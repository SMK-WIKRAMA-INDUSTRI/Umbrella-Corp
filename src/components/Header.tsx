import React, { useState } from 'react';
import { UmbrellaLogo } from './UmbrellaLogo';
import { RotateCcw, User, PhoneCall, Bed, Calendar, ShieldCheck, HeartPulse, FileText, CheckCircle2, Key, Sparkles } from 'lucide-react';
import { HOSPITAL_METADATA } from '../data/hospitalData';

interface HeaderProps {
  onResetChat: () => void;
  seniorMode: boolean;
  onToggleSeniorMode: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenEmergency: () => void;
  onOpenBedModal: () => void;
  onOpenDoctorModal: () => void;
  apiKey: string;
  onUpdateApiKey: (newKey: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onResetChat,
  seniorMode,
  onToggleSeniorMode,
  activeView,
  onSelectView,
  onOpenEmergency,
  onOpenBedModal,
  onOpenDoctorModal,
  apiKey,
  onUpdateApiKey,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSaveKey = () => {
    onUpdateApiKey(tempKey);
    setIsEditingKey(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-sm select-none">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-2.5">
          <button 
            onClick={() => onSelectView('chat')} 
            className="flex items-center space-x-2.5 focus:outline-none group text-left"
            title="Kembali ke Layanan Chatbot"
          >
            <UmbrellaLogo size={24} className="group-hover:scale-105 transition-transform" />
            <div className="flex items-center space-x-1.5 font-sans">
              <span className="font-semibold text-[15px] text-[#0F172A] tracking-tight">PT Umbrella Corp</span>
              <span className="text-[#94A3B8] font-normal text-[14px]">/</span>
              <span className="text-[#64748B] text-[14px] font-normal">Hospital Assistant</span>
            </div>
          </button>

          {/* Quick Navigation Pills for Desktop */}
          <nav className="hidden lg:flex items-center space-x-1 pl-4 ml-4 border-l border-[#E2E8F0]">
            <button
              onClick={() => onSelectView('chat')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeView === 'chat'
                  ? 'bg-rose-50 text-[#BE123C] font-semibold'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
              }`}
            >
              Asisten AI
            </button>
            <button
              onClick={onOpenDoctorModal}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors flex items-center space-x-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Jadwal Dokter</span>
            </button>
            <button
              onClick={onOpenBedModal}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors flex items-center space-x-1"
            >
              <Bed className="w-3.5 h-3.5" />
              <span>Ketersediaan Kamar</span>
            </button>
            <button
              onClick={() => onSelectView('bpjs')}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors flex items-center space-x-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Alur BPJS</span>
            </button>
            <button
              onClick={() => onSelectView('portal')}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors flex items-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Hasil Lab / Rad</span>
            </button>
          </nav>
        </div>

        {/* Center: Encrypted Patient Service Pill Badge */}
        <div className="hidden md:flex items-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E2E8F0] shadow-subtle">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E11D48] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E11D48]"></span>
            </span>
            <span className="text-[11px] font-medium tracking-wide text-[#64748B] uppercase">
              LAYANAN PASIEN TERENKRIPSI • RS UMBRELLA CARE
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3">
          
          {/* Senior Accessibility Toggle */}
          <button
            onClick={onToggleSeniorMode}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all ${
              seniorMode
                ? 'bg-rose-100 border-[#BE123C] text-[#BE123C] font-semibold'
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1]'
            }`}
            title="Perbesar teks dan sederhanakan antarmuka untuk lansia"
          >
            <span>Teks Besar (Lansia)</span>
          </button>

          {/* Direct Emergency IGD Trigger Button */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-[#BE123C] hover:bg-[#E11D48] hover:text-white transition-all text-xs font-medium"
            title="Hubungi IGD 24 Jam Segera"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="font-semibold">IGD 24 Jam</span>
          </button>

          {/* Reset Conversation Button (matching screenshot) */}
          <button
            onClick={onResetChat}
            className="flex items-center space-x-1 text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors px-2 py-1 rounded hover:bg-slate-50"
            title="Reset percakapan ke awal"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Hapus Percakapan</span>
          </button>

          {/* User Profile Avatar in Crimson (matching screenshot) */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-[#BE123C] hover:bg-[#9F1239] transition-colors flex items-center justify-center text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1"
              aria-label="Profil Pasien & Pengaturan API"
            >
              <User className="w-4 h-4 text-white" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-modal border border-[#E2E8F0] py-3 px-4 z-50 text-left animate-fade-in">
                <div className="flex items-center space-x-3 pb-3 border-b border-[#F1F5F9]">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-[#BE123C] font-semibold text-sm">
                    SA
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-[#0F172A]">Ibu Siti Aminah</h4>
                    <p className="text-xs text-[#64748B]">No. RM: UMB-2026-8812</p>
                  </div>
                </div>

                <div className="py-2.5 space-y-1.5 text-xs text-[#64748B]">
                  <div className="flex justify-between">
                    <span>Penjamin Aktif:</span>
                    <span className="font-medium text-[#0F172A] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> BPJS Kesehatan Kelas 1
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Masa Rujukan:</span>
                    <span className="font-medium text-emerald-600">Aktif s/d 14 Des 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Faskes 1:</span>
                    <span className="font-medium text-[#0F172A]">Puskesmas Tebet Barat</span>
                  </div>
                </div>

                {/* Gemini API Key Management */}
                <div className="pt-2 pb-2 border-t border-[#F1F5F9]">
                  <div className="flex items-center justify-between text-xs text-slate-700 font-semibold mb-1">
                    <span className="flex items-center gap-1 text-[#BE123C]">
                      <Sparkles className="w-3.5 h-3.5" /> Gemini AI Engine
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono">
                      Connected
                    </span>
                  </div>
                  
                  {isEditingKey ? (
                    <div className="mt-1 space-y-1.5">
                      <input
                        type="password"
                        value={tempKey}
                        onChange={(e) => setTempKey(e.target.value)}
                        placeholder="Masukkan Gemini API Key..."
                        className="w-full text-xs font-mono p-1.5 border border-slate-300 rounded"
                      />
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => setIsEditingKey(false)}
                          className="px-2 py-0.5 text-[11px] text-slate-500 hover:text-slate-800"
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleSaveKey}
                          className="px-2.5 py-0.5 text-[11px] bg-[#E11D48] text-white font-medium rounded"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded">
                      <span className="font-mono truncate max-w-[170px]">
                        {apiKey ? `${apiKey.slice(0, 10)}...${apiKey.slice(-6)}` : 'Belum diatur'}
                      </span>
                      <button
                        onClick={() => setIsEditingKey(true)}
                        className="text-[#BE123C] hover:underline font-semibold ml-2"
                      >
                        Ubah
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#F1F5F9] space-y-1">
                  <button
                    onClick={() => {
                      onSelectView('portal');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-[#BE123C] hover:bg-rose-50 transition-colors"
                  >
                    Buka Portal Pasien & Riwayat Lab
                  </button>
                  <button
                    onClick={() => {
                      onToggleSeniorMode();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:bg-slate-50 transition-colors"
                  >
                    {seniorMode ? 'Nonaktifkan Mode Lansia' : 'Aktifkan Mode Lansia (18pt)'}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
