import React, { useState, useRef, useEffect, useCallback } from 'react';
import { animate } from 'animejs';
import { BookOpen, Clock, X, Menu, Phone } from 'lucide-react';
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

  // State menu navigasi seluler (Hamburger menu untuk layar HP & Tablet)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        } catch (_) { }
      }
    }
  }, []);

  useEffect(() => {
    updateIndicator(hoveredNav || activeNav);
  }, [hoveredNav, activeNav, updateIndicator]);

  useEffect(() => {
    const handleResize = () => {
      updateIndicator(hoveredNav || activeNav);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [hoveredNav, activeNav, updateIndicator]);

  // Lock body scroll saat hamburger menu mobile terbuka
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

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
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm select-none flex-shrink-0">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 flex items-center justify-between gap-4">

          {/* Logo & Identitas Brand (Kiri) - Klik untuk kembali ke Beranda */}
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-3 sm:space-x-3.5 text-left group transition-all min-w-0"
            title="Kembali ke Beranda Umbrella Healthcare"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#E11D48] flex items-center justify-center text-white shadow-md shadow-rose-500/25 flex-shrink-0 group-hover:scale-105 transition-transform">
              <UmbrellaLogo size={24} className="sm:hidden" />
              <div className="hidden sm:block">
                <UmbrellaLogo size={28} />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-[#0F172A]">
                  Umbrella
                </span>
                <span className="font-bold text-lg sm:text-2xl tracking-tight text-[#E11D48]">
                  Healthcare
                </span>
              </div>
              <p className="text-[11px] sm:text-[13px] text-slate-500 font-medium leading-none hidden sm:block mt-0.5 sm:mt-1 truncate">
                Peduli Kesehatan Anda
              </p>
            </div>
          </button>

          {/* Navigasi Pill Tengah: Desktop Only (>= lg) dengan Efek Glasses Jelly */}
          <nav
            ref={navContainerRef}
            onMouseLeave={() => setHoveredNav(null)}
            className="hidden lg:inline-flex items-center bg-slate-100/90 backdrop-blur-md p-1.5 rounded-full border border-slate-200/90 text-sm font-semibold relative shadow-inner select-none transition-all"
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
              const itemClasses = `relative z-10 px-5 py-2.5 rounded-full transition-all duration-200 select-none text-sm font-semibold ${isSelected
                ? 'text-white font-bold drop-shadow scale-[1.02]'
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

          {/* Sisi Kanan: Desktop (Masuk & Daftar) */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() =>
                setComingSoonFeature({
                  title: 'Portal Masuk Pasien',
                  desc: 'Layanan login autentikasi pasien sedang disiapkan untuk keamanan data medis terenkripsi.',
                })
              }
              className="px-5 py-2.5 text-sm sm:text-base font-semibold text-slate-700 hover:text-[#E11D48] transition-colors active:scale-95"
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
              className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Daftar
            </button>
          </div>

          {/* Sisi Kanan: Mobile / Tablet Controls (Tombol Kembali ke Beranda + Tombol Hamburger Menu) */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={onBackToHome}
              className="px-3.5 py-2 rounded-full bg-rose-50 text-[#E11D48] border border-rose-200 text-xs font-bold flex items-center space-x-1.5 active:scale-95 shadow-2xs"
            >
              <span>Beranda</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#E11D48] transition-all border border-slate-200/80 active:scale-95 focus:outline-none"
              aria-label={isMobileMenuOpen ? 'Tutup Menu Navigasi' : 'Buka Menu Navigasi'}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>

        </div>

        {/* Backdrop Mobile Drawer */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 top-[61px] sm:top-[77px] bg-slate-950/40 backdrop-blur-sm z-30 transition-opacity animate-fade-in"
          />
        )}

        {/* Panel Mobile Hamburger Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 w-full bg-white/98 backdrop-blur-xl border-b border-slate-200 shadow-2xl p-4 sm:p-6 z-40 animate-slide-down max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="space-y-4">

              {/* Header Info Singkat di Menu Mobile */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Navigasi Asisten AI
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#E11D48] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse"></span>
                  Online Siaga 24/7
                </span>
              </div>

              {/* List Item Navigasi */}
              <div className="grid grid-cols-1 gap-2">
                {navItems.map((item) => {
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveNav(item.id);
                        setIsMobileMenuOpen(false);
                        item.onClick?.();
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${isActive
                        ? 'bg-[#E11D48] text-white shadow-md shadow-rose-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                        }`}
                    >
                      <span>{item.label}</span>
                      {item.id === 'chatbot' ? (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white text-[#E11D48]' : 'bg-rose-100 text-[#E11D48]'
                            }`}
                        >
                          AKTIF 24 JAM ✨
                        </span>
                      ) : item.id === 'beranda' ? (
                        <span className="text-xs opacity-70">← Kembali</span>
                      ) : (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                        >
                          Coming Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tombol Panduan & Masuk/Daftar */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenTutorial();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-[#E11D48]" />
                  <span>Buka Panduan Penggunaan AI</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setComingSoonFeature({
                        title: 'Portal Masuk Pasien',
                        desc: 'Layanan login autentikasi pasien sedang disiapkan untuk keamanan data medis terenkripsi.',
                      });
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold text-sm text-center transition-all active:scale-95"
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setComingSoonFeature({
                        title: 'Pendaftaran Akun Pasien Baru',
                        desc: 'Fitur pendaftaran akun digital pasien baru akan segera dibuka pada rilis portal tahap berikutnya.',
                      });
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm text-center shadow-sm transition-all active:scale-95"
                  >
                    Daftar
                  </button>
                </div>
              </div>

              {/* Hotline IGD Darurat Mobile Banner */}
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-left text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#BE123C]">Hotline IGD Darurat: (021) 8065-9911</div>
                  <div className="text-[11px] text-slate-500">Ambulans Siaga 24 Jam: 119</div>
                </div>
                <a
                  href="tel:02180659911"
                  className="px-3 py-1.5 rounded-lg bg-[#E11D48] text-white font-bold text-xs shadow-sm flex items-center space-x-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Panggil</span>
                </a>
              </div>

            </div>
          </div>
        )}
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
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-[#E11D48] font-semibold text-[11px]">
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
