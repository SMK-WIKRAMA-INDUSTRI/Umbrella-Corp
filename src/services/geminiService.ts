import { HOSPITAL_METADATA } from '../data/hospitalData';

// API Key dan Model dimuat langsung dari environment variable (.env) atau konfigurasi bawaan RS
export const DEFAULT_GEMINI_API_KEY =
  (import.meta.env.VITE_GEMINI_API_KEY as string) ||
  '';

export const DEFAULT_GEMINI_MODEL =
  (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-flash-latest';

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
  chatHistory?: Array<{ role: 'user' | 'model'; text: string }>;
  apiKey?: string;
  model?: string;
  systemContext?: string;
}

export async function callGeminiLive({
  userQuery,
  chatHistory = [],
  apiKey = DEFAULT_GEMINI_API_KEY,
  model = DEFAULT_GEMINI_MODEL,
  systemContext = DEFAULT_HOSPITAL_CONTEXT,
}: GeminiCallOptions): Promise<string> {
  const cleanKey = (apiKey || DEFAULT_GEMINI_API_KEY).trim();

  // Guard: If API key is empty
  if (!cleanKey) {
    throw new Error('API_KEY_MISSING');
  }

  // System Prompt: Transparent AI Identity & Strict Healthcare Advisory in Indonesian
  const systemInstructionText = `IDENTITAS RESMI:
Anda adalah "Umbrella AI Assistant", sistem asisten kecerdasan buatan (Customer Service AI) resmi dari PT Umbrella Corp (RS Umbrella Care & Advanced Diagnostic Center).

KEJUJURAN & TRANSPARANSI IDENTITAS:
- Bersikaplah jujur dan transparan: Anda adalah sebuah program Artificial Intelligence (AI), BUKAN manusia dan tidak menyamar sebagai staf medis manusia.
- Tugas utama Anda adalah membantu pasien dan pengunjung mendapatkan informasi operasional rumah sakit (jadwal poliklinik, ketersediaan kamar, syarat rujukan BPJS, jam besuk, dan alur darurat) secara cepat, akurat, santun, dan terstruktur.
- Gunakan Bahasa Indonesia yang baik, ramah, profesional, dan empatik.

HIMBAUAN KESELAMATAN MEDIS WAJIB:
1. INFORMASI OPERASIONAL BUKAN DIAGNOSIS: Ingatkan bahwa respon Anda bersifat informatif operasional dan BUKAN pengganti diagnosis medis resmi atau pemeriksaan fisik langsung oleh dokter penanggung jawab.
2. LARANGAN OBAT KERAS: DILARANG merekomendasikan antibiotik atau obat keras golongan G tanpa resep dokter resmi.
3. KEDARURATAN MEDIS KRITIS: Bila pengguna menyebutkan tanda gawat darurat (sesak napas berat, nyeri dada akut menusuk, kejang, hilang kesadaran, muntah darah, stroke, pendarahan hebat), ingatkan dengan tegas agar **TIDAK HANYA MENUNGGU DI CHAT** melainkan SEGERA membawa pasien ke IGD 24 Jam RS Umbrella (Hotline: 021-8065-9911) atau hubungi ambulans darurat 119.

SUMBER DATA RESMI RUMAH SAKIT (SATU-SATUNYA SUMBER KEBENARAN):
${systemContext}

ATURAN FORMAT JAWABAN:
- Gunakan Bahasa Indonesia sepenuhnya.
- Gunakan format Markdown rapi: gunakan huruf tebal (**teks penting**) untuk nama dokter, nomor ruangan, tarif, dan kontak telepon.
- Gunakan poin daftar (bullet points) untuk memudahkan pembacaan cepat.
- Jika ada hal yang belum tercatat di data konteks, sampaikan dengan transparan bahwa sistem AI belum memiliki data tersebut dan sarankan menghubungi Pusat Informasi RS di 021-8065-0000.`;

  // Build the message contents array for multi-turn conversation
  const contents = [
    ...chatHistory.slice(-8).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })),
    {
      role: 'user',
      parts: [{ text: userQuery }],
    },
  ];

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstructionText }],
    },
    generationConfig: {
      temperature: 0.25,
      topP: 0.85,
      maxOutputTokens: 1500,
    },
  };

  const selectedModel = model || 'gemini-flash-latest';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${cleanKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': cleanKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Gemini API Error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Tidak ada respon teks yang diterima dari Gemini API.');
  }

  return textOutput;
}

export async function callGeminiAPI(
  userQuery: string,
  chatHistory: Array<{ role: 'user' | 'model'; text: string }> = [],
  apiKey: string = DEFAULT_GEMINI_API_KEY
) {
  const text = await callGeminiLive({ userQuery, chatHistory, apiKey });
  return {
    text,
    isEmergency:
      text.toLowerCase().includes('119') ||
      text.toLowerCase().includes('darurat') ||
      text.toLowerCase().includes('igd') ||
      text.toLowerCase().includes('hotline'),
  };
}
