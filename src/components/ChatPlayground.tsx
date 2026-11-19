import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  PhoneCall,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Bed,
  Stethoscope,
  FileText,
  Ambulance,
  RotateCcw,
  Volume2,
  VolumeX,
  Phone,
  HeartPulse,
  ShieldCheck,
  Send,
  X,
  Activity,
  User,
  ZoomIn,
  ZoomOut,
  Info,
} from 'lucide-react';
import { UmbrellaLogo } from './UmbrellaLogo';

export interface ChatItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface ChatPlaygroundProps {
  messages: ChatItem[];
  isLoading: boolean;
  onSendMessage: (query: string) => void;
  onClearChat: () => void;
}

export const ChatPlayground: React.FC<ChatPlaygroundProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ratedMap, setRatedMap] = useState<Record<string, 'up' | 'down'>>({});
  const [seniorMode, setSeniorMode] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll saat pesan baru muncul atau sedang loading
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Cleanup speech synthesis saat komponen ditutup
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInputText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto-expand textarea up to 140px
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 140)}px`;
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRate = (id: string, type: 'up' | 'down') => {
    setRatedMap((prev) => ({ ...prev, [id]: type }));
  };

  // Fitur Text-to-Speech (Membacakan jawaban dalam Bahasa Indonesia untuk kemudahan pasien/lansia)
  const handleToggleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Fitur suara tidak didukung oleh browser ini.');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Membersihkan format markdown agar narasi suara terdengar alami
    const cleanSpeech = text
      .replace(/\*\*/g, '')
      .replace(/•/g, '')
      .replace(/[#*_-]/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // 4 Topik Pertanyaan Populer Unggulan (Kompak, Elegan & Pas di Layar)
  const featuredQuestions = [
    {
      badge: 'Rawat Inap VIP',
      title: 'Ketersediaan Kamar VIP',
      desc: 'Cek sisa ranjang Paviliun Aster, Melati & tarif kamar',
      query: 'Berapa ketersediaan kamar rawat inap VIP Paviliun Aster dan Melati saat ini beserta tarifnya?',
      icon: Bed,
    },
    {
      badge: 'Poliklinik Spesialis',
      title: 'Jadwal Dokter Spesialis',
      desc: 'Cek jam praktik dokter spesialis anak, internis & jantung hari ini',
      query: 'Bagaimana jadwal praktik dokter spesialis anak dan penyakit dalam hari ini?',
      icon: Stethoscope,
    },
    {
      badge: 'BPJS & Asuransi',
      title: 'Alur Rujukan BPJS & Bebas IGD',
      desc: 'Syarat rujukan faskes 1 & penanganan darurat langsung di IGD',
      query: 'Apakah pasien gawat darurat memerlukan surat rujukan dari faskes 1 untuk berobat?',
      icon: FileText,
    },
    {
      badge: 'Kedaruratan Medis',
      title: 'Hotline IGD & Ambulans 119',
      desc: 'Nomor ambulans siaga 119 & hotline triase IGD darurat 24 jam',
      query: 'Bagaimana nomor ambulans darurat dan prosedur triase IGD 24 jam RS Umbrella?',
      icon: Ambulance,
    },
  ];

  // Saran Pertanyaan Cepat Mengambang di Atas Input (Bersih, merah-putih-hitam tanpa warna lain)
  const quickSuggestions = [
    { label: 'Biaya Kamar VIP', query: 'Berapa tarif kamar VIP Paviliun Aster & Melati per malam?' },
    { label: 'Dokter Anak Hari Ini', query: 'Apakah poli spesialis anak buka hari ini dan jam berapa?' },
    { label: 'Syarat Pasien BPJS', query: 'Apa saja syarat berkas rujukan untuk berobat BPJS?' },
    { label: 'Panggil Ambulans 119', query: 'Bagaimana alur darurat memanggil ambulans RS Umbrella?' },
    { label: 'Jam Kunjung Pasien', query: 'Jam berapa jam besuk atau kunjungan rawat inap pasien?' },
  ];

  // Helper format teks dengan highlight medis cerdas & nomor telepon interaktif
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Deteksi bullet point
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const cleanLine = isBullet ? line.replace(/^[\s•-]+/, '').trim() : line;

      // Split bold formatting (**teks**)
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          // Highlight jika nomor darurat
          if (content.includes('021-8065-9911') || content.includes('119') || content.includes('8065-0000')) {
            return (
              <span
                key={partIdx}
                className="font-bold text-[#E11D48] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-block"
              >
                {content}
              </span>
            );
          }
          return (
            <strong key={partIdx} className="font-bold text-slate-900">
              {content}
            </strong>
          );
        }

        // Cek jika ada nomor telepon di teks biasa
        if (part.includes('021-8065-9911')) {
          return (
            <a
              key={partIdx}
              href="tel:02180659911"
              className="text-[#E11D48] font-bold underline decoration-rose-300 hover:decoration-[#E11D48]"
            >
              (021) 8065-9911
            </a>
          );
        }

        return part;
      });

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start space-x-2.5 my-1.5 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-2 flex-shrink-0" />
            <div className="flex-1 text-slate-800">{formattedParts}</div>
          </div>
        );
      }

      return (
        <div
          key={lineIdx}
          className={lineIdx > 0 && lines[lineIdx - 1] === '' ? 'mt-2.5 text-slate-800' : 'text-slate-800'}
        >
          {formattedParts}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col bg-slate-50/70 select-text relative">

      {/* Area Chat Utama: Berpusat, Nyaman & Pas Layar */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 sm:py-3 min-h-0 flex flex-col items-center justify-center">
        <div className={`w-full max-w-3xl flex-1 flex flex-col ${messages.length === 0 ? 'justify-center' : 'justify-between'}`}>

          {messages.length === 0 ? (
            /* ============================================================ */
            /* EMPTY STATE: Tampilan Awal yang Proporsional, Bersih & Pas Layar */
            /* ============================================================ */
            <div className="my-auto py-2 sm:py-3 flex flex-col items-center text-center animate-fade-in select-none w-full max-w-2xl mx-auto">

              {/* Avatar Asisten AI Kompak & Elegan */}
              <div className="relative mb-2">
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-[#BE123C] to-[#E11D48] flex items-center justify-center text-white shadow-md shadow-rose-500/20 transition-transform hover:scale-105 duration-300">
                  <UmbrellaLogo size={26} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 px-1.5 py-0.5 rounded-full bg-[#E11D48] text-white text-[9px] font-bold border-2 border-white flex items-center space-x-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Judul & Sapaan Ramah Konsultasi */}
              <div className="space-y-1 px-2">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E11D48] border border-rose-200 text-[10.5px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Layanan Konsultasi Cerdas 24 Jam</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                  Ada yang Bisa Kami Bantu Hari Ini?
                </h1>
                <p className="text-xs sm:text-[13px] text-slate-500 max-w-lg mx-auto font-normal leading-relaxed">
                  Asisten AI RS Umbrella siap memberikan panduan seputar kamar VIP, jadwal praktik 17 poliklinik spesialis, dan ketentuan rujukan BPJS.
                </p>
              </div>

              {/* Status Fasilitas Live Singkat (1 Baris Ringkas) */}
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] text-slate-600">
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs font-medium">
                  <Bed className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span>VIP Aster: <strong>4 Bed</strong> • Melati: <strong>2 Bed</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs font-medium">
                  <Stethoscope className="w-3.5 h-3.5 text-slate-900" />
                  <span>5 Dokter Spesialis Siaga</span>
                </div>
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs font-medium">
                  <Ambulance className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span>IGD 24 Jam & Ambulans 119</span>
                </div>
              </div>

              {/* Grid 4 Kartu Pertanyaan Populer (2x2 Kompak & Pas Layar) */}
              <div className="w-full mt-3 sm:mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-left">
                {featuredQuestions.map((item, idx) => {
                  const CardIcon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(item.query)}
                      className="group p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 hover:border-[#E11D48] hover:bg-rose-50/20 hover:shadow-2xs transition-all active:scale-[0.99] flex items-center justify-between gap-2.5 text-left"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#E11D48] group-hover:bg-[#E11D48] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                          <CardIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9.5px] font-bold text-[#E11D48] uppercase tracking-wider leading-none mb-0.5">
                            {item.badge}
                          </div>
                          <h3 className="font-bold text-xs sm:text-[13px] text-[#0F172A] group-hover:text-[#E11D48] transition-colors truncate">
                            {item.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-400 flex items-center justify-center flex-shrink-0 transition-all">
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Himbauan Medis Singkat Bersih (1 Baris) */}
              <div className="mt-3 flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 max-w-xl text-center px-2">
                <ShieldAlert className="w-3.5 h-3.5 text-[#E11D48] flex-shrink-0" />
                <span>
                  Informasi operasional resmi RS. Keadaan darurat segera ke <strong>IGD RS Umbrella</strong> atau hubungi <strong>119</strong>.
                </span>
              </div>

            </div>
          ) : (
            /* ============================================================ */
            /* CONVERSATION STREAM: Tampilan Obrolan yang Nyaman & Rapi      */
            /* ============================================================ */
            <div className="space-y-6 pb-6 pt-2">

              {messages.map((m) => {
                // PESAN DARI PENGGUNA (USER)
                if (m.sender === 'user') {
                  return (
                    <div key={m.id} className="flex flex-col items-end animate-fade-in">
                      <div className="flex items-end space-x-2.5 max-w-[90%] sm:max-w-[78%]">
                        <div
                          className={`bg-[#0F172A] text-white rounded-2xl rounded-br-xs px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm leading-relaxed text-left font-normal ${seniorMode ? 'text-base sm:text-lg leading-relaxed' : 'text-xs sm:text-sm'
                            }`}
                        >
                          {m.text}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold mb-1 shadow-2xs">
                          <User className="w-4 h-4 text-slate-600" />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 mr-9 px-1">
                        {m.timestamp}
                      </span>
                    </div>
                  );
                }

                // PESAN DARI AI ASSISTANT (UMBRELLA HEALTHCARE)
                const isSpeaking = speakingId === m.id;
                const containsEmergency =
                  m.text.includes('021-8065-9911') ||
                  m.text.toLowerCase().includes('gawat darurat') ||
                  m.text.toLowerCase().includes('ambulans 119') ||
                  m.text.toLowerCase().includes('triase merah');

                return (
                  <div key={m.id} className="flex items-start space-x-3 text-left animate-fade-in group">
                    {/* Avatar Dokter / Umbrella Roundel */}
                    <div className="pt-0.5 flex-shrink-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#E11D48] flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                        <UmbrellaLogo size={22} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 max-w-[92%] sm:max-w-[85%]">
                      {/* Bar Informasi Pengirim */}
                      <div className="flex items-center justify-between pb-1.5 px-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs sm:text-sm text-[#0F172A]">
                            Umbrella AI Assistant
                          </span>
                          <span className="text-[10.5px] font-semibold text-[#E11D48] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Resmi RS
                          </span>
                          <span className="text-[10px] text-slate-400">• {m.timestamp}</span>
                        </div>

                        {/* Tombol Suara (Text-to-Speech) */}
                        <button
                          onClick={() => handleToggleSpeak(m.id, m.text)}
                          className={`inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full border transition-all ${isSpeaking
                            ? 'bg-rose-100 text-[#E11D48] border-rose-300 font-bold animate-pulse'
                            : 'bg-white text-slate-500 border-slate-200 hover:text-[#E11D48] hover:border-rose-200'
                            }`}
                          title={isSpeaking ? 'Hentikan suara narasi' : 'Dengarkan jawaban ini dibacakan'}
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Berhenti</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span className="text-[11px] hidden sm:inline">Bacakan</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Bubble Respon AI Medis */}
                      <div
                        className={`p-4 sm:p-5 rounded-2xl rounded-tl-xs shadow-subtle border ${m.isError
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : isSpeaking
                            ? 'bg-rose-50/40 border-rose-300 text-slate-900 ring-2 ring-rose-200'
                            : 'bg-white border-[#E2E8F0] text-slate-800'
                          } ${seniorMode ? 'text-base sm:text-[17px] leading-relaxed sm:leading-loose' : 'text-xs sm:text-[13.5px] leading-relaxed'}`}
                      >
                        {renderFormattedText(m.text)}
                      </div>

                      {/* Kotak Aksi Kedaruratan Otomatis Jika Terdeteksi Kasus Darurat / IGD */}
                      {containsEmergency && (
                        <div className="mt-2.5 p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs animate-fade-in">
                          <div className="flex items-center space-x-2">
                            <Ambulance className="w-4 h-4 text-[#E11D48] flex-shrink-0" />
                            <span className="text-slate-800 font-medium">
                              <strong>Kondisi Gawat Darurat?</strong> Jangan tunda, segera hubungi tim triase siaga 24 jam.
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0 w-full sm:w-auto">
                            <a
                              href="tel:02180659911"
                              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs flex items-center justify-center space-x-1 transition-all active:scale-95 shadow-xs"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>Hotline IGD</span>
                            </a>
                            <a
                              href="tel:119"
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1 transition-all active:scale-95 shadow-xs"
                            >
                              <span>Ambulans 119</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Action Bar Bawah Pesan AI */}
                      {!m.isError && (
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-1">
                          <div className="flex items-center space-x-3">
                            {/* Tombol Salin */}
                            <button
                              onClick={() => handleCopyText(m.id, m.text)}
                              className="hover:text-slate-700 transition-colors inline-flex items-center space-x-1 font-medium"
                              title="Salin jawaban ini ke clipboard"
                            >
                              {copiedId === m.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#E11D48]" />
                                  <span className="text-[#E11D48] font-bold">Tersalin ke Clipboard</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Salin Teks</span>
                                </>
                              )}
                            </button>

                            {/* Umpan Balik Jempol */}
                            <div className="flex items-center space-x-1 border-l border-slate-200 pl-3">
                              <span className="text-slate-400 mr-1">Bermanfaat?</span>
                              <button
                                onClick={() => handleRate(m.id, 'up')}
                                className={`p-1 rounded-md hover:bg-slate-100 transition-colors ${ratedMap[m.id] === 'up' ? 'text-[#E11D48] font-bold bg-rose-50' : 'text-slate-400'
                                  }`}
                                title="Jawaban sangat membantu"
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleRate(m.id, 'down')}
                                className={`p-1 rounded-md hover:bg-slate-100 transition-colors ${ratedMap[m.id] === 'down' ? 'text-rose-600 font-bold bg-rose-50' : 'text-slate-400'
                                  }`}
                                title="Jawaban kurang membantu"
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Info Kontak Staf Medis Manusia */}
                          <a
                            href="tel:02180650000"
                            className="hover:text-[#E11D48] transition-colors inline-flex items-center space-x-1 font-semibold text-slate-500"
                            title="Bicara dengan petugas rumah sakit"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>Bantuan Staf: (021) 8065-0000</span>
                          </a>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}

              {/* Status Mengetik AI yang Halus */}
              {isLoading && (
                <div className="flex items-start space-x-3 text-left animate-fade-in select-none">
                  <div className="pt-0.5 flex-shrink-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#E11D48] flex items-center justify-center text-white shadow-md animate-pulse">
                      <UmbrellaLogo size={22} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 pb-1.5 px-0.5">
                      <span className="font-bold text-xs text-[#0F172A]">Umbrella AI Assistant</span>
                      <span className="text-[10.5px] font-medium text-slate-400">Sedang memproses...</span>
                    </div>
                    <div className="inline-flex items-center space-x-3 bg-white px-4 py-3 rounded-2xl rounded-tl-xs border border-[#E2E8F0] shadow-sm">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] typing-dot-1"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] typing-dot-2"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] typing-dot-3"></span>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-600 font-medium">
                        Mencari data jadwal dokter &amp; fasilitas medis terpadu...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>
          )}

        </div>
      </div>

      {/* ============================================================ */}
      {/* FLOATING INPUT DOCK: Nyaman, Ergonomis, dengan Saran Cepat   */}
      {/* ============================================================ */}
      <div className="w-full bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] p-2.5 sm:p-3 flex-shrink-0 select-none z-20 shadow-md">
        <div className="max-w-3xl mx-auto w-full space-y-1.5 sm:space-y-2">

          {/* Quick Follow-up Chips: Saran Pertanyaan Lanjutan yang Memudahkan Pasien */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={onClearChat}
                className="flex-shrink-0 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-[#E11D48] border border-rose-200 text-[11px] font-semibold transition-all active:scale-95 shadow-2xs mr-1"
                title="Bersihkan percakapan dan mulai topik baru"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Chat</span>
              </button>
            )}
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0 hidden sm:inline pl-1">
              Saran Cepat:
            </span>
            {quickSuggestions.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => onSendMessage(chip.query)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-[#E11D48] border border-slate-200 hover:border-rose-300 text-[11px] font-medium transition-all active:scale-95 disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Form Bar */}
          <form onSubmit={handleSubmit} className="relative flex items-end bg-slate-50 focus-within:bg-white border border-slate-300 focus-within:border-[#E11D48] focus-within:ring-2 focus-within:ring-rose-100 rounded-2xl p-1.5 transition-all shadow-inner">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan keluhan, jadwal dokter spesialis, kamar VIP, atau alur BPJS..."
              className={`w-full py-2 pl-3 pr-20 bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-slate-400 text-slate-800 transition-all ${seniorMode ? 'text-base' : 'text-xs sm:text-sm'
                }`}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />

            {/* Clear Text button */}
            {inputText.trim().length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  if (textareaRef.current) textareaRef.current.style.height = 'auto';
                }}
                className="absolute right-12 bottom-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                title="Hapus ketikan"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Tombol Kirim */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-2 sm:px-3.5 sm:py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-sm ${!inputText.trim() || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#E11D48] hover:bg-[#BE123C] text-white active:scale-95 shadow-rose-500/25'
                }`}
              title="Kirim pertanyaan ke Asisten AI"
            >
              <span className="hidden sm:inline">Kirim</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Petunjuk & Catatan Kaki */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-slate-400 px-1">
            <span>
              Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">Enter</kbd> untuk mengirim, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">Shift + Enter</kbd> untuk baris baru.
            </span>
            <span className="text-slate-500 font-medium">
              PT Umbrella Corp Healthcare • Sistem AI Bersertifikasi
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};
