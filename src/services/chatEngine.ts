import { ChatMessage, ActionPill } from '../types';
import { HOSPITAL_METADATA } from '../data/hospitalData';
import { callGeminiAPI } from './geminiService';

export const getCurrentWIB = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} WIB`;
};

/**
 * Membersihkan sintaks Markdown (seperti #, ##, ###, **, *, _)
 * agar teks menjadi plain text yang rapi saat disalin atau ditempel.
 */
export const stripMarkdown = (text: any): string => {
  return String(text ?? '')
    // Hapus header markdown di awal baris: #, ##, ###, dst.
    .replace(/^#{1,6}\s+/gm, '')
    // Hapus tanda blockquote di awal baris: >
    .replace(/^>\s*/gm, '')
    // Ubah bullet list asterik (* ) di awal baris menjadi strip biasa (- )
    .replace(/^\*\s+/gm, '- ')
    // Hapus format bold & italic bertingkat: ***teks***, **teks**, *teks*
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Hapus format underscore: ___teks___, __teks__, _teks_
    .replace(/___(.*?)___/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Hapus backticks: `code`
    .replace(/`([^`]+)`/g, '$1')
    .trim();
};

// INITIAL WELCOME STATE (Bahasa Indonesia)
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'ai',
    senderName: 'Umbrella AI Assistant',
    timestamp: getCurrentWIB(),
    text: `Halo! Saya **Umbrella AI Assistant**, asisten virtual terpadu Rumah Sakit PT Umbrella Corp didukung oleh **DeepSeek AI**.\n\nAda yang dapat kami bantu terkait jadwal praktik dokter spesialis, ketersediaan kamar rawat inap, atau alur penanganan darurat IGD hari ini?\n\nSilakan pilih salah satu contoh pertanyaan cepat di bawah atau ketikkan pertanyaan Anda secara langsung.`,
    quickReplies: [
      { id: 'qr-poli', label: 'Jadwal Poliklinik', icon: 'grid', actionType: 'prompt', payload: 'Berapa jadwal buka poliklinik spesialis dan kuota pendaftaran hari ini?' },
      { id: 'qr-doc', label: 'Jadwal Dokter', icon: 'calendar', actionType: 'prompt', payload: 'Tampilkan jadwal dokter spesialis anak dan penyakit dalam hari ini.' },
      { id: 'qr-bed', label: 'Kamar VIP & IGD', icon: 'bed', actionType: 'prompt', payload: 'Berapa ketersediaan kamar rawat inap VIP dan bagaimana prosedur triase IGD 24 jam?' },
      { id: 'qr-ins', label: 'Penjaminan Asuransi', icon: 'shield', actionType: 'prompt', payload: 'Apakah RS Umbrella menerima asuransi cashless dari Prudential dan AdMedika?' },
    ]
  }
];

export async function generateAIResponse(
  userText: string,
  chatHistory: ChatMessage[] = [],
  apiKey: string = ''
): Promise<ChatMessage> {
  const timestamp = getCurrentWIB();
  const lower = userText.toLowerCase();

  try {
    const formattedHistory = chatHistory
      .filter((m) => m.id !== 'msg-welcome')
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

    const geminiResult = await callGeminiAPI(userText, formattedHistory, apiKey);
    const responseText = geminiResult.text;

    let card: ChatMessage['card'];
    let actionPills: ActionPill[] | undefined;

    if (
      lower.includes('kamar') ||
      lower.includes('bed') ||
      lower.includes('vip') ||
      lower.includes('rawat inap')
    ) {
      card = {
        type: 'bed-status',
        bedData: {
          title: 'Status Ketersediaan Kamar & Fasilitas IGD 24 Jam',
          badge: 'UPDATE LIVE',
          items: [
            {
              label: 'Kamar Rawat Inap VIP',
              description: 'Tersedia 4 Bed di Paviliun Aster & 2 Bed di Paviliun Melati (Fasilitas Bed Elektrik, Smart Monitor, Ruang Tunggu Keluarga).'
            },
            {
              label: 'Triase IGD 24 Jam',
              description: 'Menerima pasien rujukan darurat 24/7 dengan alur prioritas Triase Merah/Kuning didampingi tim Dokter Spesialis Emergensi.'
            },
            {
              label: 'Persyaratan Rujukan',
              description: 'Membawa Surat Pengantar Rujukan (bila ada), Kartu Identitas/Asuransi, atau datang langsung ke Loket IGD.'
            }
          ]
        }
      };
      actionPills = [
        { id: 'act-download-form', label: 'Unduh Formulir Rawat Inap', icon: 'download', actionType: 'download' },
        { id: 'act-call-er', label: 'Hubungi Hotline IGD 24 Jam', icon: 'phone', variant: 'crimson', actionType: 'call' }
      ];
    } else if (
      geminiResult.isEmergency ||
      lower.includes('darurat') ||
      lower.includes('sesak') ||
      lower.includes('nyeri dada') ||
      lower.includes('kejang') ||
      lower.includes('pingsan')
    ) {
      actionPills = [
        { id: 'call-er-direct', label: `Hubungi IGD (${HOSPITAL_METADATA.emergencyPhone})`, icon: 'phone', variant: 'crimson', actionType: 'call' },
        { id: 'call-119', label: 'Panggil Ambulans Darurat 119', icon: 'phone', actionType: 'call' }
      ];
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      senderName: 'Umbrella AI Assistant',
      timestamp,
      text: responseText,
      card,
      actionPills
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);

    return {
      id: `msg-error-${Date.now()}`,
      sender: 'ai',
      senderName: 'Umbrella AI Assistant (Peringatan Sistem)',
      timestamp,
      isError: true,
      text: `⚠️ **GAGAL MENGHUBUNGI GOOGLE GEMINI API**\n\nDetail kendala: \`${error.message || 'Gangguan jaringan'}\`\n\nSilakan pastikan koneksi internet aktif dan API Key Gemini Anda valid di panel Pengaturan.`,
      actionPills: [
        { id: 'act-call-er', label: 'Hubungi IGD 24 Jam (021-8065-9911)', icon: 'phone', variant: 'crimson', actionType: 'call' }
      ]
    };
  }
}
