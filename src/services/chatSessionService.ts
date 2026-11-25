import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ChatItem } from '../components/ChatPlayground';

const LOCAL_SESSION_KEY = 'umbrella_chat_session_id';
const localMessagesKey = (sessionId: string) => `umbrella_chat_messages_${sessionId}`;

const isLocalSession = (sessionId: string) => sessionId.startsWith('local_');

export async function getOrCreateCurrentSession(userId?: string | null): Promise<string> {
  if (isSupabaseConfigured) {
    const stored = localStorage.getItem(LOCAL_SESSION_KEY);
    if (stored && !isLocalSession(stored)) {
      const { data } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('id', stored)
        .maybeSingle();
      if (data?.id) return stored;
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: userId ?? null, title: 'Percakapan Baru' })
      .select('id')
      .single();

    if (error || !data?.id) {
      throw new Error(error?.message || 'Gagal membuat sesi chat.');
    }

    localStorage.setItem(LOCAL_SESSION_KEY, data.id);
    return data.id;
  }

  // Mode lokal (tanpa Supabase)
  let stored = localStorage.getItem(LOCAL_SESSION_KEY);
  if (!stored || !isLocalSession(stored)) {
    stored = 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(LOCAL_SESSION_KEY, stored);
    localStorage.setItem(localMessagesKey(stored), '[]');
  }
  return stored;
}

export async function fetchSessionMessages(sessionId: string): Promise<ChatItem[]> {
  if (isSupabaseConfigured && !isLocalSession(sessionId)) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, sender, text, timestamp, is_error')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Gagal memuat pesan sesi:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      sender: row.sender,
      text: row.text,
      timestamp: row.timestamp ?? '',
      isError: !!row.is_error,
    }));
  }

  try {
    const raw = localStorage.getItem(localMessagesKey(sessionId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function persistMessage(sessionId: string, msg: ChatItem): Promise<void> {
  if (isSupabaseConfigured && !isLocalSession(sessionId)) {
    const { error } = await supabase.from('chat_messages').upsert({
      id: msg.id,
      session_id: sessionId,
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp,
      is_error: !!msg.isError,
    });
    if (error) console.error('Gagal menyimpan pesan:', error.message);

    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);
    return;
  }

  try {
    const msgs = await fetchSessionMessages(sessionId);
    const idx = msgs.findIndex((m) => m.id === msg.id);
    if (idx >= 0) msgs[idx] = msg;
    else msgs.push(msg);
    localStorage.setItem(localMessagesKey(sessionId), JSON.stringify(msgs));
  } catch (e) {
    console.error('Gagal menyimpan pesan lokal:', e);
  }
}

export async function startNewSession(userId?: string | null): Promise<string> {
  localStorage.removeItem(LOCAL_SESSION_KEY);
  return getOrCreateCurrentSession(userId ?? null);
}