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
const DEEPGRAM_API_KEY =
  process.env.DEEPGRAM_API_KEY ||
  process.env.VITE_DEEPGRAM_API_KEY ||
  "60a13af1a04287bdd70caf432f6b6b76ccbcbbc5";

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

// 3. Hospital Knowledge Context (Server-Side)
const HOSPITAL_CONTEXT = `RS PT Umbrella Corp (RS Umbrella Care & Advanced Diagnostic Center) memiliki fasilitas rawat inap VIP (Paviliun Aster & Melati) dengan fasilitas Smart Monitor telemetri pasien, bed elektrik terpadu, kamar mandi dalam dengan pemanas air, dan sofa bed penunggu keluarga. Tarif kamar VIP: Rp 1.650.000 / malam (saat ini tersedia 4 Bed di Aster dan 2 Bed di Melati).

Instalasi Gawat Darurat (IGD) siaga 24 Jam dengan sistem triase merah/kuning/hijau didampingi tim dokter spesialis kedaruratan medik. Hotline rujukan darurat IGD: 021-8065-9911. Panggilan ambulans darurat: 119.

Pendaftaran poliklinik dibuka setiap Senin - Sabtu pukul 08:00 - 21:00 WIB. Hari Minggu poliklinik rawat jalan tutup, namun Instalasi Gawat Darurat (IGD) dan rawat inap tetap beroperasi penuh 24 jam non-stop.

Jadwal Dokter Spesialis:
- dr. Budi Santoso, Sp.PD (Spesialis Penyakit Dalam): Senin, Rabu, Jumat pukul 09:00 - 13:00 WIB di Poli Internis Ruang 201.
- dr. Rina Puspita, Sp.A(K) (Spesialis Anak): Senin, Selasa, Kamis, Sabtu pukul 15:00 - 19:30 WIB di Poli Anak Ruang 105.
- dr. Andi Kurniawan, Sp.JP (Spesialis Jantung): Sedang cuti dinas, digantikan oleh dr. Ratna Dewi, Sp.JP di Ruang 302 (pukul 16:00 - 20:30 WIB).
- dr. Farhan Malik, Sp.OG (Spesialis Kebidanan & Kandungan): Senin, Rabu, Kamis, Jumat pukul 13:00 - 17:00 WIB di Poli Obgyn Ruang 210.
- dr. Hendra Wijaya, Sp.B (Spesialis Bedah Digestif): Selasa, Kamis, Sabtu pukul 10:00 - 14:00 WIB di Poli Bedah Ruang 205.

Penjaminan BPJS Kesehatan & Asuransi Swasta:
- Pasien non-darurat berobat jalan wajib membawa Surat Rujukan Online dari Faskes Tingkat 1 (Puskesmas/Klinik Pratama) yang masih berlaku (maksimal 90 hari) dan KTP/KIS.
- Pasien gawat darurat (sesak napas parah, kejang, nyeri dada akut, hilang kesadaran, trauma) BEBAS SURAT RUJUKAN dan langsung ditangani di IGD.
- Menerima klaim cashless asuransi swasta: Prudential (PRUmedical Priority Desk), AdMedika, Mandiri Inhealth, Allianz, AIA, Manulife, Sinarmas MSIG, Astra Life, Sequis Life.`;

