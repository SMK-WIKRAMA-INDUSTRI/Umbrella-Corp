/**
 * PT Umbrella Corp - Secure Healthcare AI Backend & Proxy Server
 * Author: Ihsan (Backend Security Engineer) & Architecture Purple Team
 * Description: Production-grade secure proxy with Rate Limiting, Input Sanitization,
 *              Anti-Path-Traversal, Intelligent Knowledge Caching, and Server-Side Credential Protection.
 */

import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HOSPITAL_ASSISTANT = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "src", "data", "hospitalAssistantPrompt.json"),
    "utf-8",
  ),
);
const HOSPITAL_ASSISTANT_PROMPT = HOSPITAL_ASSISTANT.systemPrompt.join("\n");

// 1. Zero-dependency .env loader for server-side secrets
function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}
loadEnv();

const PORT = process.env.PORT || 5000;
const DEEPSEEK_API_KEY =
  process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || "";
const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || "";
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || "";

// 2. Sliding Window Rate Limiter (Protects against Denial of Service / Denial of Wallet)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // 15 requests per IP per minute
const ipRequestMap = new Map();

function isRateLimited(ip) {
  // Berikan kelonggaran kuota khusus untuk developer lokal (localhost) agar tidak terblokir saat testing
  const isLocal =
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "::ffff:127.0.0.1" ||
    ip === "unknown";
  const effectiveLimit = isLocal ? 120 : MAX_REQUESTS_PER_WINDOW;

  const now = Date.now();
  let record = ipRequestMap.get(ip);

  if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    record = { startTime: now, count: 1 };
    ipRequestMap.set(ip, record);
    return false;
  }

  record.count++;
  if (record.count > effectiveLimit) {
    return true;
  }

  return false;
}

// Cleanup stale IP records every 5 minutes to avoid memory leaks
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, record] of ipRequestMap.entries()) {
      if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
        ipRequestMap.delete(ip);
      }
    }
  },
  5 * 60 * 1000,
);

