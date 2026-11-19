import React, { useState } from 'react';
import { X, Search, Calendar, Clock, MapPin, Award, CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import { INITIAL_DOCTORS, CLINIC_SPECIALTIES } from '../data/hospitalData';
import { Doctor } from '../types';

interface DoctorDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookDoctor: (doctor: Doctor) => void;
}

export const DoctorDirectoryModal: React.FC<DoctorDirectoryModalProps> = ({
  isOpen,
  onClose,
  onBookDoctor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState('ALL');

  if (!isOpen) return null;

  const filteredDoctors = INITIAL_DOCTORS.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.subSpecialty && doc.subSpecialty.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecialty =
      selectedSpecialty === 'ALL' || doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());

    const matchesDay = selectedDay === 'ALL' || doc.days.includes(selectedDay);

    return matchesSearch && matchesSpecialty && matchesDay;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#BE123C]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                Direktori Jadwal Dokter Spesialis RS Umbrella
              </h3>
              <p className="text-xs text-[#64748B]">
                17 Poliklinik Terpadu • Status Kehadiran Terverifikasi SIMRS
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

        {/* Search & Filter Bar */}
        <div className="p-4 sm:px-6 bg-white border-b border-[#F1F5F9] grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama dokter atau keluhan..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#E11D48]"
            />
          </div>

          <div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#E11D48] text-slate-700"
            >
              <option value="ALL">Semua Poliklinik (17 Spesialisasi)</option>
              {CLINIC_SPECIALTIES.map((spec, i) => (
                <option key={i} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#E11D48] text-slate-700"
            >
              <option value="ALL">Semua Hari Praktik</option>
              <option value="Senin">Hari Senin</option>
              <option value="Selasa">Hari Selasa</option>
              <option value="Rabu">Hari Rabu</option>
              <option value="Kamis">Hari Kamis</option>
              <option value="Jumat">Hari Jumat</option>
              <option value="Sabtu">Hari Sabtu</option>
            </select>
          </div>
        </div>

        {/* Doctor Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          {filteredDoctors.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Tidak ditemukan dokter untuk kriteria pencarian tersebut. Silakan atur ulang filter Anda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-4 hover:border-slate-400 hover:shadow-subtle transition-all flex flex-col justify-between text-left"
                >
                  <div>
                    {/* Top Doctor Info */}
                    <div className="flex items-start space-x-3">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-14 h-14 rounded-full object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-[#0F172A] truncate" title={doc.name}>
                            {doc.name}
                          </h4>
                        </div>
                        <p className="text-xs text-[#BE123C] font-medium">{doc.specialty}</p>
                        {doc.subSpecialty && (
                          <p className="text-[11px] text-[#64748B] line-clamp-1">{doc.subSpecialty}</p>
                        )}
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{doc.sip}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3">
                      {doc.status === 'active' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" /> Praktik Aktif Hari Ini
                        </span>
                      )}
                      {doc.status === 'on-leave' && (
                        <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-900">
                          <div className="flex items-center space-x-1 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Sedang Cuti / Berhalangan</span>
                          </div>
                          {doc.substituteDoctor && (
                            <p className="text-[11px] text-amber-800 mt-1">
                              <strong>Dokter Pengganti:</strong> {doc.substituteDoctor} ({doc.substituteHours})
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Practice Details */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#64748B] bg-slate-50 p-2.5 rounded-lg">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.days.join(', ')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.hours}</span>
                      </div>
                      <div className="flex items-center space-x-1 col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.room} ({doc.floor})</span>
                      </div>
                    </div>

                    {/* Insurance Badges */}
                    <div className="mt-2.5 flex items-center space-x-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <Shield className="w-3 h-3" /> BPJS Diterima
                      </span>
                      <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        Asuransi Swasta Cashless
                      </span>
                    </div>
                  </div>

                  {/* Booking Footer */}
                  <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                    <span className="text-xs text-[#64748B]">
                      Sisa Kuota: <strong className="text-[#0F172A]">{doc.quotaAvailable}</strong> / {doc.quotaTotal}
                    </span>
                    <button
                      onClick={() => onBookDoctor(doc)}
                      className="px-3 py-1.5 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      Pilih & Buat Janji
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
