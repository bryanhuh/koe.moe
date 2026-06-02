import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Play, User } from "lucide-react";
import { TrackCard } from "../components/TrackCard";
import { usePlayer } from "../context/PlayerContext";
import { getArtistProfile, type ArtistProfile } from "../lib/sources/artists";
import type { SourceId } from "../lib/sources/index";

const SOURCE_LABELS: Record<SourceId, string> = {
  itunes: "iTunes",
  animethemes: "AnimeThemes",
};

export default function ArtistDetail() {
  const { artistId } = useParams<{ artistId: string }>();
  const { playAlbum, registerTracks } = usePlayer();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [active, setActive] = useState<SourceId | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artistId) return;
    let cancelled = false;
    setLoading(true);
    getArtistProfile(artistId).then((result) => {
      if (cancelled) return;
      if (result) {
        // Register every source's tracks so playback resolves across tabs.
        for (const s of result.sources) registerTracks(s.tracks);
        setProfile(result);
        const hasPrimary = result.sources.some((s) => s.source === result.primary);
        setActive(hasPrimary ? result.primary : result.sources[0].source);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [artistId, registerTracks]);

  const tracks = useMemo(
    () => profile?.sources.find((s) => s.source === active)?.tracks ?? [],
    [profile, active],
  );
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

      {!loading && !profile && (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <User size={30} className="text-neutral-700 mb-4" />
          <p className="text-sm text-neutral-300">Couldn't find this artist.</p>
          <Link to="/artists" className="text-xs accent-text mt-2">
            Back to Artists
          </Link>
        </div>
      )}

      {!loading && profile && active && (
        <>
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end mb-8">
            {profile.imageUrl ? (
              <img
                src={profile.imageUrl}
                alt={profile.name}
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover bg-[#1a1a1a] shadow-xl shrink-0"
              />
            ) : (
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <User size={48} className="text-neutral-700" />
              </div>
            )}
            <div className="min-w-0 text-center sm:text-left">
              <div className="font-mono uppercase text-xs tracking-[0.25em] text-neutral-500 mb-2">
                Artist
              </div>
              <h1 className="font-mono text-3xl font-extrabold tracking-tight break-words">
                {profile.name}
              </h1>
              <div className="text-sm text-neutral-400 mt-1">
                {tracks.length} track{tracks.length === 1 ? "" : "s"}
                {profile.sources.length > 1 ? ` · on ${SOURCE_LABELS[active]}` : ""}
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

          {/* Source tabs — only when the artist has songs on more than one source. */}
          {profile.sources.length > 1 && (
            <div className="flex items-center gap-2 border-b border-[#1a1a1a] mb-4">
              {profile.sources.map((s) => {
                const isActive = s.source === active;
                return (
                  <button
                    key={s.source}
                    onClick={() => setActive(s.source)}
                    className={`px-4 py-2 -mb-px text-sm border-b-2 transition-colors ${
                      isActive
                        ? "accent-text border-current"
                        : "text-neutral-400 border-transparent hover:text-neutral-200"
                    }`}
                  >
                    {SOURCE_LABELS[s.source]}{" "}
                    <span className="text-neutral-600">({s.tracks.length})</span>
                  </button>
                );
              })}
            </div>
          )}

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
