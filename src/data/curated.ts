type FeaturedRow = {
  id: string;
  title: string;
  subtitle: string;
  source: "itunes" | "animethemes";
  type: "featured";
  limit: number;
};

type SearchRow = {
  id: string;
  title: string;
  subtitle: string;
  source: "itunes" | "animethemes";
  type: "search";
  query: string;
  limit: number;
};

export type CuratedRow = FeaturedRow | SearchRow;

export const curatedRows: CuratedRow[] = [
  {
    id: "anime-openings",
    title: "Anime Openings",
    subtitle: "Full-length OP themes from AnimeThemes",
    source: "animethemes",
    type: "featured",
    limit: 8,
  },
  {
    id: "pop-now",
    title: "Pop Right Now",
    subtitle: "Mainstream hits — 30-second previews",
    source: "itunes",
    type: "search",
    query: "pop",
    limit: 8,
  },
  {
    id: "anime-hits",
    title: "Shonen Anthems",
    subtitle: "Openings from the big shonen series",
    source: "animethemes",
    type: "search",
    query: "jujutsu kaisen",
    limit: 8,
  },
  {
    id: "hip-hop",
    title: "Hip-Hop Heat",
    subtitle: "Rap and beats — preview clips",
    source: "itunes",
    type: "search",
    query: "hip hop",
    limit: 8,
  },
  {
    id: "lofi-chill",
    title: "Lo-Fi & Chill",
    subtitle: "Laid-back sounds for deep work",
    source: "itunes",
    type: "search",
    query: "lofi",
    limit: 8,
  },
];
