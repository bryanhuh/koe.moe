import { useEffect, useState } from "react";
import { Disc3 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrowseAlbumCard } from "../components/BrowseAlbumCard";
import { usePlayer } from "../context/PlayerContext";
import { getAlbumSections, type AlbumSection } from "../lib/sources/albums";

export default function Albums() {
  const [sections, setSections] = useState<AlbumSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { registerTracks } = usePlayer();

  useEffect(() => {
    let cancelled = false;
    getAlbumSections().then(({ sections, tracks }) => {
      if (cancelled) return;
      // AnimeThemes albums ship their tracks inline — register them so playback
      // and the rest of the app can resolve them without another fetch.
      registerTracks(tracks);
      setSections(sections);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [registerTracks]);

  const total = sections.reduce((n, s) => n + s.albums.length, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Browse"
        title="Albums"
        subtitle={
          loading
            ? "Loading anime albums…"
            : `${total} albums across ${sections.length} categories`
        }
      />

      {loading && <SkeletonSections />}

      {!loading && sections.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <Disc3 size={30} className="text-neutral-700 mb-4" />
          <p className="text-sm text-neutral-300">Couldn't load albums right now.</p>
          <p className="text-xs text-neutral-600 mt-1">
            Check your connection and try again.
          </p>
        </div>
      )}

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.id}>
            <h2 className="text-sm font-mono uppercase tracking-wide text-neutral-300 mb-4">
              {section.title}{" "}
              <span className="text-neutral-600">({section.albums.length})</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {section.albums.map((album) => (
                <BrowseAlbumCard key={album.id} album={album} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function SkeletonSections() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 2 }).map((_, s) => (
        <section key={s}>
          <div className="h-4 w-40 bg-[#1a1a1a] rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[#121212] border border-[#1a1a1a] p-4 rounded-lg">
                <div className="w-full aspect-square rounded-md bg-[#1a1a1a] animate-pulse mb-3" />
                <div className="h-3 w-3/4 bg-[#1a1a1a] rounded animate-pulse mb-2" />
                <div className="h-2.5 w-1/2 bg-[#161616] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
