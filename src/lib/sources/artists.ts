import type { BrowseArtist } from "./index";
import { getAnimeArtists } from "./animethemes";
import { getTopArtists } from "./itunes";

export const ANIME_ARTISTS_PER_PAGE = 24;

/**
 * iTunes "popular" artists, derived from the top-albums chart. This is a fixed
 * curated set (no pagination) — it loads once.
 */
export function getPopularArtists(): Promise<BrowseArtist[]> {
  return getTopArtists(18).catch(() => [] as BrowseArtist[]);
}

/**
 * One page of AnimeThemes artists. There's no popularity ranking, so the list
 * is browsed by page; `hasNext` drives the pager (the API reports no total).
 */
export function getAnimeArtistsPage(
  page = 1,
): Promise<{ artists: BrowseArtist[]; hasNext: boolean }> {
  return getAnimeArtists(page, ANIME_ARTISTS_PER_PAGE).catch(() => ({
    artists: [] as BrowseArtist[],
    hasNext: false,
  }));
}
