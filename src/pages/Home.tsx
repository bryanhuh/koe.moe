import { HeroBanner } from "../components/HeroBanner";
import { AlbumGrid } from "../components/AlbumGrid";
import { PageHeader } from "../components/PageHeader";
import { albums, albumById, featuredAlbumId, tracks } from "../data/mockData";
import { TrackCard } from "../components/TrackCard";

export default function Home() {
  const featured = albumById(featuredAlbumId)!;
  const listenNow = albums.filter((a) => a.id !== featured.id).slice(0, 3);
  const newTracks = tracks.slice(0, 4);

  return (
    <div className="space-y-10">
      <HeroBanner album={featured} />

      <section>
        <PageHeader eyebrow="" title="Listen Now" subtitle="Recently played albums" />
        <AlbumGrid albums={listenNow} columns={3} />
      </section>

      <section>
        <PageHeader title="Made for You" subtitle="A handful of picks based on your library" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {newTracks.map((t) => (
            <TrackCard key={t.id} track={t} queueIds={tracks.map((x) => x.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}
