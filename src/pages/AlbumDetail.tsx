import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Disc3, Loader2, Play } from "lucide-react";
import { TrackCard } from "../components/TrackCard";
import { usePlayer } from "../context/PlayerContext";
import { getAlbumById } from "../lib/sources/albums";
import type { BrowseAlbum } from "../lib/sources/index";
import type { Track } from "../data/mockData";

export default function AlbumDetail() {
  const { albumId } = useParams<{ albumId: string }>();
  const { playAlbum, registerTracks } = usePlayer();
  const [album, setAlbum] = useState<BrowseAlbum | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!albumId) return;
    let cancelled = false;
    setLoading(true);
    getAlbumById(albumId).then((result) => {
      if (cancelled) return;
      if (result) {
        registerTracks(result.tracks);
        setAlbum(result.album);
        setTracks(result.tracks);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [albumId, registerTracks]);

  const trackIds = tracks.map((t) => t.id);

  return (
    <div>
      <Link
        to="/albums"
        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6"
      >
        <ArrowLeft size={16} />
        Albums
      </Link>

      {loading && <DetailSkeleton />}

      {!loading && !album && (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <Disc3 size={30} className="text-neutral-700 mb-4" />
          <p className="text-sm text-neutral-300">Couldn't find this album.</p>
          <Link to="/albums" className="text-xs accent-text mt-2">
            Back to Albums
          </Link>
        </div>
      )}

      {!loading && album && (
        <>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end mb-8">
            {album.coverUrl ? (
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg object-cover bg-[#1a1a1a] shadow-xl shrink-0"
              />
            ) : (
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <Disc3 size={48} className="text-neutral-700" />
              </div>
            )}
            <div className="min-w-0">
              <div className="font-mono uppercase text-xs tracking-[0.25em] text-neutral-500 mb-2">
                Album
              </div>
              <h1 className="font-mono text-3xl font-extrabold tracking-tight break-words">
                {album.title}
              </h1>
              <div className="text-sm text-neutral-400 mt-1">
                {album.artist}
                {album.year ? ` · ${album.year}` : ""} · {tracks.length} track
                {tracks.length === 1 ? "" : "s"}
              </div>
              {trackIds.length > 0 && (
                <button
                  onClick={() => playAlbum(trackIds)}
                  className="mt-4 flex items-center gap-2 accent-bg text-black font-semibold text-sm px-5 py-2.5 rounded-full hover:brightness-110"
                >
                  <Play size={14} fill="currentColor" />
                  Play all
                </button>
              )}
            </div>
          </div>

          {tracks.length === 0 ? (
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-12 text-center text-sm text-neutral-400">
              No playable tracks in this album.
            </div>
          ) : (
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-2">
              {tracks.map((t, i) => (
                <TrackCard
                  key={t.id}
                  track={t}
                  variant="row"
                  index={i}
                  queueIds={trackIds}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-6 items-end mb-8">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg bg-[#1a1a1a] animate-pulse shrink-0" />
        <div className="flex-1">
          <div className="h-3 w-16 bg-[#1a1a1a] rounded animate-pulse mb-3" />
          <div className="h-8 w-64 bg-[#1a1a1a] rounded animate-pulse mb-3" />
          <div className="h-3 w-40 bg-[#161616] rounded animate-pulse" />
        </div>
      </div>
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-2 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-[#121212] rounded-md animate-pulse" />
        ))}
      </div>
    </div>
  );
}
