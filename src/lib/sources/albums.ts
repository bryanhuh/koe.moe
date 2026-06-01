import type { Track } from "../../data/mockData";
import type { BrowseAlbum } from "./index";
import { getAnimeAlbums } from "./animethemes";
import { getAlbumTracks } from "./itunes";

export type AlbumSection = {
  id: string;
  title: string;
  albums: BrowseAlbum[];
};

/**
 * Pull browsable albums and bucket them into categorised sections. Currently
 * sourced from AnimeThemes (each anime as an album of its OP/ED themes); the
 * tracks come back inline and are returned in `tracks` so the page can register
 * them up-front.
 */
export async function getAlbumSections(): Promise<{
  sections: AlbumSection[];
  tracks: Track[];
}> {
  const { albums, tracks } = await getAnimeAlbums(24);

  const sections: AlbumSection[] = albums.length
    ? [{ id: "anime", title: "Anime Openings & Endings", albums }]
    : [];

  return { sections, tracks };
}

/**
 * Get the playable tracks for an album. AnimeThemes albums already carry their
 * track ids (registered up-front), so only iTunes needs a network round-trip.
 */
export async function resolveAlbumTracks(album: BrowseAlbum): Promise<Track[]> {
  if (album.source === "itunes") return getAlbumTracks(album.id);
  return [];
}
