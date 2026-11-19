import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { Doctor } from '../types';

interface BookingModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (bookingDetails: {
    doctorName: string;
    specialty: string;
    date: string;
    timeSlot: string;
    insurance: string;
    bookingCode: string;
    queueNumber: string;
  }) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onConfirmBooking,
}) => {
  const [selectedDay, setSelectedDay] = useState(doctor?.days[0] || 'Senin');
  const [insuranceType, setInsuranceType] = useState('BPJS Kesehatan');
  const [notes, setNotes] = useState('');

  if (!isOpen || !doctor) return null;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const randomCode = `UMB-BK-${Math.floor(100000 + Math.random() * 900000)}`;
    const randomQueue = `Q-${Math.floor(10 + Math.random() * 25)}`;

    onConfirmBooking({
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: `${selectedDay}, 20 November 2026`,
      timeSlot: doctor.hours,
      insurance: insuranceType,
      bookingCode: randomCode,
      queueNumber: randomQueue,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl overflow-hidden text-left flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-base text-[#0F172A]">Konfirmasi Janji Temu Poliklinik</h3>
            <p className="text-xs text-[#64748B]">Reservasi Mandiri Pasien Terdaftar SIMRS</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleBooking} className="p-6 space-y-4 text-xs">
          
          {/* Doctor Brief Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center space-x-3">
            <img
              src={doctor.avatarUrl}
              alt={doctor.name}
              className="w-12 h-12 rounded-full object-cover border border-slate-300"
            />
            <div>
              <h4 className="font-semibold text-sm text-[#0F172A]">{doctor.name}</h4>
              <p className="text-xs text-[#BE123C] font-medium">{doctor.specialty}</p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" /> {doctor.room} ({doctor.floor})
              </p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Hari Praktik:</label>
            <div className="grid grid-cols-3 gap-2">
              {doctor.days.map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                    selectedDay === day
                      ? 'border-[#E11D48] bg-rose-50 text-[#BE123C] font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jenis Penjaminan:</label>
            <select
              value={insuranceType}
              onChange={(e) => setInsuranceType(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
            >
              <option value="BPJS Kesehatan">BPJS Kesehatan (Rujukan PCare Faskes 1)</option>
              <option value="Asuransi Prudential (Cashless)">Asuransi Prudential (Cashless PRUmedical)</option>
              <option value="Asuransi AdMedika">Asuransi AdMedika (Cashless TPA)</option>
              <option value="Mandiri Inhealth">Mandiri Inhealth</option>
              <option value="Allianz Care">Allianz Care</option>
              <option value="Umum / Pembayaran Pribadi">Umum / Pembayaran Pribadi</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Keluhan Singkat (Opsional):</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Kontrol rutin bulanan tensi darah / resep obat habis"
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Sisa Kuota: <strong>{doctor.quotaAvailable} Pasien</strong>
            </span>
            <div className="space-x-2">
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
                Konfirmasi Booking
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
