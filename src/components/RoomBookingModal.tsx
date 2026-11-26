import React, { useState } from 'react';
import { X, BedDouble, CheckCircle2, Printer } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface RoomBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRoomClass?: string;
  defaultBedId?: string;
  defaultNights?: number;
}

interface BookingReceipt {
  bookingCode: string;
  patientName: string;
  phone: string;
  roomClass: string;
  bedId: string;
  nights: number;
  totalAmount: number;
  createdAt: string;
}

const ROOM_PRICE: Record<string, number> = {
  'VVIP Aster Suite': 2850000,
  'VIP Aster': 1650000,
  'VIP Melati': 1650000,
  'Kelas 1': 850000,
  'Kelas 2': 550000,
  'Kelas 3': 350000,
  ICU: 3200000,
  NICU: 2900000,
  Isolasi: 2100000,
};

export const RoomBookingModal: React.FC<RoomBookingModalProps> = ({
  isOpen,
  onClose,
  defaultRoomClass = 'VIP Aster',
  defaultBedId = '',
  defaultNights = 1,
}) => {
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [roomClass, setRoomClass] = useState(defaultRoomClass);
  const [nights, setNights] = useState(defaultNights);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);

  if (!isOpen) return null;

  const price = ROOM_PRICE[roomClass] || 0;
  const total = price * nights;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!patientName.trim() || !phone.trim()) {
      setError('Nama pasien dan nomor telepon wajib diisi.');
      return;
    }
    setSubmitting(true);
    const bookingCode = `UMB-RM-${Date.now().toString().slice(-6)}`;
    try {
      if (isSupabaseConfigured) {
        const { error: dbError } = await supabase.from('room_bookings').insert({
          booking_code: bookingCode,
          patient_name: patientName.trim(),
          phone: phone.trim(),
          room_class: roomClass,
          bed_id: defaultBedId || null,
          nights,
          notes: notes.trim() || null,
          total_amount: total,
          status: 'pending',
        });
        if (dbError) throw dbError;
      }
      setReceipt({
        bookingCode,
        patientName: patientName.trim(),
        phone: phone.trim(),
        roomClass,
        bedId: defaultBedId,
        nights,
        totalAmount: total,
        createdAt: new Date().toLocaleString('id-ID'),
      });
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan booking ke database.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setReceipt(null);
    setError(null);
    setPatientName('');
    setPhone('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl overflow-hidden text-left flex flex-col">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-base text-[#0F172A]">Reservasi Kamar Rawat Inap</h3>
            <p className="text-xs text-[#64748B]">Data dicatat ke sistem RS Umbrella</p>
          </div>
          <button onClick={handleClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!receipt ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Pasien:</label>
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
                placeholder="Nama lengkap pasien"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon:</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kelas Kamar:</label>
              <select
                value={roomClass}
                onChange={(e) => setRoomClass(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
              >
                {Object.keys(ROOM_PRICE).map((rc) => (
                  <option key={rc} value={rc}>
                    {rc} - Rp {ROOM_PRICE[rc].toLocaleString('id-ID')}/malam
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Durasi (malam):</label>
              <input
                type="number"
                min={1}
                value={nights}
                onChange={(e) => setNights(Math.max(1, Number(e.target.value) || 1))}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan (opsional):</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
                placeholder="Contoh: pasien pasca operasi, butuh kamar dekat lift"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Estimasi total: <strong>Rp {total.toLocaleString('id-ID')}</strong>
              </span>
              <div className="space-x-2">
                <button type="button" onClick={handleClose} className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold transition-colors shadow-sm disabled:opacity-60"
                >
                  {submitting ? 'Menyimpan...' : 'Konfirmasi Booking'}
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-rose-600">{error}</p>}
          </form>
        ) : (
          <div className="p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>Booking berhasil dicatat</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
              <p><strong>Kode Booking:</strong> {receipt.bookingCode}</p>
              <p><strong>Nama Pasien:</strong> {receipt.patientName}</p>
              <p><strong>Telepon:</strong> {receipt.phone}</p>
              <p><strong>Kelas Kamar:</strong> {receipt.roomClass}</p>
              {receipt.bedId && <p><strong>Bed:</strong> {receipt.bedId}</p>}
              <p><strong>Durasi:</strong> {receipt.nights} malam</p>
              <p><strong>Total Estimasi:</strong> Rp {receipt.totalAmount.toLocaleString('id-ID')}</p>
              <p><strong>Waktu:</strong> {receipt.createdAt}</p>
            </div>
            <p className="text-[11px] text-slate-500">
              Simpan struk ini. Konfirmasi ketersediaan dan penempatan kamar akan dilakukan oleh petugas RS.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={handlePrint} className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                <Printer className="w-4 h-4" /> Cetak Struk
              </button>
              <button onClick={handleClose} className="px-4 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold transition-colors shadow-sm">
                Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};