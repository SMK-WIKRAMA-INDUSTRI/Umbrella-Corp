-- ============================================
-- RS Umbrella - Supabase Schema (Auth + Profiles)
-- Jalankan di SQL Editor Supabase (atau via migration)
-- ============================================

-- 1. Tabel profil pasien (1:1 dengan auth.users)
-- Jika tabel sudah ada (versi lama), tambahkan kolom username
alter table if exists public.profiles add column if not exists username text;
create unique index if not exists profiles_username_unique on public.profiles (username);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  phone text,
  nik text,
  role text not null default 'patient',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- index untuk pencarian username
create index if not exists profiles_username_idx on public.profiles (username);

-- 2. Trigger: buat profil otomatis saat user baru register
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, role)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    'patient'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. RLS (Row Level Security)
alter table public.profiles enable row level security;

-- user hanya bisa lihat profil sendiri
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

-- user bisa update profil sendiri
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- insert ditangani trigger (service role), tapi izinkan self-insert fallback
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- 4. updated_at auto
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

-- ============================================
-- Tabel users (custom) + hak akses untuk anon/authenticated
-- ============================================
create table if not exists public.users (
  id bigserial primary key,
  username varchar not null unique,
  password varchar not null,
  created_at timestamptz not null default now()
);

-- izinkan frontend (anon) insert & select ke tabel users
grant usage on schema public to anon, authenticated;
grant select, insert on public.users to anon, authenticated;
grant usage, select on sequence public.users_id_seq to anon, authenticated;

-- RLS (jika aktif) - izinkan insert/select untuk anon/authenticated (prototype)
alter table public.users enable row level security;
drop policy if exists "users_insert_all" on public.users;
create policy "users_insert_all"
  on public.users
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "users_select_all" on public.users;
create policy "users_select_all"
  on public.users
  for select
  to anon, authenticated
  using (true);

-- ============================================
-- Chat Sessions & Messages (persistensi riwayat chat AI)
-- ============================================

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  title text default 'Percakapan Baru',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_sessions_user_idx on public.chat_sessions (user_id);
create index if not exists chat_sessions_updated_idx on public.chat_sessions (updated_at desc);

create table if not exists public.chat_messages (
  id text primary key,
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  sender text not null check (sender in ('user', 'ai')),
  text text not null,
  timestamp text,
  is_error boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_session_idx on public.chat_messages (session_id, created_at);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- sessions: boleh dikelola oleh pemilik atau sesi anonim (user_id is null)
drop policy if exists "chat_sessions_select" on public.chat_sessions;
create policy "chat_sessions_select"
  on public.chat_sessions
  for select
  to anon, authenticated
  using (user_id is null or user_id = auth.uid());

drop policy if exists "chat_sessions_insert" on public.chat_sessions;
create policy "chat_sessions_insert"
  on public.chat_sessions
  for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "chat_sessions_update" on public.chat_sessions;
create policy "chat_sessions_update"
  on public.chat_sessions
  for update
  to anon, authenticated
  using (user_id is null or user_id = auth.uid())
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "chat_sessions_delete" on public.chat_sessions;
create policy "chat_sessions_delete"
  on public.chat_sessions
  for delete
  to anon, authenticated
  using (user_id is null or user_id = auth.uid());

-- messages: akses mengikuti kepemilikan sesi
drop policy if exists "chat_messages_select" on public.chat_messages;
create policy "chat_messages_select"
  on public.chat_messages
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and (s.user_id is null or s.user_id = auth.uid())
    )
  );

drop policy if exists "chat_messages_insert" on public.chat_messages;
create policy "chat_messages_insert"
  on public.chat_messages
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and (s.user_id is null or s.user_id = auth.uid())
    )
  );

drop policy if exists "chat_messages_update" on public.chat_messages;
create policy "chat_messages_update"
  on public.chat_messages
  for update
  to anon, authenticated
  using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and (s.user_id is null or s.user_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and (s.user_id is null or s.user_id = auth.uid())
    )
  );

drop policy if exists "chat_messages_delete" on public.chat_messages;
create policy "chat_messages_delete"
  on public.chat_messages
  for delete
  to anon, authenticated
  using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and (s.user_id is null or s.user_id = auth.uid())
    )
  );

grant select, insert, update, delete on public.chat_sessions to anon, authenticated;
grant select, insert, update, delete on public.chat_messages to anon, authenticated;