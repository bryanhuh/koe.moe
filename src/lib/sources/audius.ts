import type { Track } from "../../data/mockData";
import type { Source } from "./index";

const APP_NAME = "koe";
let cachedHost: string | null = null;

async function getHost(): Promise<string> {
  if (cachedHost) return cachedHost;
  try {
    const res = await fetch("https://api.audius.co");
    const data = (await res.json()) as { data: string[] };
    cachedHost = data.data[0] ?? "https://discoveryprovider.audius.co";
  } catch {
    cachedHost = "https://discoveryprovider.audius.co";
  }
  return cachedHost;
}

type AudiusTrack = {
  id: string;
  title: string;
  duration: number;
  user: { id: string; name: string };
  artwork: { "480x480"?: string } | null;
};

function toTrack(host: string, a: AudiusTrack): Track {
  return {
    id: `audius:${a.id}`,
    title: a.title,
    artist: a.user.name,
    artistId: `audius:user:${a.user.id}`,
    album: "",
    albumId: "",
    duration: a.duration,
    coverUrl: a.artwork?.["480x480"] ?? "",
    audioUrl: `${host}/v1/tracks/${a.id}/stream?app_name=${APP_NAME}`,
    source: "audius",
  };
}

export const audius: Source = {
  sourceId: "audius",

  async search(query, limit = 20) {
    try {
      const host = await getHost();
      const url = new URL(`${host}/v1/tracks/search`);
      url.searchParams.set("query", query);
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("app_name", APP_NAME);
      const res = await fetch(url.toString());
      if (!res.ok) return [];
      const data = (await res.json()) as { data: AudiusTrack[] };
      return (data.data ?? []).map((t) => toTrack(host, t));
    } catch {
      return [];
    }
  },

  async getFeatured(limit = 8) {
    try {
      const host = await getHost();
      const url = new URL(`${host}/v1/tracks/trending`);
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("app_name", APP_NAME);
      const res = await fetch(url.toString());
      if (!res.ok) return [];
      const data = (await res.json()) as { data: AudiusTrack[] };
      return (data.data ?? []).map((t) => toTrack(host, t));
    } catch {
      return [];
    }
  },

  async getTrack(id) {
    try {
      const host = await getHost();
      const raw = id.startsWith("audius:") ? id.slice("audius:".length) : id;
      const url = new URL(`${host}/v1/tracks/${raw}`);
      url.searchParams.set("app_name", APP_NAME);
      const res = await fetch(url.toString());
      if (!res.ok) return null;
      const data = (await res.json()) as { data: AudiusTrack };
      return toTrack(host, data.data);
    } catch {
      return null;
    }
  },
};
