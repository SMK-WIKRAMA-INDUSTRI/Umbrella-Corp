import React, { useState, useRef, useEffect, useCallback } from 'react';
import { animate, stagger } from 'animejs';
import {
  MessageSquare,
  Calendar,
  Bed,
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
} from 'lucide-react';
import { UmbrellaLogo } from './UmbrellaLogo';
import { AnimeBackground } from './AnimeBackground';
import doctorImg from '../assets/doctors-duo.png';

interface LandingPageProps {
  onLaunchAssistant: (initialPrompt?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchAssistant }) => {
  // State modal untuk fitur yang berstatus "Coming Soon"
  const [comingSoonFeature, setComingSoonFeature] = useState<{ title: string; desc: string } | null>(null);

  // Filter tab untuk bagian Modul & Layanan Medis
  const [moduleFilter, setModuleFilter] = useState<'all' | 'ai' | 'faskes'>('all');

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
          } catch (_) {}
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
      id: 'chatbot',
      label: 'Chatbot AI',
      onClick: () => onLaunchAssistant(),
    },
    {
      id: 'telekonsultasi',
      label: 'Telekonsultasi',
      onClick: () =>
        setComingSoonFeature({
          title: 'Telekonsultasi Dokter Spesialis',
          desc: 'Layanan konsultasi tatap muka video call dengan dokter spesialis sedang dalam tahap integrasi telemedicine.',
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
      
      {/* Header Navigasi Atas (Clean, Modern, Tanpa Garis Pink / AI Slop) */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & Identitas Brand (Kiri) */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#E11D48] flex items-center justify-center text-white shadow-sm flex-shrink-0">
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
          </div>

          {/* Navigasi Pill Tengah: HANYA FITUR UTAMA dengan Efek Glasses Jelly ("Ager-Ager") Meluncur Mengikuti Kursor */}
          <nav
            ref={navContainerRef}
            onMouseLeave={() => setHoveredNav(null)}
            className="hidden md:inline-flex items-center bg-slate-100/90 backdrop-blur-md p-1 rounded-full border border-slate-200/90 text-xs font-medium relative shadow-inner select-none transition-all"
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
              const itemClasses = `relative z-10 px-4 py-1.5 rounded-full transition-all duration-200 select-none text-xs ${
                isSelected
                  ? 'text-white font-bold drop-shadow-sm scale-[1.02]'
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

          {/* Sisi Kanan: Masuk & Daftar (Tanpa Tombol Chatbot Duplikat Sesuai Permintaan) */}
          <div className="flex items-center space-x-2">
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

        {/* Bar Navigasi Seluler: HANYA FITUR UTAMA dengan Pill Interaktif */}
        <div className="md:hidden flex items-center space-x-2 px-4 py-2.5 border-t border-[#F1F5F9] overflow-x-auto no-scrollbar bg-slate-50/90 text-xs select-none">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  if (item.isAnchor) {
                    window.location.hash = item.href || '#';
                  } else {
                    item.onClick?.();
                  }
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
      </header>

      {/* Bagian Hero: Simple, Elegan, Nyaman Dilihat Sesuai Referensi Bersih */}
      <section id="beranda" className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-[#E2E8F0] bg-white">
        
        {/* Anime.js Interactive Staggered Grid Background */}
        <AnimeBackground />

        {/* Subtle Ambient Background Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[400px] bg-gradient-to-b from-rose-50/50 via-white to-transparent -z-10 blur-3xl pointer-events-none" />

        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            
            {/* Kolom Kiri: Judul Utama + Deskripsi Ringkas + Tombol Pill */}
            <div className="lg:col-span-4 space-y-5 text-left">
              <h1 className="anime-hero-stagger text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight text-[#0F172A] leading-[1.12]">
                Pelayanan Medis <br />
                <span className="text-[#E11D48]">Modern &amp; Terpadu</span>
              </h1>

              <p className="anime-hero-stagger text-sm sm:text-base text-slate-500 leading-relaxed max-w-sm font-normal">
                Pusat layanan kesehatan yang peduli dengan setiap pasien, didukung dokter spesialis dan asisten cerdas siaga 24 jam.
              </p>

              <div className="anime-hero-stagger pt-2">
                <button
                  onClick={() => onLaunchAssistant()}
                  className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-medium text-sm shadow-sm hover:shadow transition-all active:scale-95 hover:scale-105 group"
                >
                  <span>Konsultasi AI</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </button>
              </div>
            </div>

            {/* Kolom Tengah: Foto Dokter dengan Animasi Halus Anime.js */}
            <div className="lg:col-span-4 relative flex items-end justify-center min-h-[440px] sm:min-h-[480px]">
              <div className="relative w-full max-w-[380px] sm:max-w-[460px] flex items-end justify-center z-10 anime-doctor-float select-none">
                <img
                  src={doctorImg}
                  alt="Dokter RS PT Umbrella Corp"
                  className="w-full h-auto max-h-[480px] sm:max-h-[520px] object-contain object-bottom select-none filter drop-shadow-md"
                  loading="eager"
                />
              </div>
            </div>

            {/* Kolom Kanan: Sisi Teknologi Bersih & Elegan */}
            <div className="lg:col-span-4 space-y-4 text-left lg:pl-6">
              <h2 className="anime-hero-stagger text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-[#0F172A] leading-[1.15]">
                Dengan <br />
                Kecerdasan <br />
                <span className="text-[#E11D48]">Buatan</span>
              </h2>

              <p className="anime-hero-stagger text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs font-normal">
                Peralatan diagnostik digital dan asisten AI bekerja terpadu untuk kemudahan cek jadwal dokter dan rawat inap Anda.
              </p>

              <div className="anime-hero-stagger pt-2">
                <button
                  onClick={() => onLaunchAssistant()}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#E11D48] hover:text-[#BE123C] hover:underline group transition-all"
                >
                  <span>Mulai Konsultasi AI Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Bagian Kapabilitas Layanan: Ekosistem Layanan Rumah Sakit (Harmonis, Elegan, Nyaman) */}
      <section id="fitur-layanan" className="py-16 sm:py-24 max-w-[1300px] mx-auto px-4 sm:px-6 w-full">
        
        {/* Header Bagian: Terpusat, Bersih, Elegan */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs font-bold text-[#E11D48] tracking-widest uppercase inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]"></span>
            LAYANAN &amp; FASILITAS TERPADU
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A]">
            Daftar Modul Layanan Medis
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
            Pusat layanan kesehatan digital PT Umbrella Corp. Asisten AI aktif melayani Anda 24 jam non-stop untuk konsultasi jadwal dokter, kamar VIP, dan alur BPJS.
          </p>
        </div>

        {/* 6 Kartu Simetris Harmonis (3 Kolom x 2 Baris) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          
          {/* Card 1: Chatbot AI Asisten Pasien (AKTIF & BERFUNGSI) */}
          <div className="bento-anime-card bg-white rounded-3xl p-6 sm:p-7 border-2 border-rose-200 shadow-md hover:shadow-xl hover:border-[#E11D48] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ring-4 ring-rose-50/50">
            {/* Soft Ambient Corner Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-100/60 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-200/60 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E11D48] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <UmbrellaLogo size={24} />
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#E11D48] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse"></span>
                  AKTIF 24 JAM
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight mb-2 group-hover:text-[#E11D48] transition-colors">
                Chatbot AI (Asisten Pasien)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Satu-satunya sistem asisten resmi aktif untuk cek ketersediaan kamar VIP Aster &amp; Melati, jadwal dokter 17 poli, alur BPJS, dan panduan IGD instan.
              </p>

              {/* Quick Interactive Prompt Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
                  Contoh Pertanyaan Cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.slice(0, 3).map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => onLaunchAssistant(qp.query)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-[#E11D48] text-[11px] font-medium border border-slate-200 hover:border-rose-300 transition-all active:scale-95"
                    >
                      <span>{qp.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => onLaunchAssistant()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <span>Mulai Tanya Asisten AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: 17 Poliklinik Dokter Spesialis */}
          <div
            onClick={() =>
              setComingSoonFeature({
                title: 'Direktori & Jadwal Praktik Dokter Spesialis',
                desc: 'Sistem reservasi online dan direktori jadwal praktik dokter spesialis 17 poliklinik terintegrasi antrean realtime.',
              })
            }
            className="bento-anime-card bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#E11D48] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:bg-rose-50 group-hover:text-[#E11D48] group-hover:border-rose-100 transition-all">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  COMING SOON
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight mb-2 group-hover:text-[#E11D48] transition-colors">
                17 Poliklinik Dokter Spesialis
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Direktori jadwal praktik dokter spesialis lengkap: poli penyakit dalam, anak, jantung, kandungan, hingga bedah digestif.
              </p>

              {/* Specialty Tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                  Sp. Jantung
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                  Sp. Anak
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                  Sp. Penyakit Dalam
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                  Sp. Bedah
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-[#E11D48]">
              <span>Cek Jadwal Praktik</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Telemetri Rawat Inap & ICU */}
          <div
            onClick={() =>
              setComingSoonFeature({
                title: 'Telemetri Ketersediaan Kamar Rawat Inap',
                desc: 'Sistem monitoring kapasitas ranjang inap VIP Paviliun Aster & Melati serta ruang ICU langsung terhubung ke SIMRS.',
              })
            }
            className="bento-anime-card bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#E11D48] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:bg-rose-50 group-hover:text-[#E11D48] group-hover:border-rose-100 transition-all">
                  <Bed className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  COMING SOON
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight mb-2 group-hover:text-[#E11D48] transition-colors">
                Rawat Inap &amp; Kamar VIP
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Fasilitas rawat inap Paviliun Aster &amp; Melati dengan monitoring telemetri cerdas, ranjang elektrik terpadu, dan fasilitas keluarga.
              </p>

              {/* Room tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                  VIP Aster (4 Bed)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                  VIP Melati (2 Bed)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                  ICU Sentral
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-[#E11D48]">
              <span>Lihat Fasilitas Kamar</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: IGD & Trauma Center 24 Jam */}
          <div
            onClick={() =>
              setComingSoonFeature({
                title: 'Instalasi Gawat Darurat (IGD) & Trauma Center',
                desc: 'Hotline IGD siaga 24 jam di (021) 8065-9911 atau Ambulans 119.',
              })
            }
            className="bento-anime-card bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#E11D48] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-[#E11D48] border border-rose-200">
                  SIAGA 24 JAM
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight mb-2 group-hover:text-[#E11D48] transition-colors">
                IGD &amp; Triase Darurat 24 Jam
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Penanganan cepat resusitasi medis dengan triase merah/kuning/hijau dan armada ambulans siaga tanggap darurat 24 jam.
              </p>

              {/* Emergency Hotline Box */}
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-xs text-slate-800 space-y-1">
                <div className="font-bold text-[#BE123C] flex items-center space-x-1.5">
                  <span>Hotline IGD:</span>
                  <span>(021) 8065-9911</span>
                </div>
                <div className="text-slate-600 text-[11px]">
                  Panggilan Ambulans Darurat: <strong>119</strong>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-[#E11D48]">
              <span>Protokol Triase Darurat</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Gerbang Asuransi Cashless & BPJS */}
          <div
            onClick={() =>
              setComingSoonFeature({
                title: 'Gerbang Asuransi Cashless & BPJS Kesehatan',
                desc: 'Integrasi validasi rujukan online faskes tingkat 1 serta penerimaan klaim non-tunai bersama 25+ asuransi swasta.',
              })
            }
            className="bento-anime-card bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#E11D48] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:bg-rose-50 group-hover:text-[#E11D48] group-hover:border-rose-100 transition-all">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  COMING SOON
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight mb-2 group-hover:text-[#E11D48] transition-colors">
                Asuransi Cashless &amp; BPJS
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Kemudahan validasi rujukan online faskes 1 dan penjaminan klaim non-tunai (cashless) bersama mitra asuransi terpercaya.
              </p>

              {/* Partner Badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                  BPJS Kesehatan
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                  Prudential
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                  Allianz
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                  Mandiri Inhealth
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-[#E11D48]">
              <span>Panduan Klaim Asuransi</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Rekam Medis & Lab Pasien */}
          <div
            onClick={() =>
              setComingSoonFeature({
                title: 'Portal Rekam Medis & Hasil Laboratorium',
                desc: 'Akses riwayat diagnosa dan unduh berkas hasil lab mandiri sedang dalam standarisasi enkripsi ISO 27001.',
              })
            }
            className="bento-anime-card bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#E11D48] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:bg-rose-50 group-hover:text-[#E11D48] group-hover:border-rose-100 transition-all">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  COMING SOON
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight mb-2 group-hover:text-[#E11D48] transition-colors">
                Rekam Medis &amp; Lab Pasien
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Portal digital terpadu untuk memeriksa riwayat pemeriksaan medis, hasil laboratorium patologi, dan rontgen radiologi.
              </p>

              {/* Security Indicator */}
              <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                <Lock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold text-[11px]">Enkripsi Terverifikasi Standar ISO 27001</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-[#E11D48]">
              <span>Portal Hasil Medis</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

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
                Antarmuka percakapan ini didukung oleh model Google Gemini AI. Sistem ini beroperasi secara otomatis dan tidak menyamar sebagai staf medis manusia.
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
              Kredensial API Google Gemini Anda tersimpan secara lokal di browser dan dikirim langsung ke endpoint Gemini tanpa server perantara.
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
                      onClick={() => onLaunchAssistant()}
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
                  <div className="relative flex items-center bg-white border border-slate-200 rounded-full p-1.5 focus-within:border-[#E11D48] focus-within:ring-2 focus-within:ring-rose-100 transition-all shadow-inner">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Masukkan email Anda"
                      required
                      className="w-full pl-3.5 pr-2 py-2 text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 sm:px-5 py-2.5 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-all shadow-sm flex-shrink-0 active:scale-95 flex items-center space-x-1"
                    >
                      <span>Langganan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {newsletterSubscribed && (
                    <p className="text-emerald-600 text-[11px] font-semibold mt-2.5 pl-2 flex items-center space-x-1 animate-fade-in">
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

            {/* Watermark Elegan di Latar Belakang Bawah (Sesuai Referensi Gambar) */}
            <div className="text-center pt-8 pb-1 pointer-events-none select-none overflow-hidden opacity-60">
              <span className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-widest text-slate-100 uppercase inline-block leading-none">
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
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-[11px]">
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
                  onLaunchAssistant();
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

    </div>
  );
};
