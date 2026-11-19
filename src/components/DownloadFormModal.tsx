import React from 'react';
import { X, Download, Printer, CheckCircle, FileText, Shield } from 'lucide-react';
import { UmbrellaLogo } from './UmbrellaLogo';
import { HOSPITAL_METADATA } from '../data/hospitalData';

interface DownloadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadFormModal: React.FC<DownloadFormModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    alert('Mengunduh Formulir Rawat Inap RS PT Umbrella Corp (PDF Document)... Selesai.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-[#BE123C]" />
            <h3 className="font-bold text-sm sm:text-base text-[#0F172A]">
              Dokumen Admisi: Formulir Rawat Inap RS Umbrella (PDF)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF Document Visual Preview */}
        <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
          <div className="w-full max-w-xl bg-white border border-slate-300 shadow-md p-6 sm:p-8 rounded-lg text-slate-800 text-xs font-sans space-y-4">
            
            {/* Hospital Letterhead */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <UmbrellaLogo size={32} />
                <div>
                  <h4 className="font-bold text-sm tracking-tight text-slate-900">PT UMBRELLA CORP HEALTHCARE</h4>
                  <p className="text-[10px] text-slate-600">RS Umbrella Care & Advanced Diagnostic Center</p>
                  <p className="text-[9px] text-slate-500">{HOSPITAL_METADATA.address}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[9px] bg-slate-100 px-2 py-0.5 border border-slate-300 font-bold block">
                  FORM-ADM-2026-V1
                </span>
                <span className="text-[9px] text-emerald-700 font-semibold">KARS PARIPURNA</span>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-1">
              <h5 className="font-bold text-xs uppercase tracking-wide text-slate-900 underline">
                SURAT PERMOHONAN RAWAT INAP & PERSETUJUAN ADMISI (GENERAL CONSENT)
              </h5>
              <p className="text-[10px] text-slate-500">Nomor Registrasi: REG-UMB/INP/20261117-009</p>
            </div>

            {/* Form Fields Simulation */}
            <div className="space-y-2 border border-slate-200 p-3 rounded bg-slate-50/50">
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Nama Pasien:</span>
                <span className="col-span-2 border-b border-dotted border-slate-400">Ibu Siti Aminah (58 Tahun)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">No. Rekam Medis (MRN):</span>
                <span className="col-span-2 font-mono">UMB-2026-8812</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Kelas Kamar Dituju:</span>
                <span className="col-span-2 font-bold text-[#BE123C]">VIP (Paviliun Aster / Melati)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Dokter Penanggung Jawab:</span>
                <span className="col-span-2">dr. Budi Santoso, Sp.PD, K-HOM</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Penjamin Biaya:</span>
                <span className="col-span-2">BPJS Kesehatan Kelas 1 (Hak Rawat Naik ke VIP)</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-600 leading-relaxed border-t border-slate-200 pt-2">
              <p className="font-semibold mb-1">Pernyataan Pasien / Penanggung Jawab:</p>
              <p>
                1. Bersedia mematuhi tata tertib jam besuk RS Umbrella (Maksimal 2 orang bergantian).<br />
                2. Menyetujui tindakan medis invasif/non-invasif sesuai indikasi dokter spesialis yang merawat.<br />
                3. Bertanggung jawab atas pelunasan selisih tarif jika memilih fasilitas kamar di atas hak kepesertaan.
              </p>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 pt-4 text-center text-[10px]">
              <div>
                <p>Petugas Admisi RS Umbrella,</p>
                <div className="h-10"></div>
                <p className="font-semibold">( Ners Rina / Staf Admisi )</p>
              </div>
              <div>
                <p>Pasien / Keluarga Penanggung Jawab,</p>
                <div className="h-10"></div>
                <p className="font-semibold">( ............................................ )</p>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Format: Adobe PDF Printable • Ukuran: 184 KB
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Fisik</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
