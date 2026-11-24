import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, ShieldCheck, Play, ArrowRight, CornerDownLeft, Sparkles, Mic, MicOff, Loader2 } from 'lucide-react';
import { ActionPill } from '../types';
import { stripMarkdown } from '../services/chatEngine';
import { startSmartSpeechRecognition, SmartSTTController } from '../services/speechService';

interface InputDockProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  activeSuggestions?: ActionPill[];
  onSelectSuggestion: (pill: ActionPill) => void;
  seniorMode?: boolean;
}

export const InputDock: React.FC<InputDockProps> = ({
  onSendMessage,
  isLoading,
  activeSuggestions,
  onSelectSuggestion,
  seniorMode = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sttMessage, setSttMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sttControllerRef = useRef<SmartSTTController | null>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  // Cleanup controller on unmount
  useEffect(() => {
    return () => {
      if (sttControllerRef.current) {
        sttControllerRef.current.stop();
        sttControllerRef.current = null;
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

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasteData = e.clipboardData.getData('text');
    if (!pasteData) return;

    if (/(\*\*|\*|#{1,6}\s+|^>\s+)/m.test(pasteData)) {
      e.preventDefault();
      const cleaned = stripMarkdown(pasteData);

      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const currentVal = target.value;
      const nextVal = currentVal.substring(0, start) + cleaned + currentVal.substring(end);

      setInputText(nextVal);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + cleaned.length;
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
        }
      }, 0);
    }
  };

  // Smart Speech-to-Text dengan Auto-Stop Silence Detection
  const toggleSpeechRecognition = async () => {
    if (isListening) {
      if (sttControllerRef.current) {
        sttControllerRef.current.stop();
        sttControllerRef.current = null;
      }
      setIsListening(false);
      return;
    }

    if (isTranscribing) return;

    setSttMessage(null);

    const controller = await startSmartSpeechRecognition({
      onInterimResult: (interimText) => {
        setInputText(interimText);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
        }
      },
      onFinalResult: (finalText) => {
        setInputText(finalText);
        setIsListening(false);
        setIsTranscribing(false);
        setSttMessage(null);

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length;
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
          }
        }, 50);
      },
      onStateChange: (state, message) => {
        if (state === 'listening') {
          setIsListening(true);
          setIsTranscribing(false);
          setSttMessage(message || 'Mendengarkan... (otomatis selesai saat Anda berhenti berbicara)');
        } else if (state === 'transcribing') {
          setIsListening(false);
          setIsTranscribing(true);
          setSttMessage(message || 'Memproses teks...');
        } else if (state === 'idle') {
          setIsListening(false);
          setIsTranscribing(false);
          if (message) {
            setSttMessage(message);
            setTimeout(() => setSttMessage(null), 3500);
          } else {
            setSttMessage(null);
          }
        }
      },
      onError: (errMsg) => {
        setIsListening(false);
        setIsTranscribing(false);
        setSttMessage(errMsg);
        setTimeout(() => setSttMessage(null), 4000);
      },
    });

    sttControllerRef.current = controller;
  };

  return (
    <div className="w-full max-w-[800px] mx-auto px-4 sm:px-0">
      
      {/* Floating Prompt / Suggestion Chips (if any) */}
      {activeSuggestions && activeSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center justify-start gap-1.5 sm:gap-2 mb-2.5 overflow-x-auto py-1">
          {activeSuggestions.map((pill) => (
            <button
              key={pill.id}
              onClick={() => onSelectSuggestion(pill)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-medium bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] hover:border-[#E11D48] hover:text-[#BE123C] hover:bg-rose-50/50 transition-all shadow-subtle flex-shrink-0"
            >
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Sticky Input Card (Level 2 Elevation: 1px border #E2E8F0, rounded-xl 12px, shadow-dock) */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-dock transition-all focus-within:border-slate-300">
        
        {/* Inner Textarea */}
        <div className="p-3 sm:p-3.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              seniorMode
                ? "Ketik pertanyaan Anda di sini... (atau tekan ikon mikrofon)"
                : "Ketik pertanyaan rawat inap, poliklinik, atau IGD RS Umbrella... (Tekan Enter)"
            }
            className={`w-full bg-transparent border-0 resize-none text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-0 leading-relaxed ${
              seniorMode ? 'text-base sm:text-lg min-h-[44px]' : 'text-[14.5px] min-h-[36px]'
            }`}
          />
        </div>

        {/* Bottom Control Zone */}
        <div className="px-3 pb-3 sm:px-3.5 sm:pb-3 flex items-center justify-between text-xs text-[#64748B] select-none">
          
          {/* Left: Attachment & Verified Shield Badge */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => alert('Simulasi Unggah Dokumen: Anda dapat melampirkan foto Surat Rujukan PCare, Kartu KIS/BPJS, atau berkas lab medis (PDF/JPG).')}
              className="p-1 rounded text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
              title="Lampirkan Dokumen Medis / Surat Rujukan"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Mic / Voice-to-Text Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              disabled={isTranscribing}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                isListening
                  ? 'bg-rose-100 text-[#E11D48] ring-2 ring-rose-400 animate-pulse'
                  : isTranscribing
                  ? 'bg-slate-100 text-[#E11D48] cursor-wait'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
              }`}
              title={
                isListening
                  ? 'Sedang merekam... Klik lagi untuk memproses'
                  : isTranscribing
                  ? 'Sedang memproses suara...'
                  : 'Input Suara (Speech-to-Text Deepgram)'
              }
            >
              {isTranscribing ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#E11D48]" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Dynamic Status / Visual Indicator */}
            {isListening && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11.5px] font-medium bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                Mendengarkan... (Klik mic bila selesai)
              </span>
            )}

            {isTranscribing && (
              <span className="text-[11.5px] text-rose-600 font-medium animate-pulse">
                Mentranskripsi suara (Deepgram AI)...
              </span>
            )}

            {sttMessage && !isListening && !isTranscribing && (
              <span className="text-[11.5px] text-amber-600 font-medium">
                {sttMessage}
              </span>
            )}

            {!isListening && !isTranscribing && !sttMessage && (
              <div className="hidden sm:flex items-center space-x-1 text-[12px] text-[#64748B]">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Layanan Pasien Terverifikasi</span>
              </div>
            )}
          </div>

          {/* Right: Shortcut Hint & Send Button */}
          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline text-[11.5px] text-[#94A3B8]">
              Shift + Enter untuk baris baru
            </span>

            {/* Primary Send Button (36px x 36px, Umbrella Crimson #E11D48, white triangle arrow ▶) */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!inputText.trim() || isLoading}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                !inputText.trim() || isLoading
                  ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                  : 'bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-sm active:scale-95'
              }`}
              aria-label="Kirim Pesan"
            >
              {/* Right-pointing triangle glyph exactly as in screenshot */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                className="translate-x-[1px]"
              >
                <path d="M5 3L19 12L5 21V3Z" />
              </svg>
            </button>
          </div>

        </div>

      </div>

      {/* Persistent Clinical Disclaimer Footer (matching screenshot) */}
      <div className="py-2.5 text-center">
        <p className="text-[11px] sm:text-[11.5px] text-[#64748B] leading-tight select-none">
          Umbrella Hospital AI dapat membuat kesalahan. Harap konfirmasi kondisi darurat langsung dengan petugas triage IGD RS PT Umbrella Corp.
        </p>
      </div>

    </div>
  );
};
