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

interface LocalStoredUser {
  id: string;
  username: string;
  password: string;
  created_at: string;
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

const LOCAL_STORAGE_USERS_KEY = 'umbrella_patient_users_db';
const LOCAL_STORAGE_SESSION_KEY = 'umbrella_patient_active_session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper untuk mendapatkan database lokal
  const getLocalUsers = (): LocalStoredUser[] => {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (data) return JSON.parse(data);
    } catch (_) {}
    return [];
  };

  const saveLocalUsers = (users: LocalStoredUser[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (_) {}
  };

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) {
      // Di mode lokal, profile sudah diset saat signIn / restoreSession
      return;
    }
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
    let mounted = true;

    if (isSupabaseConfigured) {
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
    } else {
      // Mode Lokal: Pulihkan sesi aktif dari localStorage
      try {
        const rawSession = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          if (parsed && parsed.user) {
            setSession(parsed);
            setUser(parsed.user);
            setProfile({
              id: parsed.user.id,
              username: parsed.user.user_metadata?.username || parsed.user.email?.split('@')[0] || 'Pasien',
              full_name: parsed.user.user_metadata?.username || 'Pasien',
              phone: null,
              nik: null,
              role: 'patient',
              created_at: parsed.user.created_at,
            });
          }
        }
      } catch (_) {}
      setLoading(false);
    }
  }, []);

  const toEmail = (username: string) => `${username.trim().toLowerCase()}@umbrella.app`;

  const signIn = async (username: string, password: string) => {
    const cleanUsername = username.trim().toLowerCase();
    
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: toEmail(cleanUsername),
          password,
        });
        if (error) return { error: error.message };
        return { error: null };
      } catch (e: any) {
        return { error: e?.message || 'Gagal menghubungi server Supabase.' };
      }
    }

    // Mode Lokal: Verifikasi terhadap database lokal browser
    const users = getLocalUsers();
    const userMatch = users.find((u) => u.username.toLowerCase() === cleanUsername);
    if (!userMatch || userMatch.password !== password) {
      return { error: 'Username atau password salah. Silakan coba lagi.' };
    }

    const localUser = {
      id: userMatch.id,
      app_metadata: {},
      user_metadata: { username: userMatch.username },
      aud: 'authenticated',
      created_at: userMatch.created_at,
      email: toEmail(userMatch.username),
    } as unknown as User;

    const localSession = {
      access_token: 'local_token_' + Date.now(),
      token_type: 'bearer',
      user: localUser,
      expires_in: 3600 * 24 * 7,
      refresh_token: 'local_refresh_' + Date.now(),
    } as unknown as Session;

    try {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(localSession));
    } catch (_) {}

    setSession(localSession);
    setUser(localUser);
    setProfile({
      id: userMatch.id,
      username: userMatch.username,
      full_name: userMatch.username,
      phone: null,
      nik: null,
      role: 'patient',
      created_at: userMatch.created_at,
    });

    return { error: null };
  };

  const signUp = async (payload: { username: string; password: string }) => {
    const username = payload.username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return { error: 'Username harus 3-20 karakter, hanya huruf/angka/underscore.' };
    }

    if (isSupabaseConfigured) {
      try {
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

        if (data.user?.id) {
          const { error: insertError } = await supabase.from('users').insert({
            username,
            password: payload.password,
            created_at: new Date().toISOString(),
          });
          if (insertError) {
            return {
              error: `Akun dibuat, tetapi gagal menyimpan ke tabel users: ${insertError.message}`,
            };
          }
        }
        return { error: null };
      } catch (e: any) {
        return { error: e?.message || 'Gagal menghubungi server Supabase.' };
      }
    }

    // Mode Lokal: Simpan akun baru ke database lokal browser
    const users = getLocalUsers();
    if (users.some((u) => u.username.toLowerCase() === username)) {
      return { error: 'Username sudah terdaftar. Silakan pilih username lain atau langsung Masuk.' };
    }

    const newUser: LocalStoredUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      username,
      password: payload.password,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    saveLocalUsers(users);

    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      try {
        localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      } catch (_) {}
    }
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
        isConfigured: true,
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