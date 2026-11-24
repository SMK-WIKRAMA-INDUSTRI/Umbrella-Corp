import React, { useState } from 'react';
import { X, User, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { signIn, signUp, isConfigured } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setError(null);
    setSuccess(null);
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    reset();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);
    const { error: err } = await signIn(username.trim(), password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccess('Berhasil masuk. Selamat datang kembali!');
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 900);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    setLoading(true);
    const { error: err } = await signUp({ username, password });
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccess('Pendaftaran berhasil. Silakan masuk dengan akun Anda.');
      setMode('login');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-down">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
              {mode === 'login' ? 'Masuk' : 'Daftar Akun Baru'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'login' ? 'Masuk dengan username & password' : 'Buat akun dengan username & password'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all active:scale-95"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex bg-slate-100 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                mode === 'login' ? 'bg-white text-[#E11D48] shadow-sm' : 'text-slate-600'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                mode === 'register' ? 'bg-white text-[#E11D48] shadow-sm' : 'text-slate-600'
              }`}
            >
              Daftar
            </button>
          </div>
        </div>

        {!isConfigured && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Supabase belum dikonfigurasi. Isi .env lalu restart dev server.</span>
          </div>
        )}

        <form
          onSubmit={mode === 'login' ? handleLogin : handleRegister}
          className="px-6 py-5 space-y-4"
        >
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">Username</label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:border-[#E11D48] focus-within:ring-2 focus-within:ring-rose-100 transition-all">
              <span className="text-slate-400"><User className="w-4 h-4" /></span>
              <input
                type="text"
                required
                minLength={3}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-transparent outline-none text-sm"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">Password</label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:border-[#E11D48] focus-within:ring-2 focus-within:ring-rose-100 transition-all">
              <span className="text-slate-400"><Lock className="w-4 h-4" /></span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Minimal 6 karakter' : 'Password'}
                className="w-full bg-transparent outline-none text-sm"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-sm shadow-md shadow-rose-500/25 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Masuk' : 'Daftar Sekarang'}
          </button>

          <p className="text-[11px] text-slate-500 text-center">
            {mode === 'login' ? (
              <>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-[#E11D48] font-bold hover:underline"
                >
                  Daftar
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-[#E11D48] font-bold hover:underline"
                >
                  Masuk
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};