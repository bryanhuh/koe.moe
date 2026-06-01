import type { Track } from "../../data/mockData";
import type { BrowseAlbum } from "./index";
import { getAnimeAlbums } from "./animethemes";
import { getAlbumTracks, getTopAlbums } from "./itunes";

export type AlbumSection = {
  id: string;
  title: string;
  albums: BrowseAlbum[];
};

/**
 * Pull albums from every source and bucket them into categorised sections:
 * the AnimeThemes "anime as album" set first (koe's identity), then iTunes top
 * albums grouped by genre, largest genres first. One source failing never
 * blocks the other. AnimeThemes tracks come back inline and are returned in
 * `tracks` so the page can register them up-front (iTunes tracks are resolved
 * lazily on play via `resolveAlbumTracks`).
 */
export async function getAlbumSections(): Promise<{
  sections: AlbumSection[];
  tracks: Track[];
}> {
  const [animeRes, itunesRes] = await Promise.allSettled([
    getAnimeAlbums(18),
    getTopAlbums(100),
  ]);

  const anime =
    animeRes.status === "fulfilled" ? animeRes.value : { albums: [], tracks: [] };
  const itunesAlbums = itunesRes.status === "fulfilled" ? itunesRes.value : [];

  const sections: AlbumSection[] = [];

  if (anime.albums.length) {
    sections.push({
      id: "anime",
      title: "Anime Openings & Endings",
      albums: anime.albums,
    });
  }

  const byGenre = new Map<string, BrowseAlbum[]>();
  for (const album of itunesAlbums) {
    const list = byGenre.get(album.category) ?? [];
    list.push(album);
    byGenre.set(album.category, list);
  }

  for (const [genre, albums] of [...byGenre.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  )) {
    sections.push({ id: `itunes:${genre}`, title: genre, albums });
  }

  return { sections, tracks: anime.tracks };
}

/**
 * Get the playable tracks for an album. AnimeThemes albums already carry their
 * track ids (registered up-front), so only iTunes needs a network round-trip.
 */
export async function resolveAlbumTracks(album: BrowseAlbum): Promise<Track[]> {
  if (album.source === "itunes") return getAlbumTracks(album.id);
  return [];
}
