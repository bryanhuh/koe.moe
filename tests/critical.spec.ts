import { test, expect } from "@playwright/test";
import {
  mockSources,
  mockSupabase,
  mockOtp,
  seedSession,
  MOCK_TRACK,
} from "./helpers/mocks";

// The v1 critical path: signup → search → play → favorite → create playlist.
// Real magic-link email can't complete in CI, so the signup *form* is verified
// on its own (mocked OTP), and the authenticated library path runs with a
// seeded session.

test.describe("critical path", () => {
  test("signup form sends a magic link", async ({ page }) => {
    await mockSupabase(page);
    await mockOtp(page);

    await page.goto("/auth");
    await page.getByPlaceholder("you@example.com").fill("new-user@koe.test");
    await page.getByRole("button", { name: "Send magic link" }).click();

    await expect(page.getByText("Check your inbox.")).toBeVisible();
    await expect(page.getByText("new-user@koe.test")).toBeVisible();
  });

  test("search → play → favorite → create playlist", async ({ page }) => {
    await mockSources(page);
    await mockSupabase(page);
    await seedSession(page);

    // ── Search ──────────────────────────────────────────────────────────────
    await page.goto("/search");
    await page.getByPlaceholder(/Search songs/).fill("midnight");

    const trackRow = page.getByText(MOCK_TRACK.name).first();
    await expect(trackRow).toBeVisible();

    // ── Play ────────────────────────────────────────────────────────────────
    await trackRow.click();
    // The bottom player bar should now show the playing track's title.
    const playerBar = page.locator("div").filter({ hasText: "No track playing" });
    await expect(playerBar).toHaveCount(0);
    await expect(
      page.getByText(MOCK_TRACK.name, { exact: true }).last(),
    ).toBeVisible();

    // ── Favorite ────────────────────────────────────────────────────────────
    // Seeded session means the favorite action proceeds (no signup wall). The
    // player bar's favorite button is the last "Toggle favorite" in the DOM
    // (the Now Playing view renders one earlier). A successful favorite flips
    // the heart to the accent colour.
    const favBtn = page.getByLabel("Toggle favorite").last();
    await favBtn.click();
    await expect(page.getByText("Sign in to keep your music")).toHaveCount(0);
    await expect(favBtn).toHaveClass(/accent-text/);

    // ── Create playlist ───────────────────────────────────────────────────────
    await page.goto("/playlists");
    const countBefore = await page
      .locator("text=/^\\d+ playlists$/")
      .textContent();

    await page.getByPlaceholder("Name").fill("E2E Mix");
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page.getByText("E2E Mix")).toBeVisible();
    // Signup wall must not have appeared.
    await expect(page.getByText("Sign in to keep your music")).toHaveCount(0);
    const countAfter = await page
      .locator("text=/^\\d+ playlists$/")
      .textContent();
    expect(countAfter).not.toEqual(countBefore);
  });
});
