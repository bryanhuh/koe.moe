import { useEffect, useRef, useState } from "react";
import { Disc3, Loader2, Search as SearchIcon, SearchX } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { BrowseAlbumCard } from "../components/BrowseAlbumCard";
import { usePlayer } from "../context/PlayerContext";
import {
  getAlbumSections,
  searchAlbums,
  type AlbumSection,
} from "../lib/sources/albums";
import type { BrowseAlbum } from "../lib/sources/index";

// Module-level cache so browse and search state survive unmount/remount —
// opening an album and pressing back returns to the same view. `term` is the
// query the cached results belong to, used to skip a refetch.
const cache: {
  sections: AlbumSection[];
  loaded: boolean;
  q: string;
  term: string;
  results: BrowseAlbum[];
} = { sections: [], loaded: false, q: "", term: "", results: [] };

const GRID = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";

export default function Albums() {
  const [sections, setSections] = useState<AlbumSection[]>(cache.sections);
  const [loading, setLoading] = useState(!cache.loaded);
  const { registerTracks } = usePlayer();

  // Search
  const [q, setQ] = useState(cache.q);
  const [results, setResults] = useState<BrowseAlbum[]>(cache.results);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchActive = q.trim().length > 0;

  useEffect(() => {
    if (cache.loaded) return;
    let cancelled = false;
    getAlbumSections().then(({ sections, tracks }) => {
      if (cancelled) return;
      // AnimeThemes albums ship their tracks inline — register them so playback
      // and the rest of the app can resolve them without another fetch.
      registerTracks(tracks);
      setSections(sections);
      setLoading(false);
      cache.sections = sections;
      cache.loaded = true;
    });
    return () => {
      cancelled = true;
    };
  }, [registerTracks]);

  useEffect(() => {
    const term = q.trim();
    cache.q = q;
    if (!term) {
      setResults([]);
      setSearching(false);
      cache.term = "";
      cache.results = [];
      return;
    }
    // Results already cached for this exact term (restored on remount) — keep them.
    if (term === cache.term) return;
    setSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const found = await searchAlbums(term, 18);
      setResults(found);
      setSearching(false);
      cache.term = term;
      cache.results = found;
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

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

      <div className="relative mb-8">
        <SearchIcon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search albums…"
          className="w-full bg-[#121212] border border-[#222] rounded-md py-2.5 pl-9 pr-4 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#444]"
        />
        {searching && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 animate-spin"
          />
        )}
      </div>

      {searchActive ? (
        <SearchResults q={q} loading={searching} results={results} />
      ) : (
        <>
          {loading && <SkeletonSections />}

          {!loading && sections.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <Disc3 size={30} className="text-neutral-700 mb-4" />
              <p className="text-sm text-neutral-300">
                Couldn't load albums right now.
              </p>
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
                <div className={GRID}>
                  {section.albums.map((album) => (
                    <BrowseAlbumCard key={album.id} album={album} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SearchResults({
  q,
  loading,
  results,
}: {
  q: string;
  loading: boolean;
  results: BrowseAlbum[];
}) {
  if (loading && results.length === 0) {
    return (
      <div className={GRID}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[#121212] border border-[#1a1a1a] p-4 rounded-lg">
            <div className="w-full aspect-square rounded-md bg-[#1a1a1a] animate-pulse mb-3" />
            <div className="h-3 w-3/4 bg-[#1a1a1a] rounded animate-pulse mb-2" />
            <div className="h-2.5 w-1/2 bg-[#161616] rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <SearchX size={30} className="text-neutral-700 mb-4" />
        <p className="text-sm text-neutral-300">
          No albums for <span className="text-white">"{q}"</span>
        </p>
        <p className="text-xs text-neutral-600 mt-1">Try a different anime or title.</p>
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-sm font-mono uppercase tracking-wide text-neutral-300 mb-4">
        Results <span className="text-neutral-600">({results.length})</span>
      </h2>
      <div className={GRID}>
        {results.map((album) => (
          <BrowseAlbumCard key={album.id} album={album} />
        ))}
      </div>
    </section>
  );
}

function SkeletonSections() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 2 }).map((_, s) => (
        <section key={s}>
          <div className="h-4 w-40 bg-[#1a1a1a] rounded animate-pulse mb-4" />
          <div className={GRID}>
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
