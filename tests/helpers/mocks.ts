import type { Page } from "@playwright/test";

// Storage key supabase-js derives from VITE_SUPABASE_URL in .env.test:
//   sb-${hostname.split(".")[0]}-auth-token  →  sb-e2etest-auth-token
const SUPABASE_STORAGE_KEY = "sb-e2etest-auth-token";

export const FAKE_USER = {
  id: "00000000-0000-0000-0000-000000000000",
  aud: "authenticated",
  role: "authenticated",
  email: "e2e@koe.test",
  app_metadata: { provider: "email" },
  user_metadata: {},
  created_at: "2026-01-01T00:00:00.000Z",
};

/** One canned Jamendo track the search mock returns. */
export const MOCK_TRACK = {
  id: "999",
  name: "Midnight Circuit",
  duration: 180,
  artist_id: "42",
  artist_name: "Neon Foxes",
  album_id: "7",
  album_name: "Voltage",
  image: "https://example.test/cover.jpg",
  audio: "https://example.test/audio.mp3",
};

/**
 * Intercept every external catalog call so search is hermetic:
 *   - Jamendo /tracks/ → one canned result
 *   - Audius host discovery + search → empty (Jamendo supplies the track)
 */
export async function mockSources(page: Page): Promise<void> {
  await page.route(/api\.jamendo\.com\/.*\/tracks\//, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        headers: { status: "success", results_count: 1 },
        results: [MOCK_TRACK],
      }),
    }),
  );

  // Audius host discovery (root) → point back at itself so the search URL is
  // also caught by the route below.
  await page.route("https://api.audius.co/", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: ["https://api.audius.co"] }),
    }),
  );
  await page.route("https://api.audius.co", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: ["https://api.audius.co"] }),
    }),
  );
  await page.route(/\/v1\/tracks\/search/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [] }),
    }),
  );

  // iTunes Search → empty (Jamendo supplies the asserted track).
  await page.route(/itunes\.apple\.com\//, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ resultCount: 0, results: [] }),
    }),
  );

  // AnimeThemes → empty.
  await page.route(/api\.animethemes\.moe\//, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ animethemes: [] }),
    }),
  );
}

/** Stop any Supabase auth/REST traffic from hitting the network in tests. */
export async function mockSupabase(page: Page): Promise<void> {
  await page.route(/\/auth\/v1\/user/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(FAKE_USER),
    }),
  );
  await page.route(/\/auth\/v1\/token/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "e2e-access",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "e2e-refresh",
        user: FAKE_USER,
      }),
    }),
  );
  // REST writes (favorites/history) — accept and return empty.
  await page.route(/\/rest\/v1\//, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
}

/**
 * Mock the magic-link OTP request so the signup form can be exercised without
 * sending real email.
 */
export async function mockOtp(page: Page): Promise<void> {
  await page.route(/\/auth\/v1\/otp/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: {}, error: null }),
    }),
  );
}

/**
 * Seed a signed-in Supabase session into localStorage before the app boots, so
 * `requireAuth`-gated actions (favorite, create playlist) proceed. Real
 * magic-link auth can't run in CI, so we inject a far-future session directly.
 */
export async function seedSession(page: Page): Promise<void> {
  const session = {
    access_token: "e2e-access",
    refresh_token: "e2e-refresh",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    user: FAKE_USER,
  };
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key, value);
    },
    [SUPABASE_STORAGE_KEY, JSON.stringify(session)] as const,
  );
}