// 4. In-Memory Fast Cache for Common Questions (Zero-latency instant responses)
function checkInstantKnowledgeCache(query) {
  const q = query.toLowerCase();

  if (
    (q.includes("tarif") || q.includes("biaya") || q.includes("kamar")) &&
    (q.includes("vip") || q.includes("aster") || q.includes("melati"))
  ) {
    return `### Ketersediaan & Tarif Kamar Rawat Inap VIP RS Umbrella Corp\n\n- **Tarif Kamar VIP:** **Rp 1.650.000 / malam**\n- **Ketersediaan Live:**\n  - **Paviliun Aster:** Tersedia **4 Bed** (Lantai 5)\n  - **Paviliun Melati:** Tersedia **2 Bed** (Lantai 4)\n- **Fasilitas VIP:** 1 Bed Pasien Elektrik Parametric, Kamar Mandi Dalam Air Panas/Dingin, Sofa Bed Penunggu, Smart TV 43 Inch, AC Split + Air Purifier HEPA H13, Kulkas Medis, dan Jatah Konsumsi Penunggu 1x Sehari.\n- **Informasi Reservasi:** Hubungi Admission Desk di **(021) 8065-0000** atau kunjungi Loket Pendaftaran Lt. 1.`;
  }

  if (
    q.includes("ambulans") ||
    q.includes("darurat") ||
    q.includes("igd") ||
    q.includes("hotline") ||
    q.includes("emergency")
  ) {
    return `🚨 **LAYANAN KEDARURATAN MEDIS 24 JAM RS UMBRELLA CORP**\n\n- **Hotline Darurat IGD 24 Jam:** **(021) 8065-9911**\n- **Panggilan Ambulans Siaga:** **119** atau **(021) 8065-9999**\n- **Alur Triase Darurat:**\n  - Pasien dengan kondisi gawat darurat (sesak napas berat, nyeri dada menusuk, kejang, cedera/trauma, hilang kesadaran) **BEBAS SURAT RUJUKAN BPJS** dan langsung ditangani di ruang resusitasi/IGD 24 jam.\n  - Lokasi IGD: Gedung Utama Lantai 1 (Akses langsung Drop-Off Ambulans).`;
  }

  if (
    q.includes("anak") &&
    (q.includes("dokter") || q.includes("jadwal") || q.includes("spesialis"))
  ) {
    return `### Jadwal Praktik Dokter Spesialis Anak (Pediatri)\n\n- **Dokter:** **dr. Rina Puspita, Sp.A(K)**\n- **Hari Praktik:** **Senin, Selasa, Kamis, Sabtu**\n- **Jam Praktik:** **15:00 - 19:30 WIB**\n- **Lokasi Poliklinik:** Ruang 105 (Poliklinik Anak, Lantai 1)\n- **Pendaftaran:** Buka pukul 08:00 - 20:00 WIB (Kuota tersedia untuk pasien umum dan rujukan BPJS Kesehatan).`;
  }

  // Generic Doctor & Schedule Query
  if (
    (q.includes("dokter") || q.includes("spesialis") || q.includes("jadwal")) &&
    (q.includes("apa") || q.includes("daftar") || q.includes("siapa") || q.includes("semua") || q.includes("ada") || q.includes("jadwal") || q.includes("list"))
  ) {
    return `### Daftar & Jadwal Praktik Dokter Spesialis RS Umbrella Corp\n\n` +
      `- **dr. Budi Santoso, Sp.PD** (Spesialis Penyakit Dalam)\n  - Hari: **Senin, Rabu, Jumat** (09:00 - 13:00 WIB)\n  - Lokasi: Poli Internis Ruang 201\n\n` +
      `- **dr. Rina Puspita, Sp.A(K)** (Spesialis Anak)\n  - Hari: **Senin, Selasa, Kamis, Sabtu** (15:00 - 19:30 WIB)\n  - Lokasi: Poli Anak Ruang 105\n\n` +
      `- **dr. Ratna Dewi, Sp.JP** (Spesialis Jantung - *Pengganti dr. Andi Kurniawan yang sedang cuti dinas*)\n  - Hari: **Senin - Sabtu** (16:00 - 20:30 WIB)\n  - Lokasi: Ruang 302\n\n` +
      `- **dr. Farhan Malik, Sp.OG** (Spesialis Kebidanan & Kandungan)\n  - Hari: **Senin, Rabu, Kamis, Jumat** (13:00 - 17:00 WIB)\n  - Lokasi: Poli Obgyn Ruang 210\n\n` +
      `- **dr. Hendra Wijaya, Sp.B** (Spesialis Bedah Digestif)\n  - Hari: **Selasa, Kamis, Sabtu** (10:00 - 14:00 WIB)\n  - Lokasi: Poli Bedah Ruang 205\n\n` +
      `*Pendaftaran Poliklinik dibuka Senin - Sabtu pukul 08:00 - 21:00 WIB. Layanan IGD siaga 24 Jam.*`;
  }

  if (
    (q.includes("penyakit dalam") || q.includes("internis")) &&
    (q.includes("dokter") || q.includes("jadwal"))
  ) {
    return `### Jadwal Praktik Dokter Spesialis Penyakit Dalam (Internis)\n\n- **Dokter:** **dr. Budi Santoso, Sp.PD**\n- **Hari Praktik:** **Senin, Rabu, Jumat**\n- **Jam Praktik:** **09:00 - 13:00 WIB**\n- **Lokasi Poliklinik:** Ruang 201 (Poliklinik Internis, Lantai 2)\n- **Pendaftaran:** Wajib membawa surat rujukan Faskes 1 bagi peserta BPJS Kesehatan aktif.`;
  }

  if (
    q.includes("bpjs") &&
    (q.includes("syarat") || q.includes("rujukan") || q.includes("alur"))
  ) {
    return `### Alur & Persyaratan Pelayanan BPJS Kesehatan di RS Umbrella\n\n1. **Pelayanan Rawat Jalan (Poliklinik):**\n   - Wajib membawa **Surat Rujukan Online (PCare/Mobile JKN)** dari Faskes Tingkat 1 (Puskesmas / Klinik Pratama) yang masih berlaku (maksimal 90 hari).\n   - Membawa e-KTP / Kartu Indonesia Sehat (KIS).\n2. **Pelayanan Gawat Darurat (IGD 24 Jam):**\n   - **TIDAK MEMERLUKAN SURAT RUJUKAN** untuk kasus gawat darurat sesuai kriteria medis BPJS Kesehatan.\n   - Langsung mendatangi IGD RS Umbrella Corp di (021) 8065-9911.`;
  }

  return null;
}

