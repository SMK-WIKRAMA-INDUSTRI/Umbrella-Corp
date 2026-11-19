import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, AlertCircle, X, Navigation, Ambulance, Clock, CheckCircle } from 'lucide-react';
import { HOSPITAL_METADATA } from '../data/hospitalData';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [dispatchRequested, setDispatchRequested] = useState(false);
  const [patientLocation, setPatientLocation] = useState('');
  const [patientCondition, setPatientCondition] = useState('');

  if (!isOpen) return null;

  const handleRequestAmbulance = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchRequested(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-[#E11D48] shadow-2xl overflow-hidden text-left">
        
        {/* Header Red Banner */}
        <div className="bg-[#E11D48] text-white p-4 sm:p-5 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight">
                Instalasi Gawat Darurat (IGD) 24 Jam
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                RS Umbrella Care • Triase Resusitasi Cepat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-[#9F1239] leading-relaxed">
            <strong>Kriteria Gawat Darurat Bebas Rujukan BPJS:</strong> Pasien henti napas, sesak napas berat, nyeri dada tembus ke belakang, kejang berulang, penurunan kesadaran, atau trauma pendarahan hebat dapat langsung dibawa ke IGD tanpa surat rujukan Faskes 1.
          </div>

          {/* Quick Direct Calls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={`tel:${HOSPITAL_METADATA.emergencyPhone.replace(/-/g, '')}`}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold text-sm shadow-sm transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Hotline IGD: {HOSPITAL_METADATA.emergencyPhone}</span>
            </a>
            <a
              href="tel:119"
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all"
            >
              <Ambulance className="w-4 h-4" />
              <span>Panggilan Darurat 119</span>
            </a>
          </div>

          <div className="border-t border-[#F1F5F9] pt-4">
            <h4 className="font-semibold text-sm text-[#0F172A] mb-2 flex items-center gap-1.5">
              <Ambulance className="w-4 h-4 text-[#E11D48]" />
              <span>Pemesanan Penjemputan Ambulans RS Umbrella</span>
            </h4>

            {dispatchRequested ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-xs sm:text-sm space-y-2">
                <div className="flex items-center space-x-2 font-semibold text-emerald-900">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Ambulans Tim Emergensi Dispatched!</span>
                </div>
                <p>
                  Unit Ambulans ICU RS Umbrella Care sedang meluncur ke: <strong>{patientLocation || 'Lokasi Pasien'}</strong>.
                </p>
                <p className="text-emerald-700">
                  Estimasi tiba: <strong>8 - 12 Menit</strong>. Tim paramedis telah mempersiapkan alat resusitasi portabel.
                </p>
                <button
                  onClick={() => setDispatchRequested(false)}
                  className="mt-2 text-xs text-emerald-700 underline"
                >
                  Kirim koordinat lokasi tambahan
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestAmbulance} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Alamat Lengkap Penjemputan / Patokan:
                  </label>
                  <input
                    type="text"
                    required
                    value={patientLocation}
                    onChange={(e) => setPatientLocation(e.target.value)}
                    placeholder="Contoh: Jl. Kuningan Barat No. 12, RT 04/02 (Depan Gedung A)"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ringkasan Gejala / Kondisi Pasien:
                  </label>
                  <input
                    type="text"
                    required
                    value={patientCondition}
                    onChange={(e) => setPatientCondition(e.target.value)}
                    placeholder="Contoh: Nyeri dada mendadak, keringat dingin, lemas"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Kirim Sinyal Evakuasi Ambulans</span>
                </button>
              </form>
            )}
          </div>

          {/* Hospital Address Info */}
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-start space-x-2">
            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-700">Lokasi Fisik IGD RS Umbrella:</p>
              <p>{HOSPITAL_METADATA.address}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
