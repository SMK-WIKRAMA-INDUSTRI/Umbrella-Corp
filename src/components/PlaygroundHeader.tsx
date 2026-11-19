import React, { useState, useRef, useEffect, useCallback } from 'react';
import { animate } from 'animejs';
import { BookOpen, Clock, X } from 'lucide-react';
import { UmbrellaLogo } from './UmbrellaLogo';

interface PlaygroundHeaderProps {
  onOpenTutorial: () => void;
  onBackToHome: () => void;
  messageCount: number;
}

export const PlaygroundHeader: React.FC<PlaygroundHeaderProps> = ({
  onOpenTutorial,
  onBackToHome,
  messageCount,
}) => {
  // State modal untuk fitur yang berstatus "Coming Soon"
  const [comingSoonFeature, setComingSoonFeature] = useState<{ title: string; desc: string } | null>(null);

  // State & Ref untuk Navigasi Pill Glasses Jelly ("Ager-Ager" Meluncur Mengikuti Kursor)
  const [activeNav, setActiveNav] = useState('chatbot');
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 88,
    width: 90,
    opacity: 1,
  });

  const navContainerRef = useRef<HTMLElement | null>(null);
  const navItemsRef = useRef<{ [key: string]: HTMLElement | null }>({});
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  const updateIndicator = useCallback((targetId: string) => {
    const container = navContainerRef.current;
    const targetEl = navItemsRef.current[targetId];
    if (container && targetEl) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const targetLeft = targetRect.left - containerRect.left;
      const targetWidth = targetRect.width;

      setIndicatorStyle({
        left: targetLeft,
        width: targetWidth,
        opacity: 1,
      });

      if (indicatorRef.current) {
        try {
          animate(indicatorRef.current, {
            left: `${targetLeft}px`,
            width: `${targetWidth}px`,
            opacity: 1,
            ease: 'outElastic',
            duration: 550,
          });
        } catch (_) {}
      }
    }
  }, []);

  useEffect(() => {
    updateIndicator(hoveredNav || activeNav);
  }, [hoveredNav, activeNav, updateIndicator]);

  useEffect(() => {
    const handleResize = () => updateIndicator(hoveredNav || activeNav);
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [hoveredNav, activeNav, updateIndicator]);

  // Daftar Menu Navigasi Utama (Identik dengan Landing Page)
  const navItems = [
    {
      id: 'beranda',
      label: 'Beranda',
      onClick: onBackToHome,
    },
    {
      id: 'chatbot',
      label: 'Chatbot AI',
      onClick: () => {
        setActiveNav('chatbot');
      },
    },
    {
      id: 'telekonsultasi',
      label: 'Telekonsultasi',
      onClick: () =>
        setComingSoonFeature({
          title: 'Telekonsultasi Dokter Spesialis',
          desc: 'Layanan video call tatap muka dengan dokter spesialis sedang dalam tahap integrasi telemedicine.',
        }),
    },
    {
      id: 'rekam-medis',
      label: 'Rekam Medis',
      onClick: () =>
        setComingSoonFeature({
          title: 'Rekam Medis Digital & Laboratorium',
          desc: 'Portal akses riwayat pemeriksaan, diagnosa dokter, dan hasil laboratorium mandiri sedang dalam tahap standarisasi SIMRS.',
        }),
    },
    {
      id: 'peta-lokasi',
      label: 'Peta Lokasi',
      onClick: () =>
        setComingSoonFeature({
          title: 'Peta Fasilitas & Jaringan Faskes',
          desc: 'Peta interaktif navigasi ruangan rumah sakit serta jaringan klinik RS Umbrella sedang dalam pengembangan.',
        }),
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] select-none flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & Identitas Brand (Kiri) - Klik untuk kembali ke Beranda */}
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-3 text-left group transition-all"
            title="Kembali ke Beranda Umbrella Healthcare"
          >
            <div className="w-9 h-9 rounded-xl bg-[#E11D48] flex items-center justify-center text-white shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
              <UmbrellaLogo size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-[15px] tracking-tight text-[#0F172A]">
                  Umbrella
                </span>
                <span className="font-bold text-[15px] tracking-tight text-[#E11D48]">
                  Healthcare
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none hidden sm:block">
                Peduli Kesehatan Anda
              </p>
            </div>
          </button>

          {/* Navigasi Pill Tengah: HANYA FITUR UTAMA dengan Efek Glasses Jelly ("Ager-Ager") Meluncur Mengikuti Kursor */}
          <nav
            ref={navContainerRef}
            onMouseLeave={() => setHoveredNav(null)}
            className="hidden md:inline-flex items-center bg-slate-100/90 backdrop-blur-md p-1 rounded-full border border-slate-200/90 text-xs font-medium relative shadow-inner select-none transition-all"
          >
            {/* The Glasses Jelly Pill Indicator ("Ager-Ager Merah Bening") with Anime.js Spring */}
            <div
              ref={indicatorRef}
              className="glass-jelly-pill"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
            />

            {navItems.map((item) => {
              const isSelected = (hoveredNav || activeNav) === item.id;
              const itemClasses = `relative z-10 px-4 py-1.5 rounded-full transition-all duration-200 select-none text-xs ${
                isSelected
                  ? 'text-white font-bold drop-shadow-sm scale-[1.02]'
                  : 'text-slate-700 hover:text-black font-semibold'
              }`;

              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    navItemsRef.current[item.id] = el;
                  }}
                  type="button"
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onClick={() => {
                    setActiveNav(item.id);
                    setHoveredNav(null);
                    item.onClick?.();
                  }}
                  className={itemClasses}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Sisi Kanan: Panduan, Masuk & Daftar */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenTutorial}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#E11D48] transition-colors shadow-subtle"
              title="Panduan Penggunaan Asisten AI"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Panduan</span>
            </button>

            <button
              onClick={() =>
                setComingSoonFeature({
                  title: 'Portal Masuk Pasien',
                  desc: 'Layanan login autentikasi pasien sedang disiapkan untuk keamanan data medis terenkripsi.',
                })
              }
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-[#E11D48] transition-colors active:scale-95"
            >
              Masuk
            </button>

            <button
              onClick={() =>
                setComingSoonFeature({
                  title: 'Pendaftaran Akun Pasien Baru',
                  desc: 'Fitur pendaftaran akun digital pasien baru akan segera dibuka pada rilis portal tahap berikutnya.',
                })
              }
              className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm hover:shadow transition-all active:scale-95"
            >
              Daftar
            </button>
          </div>

        </div>

        {/* Bar Navigasi Seluler: Fitur Utama + Segmented Controller Pengaturan/Chat */}
        <div className="md:hidden flex flex-col border-t border-[#F1F5F9] bg-slate-50/90 text-xs select-none">
          {/* Menu Navigasi Seluler */}
          <div className="flex items-center space-x-2 px-4 py-2 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    item.onClick?.();
                  }}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-[#E11D48] text-white font-bold shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 hover:text-[#E11D48]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Modal Universal Fitur Segera Hadir (Coming Soon) */}
      {comingSoonFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2E8F0] shadow-2xl overflow-hidden text-left p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-[#E11D48]">
                <Clock className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-900">
                  {comingSoonFeature.title}
                </h4>
              </div>
              <button
                onClick={() => setComingSoonFeature(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-[11px]">
                <span>Status: Segera Hadir (Coming Soon)</span>
              </div>
              <p>{comingSoonFeature.desc}</p>
              <p className="text-slate-500 pt-1">
                Saat ini, Anda dapat memanfaatkan <strong>Chatbot AI</strong> kami yang telah berfungsi aktif 24 jam untuk menanyakan jadwal dokter, ketersediaan kamar, dan alur penjaminan rumah sakit.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setComingSoonFeature(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
