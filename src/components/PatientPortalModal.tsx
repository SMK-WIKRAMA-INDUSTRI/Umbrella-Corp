import React, { useState } from 'react';
import { X, FileText, CheckCircle2, Clock, Download, Eye, ShieldCheck, Activity, Users } from 'lucide-react';
import { LAB_RADIOLOGY_CATALOG } from '../data/hospitalData';

interface PatientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientPortalModal: React.FC<PatientPortalModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'RESULTS' | 'QUEUE'>('RESULTS');
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden text-left flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#BE123C]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                Portal Pasien & Hasil Diagnostik Terenkripsi
              </h3>
              <p className="text-xs text-[#64748B]">
                Pasien: Ibu Siti Aminah (No. RM: UMB-2026-8812) • Terverifikasi SatuSehat
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
            onClick={() => setActiveTab('RESULTS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'RESULTS'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Hasil Lab & Radiologi (3 Hasil Baru)
          </button>
          <button
            onClick={() => setActiveTab('QUEUE')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'QUEUE'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Pelacak Antrean Poliklinik Hari Ini
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'RESULTS' ? (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Hasil pemeriksaan divalidasi oleh Dokter Spesialis Patologi Klinik & Radiologi. Enkripsi AES-256 aktif.
                </span>
              </div>

              {/* Lab Result 1 */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 hover:border-slate-300 transition-all shadow-subtle">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">LAB-DRH-202611-091</span>
                    <h4 className="font-semibold text-sm text-[#0F172A]">Darah Lengkap Otomatis (CBC)</h4>
                    <p className="text-xs text-[#64748B]">Pemeriksaan: 17 Nov 2026, 08:30 WIB • Diverifikasi dr. Dian, Sp.PK</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded">
                    SELESAI (NORMAL)
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Hemoglobin: 13.2 g/dL • Leukosit: 7.400 /uL • Trombosit: 245.000 /uL</span>
                  <button
                    onClick={() => alert('Mengunduh Berkas Hasil Lab PDF Resmi bertanda tangan digital...')}
                    className="inline-flex items-center space-x-1 text-[#BE123C] hover:underline font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PDF</span>
                  </button>
                </div>
              </div>

              {/* Lab Result 2 */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 hover:border-slate-300 transition-all shadow-subtle">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">LAB-KIM-202611-044</span>
                    <h4 className="font-semibold text-sm text-[#0F172A]">Profil Lipid & HbA1c (Diabetes)</h4>
                    <p className="text-xs text-[#64748B]">Pemeriksaan: 17 Nov 2026, 08:35 WIB • Diverifikasi dr. Dian, Sp.PK</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded">
                    SELESAI
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Kolesterol Total: 188 mg/dL • Trigliserida: 140 mg/dL • HbA1c: 6.2%</span>
                  <button
                    onClick={() => alert('Mengunduh Berkas Hasil Lab PDF Resmi...')}
                    className="inline-flex items-center space-x-1 text-[#BE123C] hover:underline font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PDF</span>
                  </button>
                </div>
              </div>

              {/* Radiology Result */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 hover:border-slate-300 transition-all shadow-subtle">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">RAD-XRY-202611-018</span>
                    <h4 className="font-semibold text-sm text-[#0F172A]">Rontgen Thorax PA (Foto Dada)</h4>
                    <p className="text-xs text-[#64748B]">Pemeriksaan: 17 Nov 2026, 09:15 WIB • Diverifikasi dr. Harry, Sp.Rad</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded">
                    SELESAI
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Kesan: Cor dan pulmo dalam batas normal. Tidak tampak infiltrat aktif.</span>
                  <button
                    onClick={() => alert('Membuka Gambar DICOM Radiologi Terenkripsi...')}
                    className="inline-flex items-center space-x-1 text-[#BE123C] hover:underline font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Rontgen</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Queue Status Live Dashboard */}
              <div className="bg-slate-900 text-white rounded-xl p-5 text-center space-y-3">
                <div className="flex items-center justify-center space-x-2 text-rose-400 text-xs font-semibold tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>Antrean Poliklinik Penyakit Dalam (Internis)</span>
                </div>

                <div className="grid grid-cols-3 gap-3 py-2">
                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <span className="text-[11px] text-slate-400 block mb-1">Nomor Anda</span>
                    <span className="text-2xl font-bold text-rose-400 font-mono">B-014</span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <span className="text-[11px] text-slate-400 block mb-1">Sedang Dilayani</span>
                    <span className="text-2xl font-bold text-emerald-400 font-mono">B-011</span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <span className="text-[11px] text-slate-400 block mb-1">Sisa Antrean</span>
                    <span className="text-2xl font-bold text-white font-mono">3 Pasien</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  Estimasi Waktu Panggilan: <strong>± 15 - 20 Menit</strong> (dr. Budi Santoso, Sp.PD di Poli R. 201)
                </p>
              </div>

              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-[#9F1239]">
                Pemberitahuan via WhatsApp akan dikirimkan otomatis saat antrean Anda tersisa 2 pasien lagi.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
