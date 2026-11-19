import React, { useState } from 'react';
import { X, Send, UserCheck, ShieldCheck, PhoneCall, Paperclip, CheckCircle2 } from 'lucide-react';
import { getCurrentWIB } from '../services/chatEngine';

interface LiveHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatSummary: string;
}

export const LiveHandoverModal: React.FC<LiveHandoverModalProps> = ({
  isOpen,
  onClose,
  chatSummary,
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'agent' | 'user'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'Halo Ibu Siti Aminah, selamat pagi. Saya Ners Rina dari tim Customer Care & Admisi RS Umbrella. Saya telah membaca ringkasan pertanyaan Anda mengenai ketersediaan kamar rawat inap VIP dan alur penjaminan BPJS. Ada yang perlu saya bantu langsung?',
      time: getCurrentWIB(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const userMsg = {
      sender: 'user' as const,
      text: inputText.trim(),
      time: getCurrentWIB(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate Agent reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: 'Baik Bu Siti, untuk kamar VIP di Paviliun Aster saat ini memang tersisa 4 tempat tidur. Saya bantu reservasi sementara dan kirimkan tautan form admisi resminya ya.',
          time: getCurrentWIB(),
        },
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden text-left flex flex-col h-[600px] max-h-[90vh]">
        
        {/* Agent Header */}
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-[#BE123C] font-semibold text-sm">
                NR
              </div>
              <span className="w-3 h-3 bg-emerald-500 border-2 border-white rounded-full absolute bottom-0 right-0"></span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h4 className="font-semibold text-sm text-[#0F172A]">Ners Rina, S.Kep</h4>
                <span className="text-[10px] bg-rose-100 text-[#BE123C] px-1.5 py-0.5 rounded font-medium">
                  Koordinator Admisi RS
                </span>
              </div>
              <p className="text-xs text-[#64748B]">Sesi Eskalasi Aktif • Terhubung Langsung</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Forwarded Context Banner */}
        <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
          <span className="truncate">
            <strong>Riwayat Teruskan:</strong> {chatSummary || 'Pertanyaan Ketersediaan Kamar VIP & IGD'}
          </span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1 flex-shrink-0 ml-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Terenkripsi
          </span>
        </div>

        {/* Message Dialogue */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAFC]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-white border border-[#E2E8F0] text-[#0F172A] shadow-sm rounded-br-sm'
                    : 'bg-[#FFFFFF] border border-rose-100 text-[#0F172A] shadow-sm rounded-bl-sm'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {m.time} {m.sender === 'user' ? '• Terkirim' : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#E2E8F0] flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ketik pesan langsung ke Ners Rina..."
            className="flex-1 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#E11D48]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
