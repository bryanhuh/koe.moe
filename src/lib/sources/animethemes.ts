import type { Track } from "../../data/mockData";
import type { BrowseAlbum, Source } from "./index";

// AnimeThemes — community database of anime OP/ED themes. No key, CORS-enabled.
// Audio is the full-length theme as an Ogg file streamed directly from
// a.animethemes.moe (ranged GET works, no hotlink protection). Note: Ogg Vorbis
// plays on Chrome/Firefox/Android but is unreliable on older iOS Safari.
const BASE = "https://api.animethemes.moe";
const INCLUDE =
  "anime.images,song.artists,animethemeentries.videos.audio";

type Image = { facet?: string; link?: string };
type Artist = { name: string };
type Audio = { id: number; link?: string };
type Video = {
  link?: string;
  resolution?: number;
  nc?: boolean; // creditless (no episode credits overlaid)
  overlap?: string; // "None" | "Transition" | "Over"
  source?: string; // "BD" | "WEB" | "DVD" | ...
  audio?: Audio;
};
type Entry = { videos?: Video[] };
type AnimeTheme = {
  id: number;
  slug?: string; // e.g. "OP1", "ED2"
  song?: { title?: string; artists?: Artist[] };
  anime?: { name?: string; images?: Image[] };
  animethemeentries?: Entry[];
};

function pickCover(images: Image[] | undefined): string {
  if (!images?.length) return "";
  const large = images.find((i) => i.facet === "Large Cover");
  return (large ?? images[0]).link ?? "";
}

const SOURCE_RANK: Record<string, number> = { BD: 3, WEB: 2, DVD: 1 };

// Prefer the cleanest cut for a music-video experience: creditless, no overlap
// with episode dialogue, best master, highest resolution.
function scoreVideo(v: Video): number {
  let score = 0;
  if (v.overlap === "None") score += 8; // standalone theme, no dialogue over it
  if (v.nc) score += 4; // creditless
  score += SOURCE_RANK[v.source ?? ""] ?? 0;
  score += (v.resolution ?? 0) / 1000; // tie-break toward higher res
  return score;
}

// Pick the best video that also carries an audio track, so the .ogg audio and
// .webm MV come from the same encode and line up when synced.
function pickMedia(theme: AnimeTheme): { audioUrl: string; videoUrl: string } {
  const videos = (theme.animethemeentries ?? [])
    .flatMap((e) => e.videos ?? [])
    .filter((v) => v.audio?.link);
  if (!videos.length) return { audioUrl: "", videoUrl: "" };

  const best = videos.reduce((a, b) => (scoreVideo(b) > scoreVideo(a) ? b : a));
  return { audioUrl: best.audio?.link ?? "", videoUrl: best.link ?? "" };
}

function toTrack(theme: AnimeTheme): Track | null {
  const { audioUrl, videoUrl } = pickMedia(theme);
  const title = theme.song?.title;
  if (!audioUrl || !title) return null;

  const artists = theme.song?.artists ?? [];
  const anime = theme.anime?.name ?? "";
  const slug = theme.slug ? ` · ${theme.slug}` : "";

  return {
    id: `animethemes:${theme.id}`,
    title,
    artist: artists.map((a) => a.name).join(", ") || anime || "Unknown",
    artistId: "",
    album: `${anime}${slug}`.trim(),
    albumId: "",
    duration: 0, // not provided; player reads it from audio metadata
    coverUrl: pickCover(theme.anime?.images),
    audioUrl,
    videoUrl: videoUrl || undefined,
    source: "animethemes",
  };
}

async function fetchThemes(params: Record<string, string>): Promise<Track[]> {
  const url = new URL(`${BASE}/animetheme`);
  url.searchParams.set("include", INCLUDE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = (await res.json()) as { animethemes: AnimeTheme[] };
    return (data.animethemes ?? [])
      .map(toTrack)
      .filter((t): t is Track => t !== null);
  } catch {
    return [];
  }
}

