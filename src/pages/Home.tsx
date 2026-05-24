import { useEffect, useState } from "react";
import { HeroBanner } from "../components/HeroBanner";
import { AlbumGrid } from "../components/AlbumGrid";
import { PageHeader } from "../components/PageHeader";
import { albums, albumById, featuredAlbumId } from "../data/mockData";
import { TrackCard } from "../components/TrackCard";
import { jamendo } from "../lib/sources/jamendo";
import { usePlayer } from "../context/PlayerContext";
import type { Track } from "../data/mockData";

export default function Home() {
  const featured = albumById(featuredAlbumId)!;
  const listenNow = albums.filter((a) => a.id !== featured.id).slice(0, 3);

  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const { registerTracks } = usePlayer();

  useEffect(() => {
    jamendo.getFeatured(8).then((tracks) => {
      registerTracks(tracks);
      setTrendingTracks(tracks);
    }).catch(() => {});
  }, [registerTracks]);

  const trackIds = trendingTracks.map((t) => t.id);

  return (
    <div className="space-y-10">
      <HeroBanner album={featured} />

      <section>
        <PageHeader eyebrow="" title="Listen Now" subtitle="Recently played albums" />
        <AlbumGrid albums={listenNow} columns={3} />
      </section>

      <section>
        <PageHeader title="Trending on Jamendo" subtitle="Popular free tracks this week" />
        {trendingTracks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trendingTracks.slice(0, 4).map((t) => (
              <TrackCard key={t.id} track={t} queueIds={trackIds} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#121212] border border-[#1a1a1a] rounded-lg aspect-square animate-pulse"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
