import type { Track } from "../../data/mockData";
import type { BrowseArtist, SourceId } from "./index";
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
  // An artist can surface from both sources (e.g. LiSA). Collapse to one card
  // per exact name — preferring the AnimeThemes entry (real photo) — since the
  // artist page merges those sources anyway. The match is case-sensitive so two
  // distinct artists that differ only in casing ("LiSA" vs "LISA") both show.
  const seen = new Set<string>();
  const out: BrowseArtist[] = [];
  for (const a of [...anime, ...itunes]) {
    const key = a.name.trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
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

// One source's worth of an artist's tracks.
export type ArtistSourceTracks = { source: SourceId; tracks: Track[] };

// A unified artist view spanning every source that has their songs. `primary`
// is the source the user came from (the default tab); `sources` only includes
// sources that actually returned tracks — so the UI offers a choice only when
// there's more than one.
export type ArtistProfile = {
  name: string;
  imageUrl: string;
  primary: SourceId;
  sources: ArtistSourceTracks[];
};

// AnimeThemes themes for an artist, matched by exact (case-sensitive) name.
// The casing is load-bearing: the Japanese singer is "LiSA" and the K-pop
// artist is "LISA" — matching loosely would merge two distinct artists.
async function animeTracksByName(
  name: string,
): Promise<{ tracks: Track[]; imageUrl: string }> {
  const found = await searchAnimeArtists(name, 10).catch(() => [] as BrowseArtist[]);
  const match = found.find((a) => a.name.trim() === name.trim());
  if (!match) return { tracks: [], imageUrl: "" };
  const slug = match.id.slice("animethemes:artist:".length);
  const detail = await getAnimeArtistDetail(slug);
  return {
    tracks: detail?.tracks ?? [],
    imageUrl: detail?.artist.imageUrl ?? match.imageUrl,
  };
}

// iTunes songs for an artist, kept only when the track's artist matches exactly.
// iTunes' artistTerm search is fuzzy and pulls in collaborators and namesakes;
// the match is case-sensitive on purpose so distinct artists that differ only
// in casing stay separate (anime "LiSA" vs. BLACKPINK "LISA").
async function itunesTracksByName(name: string): Promise<Track[]> {
  const tracks = await getItunesArtistSongs(name).catch(() => [] as Track[]);
  return tracks.filter((t) => t.artist.trim() === name.trim());
}

/**
 * Resolve an artist across every source that has their songs. The id's source
 * is the primary (default tab); the other source is cross-resolved by exact
 * name. Returns null if no source yields any playable track.
 */
export async function getArtistProfile(id: string): Promise<ArtistProfile | null> {
  let name = "";
  let imageUrl = "";
  let animeTracks: Track[] = [];
  let primary: SourceId;

  if (id.startsWith("animethemes:artist:")) {
    primary = "animethemes";
    const slug = id.slice("animethemes:artist:".length);
    const detail = await getAnimeArtistDetail(slug);
    if (!detail) return null;
    name = detail.artist.name;
    imageUrl = detail.artist.imageUrl;
    animeTracks = detail.tracks;
  } else if (id.startsWith("itunes:artist:")) {
    primary = "itunes";
    name = decodeURIComponent(id.slice("itunes:artist:".length));
  } else {
    return null;
  }
  if (!name) return null;

  // Fill in whichever source we don't already have, by exact name.
  const [itunesTracks, anime] = await Promise.all([
    itunesTracksByName(name),
    animeTracks.length
      ? Promise.resolve({ tracks: animeTracks, imageUrl })
      : animeTracksByName(name),
  ]);
  animeTracks = anime.tracks;
  if (!imageUrl) imageUrl = anime.imageUrl;

  // Stable tab order (AnimeThemes, then iTunes); only sources with tracks.
  const sources: ArtistSourceTracks[] = [];
  if (animeTracks.length)
    sources.push({ source: "animethemes", tracks: animeTracks });
  if (itunesTracks.length) sources.push({ source: "itunes", tracks: itunesTracks });
  if (!sources.length) return null;

  if (!imageUrl)
    imageUrl = animeTracks[0]?.coverUrl ?? itunesTracks[0]?.coverUrl ?? "";

  return { name, imageUrl, primary, sources };
}
