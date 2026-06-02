import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Play, User } from "lucide-react";
import { TrackCard } from "../components/TrackCard";
import { usePlayer } from "../context/PlayerContext";
import { getArtistById } from "../lib/sources/artists";
import type { BrowseArtist } from "../lib/sources/index";
import type { Track } from "../data/mockData";

export default function ArtistDetail() {
  const { artistId } = useParams<{ artistId: string }>();
  const { playAlbum, registerTracks } = usePlayer();
  const [artist, setArtist] = useState<BrowseArtist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artistId) return;
    let cancelled = false;
    setLoading(true);
    getArtistById(artistId).then((result) => {
      if (cancelled) return;
      if (result) {
        registerTracks(result.tracks);
        setArtist(result.artist);
        setTracks(result.tracks);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [artistId, registerTracks]);

  const trackIds = tracks.map((t) => t.id);

  return (
    <div>
      <Link
        to="/artists"
        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6"
      >
        <ArrowLeft size={16} />
        Artists
      </Link>

      {loading && <DetailSkeleton />}

      {!loading && !artist && (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <User size={30} className="text-neutral-700 mb-4" />
          <p className="text-sm text-neutral-300">Couldn't find this artist.</p>
          <Link to="/artists" className="text-xs accent-text mt-2">
            Back to Artists
          </Link>
        </div>
      )}

      {!loading && artist && (
        <>
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end mb-8">
            {artist.imageUrl ? (
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover bg-[#1a1a1a] shadow-xl shrink-0"
              />
            ) : (
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <User size={48} className="text-neutral-700" />
              </div>
            )}
            <div className="min-w-0 text-center sm:text-left">
              <div className="font-mono uppercase text-xs tracking-[0.25em] text-neutral-500 mb-2">
                {artist.subtitle}
              </div>
              <h1 className="font-mono text-3xl font-extrabold tracking-tight break-words">
                {artist.name}
              </h1>
              <div className="text-sm text-neutral-400 mt-1">
                {tracks.length} track{tracks.length === 1 ? "" : "s"}
              </div>
              {trackIds.length > 0 && (
                <button
                  onClick={() => playAlbum(trackIds)}
                  className="mt-4 inline-flex items-center gap-2 accent-bg text-black font-semibold text-sm px-5 py-2.5 rounded-full hover:brightness-110"
                >
                  <Play size={14} fill="currentColor" />
                  Play all
                </button>
              )}
            </div>
          </div>

          {tracks.length === 0 ? (
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-12 text-center text-sm text-neutral-400">
              No playable tracks for this artist.
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
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end mb-8">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#1a1a1a] animate-pulse shrink-0" />
        <div className="flex-1 w-full">
          <div className="h-3 w-16 bg-[#1a1a1a] rounded animate-pulse mb-3" />
          <div className="h-8 w-64 bg-[#1a1a1a] rounded animate-pulse mb-3" />
          <div className="h-3 w-24 bg-[#161616] rounded animate-pulse" />
        </div>
      </div>
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-2 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-[#121212] rounded-md animate-pulse" />
        ))}
      </div>
    </div>
  );
}
