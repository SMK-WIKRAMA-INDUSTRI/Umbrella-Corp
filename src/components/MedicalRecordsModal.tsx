import React, { useState, useEffect, useCallback } from 'react';
import { X, FileText, Download, FlaskConical } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MedicalRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MedicalRecordRow {
  id: string;
  record_no: string;
  patient_name: string | null;
  patient_username: string | null;
  visit_date: string;
  doctor: string | null;
  diagnosis: string | null;
  lab: string | null;
  status: string | null;
}

interface MedicalRecord {
  id: string;
  no: string;
  date: string;
  doctor: string;
  diagnosis: string;
  lab: string;
  status: string;
}

const formatDate = (iso: string): string => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

export const MedicalRecordsModal: React.FC<MedicalRecordsModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const [tab, setTab] = useState<'ringkasan' | 'riwayat' | 'lab'>('ringkasan');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientLabel, setPatientLabel] = useState<string>('');

  const fetchRecords = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        setError('Supabase belum dikonfigurasi. Data rekam medis tidak dapat dimuat.');
        setRecords([]);
        return;
      }

      const { data, error: dbError } = await supabase
        .from('medical_records')
        .select('id, record_no, patient_name, patient_username, visit_date, doctor, diagnosis, lab, status')
        .order('visit_date', { ascending: false });

      if (dbError) throw dbError;

      const rows = (data as MedicalRecordRow[]) || [];
      const mapped: MedicalRecord[] = rows.map((r) => ({
        id: r.id,
        no: r.record_no,
        date: formatDate(r.visit_date),
        doctor: r.doctor || '-',
        diagnosis: r.diagnosis || '-',
        lab: r.lab || '-',
        status: r.status || 'Selesai',
      }));
      setRecords(mapped);
      if (rows.length > 0 && rows[0].patient_name) {
        setPatientLabel(rows[0].patient_name);
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat rekam medis dari database.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchRecords();
    }
  }, [isOpen, fetchRecords]);

  if (!isOpen) return null;

  const displayName = patientLabel || profile?.full_name || profile?.username || 'Pasien';
  const lastVisit = records.length > 0 ? records[0] : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#E11D48]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#0F172A]">Rekam Medis Digital</h2>
              <p className="text-xs text-slate-500 mt-0.5">Riwayat pemeriksaan, diagnosa, dan hasil laboratorium</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex bg-slate-100 rounded-2xl p-1 w-fit">
            {[
              { id: 'ringkasan', label: 'Ringkasan' },
              { id: 'riwayat', label: 'Riwayat Pemeriksaan' },
              { id: 'lab', label: 'Hasil Lab' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  tab === t.id ? 'bg-white text-[#E11D48] shadow-sm' : 'text-slate-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="py-10 text-center text-sm text-slate-500">Memuat rekam medis dari database...</div>
          )}
          {error && !loading && (
            <div className="py-10 text-center text-sm text-rose-600">{error}</div>
          )}
          {!loading && !error && records.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500">Belum ada rekam medis tersimpan.</div>
          )}

          {!loading && !error && records.length > 0 && tab === 'ringkasan' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Pasien</p>
                <p className="text-sm font-extrabold text-[#0F172A] mt-1">{displayName}</p>
                <p className="text-xs text-slate-500 mt-0.5">Username: {profile?.username || '-'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Kunjungan Terakhir</p>
                <p className="text-sm font-extrabold text-[#0F172A] mt-1">{lastVisit?.date || '-'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{lastVisit?.doctor || '-'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Status</p>
                <p className="text-sm font-extrabold text-emerald-600 mt-1">Aktif</p>
                <p className="text-xs text-slate-500 mt-0.5">{records.length} rekam medis tersimpan</p>
              </div>
            </div>
          )}

          {!loading && !error && records.length > 0 && tab === 'riwayat' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
                    <th className="py-2 pr-4">No. Rekam</th>
                    <th className="py-2 pr-4">Tanggal</th>
                    <th className="py-2 pr-4">Dokter</th>
                    <th className="py-2 pr-4">Diagnosa</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50">
                      <td className="py-3 pr-4 font-semibold text-[#E11D48]">{r.no}</td>
                      <td className="py-3 pr-4">{r.date}</td>
                      <td className="py-3 pr-4">{r.doctor}</td>
                      <td className="py-3 pr-4">{r.diagnosis}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && records.length > 0 && tab === 'lab' && (
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <FlaskConical className="w-5 h-5 text-[#E11D48]" />
                    <div>
                      <p className="text-sm font-bold text-[#0F172A]">{r.lab}</p>
                      <p className="text-xs text-slate-500">{r.date} • {r.doctor}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <Download className="w-3.5 h-3.5" />
                    Unduh
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-sm">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};