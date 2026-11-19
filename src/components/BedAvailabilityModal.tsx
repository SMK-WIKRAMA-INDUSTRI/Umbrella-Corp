import React, { useState } from 'react';
import { X, Bed, Check, ShieldAlert, Sparkles, Filter, Download } from 'lucide-react';
import { INITIAL_BEDS, HOSPITAL_METADATA } from '../data/hospitalData';
import { RoomBed } from '../types';

interface BedAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBedForInquiry: (bed: RoomBed) => void;
  onDownloadForm: () => void;
}

export const BedAvailabilityModal: React.FC<BedAvailabilityModalProps> = ({
  isOpen,
  onClose,
  onSelectBedForInquiry,
  onDownloadForm,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredBeds = selectedFilter === 'ALL'
    ? INITIAL_BEDS
    : selectedFilter === 'INTENSIVE'
    ? INITIAL_BEDS.filter(b => ['ICU', 'NICU', 'PICU', 'Isolasi Tekanan Negatif'].includes(b.roomClass))
    : INITIAL_BEDS.filter(b => ['VVIP', 'VIP', 'Kelas 1', 'Kelas 2', 'Kelas 3'].includes(b.roomClass));

  const totalAvailableBeds = INITIAL_BEDS.reduce((acc, curr) => acc + curr.availableBeds, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden text-left flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#BE123C]">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                Ketersediaan Kamar Rawat Inap & ICU
              </h3>
              <p className="text-xs text-[#64748B]">
                Data Real-Time SIMRS Terhubung • Total {totalAvailableBeds} Ranjang Siap Pakai
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

        {/* Filter Pills */}
        <div className="px-6 py-2.5 bg-white border-b border-[#F1F5F9] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-[#64748B] font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedFilter === 'ALL'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Semua Kamar ({INITIAL_BEDS.length})
            </button>
            <button
              onClick={() => setSelectedFilter('VIP')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedFilter === 'VIP'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              VVIP, VIP & Rawat Umum
            </button>
            <button
              onClick={() => setSelectedFilter('INTENSIVE')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedFilter === 'INTENSIVE'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              ICU, NICU & Isolasi
            </button>
          </div>

          <button
            onClick={onDownloadForm}
            className="hidden sm:inline-flex items-center space-x-1 px-3 py-1 bg-rose-50 text-[#BE123C] border border-rose-200 rounded-md text-xs font-medium hover:bg-rose-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Formulir Rawat Inap (PDF)</span>
          </button>
        </div>

        {/* Room List Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBeds.map((bed) => {
              const occupancyPct = Math.round((bed.occupiedBeds / bed.totalBeds) * 100);
              return (
                <div
                  key={bed.id}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-4 hover:border-slate-400 hover:shadow-subtle transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm sm:text-base text-[#0F172A]">
                            {bed.roomClass}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              bed.liveStatus === 'Tersedia'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {bed.availableBeds} Kosong ({bed.liveStatus})
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">{bed.pavilion}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold text-[#BE123C] block">
                          {bed.priceFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar of Occupancy */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] text-[#64748B] mb-1">
                        <span>Terisi: {bed.occupiedBeds} / {bed.totalBeds} Bed</span>
                        <span>{occupancyPct}% Okupansi</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            occupancyPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Facilities Preview */}
                    <div className="mt-3 pt-2.5 border-t border-[#F1F5F9]">
                      <p className="text-[11px] font-semibold text-slate-700 mb-1">Fasilitas Utama:</p>
                      <ul className="text-xs text-[#475569] space-y-1">
                        {bed.facilities.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-start space-x-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-2 text-[11px] text-[#64748B] bg-slate-50 p-2 rounded">
                      <strong>Ketentuan Besuk:</strong> {bed.visitorRules}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onSelectBedForInquiry(bed)}
                      className="px-3 py-1.5 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-medium transition-colors"
                    >
                      Pilih & Tanyakan di Chat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
