import type { BrowseArtist } from "./index";
import { getAnimeArtists } from "./animethemes";
import { getTopArtists } from "./itunes";

export type ArtistSection = {
  id: string;
  title: string;
  artists: BrowseArtist[];
};

/**
 * Browsable artists bucketed into sections, one per source: iTunes "popular"
 * artists (derived from the top-albums chart) and AnimeThemes artists. Sources
 * are fetched in parallel and a failure in one never blocks the other.
 */
export async function getArtistSections(): Promise<ArtistSection[]> {
  const [popular, anime] = await Promise.all([
    getTopArtists(18).catch(() => [] as BrowseArtist[]),
    getAnimeArtists(18).catch(() => [] as BrowseArtist[]),
  ]);

  const sections: ArtistSection[] = [];
  if (popular.length)
    sections.push({ id: "popular", title: "Popular Artists", artists: popular });
  if (anime.length)
    sections.push({ id: "anime", title: "Anime Artists", artists: anime });
  return sections;
}
