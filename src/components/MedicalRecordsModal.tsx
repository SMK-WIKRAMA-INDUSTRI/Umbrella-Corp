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
  const [tab, setTab] = useState<'ringkasan' | 'riwayat' | 'lab' | 'daftar'>('ringkasan');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientLabel, setPatientLabel] = useState<string>('');
  const [formPatient, setFormPatient] = useState('');
  const [formPatientTouched, setFormPatientTouched] = useState(false);
  const [formPoli, setFormPoli] = useState('Poli Penyakit Dalam');
  const [formDoctor, setFormDoctor] = useState('');
  const [formComplaint, setFormComplaint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

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
      const msg = err?.message || 'Gagal memuat rekam medis dari database.';
      if (msg.includes('Could not find the table')) {
        setError('Tabel medical_records belum ada di database. Jalankan file supabase/schema.sql di SQL Editor Supabase, lalu refresh.');
      } else {
        setError(msg);
      }
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [isOpen]);

  const handleRegisterPoli = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    const patientName = formPatient.trim() || (patientLabel || profile?.full_name || profile?.username || '');
    if (!patientName || !formComplaint.trim()) {
      setFormMsg('Nama pasien dan keluhan wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      if (!isSupabaseConfigured) {
        setFormMsg('Supabase belum dikonfigurasi.');
        return;
      }
      const recordNo = `MR-${Date.now()}`;
      const { error: dbError } = await supabase.from('medical_records').insert({
        record_no: recordNo,
        patient_name: patientName,
        patient_username: profile?.username || null,
        visit_date: new Date().toISOString().slice(0, 10),
        doctor: formDoctor.trim() || formPoli,
        diagnosis: formComplaint.trim(),
        lab: '-',
        status: 'Terdaftar',
      });
      if (dbError) throw dbError;
      setFormMsg('Pendaftaran poli berhasil disimpan ke rekam medis.');
      setFormComplaint('');
      await fetchRecords();
      setTab('riwayat');
    } catch (err: any) {
      setFormMsg(err?.message || 'Gagal menyimpan pendaftaran poli.');
    } finally {
      setSubmitting(false);
    }
  };

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
              { id: 'daftar', label: 'Daftar Poli' },
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
                <p className="text-xs text-slate-700 mt-1 font-semibold">{lastVisit?.diagnosis || '-'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Status Terakhir</p>
                <p className="text-sm font-extrabold text-emerald-600 mt-1">{lastVisit?.status || 'Aktif'}</p>
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

          {!loading && !error && tab === 'daftar' && (
            <form onSubmit={handleRegisterPoli} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Pasien</label>
                <input
                  value={
                    formPatientTouched || formPatient
                      ? formPatient
                      : (patientLabel || profile?.full_name || profile?.username || '')
                  }
                  onChange={(e) => {
                    setFormPatientTouched(true);
                    setFormPatient(e.target.value);
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
                  placeholder="Nama lengkap pasien"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Poliklinik</label>
                <select
                  value={formPoli}
                  onChange={(e) => setFormPoli(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
                >
                  <option>Poli Penyakit Dalam</option>
                  <option>Poli Anak</option>
                  <option>Poli Kebidanan & Kandungan</option>
                  <option>Poli Bedah</option>
                  <option>Poli Neurologi</option>
                  <option>Poli Kulit & Estetika</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Dokter (opsional)</label>
                <input
                  value={formDoctor}
                  onChange={(e) => setFormDoctor(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48]"
                  placeholder="Nama dokter"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Keluhan / Diagnosa Awal</label>
                <textarea
                  value={formComplaint}
                  onChange={(e) => setFormComplaint(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#E11D48] resize-none"
                  placeholder="Contoh: Demam 3 hari, sakit kepala"
                />
              </div>
              {formMsg && <p className="text-xs text-rose-600">{formMsg}</p>}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold text-sm disabled:opacity-60"
                >
                  {submitting ? 'Menyimpan...' : 'Daftar Poli'}
                </button>
              </div>
            </form>
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