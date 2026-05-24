import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { TrackCard } from "../components/TrackCard";
import { jamendo } from "../lib/sources/jamendo";
import { audius } from "../lib/sources/audius";
import { usePlayer } from "../context/PlayerContext";
import { curatedRows } from "../data/curated";
import type { Track } from "../data/mockData";
import type { CuratedRow } from "../data/curated";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-[#121212] border border-[#1a1a1a] rounded-lg aspect-square animate-pulse"
        />
      ))}
    </div>
  );
}

function CuratedSection({ row }: { row: CuratedRow }) {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const { registerTracks } = usePlayer();

  useEffect(() => {
    const src = row.source === "jamendo" ? jamendo : audius;
    const fetch =
      row.type === "featured"
        ? src.getFeatured(row.limit)
        : src.search(row.query, row.limit);

    fetch
      .then((t) => {
        registerTracks(t);
        setTracks(t);
      })
      .catch(() => setTracks([]));
  }, [row, registerTracks]);

  // Hide rows that returned no results (e.g. Jamendo with no CLIENT_ID)
  if (tracks !== null && tracks.length === 0) return null;

  const queueIds = (tracks ?? []).map((t) => t.id);

  return (
    <section>
      <PageHeader title={row.title} subtitle={row.subtitle} />
      {tracks !== null ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tracks.slice(0, 4).map((t) => (
            <TrackCard key={t.id} track={t} queueIds={queueIds} />
          ))}
        </div>
      ) : (
        <SkeletonGrid />
      )}
    </section>
  );
}

export default function Home() {
  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500 mb-1">
          {getGreeting()}
        </p>
        <h1 className="text-3xl font-bold text-white">Discover Music</h1>
      </div>

      {curatedRows.map((row) => (
        <CuratedSection key={row.id} row={row} />
      ))}
    </div>
  );
}
