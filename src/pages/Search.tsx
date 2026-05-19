import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { TrackCard } from "../components/TrackCard";
import { AlbumGrid } from "../components/AlbumGrid";
import { ArtistGrid } from "../components/ArtistGrid";
import { albums, artists, tracks } from "../data/mockData";

type Filter = "all" | "songs" | "artists" | "albums";

export default function Search() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const term = q.trim().toLowerCase();

  const matched = useMemo(() => {
    if (!term)
      return {
        tracks: [] as typeof tracks,
        albums: [] as typeof albums,
        artists: [] as typeof artists,
      };
    return {
      tracks: tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.artist.toLowerCase().includes(term) ||
          t.album.toLowerCase().includes(term),
      ),
      albums: albums.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.artist.toLowerCase().includes(term),
      ),
      artists: artists.filter((a) => a.name.toLowerCase().includes(term)),
    };
  }, [term]);

  const showSongs = filter === "all" || filter === "songs";
  const showArtists = filter === "all" || filter === "artists";
  const showAlbums = filter === "all" || filter === "albums";

  const filters: Filter[] = ["all", "songs", "artists", "albums"];

  return (
    <div>
      <PageHeader eyebrow="Discover" title="Search" />

      <div className="relative mb-5">
        <SearchIcon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search songs, artists, albums…"
          autoFocus
          className="w-full bg-[#121212] border border-[#222] rounded-md py-2.5 pl-9 pr-4 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#444]"
        />
      </div>

      <div className="flex items-center gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wide border ${
              filter === f
                ? "accent-bg text-black border-transparent"
                : "border-[#222] text-neutral-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {!term && (
        <div className="text-neutral-500 text-sm">
          Type something to start searching.
        </div>
      )}

      {term && (
        <div className="space-y-8">
          {showSongs && matched.tracks.length > 0 && (
            <section>
              <h2 className="text-sm font-mono uppercase tracking-wide text-neutral-300 mb-3">
                Songs ({matched.tracks.length})
              </h2>
              <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-2">
                {matched.tracks.map((t, i) => (
                  <TrackCard
                    key={t.id}
                    track={t}
                    variant="row"
                    index={i}
                    queueIds={matched.tracks.map((x) => x.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {showAlbums && matched.albums.length > 0 && (
            <section>
              <h2 className="text-sm font-mono uppercase tracking-wide text-neutral-300 mb-3">
                Albums ({matched.albums.length})
              </h2>
              <AlbumGrid albums={matched.albums} columns={4} />
            </section>
          )}

          {showArtists && matched.artists.length > 0 && (
            <section>
              <h2 className="text-sm font-mono uppercase tracking-wide text-neutral-300 mb-3">
                Artists ({matched.artists.length})
              </h2>
              <ArtistGrid artists={matched.artists} />
            </section>
          )}

          {matched.tracks.length === 0 &&
            matched.albums.length === 0 &&
            matched.artists.length === 0 && (
              <div className="text-neutral-500 text-sm">
                No matches for <span className="text-white">"{q}"</span>.
              </div>
            )}
        </div>
      )}
    </div>
  );
}
