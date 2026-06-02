import type { Track } from "../../data/mockData";
import type { BrowseArtist } from "./index";
import {
  getAnimeArtists,
  getAnimeArtistDetail,
  searchAnimeArtists,
} from "./animethemes";
import {
  getItunesArtistSongs,
  getTopArtists,
  searchItunesArtists,
} from "./itunes";

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

/**
 * Search artists across both sources. AnimeThemes artists (real images, catalog
 * relevant) come first, then iTunes artists derived from a song search.
 */
export async function searchArtists(query: string): Promise<BrowseArtist[]> {
  const [anime, itunes] = await Promise.all([
    searchAnimeArtists(query, 12).catch(() => [] as BrowseArtist[]),
    searchItunesArtists(query, 12).catch(() => [] as BrowseArtist[]),
  ]);
  return [...anime, ...itunes];
}

/**
 * Resolve a single artist and all of their playable tracks by id, for the
 * detail page. Works on a cold deep-link: the id carries everything needed —
 * the AnimeThemes slug, or the (encoded) iTunes artist name.
 */
export async function getArtistById(
  id: string,
): Promise<{ artist: BrowseArtist; tracks: Track[] } | null> {
  if (id.startsWith("animethemes:artist:")) {
    const slug = id.slice("animethemes:artist:".length);
    return getAnimeArtistDetail(slug);
  }
  if (id.startsWith("itunes:artist:")) {
    const name = decodeURIComponent(id.slice("itunes:artist:".length));
    const tracks = await getItunesArtistSongs(name);
    const artist: BrowseArtist = {
      id,
      name,
      imageUrl: tracks[0]?.coverUrl ?? "",
      source: "itunes",
      subtitle: "Artist",
    };
    return { artist, tracks };
  }
  return null;
}
