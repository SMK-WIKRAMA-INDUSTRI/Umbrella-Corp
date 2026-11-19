import React, { useEffect, useRef } from 'react';
import { ChatMessage, ActionPill } from '../types';
import { UmbrellaLogo } from './UmbrellaLogo';
import { CardRenderer } from './CardRenderers';
import { Calendar, Bed, Clock, Pill, LayoutGrid, Sparkles } from 'lucide-react';

interface ChatContainerProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onActionClick: (pill: ActionPill) => void;
  seniorMode: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading,
  onActionClick,
  seniorMode,
}) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Helper to format basic markdown (bold text **text**)
  const formatMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-[#0F172A]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const getPillIcon = (iconName?: string) => {
    switch (iconName) {
      case 'grid':
        return <LayoutGrid className="w-3.5 h-3.5 text-[#64748B]" />;
      case 'calendar':
        return <Calendar className="w-3.5 h-3.5 text-[#64748B]" />;
      case 'bed':
        return <Bed className="w-3.5 h-3.5 text-[#64748B]" />;
      case 'pill':
        return <Pill className="w-3.5 h-3.5 text-[#64748B]" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto px-4 sm:px-0 py-6 sm:py-8 space-y-8 select-text">
      {messages.map((msg) => {
        if (msg.sender === 'user') {
          return (
            <div key={msg.id} className="flex flex-col items-end">
              {/* User Bubble (Level 1 Elevation: pure white #FFFFFF, 1px border #E2E8F0, rounded-xl 12px with tucked bottom-right) */}
              <div
                className={`max-w-[85%] bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] rounded-br-[4px] px-4 py-3 sm:px-5 sm:py-3.5 text-left shadow-subtle ${
                  seniorMode ? 'text-base sm:text-lg' : 'text-[14.5px] sm:text-[15px]'
                } text-[#0F172A] leading-relaxed`}
              >
                {msg.text}
              </div>

              {/* Timestamp + Sent status (e.g. 10:43 WIB • Terkirim) */}
              <div className="mt-1 text-[11.5px] text-[#64748B] pr-1 flex items-center space-x-1 select-none">
                <span>{msg.timestamp}</span>
                {msg.statusText && (
                  <>
                    <span>•</span>
                    <span>{msg.statusText}</span>
                  </>
                )}
              </div>
            </div>
          );
        }

        // AI Response (Level 0 Elevation: seamless & borderless against #F8FAFC)
        return (
          <div key={msg.id} className="flex items-start space-x-3 text-left">
            {/* Compact Umbrella Corp Roundel Logo Badge */}
            <div className="pt-0.5 flex-shrink-0">
              <UmbrellaLogo size={20} className="rounded-full shadow-subtle" />
            </div>

            <div className="flex-1 min-w-0">
              {/* AI Header Line */}
              <div className="flex items-center space-x-2 pb-1.5 select-none">
                <span className="font-semibold text-[14px] text-[#0F172A] tracking-tight">
                  {msg.senderName || 'Umbrella Hospital Assistant'}
                </span>
                <span className="text-[11.5px] text-[#64748B] font-normal">
                  {msg.timestamp}
                </span>
              </div>

              {/* Message Body Content (unboxed, clean typography) */}
              <div
                className={`text-[#0F172A] leading-[1.65] whitespace-pre-line ${
                  seniorMode ? 'text-base sm:text-lg' : 'text-[14.5px] sm:text-[15px]'
                }`}
              >
                {formatMarkdown(msg.text)}
              </div>

              {/* Quick Reply Instruction Pills (e.g. Pendaftaran Poliklinik, Jadwal Dokter, Informasi Kamar & IGD, Layanan Farmasi) */}
              {msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="mt-3.5 flex flex-wrap gap-2 select-none">
                  {msg.quickReplies.map((pill) => (
                    <button
                      key={pill.id}
                      onClick={() => onActionClick(pill)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-medium bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] hover:border-[#E11D48] hover:text-[#BE123C] hover:bg-rose-50/40 transition-all shadow-subtle active:scale-98"
                    >
                      {getPillIcon(pill.icon)}
                      <span>{pill.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Interactive Card Component (e.g. Bed Status Card, Doctor Card, Emergency Alert) */}
              {msg.card && (
                <CardRenderer
                  cardType={msg.card.type}
                  bedData={msg.card.bedData}
                  doctorData={msg.card.doctorData}
                  emergencyData={msg.card.emergencyData}
                  actionPills={msg.actionPills}
                  onActionClick={onActionClick}
                  seniorMode={seniorMode}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* Typing & Processing Indicator (matching Design System specification: 6px circles in #E11D48, pulsing opacity, 'Analyzing query...') */}
      {isLoading && (
        <div className="flex items-start space-x-3 text-left animate-fade-in select-none">
          <div className="pt-0.5 flex-shrink-0">
            <UmbrellaLogo size={20} className="rounded-full shadow-subtle animate-spin-slow" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 pb-1.5">
              <span className="font-semibold text-[14px] text-[#0F172A]">
                Umbrella Hospital Assistant
              </span>
            </div>

            <div className="inline-flex items-center space-x-2 py-1.5">
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] typing-dot-1"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] typing-dot-2"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] typing-dot-3"></span>
              </div>
              <span className="text-xs text-[#64748B] font-medium tracking-wide">
                Analyzing query...
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={scrollEndRef} />
    </div>
  );
};
