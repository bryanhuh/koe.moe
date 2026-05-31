import type { Track } from "../../data/mockData";
import type { Source } from "./index";

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
