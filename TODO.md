# koe — TODO

Roadmap derived from the 2026-05-23 scoping interview. Each unchecked item is sized to land as one Conventional Commit. Suggested `type(scope):` prefix in parens.

---

## v1 — Lean launch scope

Goal: ship a public PWA that lets a stranger browse free streaming catalogs, sign up to favorite tracks, and build playlists.

### Cleanup / debt

- [x] Remove the crossfade toggle from Settings — audio engine is plain `HTMLAudioElement`, the toggle is decorative dead code _(`chore(settings):`)_
- [x] Replace the Google sample audio URLs in `src/data/mockData.ts` with a placeholder note that real sources land in the streaming-API milestone _(`chore(data):`)_

### Foundation

- [x] Create Supabase project (free tier), commit `.env.example` with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` _(`chore(env):`)_
- [x] Install `@supabase/supabase-js`, add `src/lib/supabase.ts` client singleton _(`feat(supabase):`)_
- [x] Schema migration: `profiles`, `playlists`, `playlist_tracks`, `favorites`, `listening_history`, `uploads_metadata` with RLS policies + per-user quotas _(`feat(db):`)_
- [x] Username regex constraint `^[a-z0-9_]{3,20}$` + reserved-name list (`admin`, `support`, `koe`, `api`, etc.) _(`feat(db):`)_

### Auth & migration

- [x] Supabase Auth wiring: magic-link signup + email verify _(`feat(auth):`)_
- [x] Resend account + Edge Function for transactional email (verify, reset) _(`feat(email):`)_
- [x] Signup wall modal triggered by favorite/playlist actions when logged out _(`feat(auth):`)_
- [x] Anon → signed-up state migration: localStorage favorites/history/settings sync to Supabase on first login _(`feat(auth):`)_

### Catalog

- [x] Streaming-source abstraction: `src/lib/sources/{jamendo,audius}.ts` exposing a common `Source` interface (`search`, `getTrack`, `getStreamUrl`) _(`feat(catalog):`)_
- [x] Wire Jamendo as first source, replace Home mock data with real results _(`feat(catalog):`)_
- [x] Add Audius as second source _(`feat(catalog):`)_
- [x] Cross-source unified search with simple weighted relevance scorer _(`feat(search):`)_
- [x] Debounced instant search input (~250ms) _(`feat(search):`)_
- [x] Source badge on every track row/card (small icon + label) _(`feat(catalog):`)_

### Local uploads

- [x] Drag-and-drop upload zone in Library, store blobs in IndexedDB (use `idb` lib) _(`feat(uploads):`)_
- [x] Parse tag metadata client-side with `music-metadata-browser`, persist to `uploads_metadata` table _(`feat(uploads):`)_

### Player

- [x] Slide-up Now Playing view (tap bottom bar to expand) _(`feat(player):`)_
- [x] Media Session API integration (lock-screen art + controls + headphone buttons) _(`feat(player):`)_
- [x] Listening-history insert on track completion, capped at last 200 per user _(`feat(history):`)_

### Home / discovery

- [ ] `src/data/curated.ts` for editorial rows; render on Home for anon + signed-in _(`feat(home):`)_

### Mobile

- [ ] Responsive: sidebar collapses to bottom nav at `<md` breakpoint _(`feat(mobile):`)_

### PWA

- [ ] Real icon set + maskable variants via realfavicongenerator.net _(`feat(pwa):`)_
- [ ] Fill out `manifest.json` (name, short_name, theme_color, display: standalone) _(`feat(pwa):`)_

### Legal / settings

- [ ] `/privacy` and `/terms` static pages (plain-English drafts) _(`docs(legal):`)_
- [ ] Settings → "Export my data" button: emits JSON of user's rows _(`feat(settings):`)_
- [ ] Settings → "Delete my account" button: cascade-deletes user rows + auth user _(`feat(settings):`)_

### Tests

- [ ] Install Playwright, add `tests/critical.spec.ts`: signup → search → play → favorite → create playlist _(`test(e2e):`)_
- [ ] GitHub Actions workflow runs E2E on PR _(`ci(e2e):`)_

### Deploy

- [ ] Connect repo to Vercel, set production env vars _(`chore(deploy):`)_
- [ ] Smoke test the deployed PWA on a real iPhone (background audio, install flow) _(manual)_

---

## Post-v1 backlog

These came up in scoping but were intentionally cut from v1.

- [ ] LRCLIB synced lyrics tab inside Now Playing
- [ ] Cloudflare Turnstile on signup (before public launch beyond friends)
- [ ] Sentry free tier wiring (before public launch beyond friends)
- [ ] Public profiles at `/u/:username` (avatar, public playlists)
- [ ] Profanity blocklist on usernames + playlist titles
- [ ] Report button → Supabase table → email-to-self moderation queue
- [ ] Shareable playlist URLs with OG image generation
- [ ] Embed widget (iframe-able mini player)
- [ ] Viewable queue with drag-reorder + "play next" / "add to queue"
- [ ] MusicBrainz + Cover Art Archive metadata enrichment for uploads
- [ ] ListenBrainz scrobbling integration

---

## Risks to watch

- **Vercel bandwidth cap (100GB/mo)** — stream audio URLs directly from `<audio src>`, never proxy through your domain
- **Supabase free tier (500MB DB)** — enforce per-user row quotas via RLS *before* users exist, not after
- **iOS background audio** — Media Session API alone isn't enough; test on real iPhone before launch
- **Cross-source relevance** — keep the scorer dumb in v1 (`title_prefix * 2 + normalized_source_popularity`)
- **Cookie consent** — skipped for v1; revisit before any EU-targeted promotion
