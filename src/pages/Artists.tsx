import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search as SearchIcon,
  SearchX,
  Users,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ArtistGrid } from "../components/ArtistGrid";
import {
  getAnimeArtistsPage,
  getPopularArtists,
  searchArtists,
} from "../lib/sources/artists";
import type { BrowseArtist } from "../lib/sources/index";

export default function Artists() {
  const [popular, setPopular] = useState<BrowseArtist[]>([]);
  const [anime, setAnime] = useState<BrowseArtist[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [paging, setPaging] = useState(false);

  // Search
  const [q, setQ] = useState("");
  const [results, setResults] = useState<BrowseArtist[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchActive = q.trim().length > 0;

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const found = await searchArtists(term);
      setResults(found);
      setSearching(false);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  // iTunes popular artists — fixed chart, loads once.
  useEffect(() => {
    let cancelled = false;
    getPopularArtists().then((a) => {
      if (!cancelled) setPopular(a);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // AnimeThemes artists — refetched whenever the page changes.
  useEffect(() => {
    let cancelled = false;
    setPaging(true);
    getAnimeArtistsPage(page).then(({ artists, hasNext }) => {
      if (cancelled) return;
      setAnime(artists);
      setHasNext(hasNext);
      setPaging(false);
      setInitialLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const empty = !initialLoading && popular.length === 0 && anime.length === 0;

  return (
    <div>
      <PageHeader
        eyebrow="Browse"
        title="Artists"
        subtitle="Popular picks and the full AnimeThemes roster"
      />

      <div className="relative mb-8">
        <SearchIcon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search artists…"
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
          {initialLoading && <SkeletonSections />}

          {empty && (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <Users size={30} className="text-neutral-700 mb-4" />
              <p className="text-sm text-neutral-300">
                Couldn't load artists right now.
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                Check your connection and try again.
              </p>
            </div>
          )}

          <div className="space-y-10">
            {popular.length > 0 && (
              <section>
                <h2 className="text-sm font-mono uppercase tracking-wide text-neutral-300 mb-4">
                  Popular Artists{" "}
                  <span className="text-neutral-600">({popular.length})</span>
                </h2>
                <ArtistGrid artists={popular} />
              </section>
            )}

            {!initialLoading && anime.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 gap-4">
                  <h2 className="text-sm font-mono uppercase tracking-wide text-neutral-300">
                    Anime Artists
                  </h2>
                  <Pager
                    page={page}
                    hasNext={hasNext}
                    disabled={paging}
                    onPrev={() => setPage((p) => Math.max(1, p - 1))}
                    onNext={() => setPage((p) => p + 1)}
                  />
                </div>
                <div className={paging ? "opacity-50 transition-opacity" : ""}>
                  <ArtistGrid artists={anime} />
                </div>
              </section>
            )}
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
  results: BrowseArtist[];
}) {
  if (loading && results.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#121212] border border-[#1a1a1a] p-4 rounded-lg text-center"
          >
            <div className="w-32 h-32 mx-auto rounded-full bg-[#1a1a1a] animate-pulse mb-3" />
            <div className="h-3 w-1/2 bg-[#1a1a1a] rounded animate-pulse mx-auto" />
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
          No artists for <span className="text-white">"{q}"</span>
        </p>
        <p className="text-xs text-neutral-600 mt-1">Try a different name.</p>
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-sm font-mono uppercase tracking-wide text-neutral-300 mb-4">
        Results <span className="text-neutral-600">({results.length})</span>
      </h2>
      <ArtistGrid artists={results} />
    </section>
  );
}

function Pager({
  page,
  hasNext,
  disabled,
  onPrev,
  onNext,
}: {
  page: number;
  hasNext: boolean;
  disabled: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const btn =
    "w-8 h-8 flex items-center justify-center rounded-md border border-[#222] bg-[#121212] text-neutral-300 hover:bg-[#1a1a1a] disabled:opacity-40 disabled:hover:bg-[#121212] disabled:cursor-not-allowed";
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPrev}
        disabled={disabled || page === 1}
        aria-label="Previous page"
        className={btn}
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-xs font-mono text-neutral-500 tabular-nums">
        Page {page}
      </span>
      <button
        onClick={onNext}
        disabled={disabled || !hasNext}
        aria-label="Next page"
        className={btn}
      >
        <ChevronRight size={16} />
      </button>
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