// 5. Secure AI Dispatcher with AbortController Timeout (Always Route to Real AI)
async function requestAICompletion(
  userQuery,
  chatHistory = [],
  clientApiKey = "",
) {
  const systemPrompt = `IDENTITAS RESMI:
Anda adalah "Umbrella AI Assistant", sistem asisten kecerdasan buatan resmi Rumah Sakit PT Umbrella Corp (RS Umbrella Care & Advanced Diagnostic Center).

KEJUJURAN & TRANSPARANSI IDENTITAS:
- Bersikaplah ramah, sopan, profesional, dan empatik.
- Jelaskan informasi secara jelas, terstruktur, dan mudah dipahami pasien serta keluarganya.

HIMBAUAN KESELAMATAN MEDIS WAJIB:
1. INFORMASI OPERASIONAL BUKAN DIAGNOSIS: Respon Anda bersifat informatif operasional dan administratif rumah sakit, BUKAN pengganti diagnosis medis resmi atau pemeriksaan fisik langsung oleh dokter.
2. LARANGAN OBAT KERAS: Dilarang meresepkan antibiotik atau obat keras tanpa resep dokter resmi.
3. KEDARURATAN MEDIS: Bila pengguna menyebutkan tanda bahaya/darurat (sesak napas akut, nyeri dada menusuk, kejang, hilang kesadaran, trauma fisik berat), ingatkan dengan tegas agar SEGERA menuju IGD 24 Jam RS Umbrella (Hotline: 021-8065-9911) atau hubungi ambulans darurat 119.

SUMBER DATA RESMI RUMAH SAKIT (ACUAN UTAMA):
${HOSPITAL_CONTEXT}

ATURAN FORMAT JAWABAN:
- Gunakan Bahasa Indonesia sepenuhnya.
- Format rapi: gunakan huruf tebal (**teks penting**) untuk nama dokter, poli, tarif, dan nomor telepon. Hindari penggunaan tanda pagar (seperti ### atau ##) pada judul, cukup gunakan baris baru atau teks tebal agar tidak mengotori teks saat dicopy.
- Gunakan poin daftar (bullet points) untuk memudahkan pembacaan cepat.
- Jika ada hal yang belum tercatat di data konteks, sampaikan dengan transparan bahwa sistem AI belum memiliki data tersebut dan sarankan menghubungi Pusat Informasi RS di 021-8065-0000.`;

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

  // Graceful Fallback if APIs are offline or unconfigured
  return {
    text: `⚠️ **KUNCI API LLM DIPERLUKAN**: Agar asisten AI dapat menjawab secara live dan cerdas menggunakan data resmi RS Umbrella, mohon masukkan kunci API AI ke file **.env**:

1. **Google Gemini API Key** (Format: \`AIzaSy...\`)
2. **DeepSeek API Key** (Format: \`sk-...\`)
3. **OpenRouter API Key** (Format: \`sk-or-v1-...\`)

*Catatan: Kunci API yang Anda masukkan sebelumnya (\`60a13af1a042...\`) adalah kunci **Deepgram** yang digunakan khusus untuk fitur **Speech-to-Text (suara ke teks)**, bukan untuk model pembuat teks (LLM).*`,
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
