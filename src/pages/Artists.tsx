import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ArtistGrid } from "../components/ArtistGrid";
import { getArtistSections, type ArtistSection } from "../lib/sources/artists";

export default function Artists() {
  const [sections, setSections] = useState<ArtistSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getArtistSections().then((sections) => {
      if (cancelled) return;
      setSections(sections);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const total = sections.reduce((n, s) => n + s.artists.length, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Browse"
        title="Artists"
        subtitle={
          loading
            ? "Loading artists…"
            : `${total} artists across ${sections.length} ${
                sections.length === 1 ? "source" : "sources"
              }`
        }
      />

      {loading && <SkeletonSections />}

      {!loading && sections.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <Users size={30} className="text-neutral-700 mb-4" />
          <p className="text-sm text-neutral-300">Couldn't load artists right now.</p>
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
              <span className="text-neutral-600">({section.artists.length})</span>
            </h2>
            <ArtistGrid artists={section.artists} />
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#121212] border border-[#1a1a1a] p-4 rounded-lg text-center"
              >
                <div className="w-32 h-32 mx-auto rounded-full bg-[#1a1a1a] animate-pulse mb-3" />
                <div className="h-3 w-1/2 bg-[#1a1a1a] rounded animate-pulse mx-auto mb-2" />
                <div className="h-2.5 w-1/3 bg-[#161616] rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
