import { Play, Heart, Pause, Music, Video } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import type { Track } from "../data/mockData";
import { formatTime } from "../data/mockData";

const SOURCE_LABELS: Record<NonNullable<Track["source"]>, string> = {
  local: "Local",
  itunes: "iTunes",
  animethemes: "Anime",
};

function SourceBadge({
  source,
  preview,
  hasVideo,
}: {
  source: Track["source"];
  preview?: boolean;
  hasVideo?: boolean;
}) {
  if (!source || source === "local") return null;
  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      <span className="inline-block text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#1a1a1a] border border-[#222] text-neutral-500">
        {SOURCE_LABELS[source]}
      </span>
      {preview && (
        <span className="inline-block text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#1a1a1a] border border-[#222] text-amber-500/70">
          30s
        </span>
      )}
      {hasVideo && (
        <span
          className="inline-flex items-center gap-0.5 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#1a1a1a] border border-[#222] accent-text"
          title="Music video available"
        >
          <Video size={9} />
          MV
        </span>
      )}
    </span>
  );
}

type Variant = "card" | "row";

export function TrackCard({
  track,
  variant = "card",
  queueIds,
  index,
}: {
  track: Track;
  variant?: Variant;
  queueIds?: string[];
  index?: number;
}) {
  const {
    playTrack,
    togglePlay,
    currentTrack,
    isPlaying,
    toggleFavorite,
    isFavorite,
  } = usePlayer();
  const { requireAuth } = useAuth();
  const isCurrent = currentTrack?.id === track.id;
  const showPause = isCurrent && isPlaying;

  const handlePlay = () => {
    if (isCurrent) togglePlay();
    else playTrack(track.id, queueIds);
  };

  if (variant === "row") {
    return (
      <div
        className={`group grid grid-cols-[40px_1fr_auto_24px] md:grid-cols-[24px_56px_1fr_1fr_auto_auto_24px] gap-2 md:gap-4 items-center px-3 py-2 rounded-md hover:bg-[#161616] cursor-pointer ${
          isCurrent ? "accent-soft-bg" : ""
        }`}
        onClick={handlePlay}
      >
        <span className="hidden md:block text-[11px] font-mono text-neutral-500">
          {(index ?? 0) + 1}
        </span>
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt=""
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-[#1a1a1a] flex items-center justify-center">
            <Music size={14} className="text-neutral-600" />
          </div>
        )}
        <div className="min-w-0">
          <div
            className={`text-sm truncate ${isCurrent ? "accent-text" : "text-white"}`}
          >
            {track.title}
          </div>
          <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
        </div>
        <div className="hidden md:block text-xs text-neutral-400 truncate">{track.album}</div>
        <span className="hidden md:block"><SourceBadge source={track.source} preview={track.preview} hasVideo={!!track.videoUrl} /></span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            requireAuth(() => toggleFavorite(track.id));
          }}
          className={`opacity-0 group-hover:opacity-100 ${
            isFavorite(track.id) ? "accent-text opacity-100" : "text-neutral-400"
          }`}
          aria-label="Favorite"
        >
          <Heart size={14} fill={isFavorite(track.id) ? "currentColor" : "none"} />
        </button>
        <span className="text-[11px] font-mono text-neutral-500">
          {formatTime(track.duration)}
        </span>
      </div>
    );
  }

  return (
    <div className="group bg-[#121212] border border-[#1a1a1a] p-4 rounded-lg hover:bg-[#161616] transition-colors">
      <div className="relative mb-3">
        <img
          src={track.coverUrl}
          alt={track.album}
          className="w-full aspect-square object-cover rounded-md"
        />
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-10 h-10 accent-bg text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg"
          aria-label={showPause ? "Pause" : "Play"}
        >
          {showPause ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" className="translate-x-[1px]" />
          )}
        </button>
      </div>
      <div
        className={`text-sm font-medium truncate ${
          isCurrent ? "accent-text" : "text-white"
        }`}
      >
        {track.title}
      </div>
      <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
      <SourceBadge source={track.source} preview={track.preview} hasVideo={!!track.videoUrl} />
    </div>
  );
}
