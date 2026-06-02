import type { Track } from "../../data/mockData";
import type { BrowseAlbum } from "./index";
import { getAnimeAlbums, searchAnimeAlbums } from "./animethemes";
import { getAlbumTracks } from "./itunes";

export type AlbumSection = {
  id: string;
  title: string;
  albums: BrowseAlbum[];
};

// Session caches so the album detail page can resolve an album (and its tracks)
// by id without refetching — and so a deep-link/refresh to /albums/:id still
// works by lazily populating them on first access.
const albumIndex = new Map<string, BrowseAlbum>();
const trackIndex = new Map<string, Track>();
let loadPromise: Promise<{ sections: AlbumSection[]; tracks: Track[] }> | null = null;

// Keep an album (and its tracks) resolvable by id from anywhere — both browse
// and search funnel through here so getAlbumById can find either.
function indexAlbums(albums: BrowseAlbum[], tracks: Track[]) {
  for (const a of albums) albumIndex.set(a.id, a);
  for (const t of tracks) trackIndex.set(t.id, t);
}

function loadAll(): Promise<{ sections: AlbumSection[]; tracks: Track[] }> {
  if (!loadPromise) {
    loadPromise = getAnimeAlbums(24).then(({ albums, tracks }) => {
      indexAlbums(albums, tracks);
      const sections: AlbumSection[] = albums.length
        ? [{ id: "anime", title: "Anime Openings & Endings", albums }]
        : [];
      return { sections, tracks };
    });
  }
  return loadPromise;
}

/**
 * Pull browsable albums and bucket them into categorised sections. Currently
 * sourced from AnimeThemes (each anime as an album of its OP/ED themes); the
 * tracks come back inline and are returned in `tracks` so the page can register
 * them up-front. Result is memoised for the session.
 */
export function getAlbumSections(): Promise<{
  sections: AlbumSection[];
  tracks: Track[];
}> {
  return loadAll();
}

/**
 * Search for albums (AnimeThemes: anime grouped by their themes). Results are
 * indexed so the detail page can resolve them by id afterwards.
 */
export async function searchAlbums(
  query: string,
  limit = 12,
): Promise<BrowseAlbum[]> {
  const { albums, tracks } = await searchAnimeAlbums(query, limit);
  indexAlbums(albums, tracks);
  return albums;
}

/**
 * Resolve a single album and its playable tracks by id, for the detail page.
 * Falls back to lazily loading the browse list (deep-link / refresh) so the
 * album can be found even if it wasn't already indexed by browse or search.
 */
export async function getAlbumById(
  id: string,
): Promise<{ album: BrowseAlbum; tracks: Track[] } | null> {
  let album = albumIndex.get(id);
  if (!album) {
    await loadAll();
    album = albumIndex.get(id);
  }
  if (!album) return null;

  // AnimeThemes ships tracks inline (already indexed); iTunes needs a lookup.
  if (album.source === "animethemes") {
    const tracks = album.trackIds
      .map((tid) => trackIndex.get(tid))
      .filter((t): t is Track => t != null);
    return { album, tracks };
  }
  const tracks = await resolveAlbumTracks(album);
  return { album, tracks };
}

/**
 * Get the playable tracks for an album. AnimeThemes albums already carry their
 * track ids (registered up-front), so only iTunes needs a network round-trip.
 */
export async function resolveAlbumTracks(album: BrowseAlbum): Promise<Track[]> {
  if (album.source === "itunes") return getAlbumTracks(album.id);
  return [];
}
