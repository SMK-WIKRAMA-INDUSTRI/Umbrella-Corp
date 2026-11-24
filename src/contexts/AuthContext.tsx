import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  phone: string | null;
  nik: string | null;
  role: string | null;
  created_at: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signUp: (payload: {
    username: string;
    password: string;
  }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    // Ambil username dari auth user (metadata/email), lalu cocokkan ke tabel public.users
    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user ?? null;
    const username =
      (authUser?.user_metadata?.username as string | undefined) ||
      authUser?.email?.split('@')[0] ||
      null;
    if (!username) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('users')
      .select('id, username, created_at')
      .eq('username', username)
      .maybeSingle();
    if (!error && data) {
      setProfile({
        id: String(data.id),
        username: data.username ?? username,
        full_name: null,
        phone: null,
        nik: null,
        role: 'patient',
        created_at: data.created_at ?? null,
      });
    } else {
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) await fetchProfile(user.id);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user?.id) {
        fetchProfile(data.session.user.id);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user?.id) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const toEmail = (username: string) => `${username.trim().toLowerCase()}@umbrella.app`;

  const signIn = async (username: string, password: string) => {
    if (!isSupabaseConfigured) return { error: 'Supabase belum dikonfigurasi. Isi .env terlebih dahulu.' };
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: toEmail(username),
        password,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e?.message || 'Gagal menghubungi server (Failed to fetch). Periksa koneksi/URL Supabase.' };
    }
  };

  const signUp = async (payload: { username: string; password: string }) => {
    if (!isSupabaseConfigured) return { error: 'Supabase belum dikonfigurasi. Isi .env terlebih dahulu.' };
    try {
      const username = payload.username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return { error: 'Username harus 3-20 karakter, hanya huruf/angka/underscore.' };
    }
    const { data, error } = await supabase.auth.signUp({
      email: toEmail(username),
      password: payload.password,
      options: {
        data: {
          username,
        },
      },
    });
    if (error) return { error: error.message };

    // Simpan data register ke tabel public.users (sesuai struktur DB).
    if (data.user?.id) {
      const { error: insertError } = await supabase.from('users').insert({
        username,
        password: payload.password,
        created_at: new Date().toISOString(),
      });
      if (insertError) {
        return {
          error: `Akun autentikasi berhasil dibuat, tetapi gagal menyimpan ke tabel users: ${insertError.message}`,
        };
      }
    }
    return { error: null };
    } catch (e: any) {
      return { error: e?.message || 'Gagal menghubungi server (Failed to fetch). Periksa koneksi/URL Supabase.' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};