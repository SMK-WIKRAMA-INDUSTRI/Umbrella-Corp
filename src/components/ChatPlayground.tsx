import React, { useState, useRef, useEffect } from 'react';
import {
  Trash2,
  ArrowRight,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  PhoneCall,
  Sparkles,
  ShieldAlert,
  Bot,
  ChevronRight,
  Bed,
  Stethoscope,
  FileText,
  Ambulance,
  RotateCcw,
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
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll saat pesan baru muncul
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRate = (id: string, type: 'up' | 'down') => {
    setRatedMap((prev) => ({ ...prev, [id]: type }));
  };

  // 4 Contoh Pertanyaan Cepat yang Paling Sering Diajukan Pasien
  const sampleQuestions = [
    {
      icon: <Bed className="w-4 h-4 text-[#E11D48]" />,
      badge: 'Rawat Inap',
      title: 'Ketersediaan Kamar VIP',
      query: 'Berapa ketersediaan kamar rawat inap VIP Paviliun Aster dan Melati saat ini beserta tarifnya?',
      desc: 'Cek sisa bed kamar VIP, tarif per malam & fasilitas terintegrasi.',
    },
    {
      icon: <Stethoscope className="w-4 h-4 text-[#E11D48]" />,
      badge: 'Poliklinik',
      title: 'Jadwal Dokter Spesialis',
      query: 'Bagaimana jadwal praktik dokter spesialis anak dan penyakit dalam hari ini?',
      desc: 'Informasi jam praktik dokter spesialis anak & internis.',
    },
    {
      icon: <FileText className="w-4 h-4 text-[#E11D48]" />,
      badge: 'BPJS & Asuransi',
      title: 'Alur Rujukan BPJS',
      query: 'Apakah pasien gawat darurat memerlukan surat rujukan dari faskes 1 untuk berobat?',
      desc: 'Syarat rujukan faskes 1 dan ketentuan bebas rujukan kasus IGD.',
    },
    {
      icon: <Ambulance className="w-4 h-4 text-[#E11D48]" />,
      badge: 'Darurat 24 Jam',
      title: 'Layanan IGD & Ambulans',
      query: 'Bagaimana nomor ambulans darurat dan prosedur triase IGD 24 jam RS Umbrella?',
      desc: 'Hotline ambulans 119, IGD 24 jam & sistem triase kedaruratan.',
    },
  ];

  // Helper format markdown (huruf tebal, poin, baris baru)
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIdx} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={lineIdx} className="flex items-start space-x-2 my-1">
            <span className="text-[#E11D48] select-none font-bold mt-0.5">•</span>
            <div className="flex-1 text-slate-800">{renderedParts}</div>
          </div>
        );
      }

      return (
        <div key={lineIdx} className={lineIdx > 0 && lines[lineIdx - 1] === '' ? 'mt-2 text-slate-800' : 'text-slate-800'}>
          {renderedParts}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col bg-[#F8FAFC] select-text">
      
      {/* Area Chat Utama: Berpusat & Lega (Gaya Modern AI Chat - Tanpa Dobel Navbar) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-h-0 flex flex-col items-center">
        <div className="w-full max-w-4xl flex-1 flex flex-col justify-between">
          
          {messages.length === 0 ? (
            /* Empty State: Tampilan Selamat Datang Modern & Elegan */
            <div className="my-auto py-8 sm:py-12 flex flex-col items-center text-center animate-fade-in select-none">
              
              {/* Emblem Logo Umbrella dengan Efek Glow Halus */}
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#BE123C] to-[#E11D48] flex items-center justify-center text-white shadow-xl shadow-rose-500/20">
                  <UmbrellaLogo size={36} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                </div>
              </div>

              {/* Headline & Deskripsi */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Halo, Ada yang Bisa Kami Bantu?
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Asisten AI RS PT Umbrella Corp siap memberikan informasi cepat seputar ketersediaan kamar VIP, jadwal praktik dokter spesialis, alur rujukan BPJS, dan admisi.
              </p>

              {/* Grid 4 Kartu Pertanyaan Cepat Interaktif */}
              <div className="w-full max-w-3xl mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                {sampleQuestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(item.query)}
                    className="group p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#E11D48] hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between relative overflow-hidden text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                          {item.icon}
                        </div>
                        <span className="text-[11px] font-bold tracking-wide uppercase text-slate-500">
                          {item.badge}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#E11D48] group-hover:translate-x-1 transition-all" />
                    </div>

                    <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#E11D48] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>

              {/* Banner Himbauan Medis Transparan */}
              <div className="w-full max-w-3xl mt-8 p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center justify-between gap-3 text-left shadow-sm">
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className="w-4 h-4 text-[#E11D48] flex-shrink-0" />
                  <span className="text-[11.5px] leading-snug text-slate-600">
                    <strong>Himbauan Keselamatan:</strong> Respon AI bersifat informatif operasional. Pasien gawat darurat segera hubungi <strong>IGD 24 Jam: (021) 8065-9911</strong> atau ambulans <strong>119</strong>.
                  </span>
                </div>
              </div>

            </div>
          ) : (
            /* Daftar Percakapan Aktif */
            <div className="space-y-6 pb-6 pt-2">
              {/* Floating Pill Chat Status & Reset (Bukan Navbar, Melainkan Kontrol Chat Ringan) */}
              <div className="sticky top-0 z-10 flex items-center justify-between pb-3 pt-1 select-none pointer-events-none">
                <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs text-xs text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-slate-800">Umbrella AI</span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">Siaga 24/7</span>
                </div>
                <button
                  onClick={onClearChat}
                  className="pointer-events-auto inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#E11D48] px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-rose-200 shadow-xs transition-all active:scale-95"
                  title="Mulai sesi obrolan baru"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="font-medium">Obrolan Baru</span>
                </button>
              </div>

              {messages.map((m) => {
                if (m.sender === 'user') {
                  return (
                    <div key={m.id} className="flex flex-col items-end">
                      <div className="max-w-[85%] sm:max-w-[75%] bg-[#0F172A] text-white rounded-2xl rounded-tr-sm px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-sm shadow-sm leading-relaxed text-left font-normal">
                        {m.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {m.timestamp}
                      </span>
                    </div>
                  );
                }

                // Respon dari AI Assistant
                return (
                  <div key={m.id} className="flex items-start space-x-3.5 text-left">
                    {/* Avatar Umbrella Red Roundel */}
                    <div className="pt-0.5 flex-shrink-0">
                      <div className="w-8 h-8 rounded-xl bg-[#E11D48] flex items-center justify-center text-white shadow-sm">
                        <UmbrellaLogo size={18} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 max-w-[85%] sm:max-w-[80%]">
                      {/* Nama Asisten & Waktu */}
                      <div className="flex items-center space-x-2 pb-1.5">
                        <span className="font-bold text-xs text-[#0F172A]">
                          Umbrella AI
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Resmi RS
                        </span>
                        <span className="text-[10px] text-slate-400">• {m.timestamp}</span>
                      </div>

                      {/* Bubble Speech Respon AI */}
                      <div
                        className={`text-xs sm:text-[13.5px] leading-relaxed p-4 sm:p-5 rounded-2xl rounded-tl-sm shadow-subtle ${
                          m.isError
                            ? 'bg-rose-50 border border-rose-200 text-rose-900'
                            : 'bg-white border border-[#E2E8F0] text-slate-800'
                        }`}
                      >
                        {formatMarkdown(m.text)}
                      </div>

                      {/* Action Bar Bawah Pesan AI */}
                      {!m.isError && (
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleCopyText(m.id, m.text)}
                              className="hover:text-slate-700 transition-colors inline-flex items-center space-x-1"
                              title="Salin jawaban ini"
                            >
                              {copiedId === m.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-600 font-semibold">Tersalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Salin</span>
                                </>
                              )}
                            </button>

                            <div className="flex items-center space-x-1 border-l border-slate-200 pl-3">
                              <span className="text-slate-400 mr-1">Bermanfaat?</span>
                              <button
                                onClick={() => handleRate(m.id, 'up')}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                                  ratedMap[m.id] === 'up' ? 'text-emerald-600 font-bold' : 'text-slate-400'
                                }`}
                                title="Jawaban membantu"
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleRate(m.id, 'down')}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                                  ratedMap[m.id] === 'down' ? 'text-rose-600 font-bold' : 'text-slate-400'
                                }`}
                                title="Kurang membantu"
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <a
                            href="tel:02180650000"
                            className="hover:text-[#E11D48] transition-colors inline-flex items-center space-x-1 font-semibold text-slate-500"
                            title="Hubungi Call Center Staf Medis"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Call Center: (021) 8065-0000</span>
                          </a>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}

              {/* Status Mengetik AI */}
              {isLoading && (
                <div className="flex items-start space-x-3.5 text-left animate-fade-in select-none">
                  <div className="pt-0.5 flex-shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-[#E11D48] flex items-center justify-center text-white shadow-sm animate-pulse">
                      <UmbrellaLogo size={18} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-xs text-[#0F172A] block pb-1">
                      Umbrella AI
                    </span>
                    <div className="inline-flex items-center space-x-2.5 bg-white px-4 py-2.5 rounded-2xl rounded-tl-sm border border-[#E2E8F0] shadow-sm">
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-[#E11D48] typing-dot-1"></span>
                        <span className="w-2 h-2 rounded-full bg-[#E11D48] typing-dot-2"></span>
                        <span className="w-2 h-2 rounded-full bg-[#E11D48] typing-dot-3"></span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        Menyiapkan informasi untuk Anda...
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

      {/* Floating Input Dock: Berada di Bawah, Berpusat, Bersih */}
      <div className="w-full bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] p-4 flex-shrink-0 select-none">
        <div className="max-w-4xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan jadwal dokter, kamar VIP, atau alur rujukan BPJS..."
              className="w-full text-xs sm:text-sm py-3.5 pl-4 pr-24 sm:pr-28 rounded-2xl border border-slate-300 focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-rose-100 resize-none leading-relaxed placeholder:text-slate-400 bg-slate-50/50 focus:bg-white transition-all shadow-inner"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />

            {/* Tombol Kirim: Merah Crimson Umbrella (#E11D48) Teks Putih */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`absolute right-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm ${
                !inputText.trim() || isLoading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#E11D48] hover:bg-[#BE123C] text-white active:scale-95 shadow-rose-500/20'
              }`}
            >
              <span>Kirim</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>

          {/* Hint Footnote */}
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1">
            <span>Tekan <strong>Enter</strong> untuk mengirim, <strong>Shift + Enter</strong> untuk baris baru.</span>
            <span className="hidden sm:inline">PT Umbrella Corp Healthcare • Sistem AI Terverifikasi</span>
          </div>
        </div>
      </div>

    </div>
  );
};
