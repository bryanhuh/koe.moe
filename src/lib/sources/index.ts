import type { Track } from "../../data/mockData";

export type SourceId =
  | "jamendo"
  | "audius"
  | "itunes"
  | "animethemes";

export interface Source {
  readonly sourceId: SourceId;
  search(query: string, limit?: number): Promise<Track[]>;
  getFeatured(limit?: number): Promise<Track[]>;
  getTrack(id: string): Promise<Track | null>;
}