// ── Albums (browse) ──────────────────────────────────────────────────────────
// AnimeThemes has no concept of an album, but an anime naturally groups its
// themes (OP1, ED1, …). So each anime becomes an album whose tracks are its
// themes. Unlike iTunes, the tracks come back inline with the anime, so the
// caller gets both the albums and a flat track list to register up-front.
const ALBUM_INCLUDE =
  "images,animethemes.song.artists,animethemes.animethemeentries.videos.audio";

type AnimeAlbumRaw = {
  id: number;
  name?: string;
  year?: number;
  season?: string;
  images?: Image[];
  animethemes?: AnimeTheme[];
};

function animeThemeToTrack(anime: AnimeAlbumRaw, theme: AnimeTheme): Track | null {
  const { audioUrl, videoUrl } = pickMedia(theme);
  const title = theme.song?.title;
  if (!audioUrl || !title) return null;

  const artists = theme.song?.artists ?? [];
  const name = anime.name ?? "";
  const slug = theme.slug ? ` · ${theme.slug}` : "";

  return {
    id: `animethemes:${theme.id}`,
    title,
    artist: artists.map((a) => a.name).join(", ") || name || "Unknown",
    artistId: "",
    album: `${name}${slug}`.trim(),
    albumId: `animethemes:anime:${anime.id}`,
    duration: 0,
    coverUrl: pickCover(anime.images),
    audioUrl,
    videoUrl: videoUrl || undefined,
    source: "animethemes",
  };
}

async function fetchAnimeAlbums(
  params: Record<string, string>,
): Promise<{ albums: BrowseAlbum[]; tracks: Track[] }> {
  const url = new URL(`${BASE}/anime`);
  url.searchParams.set("include", ALBUM_INCLUDE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return { albums: [], tracks: [] };
    const data = (await res.json()) as { anime: AnimeAlbumRaw[] };

    const albums: BrowseAlbum[] = [];
    const tracks: Track[] = [];
    for (const anime of data.anime ?? []) {
      const themeTracks = (anime.animethemes ?? [])
        .map((t) => animeThemeToTrack(anime, t))
        .filter((t): t is Track => t !== null);
      if (!themeTracks.length) continue;
      tracks.push(...themeTracks);
      albums.push({
        id: `animethemes:anime:${anime.id}`,
        title: anime.name ?? "Unknown",
        artist:
          anime.season && anime.year ? `${anime.season} ${anime.year}` : "Anime",
        coverUrl: pickCover(anime.images),
        year: anime.year,
        source: "animethemes",
        category: "Anime Openings & Endings",
        trackIds: themeTracks.map((t) => t.id),
      });
    }
    return { albums, tracks };
  } catch {
    return { albums: [], tracks: [] };
  }
}

// Browse: newest anime first — most recognisable for a cold start.
export function getAnimeAlbums(
  limit = 18,
): Promise<{ albums: BrowseAlbum[]; tracks: Track[] }> {
  return fetchAnimeAlbums({ sort: "-year", "page[size]": String(limit) });
}

// Search: anime matching a query, each returned as an album of its themes.
export function searchAnimeAlbums(
  query: string,
  limit = 12,
): Promise<{ albums: BrowseAlbum[]; tracks: Track[] }> {
  return fetchAnimeAlbums({ q: query, "page[size]": String(limit) });
}

export const animethemes: Source = {
  sourceId: "animethemes",

  search(query, limit = 20) {
    return fetchThemes({ q: query, "page[size]": String(limit) });
  },

  getFeatured(limit = 8) {
    // Surface a stable set of well-known themes as a stand-in for "featured".
    return fetchThemes({ q: "opening", "page[size]": String(limit) });
  },

  async getTrack(id) {
    const raw = id.startsWith("animethemes:")
      ? id.slice("animethemes:".length)
      : id;
    const url = new URL(`${BASE}/animetheme/${raw}`);
    url.searchParams.set("include", INCLUDE);
    try {
      const res = await fetch(url.toString());
      if (!res.ok) return null;
      const data = (await res.json()) as { animetheme: AnimeTheme };
      return data.animetheme ? toTrack(data.animetheme) : null;
    } catch {
      return null;
    }
  },
};
