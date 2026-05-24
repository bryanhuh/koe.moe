-- ============================================================
-- koe — initial schema
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ----------------------------------------------------------------
-- profiles
-- One row per auth user, created on first sign-in via trigger.
-- ----------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text not null unique,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: owner delete"
  on public.profiles for delete
  using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ----------------------------------------------------------------
-- playlists
-- ----------------------------------------------------------------
create table if not exists public.playlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  description text not null default '',
  cover_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.playlists enable row level security;

create policy "playlists: owner select"
  on public.playlists for select
  using (auth.uid() = user_id);

create policy "playlists: owner insert"
  on public.playlists for insert
  with check (auth.uid() = user_id);

create policy "playlists: owner update"
  on public.playlists for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "playlists: owner delete"
  on public.playlists for delete
  using (auth.uid() = user_id);


-- ----------------------------------------------------------------
-- playlist_tracks
-- Tracks are external (Jamendo / Audius / local upload).
-- source + external_id identify the track; position controls order.
-- ----------------------------------------------------------------
create table if not exists public.playlist_tracks (
  id          uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  source      text not null,                    -- 'jamendo' | 'audius' | 'upload'
  external_id text not null,
  position    integer not null default 0,
  added_at    timestamptz not null default now(),
  unique (playlist_id, source, external_id)
);

alter table public.playlist_tracks enable row level security;

create policy "playlist_tracks: owner select"
  on public.playlist_tracks for select
  using (auth.uid() = user_id);

create policy "playlist_tracks: owner insert"
  on public.playlist_tracks for insert
  with check (auth.uid() = user_id);

create policy "playlist_tracks: owner update"
  on public.playlist_tracks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "playlist_tracks: owner delete"
  on public.playlist_tracks for delete
  using (auth.uid() = user_id);


-- ----------------------------------------------------------------
-- favorites
-- ----------------------------------------------------------------
create table if not exists public.favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  source      text not null,
  external_id text not null,
  added_at    timestamptz not null default now(),
  unique (user_id, source, external_id)
);

alter table public.favorites enable row level security;

create policy "favorites: owner select"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites: owner insert"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites: owner delete"
  on public.favorites for delete
  using (auth.uid() = user_id);


-- ----------------------------------------------------------------
-- listening_history
-- Capped at 200 rows per user; trigger prunes oldest on overflow.
-- ----------------------------------------------------------------
create table if not exists public.listening_history (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  source       text not null,
  external_id  text not null,
  track_title  text,
  track_artist text,
  played_at    timestamptz not null default now()
);

alter table public.listening_history enable row level security;

create policy "listening_history: owner select"
  on public.listening_history for select
  using (auth.uid() = user_id);

create policy "listening_history: owner insert"
  on public.listening_history for insert
  with check (auth.uid() = user_id);

create policy "listening_history: owner delete"
  on public.listening_history for delete
  using (auth.uid() = user_id);

-- Prune rows beyond the 200-per-user cap after each insert.
create or replace function public.cap_listening_history()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.listening_history
  where id in (
    select id from public.listening_history
    where user_id = new.user_id
    order by played_at desc
    offset 200
  );
  return null;
end;
$$;

drop trigger if exists trg_cap_listening_history on public.listening_history;
create trigger trg_cap_listening_history
  after insert on public.listening_history
  for each row execute function public.cap_listening_history();


-- ----------------------------------------------------------------
-- uploads_metadata
-- Blob stored client-side in IndexedDB; this table holds the tags.
-- Hard quota: 100 uploads per user enforced by trigger.
-- ----------------------------------------------------------------
create table if not exists public.uploads_metadata (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  filename         text not null,
  title            text,
  artist           text,
  album            text,
  duration_seconds integer,
  file_size_bytes  bigint,
  mime_type        text,
  idb_key          text not null,               -- IndexedDB key where the blob lives
  uploaded_at      timestamptz not null default now()
);

alter table public.uploads_metadata enable row level security;

create policy "uploads_metadata: owner select"
  on public.uploads_metadata for select
  using (auth.uid() = user_id);

create policy "uploads_metadata: owner insert"
  on public.uploads_metadata for insert
  with check (auth.uid() = user_id);

create policy "uploads_metadata: owner update"
  on public.uploads_metadata for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "uploads_metadata: owner delete"
  on public.uploads_metadata for delete
  using (auth.uid() = user_id);

-- Enforce 100-upload quota per user before insert.
create or replace function public.enforce_upload_quota()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (
    select count(*) from public.uploads_metadata where user_id = new.user_id
  ) >= 100 then
    raise exception 'upload quota exceeded: maximum 100 uploads per user';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_upload_quota on public.uploads_metadata;
create trigger trg_enforce_upload_quota
  before insert on public.uploads_metadata
  for each row execute function public.enforce_upload_quota();
