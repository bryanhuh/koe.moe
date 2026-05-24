type FeaturedRow = {
  id: string;
  title: string;
  subtitle: string;
  source: "jamendo" | "audius";
  type: "featured";
  limit: number;
};

type SearchRow = {
  id: string;
  title: string;
  subtitle: string;
  source: "jamendo" | "audius";
  type: "search";
  query: string;
  limit: number;
};

export type CuratedRow = FeaturedRow | SearchRow;

export const curatedRows: CuratedRow[] = [
  {
    id: "trending-jamendo",
    title: "Trending This Week",
    subtitle: "Most popular free music on Jamendo right now",
    source: "jamendo",
    type: "featured",
    limit: 8,
  },
  {
    id: "trending-audius",
    title: "Rising on Audius",
    subtitle: "What the Audius community is listening to",
    source: "audius",
    type: "featured",
    limit: 8,
  },
  {
    id: "chill-focus",
    title: "Chill & Focus",
    subtitle: "Laid-back sounds for deep work",
    source: "jamendo",
    type: "search",
    query: "chill acoustic",
    limit: 8,
  },
  {
    id: "electronic",
    title: "Electronic",
    subtitle: "Synths, beats, and dance floor energy",
    source: "audius",
    type: "search",
    query: "electronic",
    limit: 8,
  },
  {
    id: "jazz-soul",
    title: "Jazz & Soul",
    subtitle: "Smooth, warm, and timeless",
    source: "jamendo",
    type: "search",
    query: "jazz",
    limit: 8,
  },
];
