import type { Track } from "../../data/mockData";

export type SourceId = "itunes" | "animethemes";

export interface Source {
  readonly sourceId: SourceId;
  search(query: string, limit?: number): Promise<Track[]>;
  getFeatured(limit?: number): Promise<Track[]>;
  getTrack(id: string): Promise<Track | null>;
}

// A browsable album from any source. `trackIds` is populated up-front when a
// source returns the tracks inline (AnimeThemes), or left empty and resolved
// lazily on play (iTunes, where tracks need a separate lookup). `category` is
// the bucket the Albums page groups by (a genre, or "Anime Openings & Endings").
export type BrowseAlbum = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  year?: number;
  source: SourceId;
  category: string;
  trackIds: string[];
};
