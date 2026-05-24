import type { Track } from "../../data/mockData";
import type { Source } from "./index";

const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID as string | undefined;
const BASE = "https://api.jamendo.com/v3.0";

type JamendoTrack = {
  id: string;
  name: string;
  duration: number;
  artist_id: string;
  artist_name: string;
  album_id: string;
  album_name: string;
  image: string;
  audio: string;
};

function toTrack(j: JamendoTrack): Track {
  return {
    id: `jamendo:${j.id}`,
    title: j.name,
    artist: j.artist_name,
    artistId: `jamendo:artist:${j.artist_id}`,
    album: j.album_name,
    albumId: `jamendo:album:${j.album_id}`,
    duration: j.duration,
    coverUrl: j.image,
    audioUrl: j.audio,
    source: "jamendo",
  };
}

async function fetchTracks(params: Record<string, string>): Promise<Track[]> {
  if (!CLIENT_ID) return [];
  const url = new URL(`${BASE}/tracks/`);
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("format", "json");
  url.searchParams.set("audioformat", "mp32");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = (await res.json()) as { results: JamendoTrack[] };
    return (data.results ?? []).map(toTrack);
  } catch {
    return [];
  }
}

export const jamendo: Source = {
  sourceId: "jamendo",

  search(query, limit = 20) {
    return fetchTracks({ search: query, limit: String(limit) });
  },

  getFeatured(limit = 8) {
    return fetchTracks({ order: "popularity_week", limit: String(limit) });
  },

  async getTrack(id) {
    const raw = id.startsWith("jamendo:") ? id.slice("jamendo:".length) : id;
    const results = await fetchTracks({ id: raw, limit: "1" });
    return results[0] ?? null;
  },
};
