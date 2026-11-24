import { HOSPITAL_METADATA } from '../data/hospitalData';

// Konfigurasi Klien & Kompatibilitas
export const DEFAULT_DEEPSEEK_MODEL = 'deepseek-chat';
export const DEFAULT_OPENROUTER_MODEL = 'deepseek/deepseek-chat';
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
}: GeminiCallOptions): Promise<string> {
  const trimmedQuery = userQuery.trim();
  if (!trimmedQuery) {
    throw new Error('Pertanyaan tidak boleh kosong.');
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
                parts: [{ text: `Anda adalah Umbrella AI Assistant resmi RS PT Umbrella Corp.\nData Panduan Resmi:\n${systemContext}` }],
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
              content: `Anda adalah Umbrella AI Assistant resmi RS PT Umbrella Corp.\nData Panduan:\n${systemContext}`,
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
  return '⚠️ Maaf, layanan AI belum dapat memproses pertanyaan ini. Jawaban generik tidak ditampilkan agar tidak menyesatkan. Silakan coba lagi beberapa saat atau hubungi Call Center RS di **(021) 8065-0000**.';
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
