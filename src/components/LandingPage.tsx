import React, { useState, useRef, useEffect, useCallback } from 'react';
import { animate, stagger } from 'animejs';
import {
  MessageSquare,
  Calendar,
  Bed,
  BedDouble,
  PhoneCall,
  ShieldCheck,
  FileText,
  ArrowRight,
  ArrowUpRight,
  Lock,
  Activity,
  ChevronRight,
  AlertTriangle,
  Clock,
  X,
  Phone,
  Mail,
  MapPin,
  Shield,
  Award,
  CheckCircle2,
  Sparkles,
  Menu,
  Calculator,
  Stethoscope,
  Building2,
  Search,
  Check,
  Layers,
  Users,
  CreditCard,
  AlertCircle,
  Info,
} from 'lucide-react';
import { UmbrellaLogo } from './UmbrellaLogo';
import { AnimeBackground } from './AnimeBackground';
import { AuthModal } from './AuthModal';
import { RoomBookingModal } from './RoomBookingModal';
import { MedicalRecordsModal } from './MedicalRecordsModal';
import { LocationMapModal } from './LocationMapModal';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import doctorImg from '../assets/doctors-duo.png';
import { INITIAL_DOCTORS, INSURANCE_PARTNERS, HOSPITAL_METADATA } from '../data/hospitalData';

