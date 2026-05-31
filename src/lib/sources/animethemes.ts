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
type Video = { audio?: Audio };
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

function pickAudio(theme: AnimeTheme): string {
  for (const entry of theme.animethemeentries ?? []) {
    for (const video of entry.videos ?? []) {
      if (video.audio?.link) return video.audio.link;
    }
  }
  return "";
}

function toTrack(theme: AnimeTheme): Track | null {
  const audioUrl = pickAudio(theme);
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
