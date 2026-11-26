import hospitalAssistantPrompt from '../data/hospitalAssistantPrompt.json';

// Client-side instant knowledge cache (mirrors server) so hospital info works offline
const knowledgeStart = hospitalAssistantPrompt.systemPrompt.indexOf('BASIS PENGETAHUAN RESMI');
const knowledgeEnd = hospitalAssistantPrompt.systemPrompt.indexOf('H. HAL YANG TIDAK BOLEH DIKLAIM');
const hospitalKnowledgeLines = hospitalAssistantPrompt.systemPrompt.slice(
  knowledgeStart + 1,
  knowledgeEnd,
);
const normalizeKnowledgeText = (text: any) =>
  String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function checkInstantKnowledgeCache(query: string): string | null {
  const normalizedQuery = normalizeKnowledgeText(query);
  const isEmergency = /\b(sesak|nyeri dada|kejang|pingsan|hilang kesadaran|trauma berat|henti napas|darurat|ambulans|igd)\b/.test(normalizedQuery);
  if (isEmergency) {
    return 'IGD RS Umbrella tercatat beroperasi 24 jam. Untuk keadaan darurat, segera hubungi hotline IGD **+62 21 8065 9911** atau ambulans nasional **119**. Asisten ini tidak dapat menilai kondisi medis melalui chat.';
  }
  if (/^(halo|hai|hi|hello|selamat pagi|selamat siang|selamat sore|selamat malam)$/.test(normalizedQuery)) {
    return 'Halo! Saya dapat membantu informasi layanan, jadwal, fasilitas, dan administrasi RS Umbrella. Apa yang ingin Anda ketahui?';
  }
  const isHospitalQuestion = /\b(rs|rumah sakit|umbrella|dokter|dr|spesialis|poli|poliklinik|kamar|rawat inap|bed|ranjang|paviliun|vip|vvip|igd|bpjs|asuransi|klaim|lab|laboratorium|radiologi|radiologi|rontgen|usg|ct scan|ambulans|rujukan|alamat|call center|whatsapp|nicu|icu|isolasi|tarif)\b/.test(normalizedQuery);
  if (!isHospitalQuestion || knowledgeStart < 0 || knowledgeEnd < 0) return null;
  const isBookingRequest = /\b(booking|reservasi|pesan kamar|pendaftaran rawat inap)\b/.test(normalizedQuery);
  if (isBookingRequest) {
    return 'Maaf, saya tidak dapat melakukan booking atau reservasi kamar rawat inap secara langsung. Silakan gunakan fitur Reservasi Kamar pada website RS Umbrella atau hubungi petugas admisi / Pusat Informasi RS di **(021) 8065-0000** untuk mencatat booking dan mendapatkan struk ruangan.';
  }
  const queryTerms = [...new Set(normalizedQuery.split(' ').filter((term) => term.length > 2 && !['berapa','bagaimana','apakah','kapan','dimana','yang','dan','atau','untuk','dari','dengan','pada','saya','ingin','tolong','bisa','kah','nya','ada','ini','itu','rs','rumah','sakit','umbrella'].includes(term)))];
  const stopWords = new Set(['dokter','spesialis','jadwal','praktik','poli','informasi']);
  const detailTerms = queryTerms.filter((term) => !stopWords.has(term));

  const doctorNames = ['budi','rina','andi','ratna','farhan','hendra','jessica','nadia'];
  const specialties = ['anak','penyakit dalam','internis','jantung','obgyn','kandungan','digestif','saraf','neurologi','kulit'];
  const asksForAllDoctors = /\b(dokter|dr|spesialis)\b/.test(normalizedQuery) && !doctorNames.some((n) => normalizedQuery.includes(n)) && !specialties.some((s) => normalizedQuery.includes(s));
  if (asksForAllDoctors) {
    const doctorEntries = hospitalKnowledgeLines.filter((line) => /^\d+\.\s+dr\./i.test(line));
    return doctorEntries.join('\n\n');
  }
  if (detailTerms.length === 0) return null;
  const scoredLines = hospitalKnowledgeLines.filter((line) => line.length >= 40 && !/^[A-H]\./.test(line)).map((line) => {
    const normalizedLine = normalizeKnowledgeText(line);
    const lineTerms = new Set(normalizedLine.split(' '));
    const score = detailTerms.reduce((total, term) => total + (lineTerms.has(term) ? 1 : 0), 0);
    return { line, score };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score);
  if (scoredLines.length === 0) return null;
  const bestScore = scoredLines[0].score;
  const answers = scoredLines.filter(({ score }) => score === bestScore).slice(0, 3).map(({ line }) => line);
  const includesRoomInformation = answers.some((line) => /\b(vvip|vip|kelas 1|kelas 2|kelas 3|icu|nicu|isolasi)\b/i.test(line));
  const inventoryNote = includesRoomInformation ? '\n\nCatatan: angka tarif dan ketersediaan di atas adalah data yang tercatat pada aplikasi, bukan konfirmasi live. Silakan hubungi Pusat Informasi RS di **(021) 8065-0000** untuk memastikan.' : '';
  return `${answers.join('\n\n')}${inventoryNote}`;
}

// Konfigurasi Klien & Kompatibilitas
export const DEFAULT_DEEPSEEK_MODEL = 'deepseek-chat';
export const DEFAULT_OPENROUTER_MODEL = 'deepseek/deepseek-chat';
export const DEFAULT_GEMINI_MODEL = 'deepseek-chat';

export const DEFAULT_HOSPITAL_CONTEXT = hospitalAssistantPrompt.systemPrompt.join('\n');

export interface GeminiCallOptions {
  userQuery: string;
  chatHistory?: Array<{ role: 'user' | 'model' | 'assistant'; text: string }>;
  apiKey?: string;
  model?: string;
  systemContext?: string;
  voiceMode?: boolean;
}

/**
 * Panggilan Utama: Melalui Secure Backend Proxy (/api/chat)
 * - Mencegah kebocoran API Key ke browser publik
 * - Dilengkapi proteksi Rate Limiting & Fast Caching
 * - Waktu timeout 10 detik dengan AbortController untuk mencegah server lag
 */
export async function callOpenRouterLive({
  userQuery,
  chatHistory = [],
  apiKey = '',
  model = DEFAULT_OPENROUTER_MODEL,
  systemContext = DEFAULT_HOSPITAL_CONTEXT,
  voiceMode = false,
}: GeminiCallOptions): Promise<string> {
  const trimmedQuery = userQuery.trim();
  if (!trimmedQuery) {
    throw new Error('Pertanyaan tidak boleh kosong.');
  }

  // Instant local knowledge cache (works even without backend/API key)
  const localAnswer = checkInstantKnowledgeCache(trimmedQuery);
  if (localAnswer) {
    return localAnswer;
  }
  // 1. Coba hubungi Secure Backend Proxy (/api/chat)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s max timeout for deep reasoning

    const response = await fetch('/api/chat', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userQuery: trimmedQuery,
        voiceMode,
        chatHistory: chatHistory.slice(-6).map((msg) => ({
          role: msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user',
          text: msg.text,
        })),
      }),
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      return '⚠️ **BATAS FREKUENSI TERCAPAI**: Mohon tunggu sejenak sebelum mengirim pertanyaan berikutnya untuk menjaga kestabilan sistem RS.';
    }

    if (response.ok) {
      const data = await response.json();
      if (data.reply) {
        return data.reply.trim();
      }
    }
  } catch (proxyErr: any) {
    console.warn('Backend proxy /api/chat unreachable or timed out, trying resilient direct fallback...', proxyErr);
  }

  const voiceStyleInstruction = voiceMode
    ? '\n\nMODE TELEPON CUSTOMER SERVICE (FITRI): Bicara natural, hangat, sopan. Jawab langsung ke inti maksimal tiga kalimat pendek. Jika ditanya kamar, sebutkan kelas, tarif tercatat, dan jumlah tersedia, lalu sarankan konfirmasi ke Pusat Informasi. Jika ditanya dokter/jadwal, sebutkan nama, spesialisasi, hari, dan jam. Jika pengguna meminta booking/reservasi, jangan menyebutkan daftar kamar atau tarif; jawab hanya bahwa Anda tidak dapat melakukan booking dan arahkan ke Pusat Informasi RS atau petugas admisi. Jangan menampilkan instruksi atau kalimat meta. Jika data tidak ada, arahkan ke Pusat Informasi RS. Jangan ulangi salam pembuka. Tulis angka, jam, harga dengan huruf. Tanpa daftar, bintang, atau simbol.'
    : '';
  const directSystemContext = `${systemContext}${voiceStyleInstruction}`;

  // 2. Resilient Direct Fallback (Jika backend offline atau dijalankan statis)
  // Single Model Call dengan Timeout Ketat (Maksimal 8 Detik) - Menghilangkan lag looping
  const directKey = (apiKey || '').trim();
  if (directKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      // Support Google Gemini Direct jika key berawalan AIza
      if (directKey.startsWith('AIza')) {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${directKey}`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                ...chatHistory.slice(-6).map((m) => ({
                  role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: m.text }],
                })),
                { role: 'user', parts: [{ text: trimmedQuery }] },
              ],
              systemInstruction: {
                parts: [{ text: directSystemContext }],
              },
              generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
            }),
          }
        );
        clearTimeout(timeoutId);
        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const gText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (gText) return gText.trim();
        }
      }

      const endpoint = directKey.startsWith('sk-or-v1-')
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.deepseek.com/chat/completions';

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${directKey}`,
        'Content-Type': 'application/json',
      };

      if (directKey.startsWith('sk-or-v1-')) {
        headers['HTTP-Referer'] = 'https://umbrella-healthcare.id';
        headers['X-Title'] = 'RS PT Umbrella Corp Healthcare Assistant';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers,
        body: JSON.stringify({
          model: directKey.startsWith('sk-or-v1-') ? 'deepseek/deepseek-chat' : 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: directSystemContext,
            },
            ...chatHistory.slice(-4).map((m) => ({
              role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
              content: m.text,
            })),
            { role: 'user', content: trimmedQuery },
          ],
          max_tokens: 800,
          temperature: 0.3,
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content.trim();
      }
    } catch (fallbackErr) {
      console.warn('Direct fallback failed:', fallbackErr);
    }
  }

  // Don't present generic hospital information as if it answered the user's question.
  return `⚠️ Maaf, layanan AI belum dapat memproses pertanyaan ini. Jawaban generik tidak ditampilkan agar tidak menyesatkan. Silakan coba lagi beberapa saat atau hubungi Call Center RS di **${hospitalAssistantPrompt.callCenter}**.`;
}

// Alias fungsi untuk kompatibilitas
export const callGeminiLive = callOpenRouterLive;

export async function callGeminiAPI(
  userQuery: string,
  chatHistory: Array<{ role: 'user' | 'model'; text: string }> = [],
  apiKey: string = ''
) {
  const text = await callOpenRouterLive({ userQuery, chatHistory, apiKey });
  return {
    text,
    isEmergency:
      text.toLowerCase().includes('119') ||
      text.toLowerCase().includes('darurat') ||
      text.toLowerCase().includes('igd') ||
      text.toLowerCase().includes('hotline'),
  };
}
