# Listening Rooms (synced playback parties)

One person **hosts**; everyone in the room hears the same track at the same
position, play/pause and all. Built entirely on **Supabase Realtime** (Presence
+ Broadcast) — no extra infrastructure, and audio streams directly from each
source so it never touches the Vercel bandwidth budget.

---

## 1. Prerequisites (one-time)

| Step | Status | Notes |
|------|--------|-------|
| Run `supabase/migrations/20260605000003_listening_rooms.sql` in the Supabase **SQL Editor** | ✅ done | Creates the `listening_rooms` table, RLS policies, and the `claim_host` RPC. |
| Realtime enabled | ✅ automatic | Broadcast + Presence work out of the box. We do **not** use Postgres Changes, so no publication change is needed. |
| Realtime client config | ✅ in code | `src/lib/supabase.ts` sets `realtime.params.eventsPerSecond`. |

> ⚠️ Do **not** run `supabase db push`. This project's migrations are applied by
> hand in the SQL Editor, so the CLI migration history is out of sync — a push
> would try to re-run the earlier migrations and error. Always paste new
> migrations into the SQL Editor.

Nothing else is required. Auth already exists; rooms reuse it (login required).

---

## 2. How to use it

### Host a party
1. Play any track.
2. Click the **📻 (radio) icon** in the player bar — or **Start party** in the
   expanded Now Playing view.
3. A modal shows your **party code** and a **`/room/<code>` link**. Share it.

### Join a party
- Open the shared link (`/room/<code>`), **or** navigate to `/room/<code>`.
- You must be signed in (you'll be prompted if not).
- Your player immediately mirrors the host. Your transport controls are
  read-only while following — only the host drives playback.

### Leave / end
- **Participant:** the **Leave** button (room page or the banner above the player).
- **Host:** **End** closes the party for everyone.
- Navigating to other pages keeps you in the party — the **RoomBanner** stays
  pinned above the player from anywhere in the app.

---

## 3. Testing locally

You need **two signed-in identities**. Because the email hook currently only
delivers magic links to `bryandiolata00@gmail.com` (Resend sandbox — see
`docs`/`send-email` setup), create a second user another way:

- **Easiest:** Supabase Dashboard → Authentication → Users → *Add user* (set a
  confirmed email), then sign in with it, **or** reuse the e2e seeded-session
  approach to inject a second session.
- Open the two sessions in a **normal window + an incognito/second-profile
  window** (separate storage so the sessions don't collide).

Then check:
- Host plays → participant mirrors the track and lands at the right position.
- Host pause / seek / skip reflects on the participant within **≤ 2.5 s**.
- A queue of 30 s iTunes previews auto-advances on **both** clients together.
- Close the host's tab → after **~12 s** the earliest-joined listener is
  promoted to host and playback continues.
- Participant's transport controls are dimmed and unclickable.

> Same account in two tabs validates the sync mechanics but collapses to a
> single Presence entry, so host-promotion can't be exercised that way — use two
> distinct accounts for that.

---

## 4. How it works (architecture)

One Realtime channel per room: **`room:<code>`**, carrying both Presence and
Broadcast.

```
        Host player (source of truth)
              │ broadcast "sync" {track, positionMs, isPlaying, sentAt}
              │   • on every play/pause/track-change
              │   • + heartbeat every 2.5s
              ▼
   room:<code> channel ──────────────► Participants
        ▲   │                           player.syncTo(track, target, isPlaying)
        │   │ Presence {userId, username, avatarUrl, isHost, joinedAt}
        │   ▼
   listening_rooms row (durable)
     • host writes a 10s heartbeat (position/playing/updated_at)
     • seeds late joiners
     • staleness (>12s) lets a participant claim host
```

- **Presence** → live listener list + host-departure detection + promotion
  order (smallest `joinedAt` wins).
- **Broadcast events:** `sync` (host → all), `request_sync` (new joiner → host,
  for instant seeding), `ended` (host explicitly ends the party).
- **Drift correction:** participant computes
  `target = positionMs + (isPlaying ? now - sentAt : 0)` and only seeks if it's
  off by **> 1.5 s**, so heartbeats don't cause stutter.
- **Host promotion:** if no present member is flagged host, the earliest joiner
  calls the `claim_host(code)` RPC. It promotes the caller **only if the room's
  `updated_at` is older than 12 s** (host stopped heartbeating). This is the
  server-side guard against hijacking an active host; it's idempotent, so
  concurrent claimers can't both win.

### Key files
| File | Role |
|------|------|
| `supabase/migrations/20260605000003_listening_rooms.sql` | Table, RLS, `claim_host` RPC |
| `src/context/RoomContext.tsx` | All realtime logic: presence, broadcast, heartbeats, election, `startParty`/`joinRoom`/`leaveRoom` |
| `src/context/PlayerContext.tsx` | `syncTo(track, positionMs, isPlaying)` — the follower entry point |
| `src/pages/Room.tsx` | `/room/:code` lobby (join, listener list, leave) |
| `src/components/StartPartyButton.tsx` | Entry points in the player |
| `src/components/ShareRoomModal.tsx` | Code + link share sheet |
| `src/components/RoomBanner.tsx` | Persistent in-party bar above the player |
| `src/lib/supabase.ts` | Realtime client config |

---

## 5. Known limitations (v1, by design)

- **Local uploads** can't be heard by other listeners (the blob URL is
  device-local). Participants see a "host is playing a local file you can't
  hear" notice and stay position-synced; audio resumes on the next shared track.
- **Same account, two tabs** collapses to one Presence entry — fine for real
  multi-user, but can't test promotion.
- A participant's own **Logs/listening history** fills with the host's tracks
  while following.
- **Clock skew** between devices is ignored (corrected only on > 1.5 s drift).

---

## 6. Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| "Party not found" on join | Migration not applied, or the host already ended the party. |
| Join page hangs / nothing syncs | Not signed in, or Realtime blocked by a network/extension. Check the browser console for channel errors. |
| Participant audio silent but UI synced | Host is playing a **local upload** (expected — see limitations). |
| Host promotion never happens | Closing a tab takes ~12 s to go stale; same-account testing can't promote (use two accounts). |

---

## 7. Possible follow-ups

- Emoji reactions (a `reaction` broadcast event on the same channel).
- "Anyone can control" / DJ handoff mode.
- A queue/jukebox where participants add tracks.
- Persist a participants table for richer history/analytics.