interface LandingPageProps {
  onLaunchAssistant: (initialPrompt?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchAssistant }) => {
  const { user, profile, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [medicalOpen, setMedicalOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  // Guard: chatbot hanya bisa diakses setelah login
  const openAuthForChat = () => {
    window.alert('Silakan login terlebih dahulu untuk menggunakan fitur chatbot.');
    setAuthMode('login');
    setAuthOpen(true);
  };
  const handleLaunchAssistant = (initialPrompt?: string) => {
    if (!user) {
      openAuthForChat();
      return;
    }
    onLaunchAssistant(initialPrompt);
  };

  // State modal untuk fitur yang berstatus "Coming Soon"
  const [comingSoonFeature, setComingSoonFeature] = useState<{ title: string; desc: string } | null>(null);

  // Filter tab untuk bagian Modul & Layanan Medis
  const [moduleFilter, setModuleFilter] = useState<'all' | 'ai' | 'faskes'>('all');

  // State untuk Pusat Eksplorasi Pasien & Fasilitas Interaktif
  const [hubTab, setHubTab] = useState<'calculator' | 'schedule' | 'bpjs' | 'directory'>('calculator');

  // 1. State Kalkulator Rawat Inap VIP & Denah Bed
  const [calcRoomType, setCalcRoomType] = useState<'aster' | 'melati' | 'vvip'>('aster');
  const [calcNights, setCalcNights] = useState<number>(2);
  const [calcExtraSofa, setCalcExtraSofa] = useState<boolean>(true);
  const [calcGourmet, setCalcGourmet] = useState<boolean>(false);
  const [calcButler, setCalcButler] = useState<boolean>(false);
  const [selectedBedId, setSelectedBedId] = useState<string>('AST-401');

  // 2. State Jadwal Dokter Spesialis Siaga Harian
  const [scheduleDay, setScheduleDay] = useState<string>('Senin');
  const [scheduleSpecialty, setScheduleSpecialty] = useState<string>('Semua');

  // 3. State Simulator BPJS & Asuransi Cashless
  const [bpjsEmergency, setBpjsEmergency] = useState<boolean>(false);
  const [bpjsChecklist, setBpjsChecklist] = useState<{ rujukan: boolean; ktp: boolean; antrean: boolean }>({
    rujukan: true,
    ktp: true,
    antrean: false,
  });
  const [insuranceSearch, setInsuranceSearch] = useState<string>('');
  const [selectedInsuranceName, setSelectedInsuranceName] = useState<string>('Prudential Indonesia (PRUmedical Network)');

  // 4. State Peta Denah Lantai Gedung
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedFacilityKey, setSelectedFacilityKey] = useState<string>('igd');

  // Pertanyaan Cepat Interaktif untuk menguji Chatbot AI langsung dari Card
  const quickPrompts = [
    { label: 'Cek Kamar VIP Aster', query: 'Apakah kamar VIP Aster tersedia saat ini?' },
    { label: 'Jadwal Dokter Anak', query: 'Bisa cek jadwal praktik dokter spesialis anak?' },
    { label: 'Alur Rujukan BPJS', query: 'Bagaimana prosedur alur rujukan faskes tingkat 1 BPJS?' },
    { label: 'Hotline IGD 24 Jam', query: 'Berapa nomor telepon darurat IGD dan ambulans RS Umbrella?' },
  ];

  // State newsletter buletin kesehatan
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSubscribed(false);
    }, 4500);
  };

  // State menu navigasi seluler (Hamburger menu untuk layar HP & Tablet)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoomBookingOpen, setIsRoomBookingOpen] = useState(false);

  // State & Ref untuk Navigasi Pill Ager-Ager (Glasses Jelly Highlight yang meluncur halus mengikuti kursor)
  const [activeNav, setActiveNav] = useState('beranda');
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 4,
    width: 80,
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

  // Anime.js v4: Animasi Masuk Bergaya AnimeJS Showcase (Stagger & Spring)
  useEffect(() => {
    try {
      const heroNodes = document.querySelectorAll('.anime-hero-stagger');
      if (heroNodes.length > 0) {
        animate(heroNodes, {
          translateY: [28, 0],
          opacity: [0, 1],
          delay: stagger(100),
          ease: 'outExpo',
          duration: 1050,
        });
      }

      const doctorNode = document.querySelector('.anime-doctor-float');
      if (doctorNode) {
        const docAnim = animate(doctorNode, {
          translateY: [-10, 10],
          duration: 3600,
          alternate: true,
          loop: true,
          ease: 'inOutSine',
        });
        return () => {
          try {
            docAnim.pause();
          } catch (_) { }
        };
      }
    } catch (err) {
      console.warn('Hero anime error:', err);
    }
  }, []);

  // Bento grid staggered reveal when filter changes
  useEffect(() => {
    try {
      const bentoNodes = document.querySelectorAll('.bento-anime-card');
      if (bentoNodes.length > 0) {
        animate(bentoNodes, {
          translateY: [28, 0],
          opacity: [0, 1],
          scale: [0.97, 1],
          delay: stagger(80),
          ease: 'outBack',
          duration: 700,
        });
      }
    } catch (err) {
      console.warn('Bento anime error:', err);
    }
  }, [moduleFilter]);

  // Daftar Menu Navigasi Utama
  const navItems = [
    {
      id: 'beranda',
      label: 'Beranda',
      href: '#beranda',
      isAnchor: true,
    },
    {
      id: 'peta-lokasi',
      label: 'Peta Lokasi',
      onClick: () => setLocationOpen(true),
    },
  ];

  // Hanya Chatbot AI yang AKTIF & BERFUNGSI, seluruh fitur lain berstatus COMING SOON
  const capabilities = [
    {
      id: 'ai-concierge',
      title: 'Chatbot AI (Asisten Pasien)',
      badge: 'AKTIF • BERFUNGSI',
      badgeActive: true,
      description:
        'Satu-satunya fitur yang telah berfungsi aktif saat ini. Layanan cerdas 24 jam untuk konsultasi rawat inap, jadwal dokter, alur rujukan BPJS, dan panduan IGD.',
      actionLabel: 'Buka Chatbot AI',
      isPrimaryAction: true,
      icon: MessageSquare,
      accessibleNow: true,
    },
    {
      id: 'doctor-directory',
      title: 'Direktori & Jadwal Praktik Dokter',
      badge: 'COMING SOON',
      badgeActive: false,
      description:
        'Sistem reservasi dan direktori dokter spesialis 17 poliklinik terintegrasi antrean realtime. (Dalam Tahap Pengembangan).',
      actionLabel: 'Segera Hadir (Coming Soon)',
      isPrimaryAction: false,
      icon: Calendar,
      accessibleNow: false,
    },
    {
      id: 'bed-telemetry',
      title: 'Telemetri Rawat Inap & ICU Real-Time',
      badge: 'COMING SOON',
      badgeActive: false,
      description:
        'Dashboard ketersediaan tempat tidur kamar VIP Aster, Melati, dan ruang perawatan intensif secara langsung. (Dalam Tahap Pengembangan).',
      actionLabel: 'Segera Hadir (Coming Soon)',
      isPrimaryAction: false,
      icon: Bed,
      accessibleNow: false,
    },
    {
      id: 'emergency-triage',
      title: 'Triase Gawat Darurat Akut 24 Jam',
      badge: 'COMING SOON',
      badgeActive: false,
      description:
        'Sistem pemanggilan ambulans otomatis dan pra-triase digital untuk kondisi darurat. (Dalam Tahap Pengembangan).',
      actionLabel: 'Segera Hadir (Coming Soon)',
      isPrimaryAction: false,
      icon: PhoneCall,
      accessibleNow: false,
    },
    {
      id: 'insurance-gateway',
      title: 'Gerbang Asuransi Cashless & BPJS',
      badge: 'COMING SOON',
      badgeActive: false,
      description:
        'Verifikasi otomatis eligibilitas kartu asuransi rekanan dan validasi rujukan online faskes 1. (Dalam Tahap Pengembangan).',
      actionLabel: 'Segera Hadir (Coming Soon)',
      isPrimaryAction: false,
      icon: ShieldCheck,
      accessibleNow: false,
    },
    {
      id: 'diagnostic-records',
      title: 'Rekam Medis & Hasil Laboratorium',
      badge: 'COMING SOON',
      badgeActive: false,
      description:
        'Portal unduh berkas hasil tes laboratorium dan radiologi CT Scan dengan enkripsi aman. (Dalam Tahap Pengembangan).',
      actionLabel: 'Segera Hadir (Coming Soon)',
      isPrimaryAction: false,
      icon: FileText,
      accessibleNow: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">

      {/* Header Navigasi Atas Responsif (Hamburger Menu di Mobile & Tablet, Jelly Pill di Desktop) */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm select-none">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 flex items-center justify-between gap-4">

          {/* Logo & Identitas Brand (Kiri) */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 sm:space-x-3.5 text-left group transition-all min-w-0"
            title="Umbrella Healthcare"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#E11D48] flex items-center justify-center text-white shadow-md shadow-rose-500/25 flex-shrink-0 transition-transform hover:scale-105">
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

          {/* Navigasi Pill Tengah: Desktop Only (Layar Besar >= lg) dengan Efek Glasses Jelly */}
          <nav
            ref={navContainerRef}
            onMouseLeave={() => setHoveredNav(null)}
            className="hidden lg:inline-flex items-center bg-slate-100/90 backdrop-blur-md p-1.5 rounded-full border border-slate-200/90 text-sm font-semibold relative shadow-inner select-none transition-all"
          >
            {/* The Glasses Jelly Pill Indicator ("Ager-Ager") with Anime.js Spring */}
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
              const itemClasses = `relative z-10 px-5 py-2.5 rounded-full transition-all duration-200 select-none text-sm font-semibold ${
                isSelected
                  ? 'text-white font-bold drop-shadow scale-[1.02]'
                  : 'text-slate-700 hover:text-black font-semibold'
              }`;

              if (item.isAnchor) {
                return (
                  <a
                    key={item.id}
                    ref={(el) => {
                      navItemsRef.current[item.id] = el;
                    }}
                    href={item.href}
                    onMouseEnter={() => setHoveredNav(item.id)}
                    onClick={() => {
                      setActiveNav(item.id);
                      setHoveredNav(null);
                    }}
                    className={itemClasses}
                  >
                    {item.label}
                  </a>
                );
              }

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

          {/* Sisi Kanan: Desktop (Masuk & Daftar / Akun) */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <UserIcon className="w-4 h-4 text-[#E11D48]" />
                  {profile?.username || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthOpen(true);
                  }}
                  className="px-5 py-2.5 text-sm sm:text-base font-semibold text-slate-700 hover:text-[#E11D48] transition-colors active:scale-95"
                >
                  Masuk
                </button>

                <button
                  onClick={() => {
                    setAuthMode('register');
                    setAuthOpen(true);
                  }}
                  className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  Daftar
                </button>
              </>
            )}
          </div>

          {/* Sisi Kanan: Mobile / Tablet Controls (Tombol Chat Cepat + Tombol Hamburger Menu) */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => handleLaunchAssistant()}
              className="px-3.5 py-2 rounded-full bg-rose-50 text-[#E11D48] border border-rose-200 text-xs font-bold flex items-center space-x-1.5 active:scale-95 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse"></span>
              <span>Chat AI</span>
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
                  Navigasi Layanan Medis
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#E11D48] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse"></span>
                  Sistem AI Aktif
                </span>
              </div>

              {/* List Item Navigasi Utama */}
              <div className="grid grid-cols-1 gap-2">
                {navItems.map((item) => {
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveNav(item.id);
                        setIsMobileMenuOpen(false);
                        if (item.isAnchor) {
                          window.location.hash = item.href || '#';
                        } else {
                          item.onClick?.();
                        }
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[#E11D48] text-white shadow-md shadow-rose-500/20'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.id === 'chatbot' ? (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-white text-[#E11D48]' : 'bg-rose-100 text-[#E11D48]'
                          }`}
                        >
                          AKTIF 24 JAM ✨
                        </span>
                      ) : item.id === 'beranda' ? (
                        <span className="text-xs opacity-70">Utama</span>
                      ) : (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          Coming Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tombol Aksi Masuk & Daftar untuk Mobile */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                {user ? null : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAuthMode('login');
                    setAuthOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold text-sm text-center transition-all active:scale-95"
                >
                  Masuk
                </button>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAuthMode('register');
                     setAuthOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm text-center shadow-sm transition-all active:scale-95"
                >
                  Daftar
                </button>
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

      {/* Bagian Hero: Responsif untuk Semua Layar (Mobile, Tablet, Desktop) Tanpa Terpotong */}
      <section id="beranda" className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-24 border-b border-[#E2E8F0] bg-white">

        {/* Anime.js Interactive Staggered Grid Background */}
        <AnimeBackground />

        {/* Subtle Ambient Background Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1100px] h-[400px] bg-gradient-to-b from-rose-50/50 via-white to-transparent -z-10 blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">

            {/* Kolom Kiri: Judul Utama + Deskripsi Ringkas + Tombol Pill */}
            <div className="lg:col-span-3 xl:col-span-3 space-y-4 sm:space-y-5 text-center lg:text-left">
              <h1 className="anime-hero-stagger text-3xl sm:text-4xl lg:text-[2.8rem] xl:text-[3.2rem] font-bold tracking-tight text-[#0F172A] leading-[1.12]">
                Pelayanan Medis <br className="hidden sm:inline" />
                <span className="text-[#E11D48]">Modern &amp; Terpadu</span>
              </h1>

              <p className="anime-hero-stagger text-sm sm:text-base text-slate-500 leading-relaxed max-w-md mx-auto lg:mx-0 font-normal">
                Pusat layanan kesehatan yang peduli dengan setiap pasien, didukung dokter spesialis dan asisten cerdas siaga 24 jam.
              </p>

              <div className="anime-hero-stagger pt-1 sm:pt-2 flex justify-center lg:justify-start">
                <button
                  onClick={() => handleLaunchAssistant()}
                  className="inline-flex items-center space-x-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-medium text-sm shadow-sm hover:shadow transition-all active:scale-95 hover:scale-105 group"
                >
                  <span>Konsultasi AI</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </button>
              </div>
            </div>

            {/* Kolom Tengah: Foto Dokter dengan Ukuran Lebih Besar & Gagah */}
            <div className="lg:col-span-6 xl:col-span-6 relative flex items-end justify-center min-h-[320px] sm:min-h-[440px] lg:min-h-[520px]">
              <div className="relative w-full max-w-[340px] sm:max-w-[480px] md:max-w-[580px] lg:max-w-[680px] xl:max-w-[740px] flex items-end justify-center z-10 anime-doctor-float select-none">
                <img
                  src={doctorImg}
                  alt="Dokter RS PT Umbrella Corp"
                  className="w-full h-auto max-h-[380px] sm:max-h-[500px] lg:max-h-[580px] xl:max-h-[640px] object-contain object-bottom select-none filter drop-shadow-xl scale-105 sm:scale-115 lg:scale-120 xl:scale-125 origin-bottom transition-transform duration-300"
                  loading="eager"
                />
              </div>
            </div>

            {/* Kolom Kanan: Sisi Teknologi Bersih & Elegan */}
            <div className="lg:col-span-3 xl:col-span-3 space-y-4 text-center lg:text-left lg:pl-4">
              <h2 className="anime-hero-stagger text-2xl sm:text-3xl lg:text-[2.4rem] xl:text-[2.7rem] font-bold tracking-tight text-[#0F172A] leading-[1.15]">
                Dengan <br className="hidden lg:inline" />
                Kecerdasan <br className="hidden lg:inline" />
                <span className="text-[#E11D48]">Buatan</span>
              </h2>

              <p className="anime-hero-stagger text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto lg:mx-0 font-normal">
                Peralatan diagnostik digital dan asisten AI bekerja terpadu untuk kemudahan cek jadwal dokter dan rawat inap Anda.
              </p>

              <div className="anime-hero-stagger pt-1 sm:pt-2 flex justify-center lg:justify-start">
                <button
                  onClick={() => handleLaunchAssistant()}
                  className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-[#E11D48] hover:text-[#BE123C] hover:underline group transition-all"
                >
                  <span>Mulai Konsultasi AI Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Pusat Eksplorasi Pasien & Fasilitas Rumah Sakit (Fitur Interaktif Nyata & Edukatif) */}
      <section id="fitur-layanan" className="py-16 sm:py-24 max-w-[1300px] mx-auto px-4 sm:px-6 w-full">

        {/* Header Bagian: Terpusat, Elegan, Interaktif */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
          <span className="text-xs font-bold text-[#E11D48] tracking-widest uppercase inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse"></span>
            PUSAT INTERAKTIF PASIEN &amp; RS UMBRELLA
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A]">
            Eksplorasi Fasilitas &amp; Simulasi Pasien
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Bukan sekadar daftar informasi statis—gunakan simulator interaktif kami untuk menghitung estimasi biaya rawat inap VIP, memeriksa jadwal dokter spesialis siaga hari ini, menguji kesiapan berkas BPJS, hingga meninjau direktori denah tiap lantai gedung kami.
          </p>
        </div>

        {/* Tab Navigasi Interaktif (4 Tab Berbasis Warna Merah, Putih, Hitam) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 p-1.5 bg-slate-100/90 rounded-2xl max-w-3xl mx-auto border border-slate-200 shadow-inner">
          <button
            onClick={() => setHubTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              hubTab === 'calculator'
                ? 'bg-[#E11D48] text-white shadow-md'
                : 'bg-transparent text-slate-700 hover:text-[#0F172A] hover:bg-white/80'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Kalkulator &amp; Kamar VIP</span>
          </button>

          <button
            onClick={() => setHubTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              hubTab === 'schedule'
                ? 'bg-[#E11D48] text-white shadow-md'
                : 'bg-transparent text-slate-700 hover:text-[#0F172A] hover:bg-white/80'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Jadwal Dokter Siaga</span>
          </button>

          <button
            onClick={() => setHubTab('bpjs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              hubTab === 'bpjs'
                ? 'bg-[#E11D48] text-white shadow-md'
                : 'bg-transparent text-slate-700 hover:text-[#0F172A] hover:bg-white/80'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Simulator BPJS &amp; Asuransi</span>
          </button>

          <button
            onClick={() => setHubTab('directory')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              hubTab === 'directory'
                ? 'bg-[#E11D48] text-white shadow-md'
                : 'bg-transparent text-slate-700 hover:text-[#0F172A] hover:bg-white/80'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Denah Tiap Lantai RS</span>
          </button>
        </div>

        {/* Konten Tab 1: Kalkulator Biaya & Visualisasi Ranjang VIP */}
        {hubTab === 'calculator' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 lg:p-10 transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Kolom Kiri: Konfigurasi Kamar & Opsi Inap (7 Kolom) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mb-1 flex items-center gap-2.5">
                    <Bed className="w-6 h-6 text-[#E11D48]" />
                    <span>Simulasi Tarif Rawat Inap &amp; Ketersediaan Ranjang</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal">
                    Pilih tipe paviliun, jumlah malam rawat inap, serta fasilitas pendamping untuk mendapatkan rincian estimasi biaya transparan.
                  </p>
                </div>

                {/* Pemilihan Tipe Kamar */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Pilih Tipe Paviliun Kamar:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCalcRoomType('aster');
                        setSelectedBedId('AST-401');
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        calcRoomType === 'aster'
                          ? 'border-[#E11D48] bg-rose-50/60 ring-2 ring-rose-300'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-[#0F172A]">VIP Aster</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E11D48] text-white">
                          4 Bed Siap
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">Lantai 4 Gedung Utama</p>
                      <p className="text-xs font-black text-[#E11D48]">Rp 1.650.000 <span className="font-normal text-[10px] text-slate-500">/malam</span></p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCalcRoomType('melati');
                        setSelectedBedId('MLT-405');
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        calcRoomType === 'melati'
                          ? 'border-[#E11D48] bg-rose-50/60 ring-2 ring-rose-300'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-[#0F172A]">VIP Melati</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E11D48] text-white">
                          2 Bed Siap
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">Lantai 4 Wing Timur</p>
                      <p className="text-xs font-black text-[#E11D48]">Rp 1.650.000 <span className="font-normal text-[10px] text-slate-500">/malam</span></p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCalcRoomType('vvip');
                        setSelectedBedId('VVIP-501');
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        calcRoomType === 'vvip'
                          ? 'border-[#E11D48] bg-rose-50/60 ring-2 ring-rose-300'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-[#0F172A]">VVIP Aster Suite</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0F172A] text-white">
                          2 Suite Siap
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">Lantai 5 Penthouse</p>
                      <p className="text-xs font-black text-[#E11D48]">Rp 2.850.000 <span className="font-normal text-[10px] text-slate-500">/malam</span></p>
                    </button>
                  </div>
                </div>

                {/* Durasi Menginap */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Durasi Menginap Pasien:
                    </label>
                    <span className="text-xs font-black text-[#E11D48] bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                      {calcNights} Malam
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 5, 7].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCalcNights(n)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          calcNights === n
                            ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {n} Malam
                      </button>
                    ))}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setCalcNights(Math.max(1, calcNights - 1))}
                        className="px-2.5 py-2 text-slate-700 hover:bg-slate-200 font-black text-sm"
                        title="Kurangi 1 Malam"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalcNights(calcNights + 1)}
                        className="px-2.5 py-2 text-slate-700 hover:bg-slate-200 font-black text-sm"
                        title="Tambah 1 Malam"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Layanan Fasilitas Pendamping Tambahan */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Fasilitas Pendamping Tambahan (Opsional):
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition-all">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={calcExtraSofa}
                          onChange={(e) => setCalcExtraSofa(e.target.checked)}
                          className="w-4 h-4 accent-[#E11D48] rounded cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#0F172A]">Ekstra Sofa Bed &amp; Selimut Pasien</p>
                          <p className="text-[11px] text-slate-500">Kenyamanan ekstra untuk 1 orang anggota keluarga penunggu</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700">+Rp 150.000 /mlm</span>
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition-all">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={calcGourmet}
                          onChange={(e) => setCalcGourmet(e.target.checked)}
                          className="w-4 h-4 accent-[#E11D48] rounded cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#0F172A]">Paket Nutrisi Gourmet Keluarga</p>
                          <p className="text-[11px] text-slate-500">Menu makanan lezat racikan Chef RS untuk 1 orang penunggu (3x makan)</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700">+Rp 200.000 /mlm</span>
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition-all">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={calcButler}
                          onChange={(e) => setCalcButler(e.target.checked)}
                          className="w-4 h-4 accent-[#E11D48] rounded cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#0F172A]">Butler Medis Pribadi 24 Jam</p>
                          <p className="text-[11px] text-slate-500">Pendampingan khusus pengurusan admisi, resep obat, &amp; logistik kamar</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700">+Rp 300.000 /mlm</span>
                    </label>
                  </div>
                </div>

                {/* Fasilitas Kamar Default */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E11D48]" />
                    <span>Fasilitas Standar Sudah Termasuk di Setiap Kamar:</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]"></span>
                      <span>Ranjang Elektrik Hill-Rom Remote</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]"></span>
                      <span>Kamar Mandi Dalam Water Heater</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]"></span>
                      <span>Smart TV LED + WiFi RS Cepat</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]"></span>
                      <span>Air Purifier Medis HEPA H13</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Kolom Kanan: Visual Denah Ranjang & Kalkulasi Biaya (5 Kolom) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-slate-50/70 p-6 rounded-3xl border border-slate-200">
                
                {/* Visualisasi Ranjang Kamar yang Siap Huni */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Visualisasi Ranjang Siap Huni:
                    </h4>
                    <span className="text-[11px] font-bold text-[#E11D48] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-ping"></span>
                      Status Live SIMRS
                    </span>
                  </div>

                  <p className="text-[11.5px] text-slate-500 mb-3">
                    Klik salah satu ranjang untuk memilih posisi ruangan pasien:
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    {calcRoomType === 'aster' && [
                      { id: 'AST-401', label: 'Bed Aster 401', view: 'City View' },
                      { id: 'AST-402', label: 'Bed Aster 402', view: 'Garden View' },
                      { id: 'AST-403', label: 'Bed Aster 403', view: 'Courtyard' },
                      { id: 'AST-404', label: 'Bed Aster 404', view: 'Skyline' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBedId(b.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedBedId === b.id
                            ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-md'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold">{b.label}</span>
                          <Bed className="w-3.5 h-3.5 opacity-80" />
                        </div>
                        <span className={`text-[10px] block mt-1 ${selectedBedId === b.id ? 'text-white/90' : 'text-slate-400'}`}>
                          {b.view} • Steril
                        </span>
                      </button>
                    ))}

                    {calcRoomType === 'melati' && [
                      { id: 'MLT-405', label: 'Bed Melati 405', view: 'Taman Timur' },
                      { id: 'MLT-406', label: 'Bed Melati 406', view: 'Courtyard Hening' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBedId(b.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedBedId === b.id
                            ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-md'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold">{b.label}</span>
                          <Bed className="w-3.5 h-3.5 opacity-80" />
                        </div>
                        <span className={`text-[10px] block mt-1 ${selectedBedId === b.id ? 'text-white/90' : 'text-slate-400'}`}>
                          {b.view} • Steril
                        </span>
                      </button>
                    ))}

                    {calcRoomType === 'vvip' && [
                      { id: 'VVIP-501', label: 'Suite VVIP 501', view: 'Penthouse View' },
                      { id: 'VVIP-502', label: 'Suite VVIP 502', view: 'Sky Suite 180°' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBedId(b.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedBedId === b.id
                            ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-md'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold">{b.label}</span>
                          <Bed className="w-3.5 h-3.5 opacity-80" />
                        </div>
                        <span className={`text-[10px] block mt-1 ${selectedBedId === b.id ? 'text-white/90' : 'text-slate-400'}`}>
                          {b.view} • Steril
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Ranjang Dipilih: <strong className="text-[#0F172A]">{selectedBedId}</strong></span>
                    <span className="text-[#E11D48] font-bold">Siap Huni Segera</span>
                  </div>
                </div>

                {/* Ringkasan Perhitungan Biaya Transparan */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Rincian Perhitungan Biaya:
                  </h4>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Tarif Kamar ({calcNights} malam x {calcRoomType === 'vvip' ? 'Rp 2.850.000' : 'Rp 1.650.000'}):</span>
                      <span className="font-bold text-slate-800">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                          (calcRoomType === 'vvip' ? 2850000 : 1650000) * calcNights
                        )}
                      </span>
                    </div>

                    {((calcExtraSofa ? 150000 : 0) + (calcGourmet ? 200000 : 0) + (calcButler ? 300000 : 0)) > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Layanan Tambahan Terpilih ({calcNights} malam):</span>
                        <span className="font-bold text-slate-800">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                            ((calcExtraSofa ? 150000 : 0) + (calcGourmet ? 200000 : 0) + (calcButler ? 300000 : 0)) * calcNights
                          )}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>Biaya Registrasi &amp; SIMRS:</span>
                      <span className="font-bold text-[#E11D48]">GRATIS (Rp 0)</span>
                    </div>
                  </div>

                  {/* Total Estimasi */}
                  <div className="p-4 rounded-2xl bg-white border-2 border-rose-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Estimasi Biaya:</p>
                      <p className="text-xl sm:text-2xl font-black text-[#E11D48]">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                          ((calcRoomType === 'vvip' ? 2850000 : 1650000) +
                            (calcExtraSofa ? 150000 : 0) +
                            (calcGourmet ? 200000 : 0) +
                            (calcButler ? 300000 : 0)) *
                            calcNights
                        )}
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <span>Estimasi transparan</span>
                      <p className="text-slate-500 font-semibold">{calcNights} Malam Inap</p>
                    </div>
                  </div>

                  {/* Tombol Aksi Menghubungkan ke Chatbot AI */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleLaunchAssistant(
                          `Halo, saya ingin menanyakan ketersediaan dan reservasi kamar ${
                            calcRoomType === 'vvip' ? 'VVIP Aster Suite' : calcRoomType === 'aster' ? 'VIP Aster' : 'VIP Melati'
                          } ranjang ${selectedBedId} untuk estimasi ${calcNights} malam inap.`
                        )
                      }
                      className="w-full py-3 px-4 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      <span>Tanya &amp; Reservasi Kamar ke Asisten AI</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href="tel:+622180659911"
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#E11D48]" />
                      <span>Telepon Admisi Rawat Inap (021) 8065-9911</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setIsRoomBookingOpen(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border border-emerald-700 flex items-center justify-center gap-2 transition-all"
                    >
                      <BedDouble className="w-3.5 h-3.5" />
                      <span>Reservasi Kamar</span>
                    </button>
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

        {/* Konten Tab 2: Cek Jadwal Dokter Spesialis Siaga Harian */}
        {hubTab === 'schedule' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 lg:p-10 transition-all space-y-6">
            
            {/* Filter Hari Praktik (Senin - Sabtu) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-[#E11D48]" />
                  <span>Jadwal Dokter Spesialis Siaga Harian</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-normal">
                  Pilih hari untuk melihat daftar dokter spesialis yang sedang siaga, jam praktik, dan sisa kuota antrean hari ini.
                </p>
              </div>

              {/* Hari Praktik Selector */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setScheduleDay(day)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      scheduleDay === day
                        ? 'bg-[#E11D48] text-white shadow-sm'
                        : 'bg-transparent text-slate-700 hover:text-[#0F172A] hover:bg-white'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Spesialisasi */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap mr-1">Filter Poli:</span>
              {['Semua', 'Penyakit Dalam', 'Anak', 'Jantung', 'Kandungan', 'Bedah', 'Saraf', 'Kulit'].map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => setScheduleSpecialty(spec)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
                    scheduleSpecialty === spec
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            {/* Grid Kartu Dokter yang Siaga pada Hari Tersebut */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {INITIAL_DOCTORS.filter((doc) => {
                const matchDay = doc.days.includes(scheduleDay);
                if (!matchDay) return false;
                if (scheduleSpecialty === 'Semua') return true;
                return doc.specialty.toLowerCase().includes(scheduleSpecialty.toLowerCase());
              }).map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-[#E11D48] hover:shadow-lg transition-all duration-300 flex flex-col justify-between bg-white group"
                >
                  <div>
                    {/* Header: Avatar, Status, Kuota */}
                    <div className="flex items-start gap-3.5 mb-3.5">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-[#E11D48] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 truncate">
                            {doc.specialty}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                            ★ {doc.rating}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-[#0F172A] leading-snug truncate group-hover:text-[#E11D48] transition-colors">
                          {doc.name}
                        </h4>
                        <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                          {doc.subSpecialty || doc.title}
                        </p>
                      </div>
                    </div>

                    {/* Rincian Jam Praktik & Ruangan */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 mb-3">
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#E11D48]" />
                          Jam Praktik:
                        </span>
                        <strong className="text-slate-900">{doc.hours}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#E11D48]" />
                          Ruang Poli:
                        </span>
                        <strong className="text-slate-900">{doc.room}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11.5px] pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">Sisa Kuota Antrean:</span>
                        <span className="font-black text-[#E11D48]">
                          {doc.quotaAvailable} dari {doc.quotaTotal} Antrean
                        </span>
                      </div>
                    </div>

                    {/* Tag Jaminan */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        BPJS Kesehatan
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Asuransi Cashless
                      </span>
                    </div>
                  </div>

                  {/* Tombol Buat Janji via AI */}
                  <button
                    type="button"
                    onClick={() =>
                      handleLaunchAssistant(
                        `Halo, saya ingin reservasi nomor antrean dokter ${doc.name} (${doc.specialty}) untuk jadwal hari ${scheduleDay} di ${doc.room}.`
                      )
                    }
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-[#E11D48] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <span>Daftar Janji Temu via AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Fallback Jika Tidak Ada Dokter di Filter Ini */}
            {INITIAL_DOCTORS.filter((doc) => {
              const matchDay = doc.days.includes(scheduleDay);
              if (!matchDay) return false;
              if (scheduleSpecialty === 'Semua') return true;
              return doc.specialty.toLowerCase().includes(scheduleSpecialty.toLowerCase());
            }).length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <AlertCircle className="w-8 h-8 text-[#E11D48] mx-auto" />
                <p className="font-bold text-sm text-slate-800">
                  Tidak ada dokter poli {scheduleSpecialty} yang berjadwal pada hari {scheduleDay}.
                </p>
                <p className="text-xs text-slate-500">
                  Silakan pilih hari lain (misal Senin atau Kamis) atau klik tombol Semua Poli untuk melihat dokter siaga lainnya.
                </p>
                <button
                  type="button"
                  onClick={() => setScheduleSpecialty('Semua')}
                  className="px-4 py-2 rounded-xl bg-[#E11D48] text-white font-bold text-xs"
                >
                  Tampilkan Semua Dokter Hari {scheduleDay}
                </button>
              </div>
            )}

          </div>
        )}

        {/* Konten Tab 3: Simulator Syarat Berkas BPJS & Cek Rekanan Asuransi */}
        {hubTab === 'bpjs' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 lg:p-10 transition-all space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              
              {/* Kolom Kiri: Simulator Syarat Berkas BPJS (6 Kolom) */}
              <div className="lg:col-span-6 space-y-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mb-1 flex items-center gap-2.5">
                    <ShieldCheck className="w-6 h-6 text-[#E11D48]" />
                    <span>Simulator Kesiapan Berkas BPJS Kesehatan</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal">
                    Ketahui apakah Anda memerlukan surat rujukan Faskes 1 atau dapat langsung ditangani di IGD secara bebas rujukan.
                  </p>
                </div>

                {/* Toggle Kasus: Gawat Darurat vs Rawat Jalan */}
                <div className="p-1.5 bg-slate-100 rounded-2xl border border-slate-200 flex">
                  <button
                    type="button"
                    onClick={() => setBpjsEmergency(false)}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                      !bpjsEmergency
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-slate-600 hover:text-[#0F172A]'
                    }`}
                  >
                    Rawat Jalan / Poliklinik
                  </button>
                  <button
                    type="button"
                    onClick={() => setBpjsEmergency(true)}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                      bpjsEmergency
                        ? 'bg-[#E11D48] text-white shadow-sm'
                        : 'text-slate-600 hover:text-[#0F172A]'
                    }`}
                  >
                    Kondisi Gawat Darurat (IGD)
                  </button>
                </div>

                {/* Kondisi 1: Gawat Darurat (100% Bebas Rujukan) */}
                {bpjsEmergency ? (
                  <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-3">
                    <div className="flex items-center gap-2 text-[#BE123C] font-black text-sm uppercase tracking-wide">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <span>100% Bebas Rujukan Faskes 1!</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Sesuai <strong>Permenkes RI No. 47/2018 &amp; Regulasi BPJS Kesehatan</strong>, pasien dalam kondisi gawat darurat (sesak napas akut, henti jantung, penurunan kesadaran, trauma perdarahan hebat, demam tinggi kejang pada anak) <strong>TIDAK MEMERLUKAN SURAT RUJUKAN</strong> dari Puskesmas/Klinik.
                    </p>
                    <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs text-slate-800 space-y-1">
                      <p className="font-bold text-[#0F172A]">Dokumen yang Dibutuhkan di IGD:</p>
                      <p className="text-slate-600 text-[11.5px]">• Cukup bawa KTP Asli / KIS Digital di aplikasi Mobile JKN (Penanganan medis selalu didahulukan daripada administrasi).</p>
                    </div>
                    <div className="pt-1 flex gap-2">
                      <a
                        href="tel:+622180659911"
                        className="flex-1 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Hotline IGD: (021) 8065-9911</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Kondisi 2: Rawat Jalan Poliklinik (Checklist Mandiri) */
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Checklist Berkas Pasien Rawat Jalan:
                    </p>

                    <div className="space-y-2.5">
                      <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          checked={bpjsChecklist.rujukan}
                          onChange={(e) => setBpjsChecklist({ ...bpjsChecklist, rujukan: e.target.checked })}
                          className="w-4 h-4 accent-[#E11D48] rounded cursor-pointer"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-[#0F172A]">Surat Rujukan Online Faskes 1 Aktif</p>
                          <p className="text-[11px] text-slate-500">Dari Puskesmas / Klinik Pratama (Masa berlaku 90 hari di PCare)</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          checked={bpjsChecklist.ktp}
                          onChange={(e) => setBpjsChecklist({ ...bpjsChecklist, ktp: e.target.checked })}
                          className="w-4 h-4 accent-[#E11D48] rounded cursor-pointer"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-[#0F172A]">e-KTP Asli / Kartu KIS Digital</p>
                          <p className="text-[11px] text-slate-500">Status kepesertaan aktif di Mobile JKN (atau kartu fisik KIS)</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          checked={bpjsChecklist.antrean}
                          onChange={(e) => setBpjsChecklist({ ...bpjsChecklist, antrean: e.target.checked })}
                          className="w-4 h-4 accent-[#E11D48] rounded cursor-pointer"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-[#0F172A]">Surat Kontrol Ulang Dokter DPJP (Jika Kontrol Lanjutan)</p>
                          <p className="text-[11px] text-slate-500">Wajib dilampirkan jika kunjungan kedua atau perawatan pasca rawat inap</p>
                        </div>
                      </label>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                      <span className="text-slate-600">Kesiapan Berkas Anda:</span>
                      <span className="font-bold text-[#E11D48]">
                        {(bpjsChecklist.rujukan ? 1 : 0) + (bpjsChecklist.ktp ? 1 : 0) + (bpjsChecklist.antrean ? 1 : 0)} dari 3 Siap
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleLaunchAssistant(
                          'Bagaimana alur dan syarat rujukan BPJS Kesehatan untuk berobat ke poliklinik spesialis RS Umbrella?'
                        )
                      }
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-[#E11D48] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <span>Panduan Lengkap Alur BPJS via AI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Kolom Kanan: Cek Rekanan Asuransi Cashless 25+ (6 Kolom) */}
              <div className="lg:col-span-6 space-y-5 bg-slate-50/70 p-6 rounded-3xl border border-slate-200">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mb-1 flex items-center gap-2.5">
                    <CreditCard className="w-6 h-6 text-[#E11D48]" />
                    <span>Cek Rekanan Asuransi Cashless (25+ Mitra)</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal">
                    Ketik nama asuransi Anda untuk memastikan jaminan penjaminan non-tunai (cashless guarantee) di RS Umbrella Care.
                  </p>
                </div>

                {/* Input Search Asuransi */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={insuranceSearch}
                    onChange={(e) => setInsuranceSearch(e.target.value)}
                    placeholder="Ketik nama asuransi Anda (misal: Prudential, Allianz, Inhealth)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48] transition-all"
                  />
                </div>

                {/* Chips Mitra Populer */}
                <div className="flex flex-wrap gap-1.5">
                  {INSURANCE_PARTNERS.filter((ins) =>
                    ins.name.toLowerCase().includes(insuranceSearch.toLowerCase())
                  )
                    .slice(0, 8)
                    .map((ins) => (
                      <button
                        key={ins.name}
                        type="button"
                        onClick={() => setSelectedInsuranceName(ins.name)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                          selectedInsuranceName === ins.name
                            ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {ins.logoText || ins.name}
                      </button>
                    ))}
                </div>

                {/* Detail Status Asuransi Terpilih */}
                {(() => {
                  const ins =
                    INSURANCE_PARTNERS.find((i) => i.name === selectedInsuranceName) ||
                    INSURANCE_PARTNERS[2];
                  return (
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#E11D48] border border-rose-200">
                          {ins.category}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700">
                          Hotline: {ins.hotline}
                        </span>
                      </div>

                      <h4 className="font-black text-base text-[#0F172A]">{ins.name}</h4>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#E11D48]" />
                          <span>Metode Penjaminan: <strong>{ins.coverageMethod} (Non-Tunai Instan)</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#E11D48]" />
                          <span>Meja Admisi Prioritas di Lobby Lantai 1</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#E11D48]" />
                          <span>Berlaku untuk Rawat Inap &amp; Rawat Jalan Poliklinik</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleLaunchAssistant(
                            `Bagaimana alur klaim penjaminan non-tunai (cashless) untuk asuransi ${ins.name} di RS Umbrella?`
                          )
                        }
                        className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-[#E11D48] text-slate-800 font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 transition-all"
                      >
                        <span>Tanya Syarat Polis {ins.logoText || ins.name} ke AI</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })()}

              </div>

            </div>
          </div>
        )}

        {/* Konten Tab 4: Peta & Direktori Fasilitas Lantai Gedung RS */}
        {hubTab === 'directory' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 lg:p-10 transition-all space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mb-1 flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-[#E11D48]" />
                <span>Direktori Denah Fasilitas Tiap Lantai RS Umbrella</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Pilih lantai gedung untuk melihat daftar ruangan medis, fasilitas penunjang, jam operasional, serta nomor ekstensi telepon langsung.
              </p>
            </div>

            {/* Selector Lantai (Lantai 1 - Lantai 4/5) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { floor: 1, title: 'Lantai 1', subtitle: 'IGD & Admisi BPJS' },
                { floor: 2, title: 'Lantai 2', subtitle: 'Poli Spesialis & Lab' },
                { floor: 3, title: 'Lantai 3', subtitle: 'Bedah Sentral & ICU' },
                { floor: 4, title: 'Lantai 4 & 5', subtitle: 'Rawat Inap VIP & Suite' },
              ].map((f) => (
                <button
                  key={f.floor}
                  type="button"
                  onClick={() => {
                    setSelectedFloor(f.floor);
                    if (f.floor === 1) setSelectedFacilityKey('igd');
                    if (f.floor === 2) setSelectedFacilityKey('poli-spesialis');
                    if (f.floor === 3) setSelectedFacilityKey('bedah-sentral');
                    if (f.floor === 4) setSelectedFacilityKey('vip-aster-floor');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedFloor === f.floor
                      ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-md'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-extrabold text-sm">{f.title}</p>
                  <p className={`text-[11px] truncate mt-0.5 ${selectedFloor === f.floor ? 'text-white/90' : 'text-slate-500'}`}>
                    {f.subtitle}
                  </p>
                </button>
              ))}
            </div>

            {/* Fasilitas pada Lantai Terpilih */}
            {(() => {
              const floorData = [
                {
                  floor: 1,
                  items: [
                    {
                      key: 'igd',
                      name: 'Instalasi Gawat Darurat (IGD) & Trauma Center',
                      ext: 'Ext. 111 / Hotline (021) 8065-9911',
                      hours: '24 Jam Non-Stop',
                      desc: 'Pusat penanganan darurat resusitasi dengan triase merah, kuning, dan hijau. Siaga dokter spesialis emergensi, trauma room, dan armada ambulans 119.',
                    },
                    {
                      key: 'farmasi-1',
                      name: 'Farmasi Sentral & Resep 24 Jam',
                      ext: 'Ext. 112',
                      hours: '24 Jam Non-Stop',
                      desc: 'Layanan penyediaan obat rawat jalan, rawat inap, dan racikan steril berstandar Good Pharmacy Practice (GPP) dengan verifikasi farmasis klinis.',
                    },
                    {
                      key: 'radiologi',
                      name: 'Radiologi Digital & CT-Scan 128 Slices',
                      ext: 'Ext. 115',
                      hours: '24 Jam Siaga Emergency',
                      desc: 'Pemeriksaan rontgen thorax digital, USG 4D fetomaternal, panoramic gigi, dan Multi-Slice CT Scan berkecepatan tinggi.',
                    },
                    {
                      key: 'admisi-bpjs',
                      name: 'Admisi Pasien, Loket BPJS & Priority Desk Asuransi',
                      ext: 'Ext. 101 / 102',
                      hours: '07:00 - 21:00 WIB',
                      desc: 'Pendaftaran rawat jalan, verifikasi SEP rujukan online BPJS Kesehatan, dan priority desk cashless insurance untuk 25+ asuransi rekanan.',
                    },
                  ],
                },
                {
                  floor: 2,
                  items: [
                    {
                      key: 'poli-spesialis',
                      name: '17 Poliklinik Dokter Spesialis Terpadu',
                      ext: 'Ext. 201 - 217',
                      hours: 'Senin - Sabtu: 08:00 - 21:00 WIB',
                      desc: 'Poli Penyakit Dalam, Kesehatan Anak, Jantung, Bedah Digestif, Kebidanan & Kandungan, Saraf, Mata, THT-KL, Paru, Kulit & Kelamin, dan Gigi.',
                    },
                    {
                      key: 'lab-patologi',
                      name: 'Laboratorium Patologi Klinik Terakreditasi',
                      ext: 'Ext. 205',
                      hours: '24 Jam Non-Stop',
                      desc: 'Pemeriksaan darah rutin otomatis, profil lipid kolesterol, gula darah puasa HbA1c, fungsi hepar & ginjal, dan biomarker infeksi cito.',
                    },
                    {
                      key: 'fisioterapi',
                      name: 'Pusat Rehabilitasi Medik & Fisioterapi',
                      ext: 'Ext. 208',
                      hours: 'Senin - Sabtu: 08:00 - 17:00 WIB',
                      desc: 'Terapi pemulihan pasca-stroke, cedera sendi & otot, fisioterapi dada anak, stimulasi neuromuskular, dan gym medik ergonomis.',
                    },
                    {
                      key: 'kasir-2',
                      name: 'Kasir Poliklinik & Konfirmasi Antrean SIMRS',
                      ext: 'Ext. 202',
                      hours: '07:30 - 21:30 WIB',
                      desc: 'Layanan pembayaran tunai, QRIS, kartu debit/kredit, serta cetak kwitansi resmi rincian biaya medis untuk reimbursement.',
                    },
                  ],
                },
                {
                  floor: 3,
                  items: [
                    {
                      key: 'bedah-sentral',
                      name: 'Ruang Bedah Sentral (Integrated Operating Theatre)',
                      ext: 'Ext. 301',
                      hours: '24 Jam Siaga (Elektif & Cito)',
                      desc: '5 kamar operasi steril bertekanan positif dengan filter udara HEPA laminar air flow untuk operasi laparoskopi, bedah digestif, caesar, ortopedi.',
                    },
                    {
                      key: 'icu-ccu',
                      name: 'ICU & ICCU Terpadu (12 Bed Central Telemetry)',
                      ext: 'Ext. 305',
                      hours: '24 Jam Non-Stop',
                      desc: 'Unit perawatan intensif dilengkapi ventilator canggih Dräger/Hamilton, continuous arterial pressure, dan dokter anestesi KIC siaga 24/7.',
                    },
                    {
                      key: 'nicu-picu',
                      name: 'Pusat Perawatan Kritis Bayi & Anak (NICU & PICU)',
                      ext: 'Ext. 308',
                      hours: '24 Jam Non-Stop',
                      desc: 'Inkubator Giraffe Omnibed Carestation, ventilator neonatal HFOV, dan fototerapi double surface untuk bayi risiko tinggi dan prematur.',
                    },
                    {
                      key: 'bdrs',
                      name: 'Bank Darah Rumah Sakit (BDRS)',
                      ext: 'Ext. 309',
                      hours: '24 Jam Siaga',
                      desc: 'Penyimpanan dan uji crossmatch kantong darah PRC, TC, FFP berkoordinasi langsung dengan PMI Pusat untuk kebutuhan operasi darurat.',
                    },
                  ],
                },
                {
                  floor: 4,
                  items: [
                    {
                      key: 'vip-aster-floor',
                      name: 'Paviliun VIP Aster (4 Bed Siap Huni)',
                      ext: 'Ext. 401',
                      hours: '24 Jam Rawat Inap',
                      desc: 'Kamar privat VIP dengan ranjang elektrik Hill-Rom 3-motor, smart monitor pasien, water heater, sofa bed penunggu, dan HEPA filter H13.',
                    },
                    {
                      key: 'vip-melati-floor',
                      name: 'Paviliun VIP Melati (2 Bed Siap Huni)',
                      ext: 'Ext. 402',
                      hours: '24 Jam Rawat Inap',
                      desc: 'Kamar privat dengan pemandangan taman asri tenang, AC split individual hening, kulkas medis, dan jatah makan penunggu terjamin.',
                    },
                    {
                      key: 'vvip-suite-floor',
                      name: 'Paviliun Aster Suite VVIP (Lantai 5)',
                      ext: 'Ext. 501',
                      hours: '24 Jam Butler Medis',
                      desc: 'Suite presidential dengan living room terpisah, 2 Smart TV 55", dapur mini microwave, bathtub jacuzzi marmer, dan butler 24 jam.',
                    },
                    {
                      key: 'family-lounge',
                      name: 'Executive Family Lounge & Ruang Tenang',
                      ext: 'Ext. 405',
                      hours: '06:00 - 22:00 WIB',
                      desc: 'Area istirahat khusus keluarga pasien VIP dengan complimentary coffee/tea bar, high-speed WiFi, musholla nyaman, dan charging station.',
                    },
                  ],
                },
              ];

              const currentFloor = floorData.find((f) => f.floor === selectedFloor) || floorData[0];

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentFloor.items.map((item) => (
                    <div
                      key={item.key}
                      className={`p-5 rounded-2xl border transition-all ${
                        selectedFacilityKey === item.key
                          ? 'border-[#E11D48] bg-rose-50/40 ring-2 ring-rose-200'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedFacilityKey(item.key)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {item.hours}
                        </span>
                        <span className="text-xs font-bold text-[#E11D48]">{item.ext}</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-[#0F172A] mb-1.5">{item.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.desc}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchAssistant(
                            `Saya ingin informasi rute, jadwal layanan, dan prosedur di ${item.name} (${selectedFloor === 4 ? 'Lantai 4/5' : 'Lantai ' + selectedFloor}).`
                          );
                        }}
                        className="text-xs font-bold text-[#E11D48] hover:text-[#BE123C] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Tanyakan Ruangan Ini ke Asisten AI</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

      </section>

      {/* Bagian Himbauan Pasien & Transparansi Klinis */}
      <section id="himbauan-pasien" className="py-12 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">

          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 sm:p-8 space-y-4 text-left">
            <div className="flex items-center space-x-2.5 text-[#BE123C]">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide">
                Himbauan Keselamatan Pasien & Transparansi AI
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-white rounded-xl border border-rose-100 hover:border-rose-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <strong className="block text-slate-900 font-semibold mb-1">
                  1. Transparansi Sistem AI
                </strong>
                Antarmuka percakapan ini didukung oleh model DeepSeek AI &amp; Google Gemini. Sistem ini beroperasi secara otomatis dan tidak menyamar sebagai staf medis manusia.
              </div>

              <div className="p-4 bg-white rounded-xl border border-rose-100 hover:border-rose-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <strong className="block text-slate-900 font-semibold mb-1">
                  2. Informasi Bersifat Non-Diagnosis
                </strong>
                Respon AI bersifat operasional dan administratif. Asisten ini tidak menerbitkan diagnosis medis resmi atau meresepkan obat keras tanpa resep dokter.
              </div>

              <div className="p-4 bg-white rounded-xl border border-rose-100 hover:border-rose-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <strong className="block text-slate-900 font-semibold mb-1">
                  3. Protokol Gawat Darurat Kritis
                </strong>
                Jika pasien mengalami sesak napas akut, nyeri dada berat, henti napas, atau penurunan kesadaran, JANGAN MENUNGGU DI CHAT. Segera bawa ke IGD RS Umbrella (<strong>021-8065-9911</strong>) atau hubungi ambulans <strong>119</strong>.
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Bagian Standar Tata Kelola Rumah Sakit */}
      <section id="standar-tata-kelola" className="py-16 max-w-[1200px] mx-auto px-4 sm:px-6 w-full text-center">
        <span className="text-xs font-bold text-[#E11D48] tracking-wider uppercase block mb-1">
          Standar Tata Kelola & Kepatuhan Rumah Sakit
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] mb-8">
          Tata Kelola Layanan Kesehatan Perusahaan
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl border border-[#E2E8F0] bg-white space-y-2 hover:border-rose-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#BE123C] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-[#E11D48] transition-colors">Penyimpanan API Key di Browser</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kredensial API AI Anda tersimpan secara lokal di browser dan dikirim langsung ke endpoint AI tanpa server perantara.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#E2E8F0] bg-white space-y-2 hover:border-rose-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#BE123C] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-[#E11D48] transition-colors">Dasar Pengetahuan SIMRS Terpadu</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Jumlah kamar rawat inap, panduan triase IGD, dan jadwal dokter spesialis dimuat sebagai acuan tunggal yang akurat.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#E2E8F0] bg-white space-y-2 hover:border-rose-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#BE123C] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-[#E11D48] transition-colors">Tanpa Penyimpanan Data Medis (Zero PHI)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Riwayat percakapan dapat dihapus seketika dengan satu tombol untuk menjaga privasi pasien secara menyeluruh.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER MODERN RS UMBRELLA: Referensi Elegan Berbasis Card Terpadu */}
      <footer id="kontak-rs" className="mt-16 pb-12 select-none">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

          {/* Card Container Utama Footer */}
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/90 shadow-xl p-6 sm:p-10 relative overflow-hidden text-left">

            {/* Grid Konten 4 Kolom: Brand Card (Kiri), Navigasi (Tengah 1), Informasi (Tengah 2), Newsletter (Kanan) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start relative z-10">

              {/* Kolom 1: Brand Showcase Card (Deep Slate #0F172A dengan Aksen Merah Umbrella) */}
              <div className="lg:col-span-4 bg-[#0F172A] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-lg border border-slate-800 flex flex-col justify-between min-h-[250px] group">
                {/* Glow Merah Halus di Sudut */}
                <div className="absolute -right-10 -top-10 w-36 h-36 bg-[#E11D48]/25 rounded-full blur-2xl pointer-events-none group-hover:bg-[#E11D48]/35 transition-all duration-500" />

                <div>
                  {/* Brand Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#E11D48] flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                      <UmbrellaLogo size={24} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-base tracking-tight text-white">
                          Umbrella
                        </span>
                        <span className="font-bold text-base tracking-tight text-[#E11D48]">
                          Healthcare
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-medium">
                        Peduli Kesehatan Anda
                      </p>
                    </div>
                  </div>

                  {/* Tagline Medis */}
                  <p className="text-xs text-slate-300 leading-relaxed font-normal mb-6">
                    Layanan kesehatan cerdas terpadu, didukung kecerdasan buatan medis siaga 24 jam dan dokter spesialis berstandar internasional.
                  </p>
                </div>

                {/* Sosial Media Resmi */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    Ikuti Kami
                  </span>
                  <div className="flex items-center space-x-2">
                    {/* WhatsApp */}
                    <a
                      href="https://wa.me/6281198760099"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#E11D48] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 shadow-sm"
                      title="WhatsApp Resmi RS Umbrella"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                    {/* LinkedIn */}
                    <a
                      href="#kontak-rs"
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#E11D48] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 shadow-sm"
                      title="LinkedIn PT Umbrella Corp"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                    {/* Instagram */}
                    <a
                      href="#kontak-rs"
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#E11D48] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 shadow-sm"
                      title="Instagram @umbrellacorp.id"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                    {/* X (Twitter) */}
                    <a
                      href="#kontak-rs"
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#E11D48] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 shadow-sm"
                      title="X (Twitter) @umbrellacorp"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Kolom 2: Navigasi */}
              <div className="lg:col-span-2 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
                  Navigasi
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                  <li>
                    <a href="#beranda" className="hover:text-[#E11D48] transition-colors block">
                      Beranda
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLaunchAssistant()}
                      className="inline-flex items-center space-x-1.5 text-[#E11D48] font-bold hover:underline transition-colors text-left"
                    >
                      <span>Chatbot AI</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-[9.5px] border border-rose-200">
                        Aktif ✨
                      </span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        setComingSoonFeature({
                          title: 'Telekonsultasi Dokter Spesialis',
                          desc: 'Layanan video call tatap muka dengan dokter spesialis sedang dalam tahap integrasi telemedicine.',
                        })
                      }
                      className="hover:text-[#E11D48] transition-colors text-left block"
                    >
                      Telekonsultasi
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        setComingSoonFeature({
                          title: 'Rekam Medis Digital & Lab',
                          desc: 'Portal akses riwayat pemeriksaan mandiri sedang dalam tahap standarisasi SIMRS.',
                        })
                      }
                      className="hover:text-[#E11D48] transition-colors text-left block"
                    >
                      Rekam Medis
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        setComingSoonFeature({
                          title: 'Peta Fasilitas & Jaringan Faskes',
                          desc: 'Peta navigasi rute ruangan rumah sakit dan jaringan klinik sedang disiapkan.',
                        })
                      }
                      className="hover:text-[#E11D48] transition-colors text-left block"
                    >
                      Peta Faskes
                    </button>
                  </li>
                </ul>
              </div>

              {/* Kolom 3: Informasi & Akun */}
              <div className="lg:col-span-2 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
                  Informasi &amp; Akun
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                  <li>
                    <a href="#standar-tata-kelola" className="hover:text-[#E11D48] transition-colors block">
                      Profil RS &amp; Akreditasi
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        setComingSoonFeature({
                          title: 'Direktori & Jadwal Praktik Dokter',
                          desc: 'Sistem booking 17 poliklinik dokter spesialis sedang dalam pengembangan terintegrasi.',
                        })
                      }
                      className="hover:text-[#E11D48] transition-colors text-left block"
                    >
                      Jadwal Dokter
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        setComingSoonFeature({
                          title: 'Panduan Alur BPJS Kesehatan',
                          desc: 'Panduan integrasi PCare dan rujukan berjenjang BPJS sedang disiapkan.',
                        })
                      }
                      className="hover:text-[#E11D48] transition-colors text-left block"
                    >
                      Alur Rujukan BPJS
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        setComingSoonFeature({
                          title: 'Portal Masuk Pasien Terdaftar',
                          desc: 'Autentikasi login pasien dengan enkripsi SIMRS sedang dalam pengujian keamanan.',
                        })
                      }
                      className="hover:text-[#E11D48] transition-colors text-left block"
                    >
                      Login Pasien
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        setComingSoonFeature({
                          title: 'Pendaftaran Pasien Baru',
                          desc: 'Pendaftaran akun pasien baru secara online sedang dalam integrasi SatuSehat Kemenkes.',
                        })
                      }
                      className="hover:text-[#E11D48] transition-colors text-left block"
                    >
                      Registrasi
                    </button>
                  </li>
                </ul>
              </div>

              {/* Kolom 4: Box Inovasi Kesehatan & Langganan (Sesuai Referensi Gambar) */}
              <div className="lg:col-span-4 bg-slate-50 border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:border-[#E11D48] transition-all">
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold text-[#0F172A] tracking-tight leading-snug">
                    Inovasi Kesehatan AI. Tetap terhubung dengan RS Umbrella.
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    Dapatkan info ketersediaan kamar, jadwal dokter spesialis, dan panduan kesehatan terpercaya langsung ke email Anda.
                  </p>
                </div>

                <form onSubmit={handleNewsletterSubmit} className="mt-4">
                  <div className="relative flex items-center bg-white border border-slate-200 rounded-full p-1.5 focus-within:border-[#E11D48] focus-within:ring-2 focus-within:ring-rose-100 transition-all shadow-inner w-full">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Masukkan email Anda"
                      required
                      className="w-full min-w-0 flex-1 pl-3.5 pr-2 py-2 text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-all shadow-sm flex-shrink-0 active:scale-95 flex items-center space-x-1"
                    >
                      <span>Langganan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {newsletterSubscribed && (
                    <p className="text-[#E11D48] text-[11px] font-semibold mt-2.5 pl-2 flex items-center space-x-1 animate-fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Terima kasih! Email Anda telah terdaftar.</span>
                    </p>
                  )}
                </form>
              </div>

            </div>

            {/* Garis Pembatas Bawah */}
            <div className="border-t border-slate-200/90 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium relative z-10">
              <div className="flex items-center space-x-2">
                <UmbrellaLogo size={14} />
                <span>
                  © 2026 PT Umbrella Corp Healthcare. Hak Cipta Dilindungi.
                </span>
              </div>

              <div className="flex items-center space-x-3 text-[11px]">
                <span className="text-slate-600 font-semibold">
                  Tim Pengembang Sistem Medis
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">
                  Umbrella HealthTech
                </span>
              </div>
            </div>

            {/* Watermark Elegan di Latar Belakang Bawah (Responsif Tanpa Overflow) */}
            <div className="text-center pt-8 pb-1 pointer-events-none select-none overflow-hidden opacity-60">
              <span className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-normal sm:tracking-widest text-slate-100 uppercase inline-block leading-none break-words max-w-full">
                Umbrella Sehat
              </span>
            </div>

          </div>

        </div>
      </footer>

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

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setComingSoonFeature(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setComingSoonFeature(null);
                  handleLaunchAssistant();
                }}
                className="px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <span>Gunakan Chatbot AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
      <RoomBookingModal
        isOpen={isRoomBookingOpen}
        onClose={() => setIsRoomBookingOpen(false)}
        defaultRoomClass={
          calcRoomType === 'vvip' ? 'VVIP Aster Suite' : calcRoomType === 'aster' ? 'VIP Aster' : 'VIP Melati'
        }
        defaultBedId={selectedBedId}
        defaultNights={calcNights}
      />
      <MedicalRecordsModal isOpen={medicalOpen} onClose={() => setMedicalOpen(false)} />
      <LocationMapModal isOpen={locationOpen} onClose={() => setLocationOpen(false)} />
    </div>
  );
};
