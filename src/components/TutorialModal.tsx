import React from 'react';
import { X, BookOpen, Key, FileText, Send, CheckCircle2 } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl overflow-hidden text-left flex flex-col font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-5 h-5 text-[#E11D48]" />
            <h3 className="font-bold text-base text-[#0F172A]">
              Panduan Penggunaan Asisten AI Rumah Sakit
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed overflow-y-auto max-h-[75vh]">
          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-[#BE123C] font-bold flex items-center justify-center flex-shrink-0 text-xs">
              1
            </span>
            <div>
              <strong className="text-slate-900 block text-sm mb-0.5">Konfigurasi API Key Gemini Anda:</strong>
              Masukkan Gemini API Key pada kolom <strong>API KEY GEMINI</strong> di panel kiri. Anda dapat mencentang <em>"Simpan API key di browser ini"</em> agar tersimpan di sesi browser lokal Anda.
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-[#BE123C] font-bold flex items-center justify-center flex-shrink-0 text-xs">
              2
            </span>
            <div>
              <strong className="text-slate-900 block text-sm mb-0.5">Kustomisasi Basis Pengetahuan Rumah Sakit:</strong>
              Pada editor <strong>KONTEKS BASIS PENGETAHUAN</strong>, Anda bebas mengubah atau memperbarui informasi resmi RS (jadwal praktik dokter, ketersediaan kamar rawat inap VIP, aturan BPJS, dan alur IGD). Gemini AI akan menjawab berdasarkan konteks ini.
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-[#BE123C] font-bold flex items-center justify-center flex-shrink-0 text-xs">
              3
            </span>
            <div>
              <strong className="text-slate-900 block text-sm mb-0.5">Lampirkan Dokumen Tambahan (Opsional):</strong>
              Gunakan tombol <em>Pilih Berkas</em> jika memiliki SOP atau katalog tarif dalam format teks atau PDF untuk disertakan ke dalam pemahaman asisten AI.
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-[#BE123C] font-bold flex items-center justify-center flex-shrink-0 text-xs">
              4
            </span>
            <div>
              <strong className="text-slate-900 block text-sm mb-0.5">Respon Real-Time 100% AI (Tanpa Dummy):</strong>
              Ketik pertanyaan di kolom percakapan kanan atau klik kartu contoh pertanyaan. Jika API Key belum terisi, sistem akan memandu Anda untuk melengkapinya terlebih dahulu di panel Pengaturan.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold text-xs shadow-sm transition-colors"
          >
            Mengerti & Mulai
          </button>
        </div>

      </div>
    </div>
  );
};
