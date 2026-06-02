import { useEffect, useRef, useState } from "react";
import { Loader2, Search as SearchIcon, SearchX } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { TrackCard } from "../components/TrackCard";
import { BrowseAlbumCard } from "../components/BrowseAlbumCard";
import { searchAllSources } from "../lib/sources/registry";
import { searchAlbums } from "../lib/sources/albums";
import { usePlayer } from "../context/PlayerContext";
import type { Track } from "../data/mockData";
import type { BrowseAlbum } from "../lib/sources/index";

const SUGGESTIONS = [
  "Blinding Lights",
  "Unravel",
  "lofi",
  "Jujutsu Kaisen",
  "The Weeknd",
];

function SkeletonRows() {
  return (
    <section>
      <div className="h-4 w-24 bg-[#1a1a1a] rounded animate-pulse mb-3" />
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded bg-[#1a1a1a] animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/3 bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-2.5 w-1/4 bg-[#161616] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function scoreTrack(t: Track, term: string): number {
  const title = t.title.toLowerCase();
  const artist = t.artist.toLowerCase();
  let score = 0;
  if (title.startsWith(term)) score += 3;
  else if (title.includes(term)) score += 2;
  if (artist.includes(term)) score += 1;
  return score;
}

export default function Search() {
  const [q, setQ] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<BrowseAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { registerTracks } = usePlayer();

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setTracks([]);
      setAlbums([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const [merged, foundAlbums] = await Promise.all([
        searchAllSources(term, 10),
        searchAlbums(term, 12),
      ]);

      const termLower = term.toLowerCase();
      merged.sort((a, b) => scoreTrack(b, termLower) - scoreTrack(a, termLower));

      registerTracks(merged);
      setTracks(merged);
      setAlbums(foundAlbums);
      setLoading(false);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, registerTracks]);

  const queueIds = tracks.map((t) => t.id);

  return (
    <div>
      <PageHeader eyebrow="Discover" title="Search" />

      <div className="relative mb-6">
        <SearchIcon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search songs and anime themes…"
          autoFocus
          className="w-full bg-[#121212] border border-[#222] rounded-md py-2.5 pl-9 pr-4 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#444]"
        />
        {loading && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 animate-spin"
          />
        )}
      </div>

      {!q.trim() && (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <SearchIcon size={30} className="text-neutral-700 mb-4" />
          <p className="text-sm text-neutral-300">
            Search across iTunes and AnimeThemes
          </p>
          <p className="text-xs text-neutral-600 mt-1 mb-6">
            Mainstream songs and full-length anime openings
          </p>
          <div className="flex flex-wrap gap-2 justify-center max-w-md">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setQ(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-[#161616] border border-[#222] text-neutral-300 hover:bg-[#1f1f1f] hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {q.trim() && loading && tracks.length === 0 && <SkeletonRows />}

      {q.trim() && !loading && tracks.length === 0 && albums.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <SearchX size={30} className="text-neutral-700 mb-4" />
          <p className="text-sm text-neutral-300">
            No matches for <span className="text-white">"{q}"</span>
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            Try a different title, artist, or anime.
          </p>
        </div>
      )}

      <div className="space-y-8">
        {albums.length > 0 && (
          <section>
            <h2 className="text-sm font-mono uppercase tracking-wide text-neutral-300 mb-3">
              Albums ({albums.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {albums.map((album) => (
                <BrowseAlbumCard key={album.id} album={album} />
              ))}
            </div>
          </section>
        )}

        {tracks.length > 0 && (
          <section>
            <h2 className="text-sm font-mono uppercase tracking-wide text-neutral-300 mb-3">
              Songs ({tracks.length})
            </h2>
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-2">
              {tracks.map((t, i) => (
                <TrackCard key={t.id} track={t} variant="row" index={i} queueIds={queueIds} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