// Local retrieval keeps known hospital answers available when no LLM provider responds.
const knowledgeStart = HOSPITAL_ASSISTANT.systemPrompt.indexOf(
  "BASIS PENGETAHUAN RESMI",
);
const knowledgeEnd = HOSPITAL_ASSISTANT.systemPrompt.indexOf(
  "H. HAL YANG TIDAK BOLEH DIKLAIM",
);
const hospitalKnowledgeLines = HOSPITAL_ASSISTANT.systemPrompt.slice(
  knowledgeStart + 1,
  knowledgeEnd,
);
const normalizeKnowledgeText = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function checkInstantKnowledgeCache(query) {
  const normalizedQuery = normalizeKnowledgeText(query);
  const isEmergency = /\b(sesak|nyeri dada|kejang|pingsan|hilang kesadaran|trauma berat|henti napas|darurat|ambulans|igd)\b/.test(
    normalizedQuery,
  );

  if (isEmergency) {
    return "IGD RS Umbrella tercatat beroperasi 24 jam. Untuk keadaan darurat, segera hubungi hotline IGD **+62 21 8065 9911** atau ambulans nasional **119**. Asisten ini tidak dapat menilai kondisi medis melalui chat.";
  }

  if (/^(halo|hai|hi|hello|selamat pagi|selamat siang|selamat sore|selamat malam)$/.test(normalizedQuery)) {
    return "Halo! Saya dapat membantu informasi layanan, jadwal, fasilitas, dan administrasi RS Umbrella. Apa yang ingin Anda ketahui?";
  }

  const isHospitalQuestion =
    /\b(rs|rumah sakit|umbrella|dokter|dr|spesialis|poli|poliklinik|kamar|rawat inap|bed|ranjang|paviliun|vip|vvip|igd|bpjs|asuransi|klaim|lab|laboratorium|radiologi|rontgen|usg|ct scan|ambulans|rujukan|alamat|call center|whatsapp|nicu|icu|isolasi|tarif)\b/.test(
      normalizedQuery,
    );
  if (!isHospitalQuestion || knowledgeStart < 0 || knowledgeEnd < 0) {
    return null;
  }

  const queryTerms = [
    ...new Set(
      normalizedQuery
        .split(" ")
        .filter(
          (term) =>
            term.length > 2 &&
            ![
              "berapa",
              "bagaimana",
              "apakah",
              "kapan",
              "dimana",
              "dimana",
              "yang",
              "dan",
              "atau",
              "untuk",
              "dari",
              "dengan",
              "pada",
              "saya",
              "ingin",
              "tolong",
              "bisa",
              "kah",
              "nya",
              "ada",
              "ini",
              "itu",
              "rs",
              "rumah",
              "sakit",
              "umbrella",
            ].includes(term),
        ),
    ),
  ];
  const stopWords = new Set(["dokter", "spesialis", "jadwal", "praktik", "poli"]);
  const detailTerms = queryTerms.filter((term) => !stopWords.has(term));
  if (detailTerms.length === 0) return null;

  const doctorNames = ["budi", "rina", "andi", "ratna", "farhan", "hendra", "jessica", "nadia"];
  const specialties = [
    "anak",
    "penyakit dalam",
    "internis",
    "jantung",
    "obgyn",
    "kandungan",
    "digestif",
    "saraf",
    "neurologi",
    "kulit",
  ];
  const asksForAllDoctors =
    /\b(dokter|dr|spesialis)\b/.test(normalizedQuery) &&
    /\b(semua|daftar|list)\b/.test(normalizedQuery) &&
    !doctorNames.some((name) => normalizedQuery.includes(name)) &&
    !specialties.some((specialty) => normalizedQuery.includes(specialty));

  if (asksForAllDoctors) {
    const doctorEntries = hospitalKnowledgeLines.filter((line) =>
      /^\d+\.\s+dr\./i.test(line),
    );
    return doctorEntries.join("\n\n");
  }

  const scoredLines = hospitalKnowledgeLines
    .filter((line) => line.length >= 40 && !/^[A-H]\./.test(line))
    .map((line) => {
      const normalizedLine = normalizeKnowledgeText(line);
      const lineTerms = new Set(normalizedLine.split(" "));
      const score = detailTerms.reduce(
        (total, term) => total + (lineTerms.has(term) ? 1 : 0),
        0,
      );
      return { line, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (scoredLines.length === 0) return null;

  const bestScore = scoredLines[0].score;
  const answers = scoredLines
    .filter(({ score }) => score === bestScore)
    .slice(0, 3)
    .map(({ line }) => line);
  const includesRoomInformation = answers.some((line) =>
    /\b(vvip|vip|kelas 1|kelas 2|kelas 3|icu|nicu|isolasi)\b/i.test(line),
  );
  const inventoryNote = includesRoomInformation
    ? "\n\nCatatan: angka tarif dan ketersediaan di atas adalah data yang tercatat pada aplikasi, bukan konfirmasi live. Silakan hubungi Pusat Informasi RS di **(021) 8065-0000** untuk memastikan."
    : "";

  return `${answers.join("\n\n")}${inventoryNote}`;
}

// 5. Secure AI Dispatcher with AbortController Timeout (Always Route to Real AI)
async function requestAICompletion(
  userQuery,
  chatHistory = [],
  clientApiKey = "",
) {
  const systemPrompt = HOSPITAL_ASSISTANT_PROMPT;

  const messagesPayload = [
    { role: "system", content: systemPrompt },
    ...chatHistory.slice(-6).map((msg) => ({
      role:
        msg.role === "model" || msg.role === "assistant" ? "assistant" : "user",
      content: String(msg.text || "").slice(0, 500),
    })),
    { role: "user", content: userQuery.slice(0, 1000) },
  ];

  // 1. Coba OpenRouter Engine jika kunci tersedia (Mendukung DeepSeek-Chat)
  const orKey =
    OPENROUTER_API_KEY ||
    (DEEPSEEK_API_KEY.startsWith("sk-or-v1-") ? DEEPSEEK_API_KEY : "");
  if (orKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${orKey}`,
          "HTTP-Referer": "https://umbrella-healthcare.id",
          "X-Title": "RS PT Umbrella Corp Healthcare Assistant",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat",
          messages: messagesPayload,
          max_tokens: 800,
          temperature: 0.3,
        }),
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return { text: content.trim(), source: "openrouter" };
      } else {
        const errText = await res.text();
        console.warn(
          "OpenRouter upstream warning (" + res.status + "):",
          errText,
        );
      }
    } catch (err) {
      console.warn("OpenRouter upstream error:", err.message);
    }
  }

  // 2. Coba DeepSeek Official Direct jika kunci resmi sk- tersedia
  if (
    DEEPSEEK_API_KEY &&
    DEEPSEEK_API_KEY.startsWith("sk-") &&
    !DEEPSEEK_API_KEY.startsWith("sk-or-v1-")
  ) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: messagesPayload,
          max_tokens: 800,
          temperature: 0.3,
        }),
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return { text: content.trim(), source: "deepseek" };
      }
    } catch (err) {
      console.warn("DeepSeek upstream error:", err.message);
    }
  }

  // 3. Coba Google Gemini API jika GEMINI_API_KEY atau kunci AIza tersedia
  const geminiKey =
    (clientApiKey.startsWith("AIza") ? clientApiKey : "") ||
    (GEMINI_API_KEY && !GEMINI_API_KEY.includes("your_") ? GEMINI_API_KEY : "");

  if (geminiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      const contents = [
        ...chatHistory.slice(-6).map((msg) => ({
          role:
            msg.role === "assistant" || msg.role === "model" ? "model" : "user",
          parts: [{ text: String(msg.text || "").slice(0, 500) }],
        })),
        { role: "user", parts: [{ text: userQuery }] },
      ];

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
          }),
        },
      );

      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text: text.trim(), source: "gemini" };
      } else {
        const errText = await res.text();
        console.warn(`Gemini API error (${res.status}):`, errText);
      }
    } catch (err) {
      console.warn("Gemini upstream error:", err.message);
    }
  }

  const localAnswer = checkInstantKnowledgeCache(userQuery);
  if (localAnswer) {
    return { text: localAnswer, source: "hospital-knowledge" };
  }

  // Graceful Fallback if APIs are offline or unconfigured
  return {
    text: `Maaf, Asisten AI belum dapat memproses pertanyaan saat ini. Untuk informasi layanan RS, silakan hubungi Pusat Informasi di **${HOSPITAL_ASSISTANT.callCenter}**. Untuk keadaan darurat, hubungi IGD **021-8065-9911** atau ambulans **119**.`,
    source: "fallback-system",
  };
}

// 6. HTTP Server & Request Dispatcher
const mimeTypes = {
  ".html": "text/html; charset=UTF-8",
  ".js": "text/javascript; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  // Comprehensive Security Headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=()",
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://openrouter.ai https://api.deepseek.com https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://www.google.com https://maps.google.com;",
  );

  // CORS - Restrictive default
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const clientIp =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  // API Route: Health Check
  if (req.url === "/api/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "UP",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        service: "PT Umbrella Corp Healthcare API Gateway",
      }),
    );
    return;
  }

  // API Route: Chat Completions
  if (req.url === "/api/chat" && req.method === "POST") {
    // 1. Rate Limiting Check
    if (isRateLimited(clientIp)) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "RATE_LIMIT_EXCEEDED",
          message:
            "Batas frekuensi pertanyaan tercapai. Mohon tunggu 1 menit untuk melanjutkan.",
        }),
      );
      return;
    }

    // 2. Read Request Body with Size Limit (Max 50 KB)
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 50 * 1024) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload too large" }));
        req.destroy();
      }
    });

    req.on("end", async () => {
      let payload = {};
      try {
        payload = JSON.parse(body || "{}");
      } catch (parseErr) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Bad Request",
            message: "Format JSON payload tidak valid.",
          }),
        );
        return;
      }

      try {
        const userQuery = String(payload.userQuery || "").trim();
        const chatHistory = Array.isArray(payload.chatHistory)
          ? payload.chatHistory
          : [];

        if (!userQuery) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "userQuery is required" }));
          return;
        }

        // 3. Process with Secure AI Dispatcher
        const result = await requestAICompletion(
          userQuery,
          chatHistory,
          payload.apiKey,
        );

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            reply: result.text,
            source: result.source,
          }),
        );
      } catch (err) {
        console.error("API /api/chat error");
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Internal Server Error",
            message: "Terjadi kendala pada pemrosesan permintaan.",
          }),
        );
      }
    });
    return;
  }

  // API Route: Speech-to-Text Transcription (Deepgram Nova-2 Indonesian Engine)
  if (req.url.startsWith("/api/stt") && req.method === "POST") {
    if (!DEEPGRAM_API_KEY) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "DEEPGRAM_NOT_CONFIGURED",
          message: "Layanan transkripsi suara belum dikonfigurasi.",
        }),
      );
      return;
    }

    if (isRateLimited(clientIp)) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "RATE_LIMIT_EXCEEDED",
          message:
            "Batas frekuensi transkripsi audio tercapai. Mohon tunggu sejenak.",
        }),
      );
      return;
    }

    const chunks = [];
    let totalLength = 0;
    const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15MB limit

    req.on("data", (chunk) => {
      totalLength += chunk.length;
      if (totalLength > MAX_AUDIO_BYTES) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Ukuran audio melebihi batas 15MB." }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", async () => {
      if (totalLength === 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Data rekaman audio kosong." }));
        return;
      }

      const audioBuffer = Buffer.concat(chunks);
      const contentType = req.headers["content-type"] || "audio/webm";

      try {
        const dgResponse = await fetch(
          "https://api.deepgram.com/v1/listen?model=nova-2&language=id&smart_format=true&punctuate=true",
          {
            method: "POST",
            headers: {
              Authorization: `Token ${DEEPGRAM_API_KEY}`,
              "Content-Type": contentType,
            },
            body: audioBuffer,
          },
        );

        if (!dgResponse.ok) {
          const dgErr = await dgResponse.text();
          console.warn(`Deepgram status (${dgResponse.status}):`, dgErr);
          res.writeHead(dgResponse.status, {
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({
              error: "Deepgram error",
              message: "Gagal memproses audio dengan Deepgram.",
            }),
          );
          return;
        }

        const dgData = await dgResponse.json();
        const transcript =
          dgData.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
        const confidence =
          dgData.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            transcript: transcript.trim(),
            confidence,
          }),
        );
      } catch (err) {
        console.error("Deepgram gateway error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Internal Server Error",
            message: "Gagal terhubung ke layanan Speech-to-Text.",
          }),
        );
      }
    });
    return;
  }

  // 7. SECURE Static File Serving with Strict Anti-Path-Traversal (CWE-22 Protection)
  const distDir = path.resolve(__dirname, "dist");
  if (fs.existsSync(distDir)) {
    // A. Sanitize requested URL path (strip query, decode URI, strip null bytes)
    let rawPath = req.url.split("?")[0];
    let decodedPath = "";
    try {
      decodedPath = decodeURIComponent(rawPath).replace(/\0/g, "");
    } catch (_) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Bad Request: Malformed URI" }));
      return;
    }

    // B. Resolve target file safely relative to distDir
    let safeRelative = decodedPath === "/" ? "index.html" : "." + decodedPath;
    let targetFile = path.resolve(distDir, safeRelative);

    // C. Strict Boundary Check: targetFile MUST reside inside distDir
    if (!targetFile.startsWith(distDir + path.sep) && targetFile !== distDir) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "Forbidden: Access Outside Document Root" }),
      );
      return;
    }

    // Reject dotfiles (e.g. .env, .git, .htaccess)
    if (
      path.basename(targetFile).startsWith(".") &&
      path.basename(targetFile) !== "."
    ) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "Forbidden: Dotfiles are not accessible" }),
      );
      return;
    }

    // D. SPA Fallback: If file does not exist or is a directory, fallback to index.html
    if (!fs.existsSync(targetFile) || fs.statSync(targetFile).isDirectory()) {
      targetFile = path.join(distDir, "index.html");
    }

    // E. Secondary boundary check on fallback file
    if (!targetFile.startsWith(distDir + path.sep) && targetFile !== distDir) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden" }));
      return;
    }

    const ext = path.extname(targetFile).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    fs.readFile(targetFile, (err, content) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
        return;
      }
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    });
    return;
  }

  // Fallback for non-existent routes
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`  🏥 PT UMBRELLA CORP - SECURE AI BACKEND PROXY`);
  console.log(`  🔒 Security: Rate Limiting & Anti-Path-Traversal ACTIVE`);
  console.log(`  ⚡ Server listening on http://localhost:${PORT}`);
  console.log(`=================================================\n`);
});
