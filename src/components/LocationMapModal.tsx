import React from 'react';
import { X, MapPin, Navigation, Phone, Clock } from 'lucide-react';

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationMapModal: React.FC<LocationMapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const address = 'RS Umbrella Healthcare, Jakarta, Indonesia';
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#E11D48]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#0F172A]">Peta Lokasi & Fasilitas</h2>
              <p className="text-xs text-slate-500 mt-0.5">Navigasi ruangan rumah sakit dan jaringan faskes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          <div className="md:col-span-2">
            <iframe
              title="Peta RS Umbrella"
              src={mapUrl}
              className="w-full h-[420px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="p-6 space-y-4 border-t md:border-t-0 md:border-l border-slate-100">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#E11D48] mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#0F172A]">Alamat</p>
                <p className="text-xs text-slate-500 mt-0.5">Jl. Kesehatan No. 88, Jakarta Pusat</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#E11D48] mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#0F172A]">Call Center</p>
                <p className="text-xs text-slate-500 mt-0.5">(021) 8065-0000</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#E11D48] mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#0F172A]">Jam Operasional</p>
                <p className="text-xs text-slate-500 mt-0.5">IGD 24 Jam • Poliklinik 08.00-20.00</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Fasilitas Utama</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• IGD 24 Jam</li>
                <li>• Rawat Inap & ICU</li>
                <li>• Laboratorium & Radiologi</li>
                <li>• Farmasi 24 Jam</li>
                <li>• Parkir & Ambulans</li>
              </ul>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-[#E11D48] text-white text-sm font-bold hover:bg-[#BE123C]"
            >
              <Navigation className="w-4 h-4" />
              Buka di Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};