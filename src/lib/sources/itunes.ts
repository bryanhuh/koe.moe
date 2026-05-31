import type { Track } from "../../data/mockData";
import type { Source } from "./index";

// iTunes Search API — the general/mainstream catalog. No key, CORS-enabled.
// Playback is the official 30-second `.m4a` (AAC) preview, which plays on every
// browser including iOS Safari. Full-length playback is not available.
const BASE = "https://itunes.apple.com";
const PREVIEW_SECONDS = 30;

type ItunesResult = {
  trackId: number;
  trackName: string;
  artistName: string;
  artistId: number;
  collectionName?: string;
  collectionId?: number;
  artworkUrl100?: string;
  previewUrl?: string;
};

function upscaleArt(url: string | undefined): string {
  // Apple serves 100x100 by default; swap for a crisp 600x600.
  return url ? url.replace(/\/\d+x\d+bb\./, "/600x600bb.") : "";
}

function toTrack(r: ItunesResult): Track {
  return {
    id: `itunes:${r.trackId}`,
    title: r.trackName,
    artist: r.artistName,
    artistId: `itunes:artist:${r.artistId}`,
    album: r.collectionName ?? "",
    albumId: r.collectionId ? `itunes:album:${r.collectionId}` : "",
    duration: PREVIEW_SECONDS,
    coverUrl: upscaleArt(r.artworkUrl100),
    audioUrl: r.previewUrl ?? "",
    source: "itunes",
    preview: true,
  };
}

async function fetchResults(params: Record<string, string>): Promise<Track[]> {
  const url = new URL(`${BASE}/search`);
  url.searchParams.set("media", "music");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = (await res.json()) as { results: ItunesResult[] };
    // Only tracks with a playable preview are useful to us.
    return (data.results ?? []).filter((r) => r.previewUrl).map(toTrack);
  } catch {
    return [];
  }
}

export const itunes: Source = {
  sourceId: "itunes",

  search(query, limit = 20) {
    return fetchResults({ term: query, limit: String(limit) });
  },

  // iTunes has no "featured" feed; Home rows don't use this source.
  async getFeatured() {
    return [];
  },

  async getTrack(id) {
    const raw = id.startsWith("itunes:") ? id.slice("itunes:".length) : id;
    const url = new URL(`${BASE}/lookup`);
    url.searchParams.set("id", raw);
    try {
      const res = await fetch(url.toString());
      if (!res.ok) return null;
      const data = (await res.json()) as { results: ItunesResult[] };
      const hit = (data.results ?? []).find((r) => r.previewUrl);
      return hit ? toTrack(hit) : null;
    } catch {
      return null;
    }
  },
};
