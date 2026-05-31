import { useEffect, useRef, useState } from "react";
import { Loader2, Search as SearchIcon } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { TrackCard } from "../components/TrackCard";
import { searchAllSources } from "../lib/sources/registry";
import { usePlayer } from "../context/PlayerContext";
import type { Track } from "../data/mockData";

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
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { registerTracks } = usePlayer();

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setTracks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const merged: Track[] = await searchAllSources(term, 10);

      const termLower = term.toLowerCase();
      merged.sort((a, b) => scoreTrack(b, termLower) - scoreTrack(a, termLower));

      registerTracks(merged);
      setTracks(merged);
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
          placeholder="Search songs across Jamendo and Audius…"
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
        <div className="text-neutral-500 text-sm">
          Type something to start searching.
        </div>
      )}

      {q.trim() && !loading && tracks.length === 0 && (
        <div className="text-neutral-500 text-sm">
          No matches for <span className="text-white">"{q}"</span>.
        </div>
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
  );
}
