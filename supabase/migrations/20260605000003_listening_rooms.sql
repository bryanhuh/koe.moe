-- ============================================================
-- koe — listening rooms (synced playback parties)
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ----------------------------------------------------------------
-- listening_rooms
-- One row per active party. The host owns the row; participants
-- read it to seed playback when joining and to detect a stale host
-- for promotion. Live playback sync rides Realtime Broadcast/Presence
-- on the `room:<code>` channel, not this table.
-- ----------------------------------------------------------------
create table if not exists public.listening_rooms (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  host_id       uuid not null references auth.users (id) on delete cascade,
  track_id      text,
  track_payload jsonb,
  position_ms   integer not null default 0,
  is_playing    boolean not null default false,
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

alter table public.listening_rooms enable row level security;

-- Any signed-in user may read a room so they can join by code.
create policy "rooms: authed select"
  on public.listening_rooms for select
  using (auth.role() = 'authenticated');

-- Only the host may create / update / delete their own room.
create policy "rooms: host insert"
  on public.listening_rooms for insert
  with check (auth.uid() = host_id);

create policy "rooms: host update"
  on public.listening_rooms for update
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "rooms: host delete"
  on public.listening_rooms for delete
  using (auth.uid() = host_id);

-- ----------------------------------------------------------------
-- claim_host(code)
-- Promote the caller to host of a room, but ONLY when the current
-- host has gone stale (no heartbeat for >12s). This is the server-
-- side election guard: an active host's heartbeat keeps updated_at
-- fresh, so a participant can never hijack a live room. The first
-- claimer refreshes updated_at, so concurrent claimers see a
-- non-stale row and get nothing back.
-- ----------------------------------------------------------------
create or replace function public.claim_host(p_code text)
returns public.listening_rooms
language plpgsql security definer set search_path = public as $$
declare
  result public.listening_rooms;
begin
  update public.listening_rooms
    set host_id = auth.uid(), updated_at = now()
    where code = p_code
      and updated_at < now() - interval '12 seconds'
    returning * into result;
  return result;
end;
$$;
