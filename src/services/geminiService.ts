import { HOSPITAL_METADATA } from '../data/hospitalData';

// API Key DeepSeek dari Guru / Pengguna
export const DEFAULT_DEEPSEEK_API_KEY =
  (import.meta.env.VITE_DEEPSEEK_API_KEY as string) ||
  '';

export const DEFAULT_DEEPSEEK_MODEL =
  (import.meta.env.VITE_DEEPSEEK_MODEL as string) || 'deepseek-chat';

// OpenRouter Engine (Mendukung DeepSeek-Chat dan Google Gemini)
export const BACKUP_OPENROUTER_API_KEY =
  (import.meta.env.VITE_OPENROUTER_API_KEY as string) ||
  '';

export const DEFAULT_OPENROUTER_API_KEY = DEFAULT_DEEPSEEK_API_KEY;
export const DEFAULT_OPENROUTER_MODEL = 'deepseek/deepseek-chat';

// Alias kompatibilitas
export const DEFAULT_GEMINI_API_KEY = DEFAULT_DEEPSEEK_API_KEY;
export const DEFAULT_GEMINI_MODEL = 'deepseek-chat';

export const DEFAULT_HOSPITAL_CONTEXT = `RS PT Umbrella Corp (RS Umbrella Care & Advanced Diagnostic Center) memiliki fasilitas rawat inap VIP (Paviliun Aster & Melati) dengan fasilitas Smart Monitor telemetri pasien, bed elektrik terpadu, kamar mandi dalam dengan pemanas air, dan sofa bed penunggu keluarga. Tarif kamar VIP: Rp 1.650.000 / malam (saat ini tersedia 4 Bed di Aster dan 2 Bed di Melati).

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

export interface GeminiCallOptions {
  userQuery: string;
  chatHistory?: Array<{ role: 'user' | 'model' | 'assistant'; text: string }>;
  apiKey?: string;
  model?: string;
  systemContext?: string;
}

export async function callOpenRouterLive({
  userQuery,
  chatHistory = [],
  apiKey = DEFAULT_DEEPSEEK_API_KEY,
  model = DEFAULT_OPENROUTER_MODEL,
  systemContext = DEFAULT_HOSPITAL_CONTEXT,
}: GeminiCallOptions): Promise<string> {
  const cleanKey = (apiKey || DEFAULT_DEEPSEEK_API_KEY).trim();

  // Guard: Jika API key kosong
  if (!cleanKey) {
    throw new Error('API_KEY_MISSING: Kunci API AI belum terpasang.');
  }

  // System Prompt: Identitas Resmi Asisten Rumah Sakit & Integritas Medis
  const systemInstructionText = `IDENTITAS RESMI:
Anda adalah "Umbrella AI Assistant", sistem asisten kecerdasan buatan resmi Rumah Sakit PT Umbrella Corp (RS Umbrella Care & Advanced Diagnostic Center).

KEJUJURAN & TRANSPARANSI IDENTITAS:
- Bersikaplah ramah, sopan, profesional, dan empatik.
- Jelaskan informasi secara jelas, terstruktur, dan mudah dipahami pasien serta keluarganya.

HIMBAUAN KESELAMATAN MEDIS WAJIB:
1. INFORMASI OPERASIONAL BUKAN DIAGNOSIS: Respon Anda bersifat informatif operasional dan administratif rumah sakit, BUKAN pengganti diagnosis medis resmi atau pemeriksaan fisik langsung oleh dokter.
2. LARANGAN OBAT KERAS: Dilarang meresepkan antibiotik atau obat keras tanpa resep dokter resmi.
3. KEDARURATAN MEDIS: Bila pengguna menyebutkan tanda bahaya/darurat (sesak napas akut, nyeri dada menusuk, kejang, hilang kesadaran, trauma fisik berat), ingatkan dengan tegas agar SEGERA menuju IGD 24 Jam RS Umbrella (Hotline: 021-8065-9911) atau hubungi ambulans darurat 119.

SUMBER DATA RESMI RUMAH SAKIT (ACUAN UTAMA):
${systemContext}

ATURAN FORMAT JAWABAN:
- Gunakan Bahasa Indonesia sepenuhnya.
- Gunakan format Markdown rapi: gunakan huruf tebal (**teks penting**) untuk nama dokter, poli, tarif, dan nomor telepon.
- Gunakan poin daftar (bullet points) untuk memudahkan pembacaan cepat.
- Jika ada hal yang belum tercatat di data konteks, sampaikan dengan transparan bahwa sistem AI belum memiliki data tersebut dan sarankan menghubungi Pusat Informasi RS di 021-8065-0000.`;

  // Format riwayat pesan untuk OpenAI / DeepSeek format
  const messagesPayload: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: systemInstructionText,
    },
    ...chatHistory.slice(-8).map((msg) => ({
      role: msg.role === 'model' || msg.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: msg.text,
    })),
    {
      role: 'user',
      content: userQuery,
    },
  ];

  // 1. Jika API key ditujukan untuk DeepSeek Official (bukan sk-or-v1-), coba panggil DeepSeek Official API
  if (!cleanKey.startsWith('sk-or-v1-')) {
    try {
      const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cleanKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messagesPayload,
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (dsResponse.ok) {
        const dsData = await dsResponse.json();
        const dsContent = dsData.choices?.[0]?.message?.content;
        if (dsContent && typeof dsContent === 'string') {
          return dsContent.trim();
        }
      } else {
        const dsErr = await dsResponse.text();
        console.warn(`DeepSeek direct endpoint (${dsResponse.status}):`, dsErr);
      }
    } catch (dsErr) {
      console.warn('DeepSeek direct network exception:', dsErr);
    }
  }

  // 2. OpenRouter DeepSeek Engine (Fallback otomatis menggunakan model DeepSeek-Chat)
  const openRouterKey = cleanKey.startsWith('sk-or-v1-') ? cleanKey : BACKUP_OPENROUTER_API_KEY;

  const candidateModels = [
    model || 'deepseek/deepseek-chat',
    'deepseek/deepseek-chat',
    'deepseek/deepseek-r1',
    'google/gemini-2.5-flash',
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.3-70b-instruct',
  ];

  // Hapus duplikasi model
  const modelsToTry = Array.from(new Set(candidateModels));

  let lastError: any = null;

  for (const targetModel of modelsToTry) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://umbrella-healthcare.id',
          'X-Title': 'RS PT Umbrella Corp Healthcare Assistant',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: targetModel,
          messages: messagesPayload,
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`AI Gateway error with model ${targetModel} (${response.status}):`, errorText);
        lastError = new Error(`AI Gateway Error (${response.status}): ${errorText}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (content && typeof content === 'string') {
        return content.trim();
      }
    } catch (err) {
      console.warn(`Network/fetch failure with model ${targetModel}:`, err);
      lastError = err;
    }
  }

  // Jika semua model gagal
  throw lastError || new Error('Gagal mendapatkan balasan dari AI API.');
}

// Alias fungsi untuk menjaga kompatibilitas penuh dengan kode yang memanggil callGeminiLive
export const callGeminiLive = callOpenRouterLive;

export async function callGeminiAPI(
  userQuery: string,
  chatHistory: Array<{ role: 'user' | 'model'; text: string }> = [],
  apiKey: string = DEFAULT_DEEPSEEK_API_KEY
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
