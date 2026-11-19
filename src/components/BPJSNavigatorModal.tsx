import React, { useState } from 'react';
import { X, ShieldCheck, CheckSquare, AlertTriangle, Building, FileText, Search, CreditCard } from 'lucide-react';
import { INSURANCE_PARTNERS } from '../data/hospitalData';

interface BPJSNavigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskInChat: (query: string) => void;
}

export const BPJSNavigatorModal: React.FC<BPJSNavigatorModalProps> = ({
  isOpen,
  onClose,
  onAskInChat,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'BPJS' | 'INSURANCE'>('BPJS');

  if (!isOpen) return null;

  const filteredInsurance = INSURANCE_PARTNERS.filter(ins =>
    ins.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ins.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden text-left flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#BE123C]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                Panduan Penjaminan BPJS & Asuransi Swasta
              </h3>
              <p className="text-xs text-[#64748B]">
                Alur Rujukan Berjenjang, Syarat Berkas, dan 25+ Asuransi Rekanan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-white border-b border-[#F1F5F9] flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('BPJS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'BPJS'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Alur Rujukan BPJS Kesehatan
          </button>
          <button
            onClick={() => setActiveTab('INSURANCE')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'INSURANCE'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Asuransi Swasta & Rekanan ({INSURANCE_PARTNERS.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'BPJS' ? (
            <div className="space-y-5">
              {/* Emergency Banner */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-[#9F1239] leading-relaxed flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-[#E11D48] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm font-bold text-[#9F1239] mb-0.5">
                    Pengecualian Khusus Kedaruratan (IGD Bebas Rujukan):
                  </strong>
                  Kondisi gawat darurat yang mengancam nyawa (sesak berat, kejang, cedera parah, serangan jantung) <strong>TIDAK MEMERLUKAN SURAT RUJUKAN</strong> dan langsung ditangani di IGD 24 Jam. Penjaminan BPJS diurus 3x24 jam setelah pasien stabil.
                </div>
              </div>

              {/* 4 Step Workflow */}
              <div>
                <h4 className="font-bold text-sm text-[#0F172A] mb-3">
                  Alur 4 Langkah Rawat Jalan BPJS Berjenjang:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                      1
                    </span>
                    <strong className="text-slate-900 block mb-1">Kunjungi Faskes 1 Terdaftar</strong>
                    <p className="text-slate-600">
                      Puskesmas atau Klinik Pratama yang tertera di kartu KIS Mobile JKN Anda untuk pemeriksaan primer.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                      2
                    </span>
                    <strong className="text-slate-900 block mb-1">Terbitkan Rujukan Online (PCare)</strong>
                    <p className="text-slate-600">
                      Jika dokter Faskes 1 mengindikasikan butuh spesialis, minta rujukan ke <strong>RS Umbrella Care</strong>. Berlaku 90 hari.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                      3
                    </span>
                    <strong className="text-slate-900 block mb-1">Pendaftaran Online di Bot</strong>
                    <p className="text-slate-600">
                      Pilih dokter dan hari praktik maksimal H-1 jam 21.00 WIB untuk mendapatkan nomor antrean poli.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                      4
                    </span>
                    <strong className="text-slate-900 block mb-1">Fingerprint & Loket Admisi</strong>
                    <p className="text-slate-600">
                      Datang 30 menit sebelum jadwal, lakukan rekam biometrik fingerprint di Loket Admisi BPJS Lantai 1.
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Checklist */}
              <div className="border-t border-[#F1F5F9] pt-4">
                <h4 className="font-bold text-sm text-[#0F172A] mb-2">Dokumen Wajib Dibawa:</h4>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>KTP Asli Pasien (atau KIA untuk pasien anak di bawah 17 tahun)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Kartu BPJS Kesehatan Fisik atau e-Card di Aplikasi Mobile JKN</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Nomor Surat Rujukan Faskes 1 (atau Surat Kontrol Ulang dari Dokter RS)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onAskInChat('Saya ingin mengecek syarat berkas BPJS untuk kontrol poliklinik');
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Tanyakan Alur BPJS di Chat
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama asuransi (misal: Prudential, Inhealth, AIA)..."
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredInsurance.map((ins, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start justify-between">
                    <div>
                      <h5 className="font-semibold text-xs sm:text-sm text-[#0F172A]">{ins.name}</h5>
                      <p className="text-[11px] text-[#64748B] mt-0.5">{ins.category} • Metode: {ins.coverageMethod}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Hotline: {ins.hotline}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      CASHLESS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
