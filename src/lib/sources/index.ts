import type { Track } from "../../data/mockData";

export interface Source {
  readonly sourceId: "jamendo" | "audius";
  search(query: string, limit?: number): Promise<Track[]>;
  getFeatured(limit?: number): Promise<Track[]>;
  getTrack(id: string): Promise<Track | null>;
}
