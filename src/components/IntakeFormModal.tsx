import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle, HeartPulse, Stethoscope } from 'lucide-react';
import { ClinicalIntakeForm } from '../types';
import { CLINIC_SPECIALTIES } from '../data/hospitalData';

interface IntakeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitIntake: (form: ClinicalIntakeForm) => void;
}

export const IntakeFormModal: React.FC<IntakeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitIntake,
}) => {
  const [category, setCategory] = useState<'Dewasa' | 'Anak' | 'Lansia' | 'Ibu Hamil'>('Dewasa');
  const [complaint, setComplaint] = useState('');
  const [duration, setDuration] = useState('3 hari');
  const [painScale, setPainScale] = useState(4);
  const [allergies, setAllergies] = useState('Tidak ada');
  const [history, setHistory] = useState('Hipertensi ringan');
  const [targetSpecialty, setTargetSpecialty] = useState('Penyakit Dalam (Internis)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitIntake({
      patientCategory: category,
      chiefComplaint: complaint || 'Demam naik turun dan lemas',
      symptomDuration: duration,
      painScale,
      drugAllergies: allergies,
      medicalHistory: history,
      targetSpecialty,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#BE123C]">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                Form Intake Triase Medis Pasien
              </h3>
              <p className="text-xs text-[#64748B]">
                Ringkasan Keluhan Terstandar untuk Dokter Poliklinik RS Umbrella
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          <div className="bg-rose-50 border border-rose-100 rounded-lg p-2.5 text-[#9F1239]">
            <strong>Disclaimer Medis:</strong> Pengisian form ini bertujuan mempermudah penentuan poliklinik yang tepat dan bukan pengganti pemeriksaan fisik langsung dokter.
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kategori Pasien:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Dewasa', 'Anak', 'Lansia', 'Ibu Hamil'] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2 rounded-lg border text-center font-medium transition-colors ${
                    category === cat
                      ? 'border-[#E11D48] bg-rose-50 text-[#BE123C] font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Keluhan Utama / Gejala yang Dirasakan:
            </label>
            <textarea
              required
              rows={2}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Contoh: Demam tinggi 3 hari, sakit kepala berdenyut, mual dan tidak nafsu makan..."
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lama Gejala Berlangsung:
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Misal: 3 hari / 1 minggu"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Skala Ketidaknyamanan / Nyeri: ({painScale}/10)
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={painScale}
                onChange={(e) => setPainScale(Number(e.target.value))}
                className="w-full accent-[#E11D48] mt-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Riwayat Alergi Obat (Sangat Penting):
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Contoh: Penisilin, Amoksisilin, Aspirin, atau Tidak Ada"
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Rekomendasi Poliklinik Dituju:
            </label>
            <select
              value={targetSpecialty}
              onChange={(e) => setTargetSpecialty(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
            >
              {CLINIC_SPECIALTIES.map((spec, i) => (
                <option key={i} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold transition-colors shadow-sm"
            >
              Kirim ke Asisten AI
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
