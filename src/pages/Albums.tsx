import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Disc3, Loader2, Play } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { usePlayer } from "../context/PlayerContext";
import {
  getAlbumSections,
  resolveAlbumTracks,
  type AlbumSection,
} from "../lib/sources/albums";
import type { BrowseAlbum } from "../lib/sources/index";

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

function BrowseAlbumCard({ album }: { album: BrowseAlbum }) {
  const { playAlbum, registerTracks } = usePlayer();
  const [busy, setBusy] = useState(false);

  // Quick-play straight from the card without leaving the grid. The card itself
  // navigates to the album's track list (see the wrapping <Link>).
  const play = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (busy) return;
    // AnimeThemes tracks are already known/registered; play immediately.
    if (album.source === "animethemes") {
      if (album.trackIds.length) playAlbum(album.trackIds);
      return;
    }
    // iTunes: resolve the album's tracks on demand, then play.
    setBusy(true);
    try {
      const tracks = await resolveAlbumTracks(album);
      registerTracks(tracks);
      if (tracks.length) playAlbum(tracks.map((t) => t.id));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link
      to={`/albums/${encodeURIComponent(album.id)}`}
      className="group bg-[#121212] border border-[#1a1a1a] p-4 rounded-lg hover:bg-[#161616] transition-colors block text-left w-full"
      aria-label={`Open ${album.title}`}
    >
      <div className="relative mb-3">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            loading="lazy"
            className="w-full aspect-square object-cover rounded-md bg-[#1a1a1a]"
          />
        ) : (
          <div className="w-full aspect-square rounded-md bg-[#1a1a1a] flex items-center justify-center">
            <Disc3 size={32} className="text-neutral-700" />
          </div>
        )}
        <button
          onClick={play}
          aria-label={`Play ${album.title}`}
          className="absolute bottom-2 right-2 w-10 h-10 accent-bg text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} fill="currentColor" className="translate-x-[1px]" />
          )}
        </button>
      </div>
      <div className="text-sm font-medium text-white truncate">{album.title}</div>
      <div className="text-xs text-neutral-400 truncate">
        {album.artist}
        {album.year ? ` · ${album.year}` : ""}
      </div>
    </Link>
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
