import React from 'react';
import { BedCardData, DoctorCardData, EmergencyCardData, ActionPill } from '../types';
import { Download, PhoneCall, AlertTriangle, Calendar, Clock, CheckCircle, ChevronRight, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface CardRendererProps {
  cardType: string;
  bedData?: BedCardData;
  doctorData?: DoctorCardData[];
  emergencyData?: EmergencyCardData;
  actionPills?: ActionPill[];
  onActionClick: (pill: ActionPill) => void;
  seniorMode?: boolean;
}

export const CardRenderer: React.FC<CardRendererProps> = ({
  cardType,
  bedData,
  doctorData,
  emergencyData,
  actionPills,
  onActionClick,
  seniorMode = false,
}) => {
  if (cardType === 'bed-status' && bedData) {
    return (
      <div className="mt-3.5 space-y-3">
        {/* The Exact Bed Status Card as shown in user screenshot */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 sm:p-5 shadow-sm text-left">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <h4 className={`font-semibold text-[#0F172A] ${seniorMode ? 'text-lg' : 'text-[14px] sm:text-[15px]'}`}>
              {bedData.title}
            </h4>
            <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#E11D48] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-ping"></span>
              <span>{bedData.badge || 'UPDATE LIVE'}</span>
            </span>
          </div>

          {/* Card Bullet Points */}
          <ul className={`mt-3 space-y-2.5 text-[#334155] leading-relaxed ${seniorMode ? 'text-base' : 'text-[13.5px]'}`}>
            {bedData.items.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-[#0F172A] mr-2 select-none font-bold">•</span>
                <div>
                  <strong className="text-[#0F172A] font-semibold">{item.label}:</strong>{' '}
                  <span className="text-[#334155]">{item.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons below card (e.g. Unduh Formulir Rawat Inap & Hubungi IGD 24 Jam) */}
        {actionPills && actionPills.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {actionPills.map((pill) => {
              const isCrimson = pill.variant === 'crimson' || pill.id.includes('igd') || pill.id.includes('emergency');
              return (
                <button
                  key={pill.id}
                  onClick={() => onActionClick(pill)}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isCrimson
                      ? 'bg-white border border-[#E11D48] text-[#BE123C] hover:bg-rose-50 shadow-sm'
                      : 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {pill.icon === 'download' && <Download className="w-3.5 h-3.5 text-[#64748B]" />}
                  {pill.icon === 'phone' && <PhoneCall className="w-3.5 h-3.5 text-[#BE123C]" />}
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (cardType === 'doctor-list' && doctorData) {
    return (
      <div className="mt-3.5 space-y-3">
        <div className="grid grid-cols-1 gap-2.5">
          {doctorData.map((doc, idx) => (
            <div
              key={idx}
              className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-3.5 sm:p-4 hover:border-rose-300 transition-all text-left shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-[#0F172A]">{doc.doctorName}</h4>
                  <p className="text-xs text-[#BE123C] font-medium mt-0.5">{doc.specialty}</p>
                </div>
                <div>
                  {doc.status === 'active' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Praktik Aktif
                    </span>
                  )}
                  {doc.status === 'on-leave' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Cuti (Dokter Pengganti)
                    </span>
                  )}
                </div>
              </div>

              {doc.substituteName && (
                <div className="mt-2 text-xs bg-rose-50/60 p-2 rounded border border-rose-100 text-[#9F1239]">
                  <strong>Digantikan oleh:</strong> {doc.substituteName} ({doc.substituteHours || doc.hours})
                </div>
              )}

              <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs text-[#64748B]">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doc.days.join(', ')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doc.hours}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Sisa Kuota: <strong className="text-slate-800">{doc.quotaAvailable}</strong> / {doc.quotaTotal}
                </span>
                <button
                  onClick={() =>
                    onActionClick({
                      id: `book-${doc.doctorName}`,
                      label: `Booking ${doc.doctorName}`,
                      actionType: 'modal',
                      payload: doc.doctorName,
                    })
                  }
                  className="px-2.5 py-1 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-medium rounded-md transition-colors"
                >
                  Pilih & Booking
                </button>
              </div>
            </div>
          ))}
        </div>

        {actionPills && actionPills.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {actionPills.map((pill) => (
              <button
                key={pill.id}
                onClick={() => onActionClick(pill)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50 shadow-sm transition-colors"
              >
                <span>{pill.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (cardType === 'emergency-alert' && emergencyData) {
    return (
      <div className="mt-3.5 bg-rose-50 border-2 border-[#E11D48] rounded-xl p-4 sm:p-5 text-left shadow-md">
        <div className="flex items-center space-x-2.5 pb-2.5 border-b border-rose-200">
          <div className="w-8 h-8 rounded-full bg-[#E11D48] flex items-center justify-center text-white flex-shrink-0 animate-bounce">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-[#9F1239] uppercase tracking-wide">
              {emergencyData.title}
            </h4>
            <p className="text-xs text-rose-700">Triase Resusitasi Merah • Prioritas Penanganan Level 1</p>
          </div>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
          {emergencyData.warningText}
        </p>

        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a
            href={`tel:${emergencyData.emergencyHotline.replace(/-/g, '')}`}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Panggil IGD ({emergencyData.emergencyHotline})</span>
          </a>
          <a
            href="tel:119"
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-white border border-rose-300 text-[#9F1239] hover:bg-rose-100 font-semibold text-xs sm:text-sm transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Panggil Ambulans (119)</span>
          </a>
        </div>
      </div>
    );
  }

  return null;
};
