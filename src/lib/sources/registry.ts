import type { Track } from "../../data/mockData";
import type { Source, SourceId } from "./index";
import { itunes } from "./itunes";
import { animethemes } from "./animethemes";

// Every active catalog source. Order here is the tie-break order when relevance
// scores are equal: iTunes (mainstream, 30s previews) then AnimeThemes (anime).
export const sources: Source[] = [itunes, animethemes];

export const sourceById: Record<SourceId, Source> = {
  itunes,
  animethemes,
};

/**
 * Search every source in parallel and return the flattened results. Failures in
 * one source never block the others. Callers do their own relevance sorting.
 */
export async function searchAllSources(
  query: string,
  perSourceLimit = 10,
): Promise<Track[]> {
  const results = await Promise.allSettled(
    sources.map((s) => s.search(query, perSourceLimit)),
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
