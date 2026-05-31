export type Track = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: number; // seconds
  coverUrl: string;
  audioUrl: string;
  source?: "local" | "itunes" | "animethemes";
  // True for sources that only stream a short clip (e.g. iTunes 30s previews).
  preview?: boolean;
  // Optional music video (e.g. AnimeThemes serves the OP/ED as a .webm).
  videoUrl?: string;
};

export type Album = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  year: number;
  coverUrl: string;
  trackIds: string[];
};

export type Artist = {
  id: string;
  name: string;
  coverUrl: string;
  bio: string;
};

export type Playlist = {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
};

// Picsum seeds give stable images per id
const cover = (seed: string, size = 600) =>
  `https://picsum.photos/seed/koe-${seed}/${size}/${size}`;

// These mock tracks carry no real audio; live tracks come from the iTunes /
// AnimeThemes sources. Every mock track returns an empty string here.
const audio = (_i: number) => "";

export const artists: Artist[] = [
  {
    id: "ar1",
    name: "Yorushika",
    coverUrl: cover("artist-yorushika"),
    bio: "Japanese rock duo formed in 2017. Known for cinematic, literary songwriting.",
  },
  {
    id: "ar2",
    name: "Lamp",
    coverUrl: cover("artist-lamp"),
    bio: "Tokyo-based trio blending bossa nova, jazz, and shibuya-kei.",
  },
  {
    id: "ar3",
    name: "Mac DeMarco",
    coverUrl: cover("artist-mac"),
    bio: "Canadian indie songwriter with a laid-back, sun-soaked sound.",
  },
  {
    id: "ar4",
    name: "Mitski",
    coverUrl: cover("artist-mitski"),
    bio: "American indie rock artist known for raw, emotional songwriting.",
  },
];

export const albums: Album[] = [
  {
    id: "al1",
    title: "Plagiarism",
    artist: "Yorushika",
    artistId: "ar1",
    year: 2020,
    coverUrl: cover("album-plagiarism"),
    trackIds: ["t1", "t2", "t3"],
  },
  {
    id: "al2",
    title: "彼女",
    artist: "Lamp",
    artistId: "ar2",
    year: 2014,
    coverUrl: cover("album-kanojo"),
    trackIds: ["t4", "t5"],
  },
  {
    id: "al3",
    title: "Salad Days",
    artist: "Mac DeMarco",
    artistId: "ar3",
    year: 2014,
    coverUrl: cover("album-salad"),
    trackIds: ["t6", "t7"],
  },
  {
    id: "al4",
    title: "Be the Cowboy",
    artist: "Mitski",
    artistId: "ar4",
    year: 2018,
    coverUrl: cover("album-cowboy"),
    trackIds: ["t8", "t9", "t10"],
  },
];

export const tracks: Track[] = [
  {
    id: "t1",
    title: "Hitchcock",
    artist: "Yorushika",
    artistId: "ar1",
    album: "Plagiarism",
    albumId: "al1",
    duration: 214,
    coverUrl: cover("album-plagiarism"),
    audioUrl: audio(0),
  },
  {
    id: "t2",
    title: "Just a Sunny Day For You",
    artist: "Yorushika",
    artistId: "ar1",
    album: "Plagiarism",
    albumId: "al1",
    duration: 198,
    coverUrl: cover("album-plagiarism"),
    audioUrl: audio(1),
  },
  {
    id: "t3",
    title: "Say It",
    artist: "Yorushika",
    artistId: "ar1",
    album: "Plagiarism",
    albumId: "al1",
    duration: 232,
    coverUrl: cover("album-plagiarism"),
    audioUrl: audio(2),
  },
  {
    id: "t4",
    title: "Lover, Please",
    artist: "Lamp",
    artistId: "ar2",
    album: "彼女",
    albumId: "al2",
    duration: 246,
    coverUrl: cover("album-kanojo"),
    audioUrl: audio(3),
  },
  {
    id: "t5",
    title: "Sunday Bossa",
    artist: "Lamp",
    artistId: "ar2",
    album: "彼女",
    albumId: "al2",
    duration: 271,
    coverUrl: cover("album-kanojo"),
    audioUrl: audio(0),
  },
  {
    id: "t6",
    title: "Salad Days",
    artist: "Mac DeMarco",
    artistId: "ar3",
    album: "Salad Days",
    albumId: "al3",
    duration: 187,
    coverUrl: cover("album-salad"),
    audioUrl: audio(1),
  },
  {
    id: "t7",
    title: "Chamber of Reflection",
    artist: "Mac DeMarco",
    artistId: "ar3",
    album: "Salad Days",
    albumId: "al3",
    duration: 257,
    coverUrl: cover("album-salad"),
    audioUrl: audio(2),
  },
  {
    id: "t8",
    title: "Nobody",
    artist: "Mitski",
    artistId: "ar4",
    album: "Be the Cowboy",
    albumId: "al4",
    duration: 211,
    coverUrl: cover("album-cowboy"),
    audioUrl: audio(3),
  },
  {
    id: "t9",
    title: "Geyser",
    artist: "Mitski",
    artistId: "ar4",
    album: "Be the Cowboy",
    albumId: "al4",
    duration: 175,
    coverUrl: cover("album-cowboy"),
    audioUrl: audio(0),
  },
  {
    id: "t10",
    title: "Washing Machine Heart",
    artist: "Mitski",
    artistId: "ar4",
    album: "Be the Cowboy",
    albumId: "al4",
    duration: 122,
    coverUrl: cover("album-cowboy"),
    audioUrl: audio(1),
  },
];

export const playlists: Playlist[] = [
  {
    id: "pl1",
    name: "Late Night Drive",
    description: "Mellow tracks for empty highways at 2am.",
    coverUrl: cover("pl-night"),
    trackIds: ["t7", "t4", "t8", "t3"],
  },
  {
    id: "pl2",
    name: "Soft Mornings",
    description: "Gentle starts. Coffee not optional.",
    coverUrl: cover("pl-morning"),
    trackIds: ["t5", "t2", "t10", "t6"],
  },
];

export const featuredAlbumId = "al4";

export const trackById = (id: string) => tracks.find((t) => t.id === id);
export const albumById = (id: string) => albums.find((a) => a.id === id);
export const artistById = (id: string) => artists.find((a) => a.id === id);
export const playlistById = (id: string) => playlists.find((p) => p.id === id);

export const formatTime = (s: number): string => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};
