import {
  ChevronDown,
  ChevronUp,
  Heart,
  ListMusic,
  Music,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { formatTime } from "../data/mockData";

export function Player() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleFavorite,
    isFavorite,
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const VolumeIcon =
    muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      <NowPlayingView open={nowPlayingOpen} onClose={() => setNowPlayingOpen(false)} />

      <div className="h-[88px] bg-[#0b0b0b] border-t border-[#1a1a1a] grid grid-cols-[1fr_2fr_1fr] items-center px-4 gap-4 relative z-10">
        {/* Left: track info — click to expand Now Playing */}
        <div className="flex items-center gap-3 min-w-0">
          {currentTrack ? (
            <>
              <button
                onClick={() => setNowPlayingOpen(true)}
                className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-75 transition-opacity text-left"
                aria-label="Expand Now Playing"
              >
                {currentTrack.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.album}
                    className="w-14 h-14 rounded object-cover bg-[#1a1a1a] shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded bg-[#1a1a1a] flex items-center justify-center shrink-0">
                    <Music size={20} className="text-neutral-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white truncate">
                    {currentTrack.title}
                  </div>
                  <div className="text-xs text-neutral-400 truncate">
                    {currentTrack.artist}
                  </div>
                </div>
                <ChevronUp size={13} className="text-neutral-600 shrink-0" />
              </button>
              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className={`ml-1 p-1.5 rounded hover:bg-[#1a1a1a] transition-colors shrink-0 ${
                  isFavorite(currentTrack.id) ? "accent-text" : "text-neutral-400"
                }`}
                aria-label="Toggle favorite"
              >
                <Heart
                  size={16}
                  fill={isFavorite(currentTrack.id) ? "currentColor" : "none"}
                />
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded bg-[#1a1a1a] shrink-0" />
              <div className="text-xs text-neutral-500 font-mono">No track playing</div>
            </>
          )}
        </div>

        {/* Center: controls */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${
                shuffle ? "accent-text" : "text-neutral-400 hover:text-white"
              }`}
              aria-label="Toggle shuffle"
            >
              <Shuffle size={16} />
            </button>
            <button
              onClick={prev}
              className="text-neutral-300 hover:text-white"
              aria-label="Previous"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="translate-x-[1px]" />
              )}
            </button>
            <button
              onClick={next}
              className="text-neutral-300 hover:text-white"
              aria-label="Next"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button
              onClick={cycleRepeat}
              className={`transition-colors ${
                repeat !== "off" ? "accent-text" : "text-neutral-400 hover:text-white"
              }`}
              aria-label="Cycle repeat"
            >
              {repeat === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          <div className="flex items-center gap-3 w-full max-w-[560px]">
            <span className="text-[10px] font-mono text-neutral-500 w-9 text-right">
              {formatTime(progress)}
            </span>
            <div className="flex-1 relative">
              <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div
                  className="h-full accent-bg transition-[width] duration-100"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={progress}
                onChange={(e) => seek(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Seek"
              />
            </div>
            <span className="text-[10px] font-mono text-neutral-500 w-9">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: volume + queue */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setShowQueue((s) => !s)}
            className={`p-1.5 rounded hover:bg-[#1a1a1a] transition-colors ${
              showQueue ? "accent-text" : "text-neutral-400"
            }`}
            aria-label="Queue"
          >
            <ListMusic size={16} />
          </button>
          <button
            onClick={toggleMute}
            className="text-neutral-400 hover:text-white"
            aria-label="Mute"
          >
            <VolumeIcon size={16} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="koe-range w-24"
            aria-label="Volume"
          />
        </div>

        {showQueue && <QueuePopover onClose={() => setShowQueue(false)} />}
      </div>
    </>
  );
}

// ─── Now Playing expanded view ───────────────────────────────────────────────

function NowPlayingView({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleFavorite,
    isFavorite,
  } = usePlayer();

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const VolumeIcon =
    muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  // ── Music video (AnimeThemes) ──────────────────────────────────────────────
  // The audio engine stays the single source of truth. The MV is a muted
  // <video> mirrored to the audio's play state and position so it never
  // double-plays sound and stays roughly in sync (incl. after seeks).
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoUrl = currentTrack?.videoUrl;

  const syncVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    if (Math.abs(v.currentTime - progress) > 0.4) v.currentTime = progress;
    if (open && isPlaying) void v.play().catch(() => {});
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoUrl) return;
    if (open && isPlaying) void v.play().catch(() => {});
    else v.pause();
  }, [open, isPlaying, videoUrl, currentTrack?.id]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoUrl || !open) return;
    if (Math.abs(v.currentTime - progress) > 0.4) v.currentTime = progress;
  }, [progress, videoUrl, open]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#090909] flex flex-col transition-transform duration-300 ease-in-out ${
        open ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#1a1a1a] text-neutral-400 hover:text-white transition-colors"
          aria-label="Collapse"
        >
          <ChevronDown size={20} />
        </button>
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400">
          Now Playing
        </span>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col px-8 py-4 max-w-[480px] mx-auto w-full">
        {/* Cover — or the music video for AnimeThemes tracks */}
        {videoUrl ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black mb-8 shadow-2xl shrink-0">
            <video
              ref={videoRef}
              src={videoUrl}
              poster={currentTrack?.coverUrl || undefined}
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={syncVideo}
              className="w-full h-full object-contain bg-black"
            />
            <span className="absolute top-2 right-2 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/60 border border-white/15 text-white/80">
              MV
            </span>
          </div>
        ) : (
          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#1a1a1a] mb-8 shadow-2xl shrink-0">
            {currentTrack?.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music size={72} className="text-neutral-700" />
              </div>
            )}
          </div>
        )}

        {/* Track info + favorite */}
        <div className="flex items-start gap-4 mb-6 shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white truncate">
              {currentTrack?.title ?? "—"}
            </h2>
            <p className="text-sm text-neutral-400 mt-0.5 truncate">
              {currentTrack?.artist ?? ""}
            </p>
          </div>
          {currentTrack && (
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className={`mt-1 p-2 rounded-full hover:bg-[#1a1a1a] transition-colors ${
                isFavorite(currentTrack.id) ? "accent-text" : "text-neutral-400"
              }`}
              aria-label="Toggle favorite"
            >
              <Heart
                size={22}
                fill={isFavorite(currentTrack.id) ? "currentColor" : "none"}
              />
            </button>
          )}
        </div>

        {/* Seek bar */}
        <div className="mb-6 shrink-0">
          <div className="relative mb-2">
            <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div className="h-full accent-bg" style={{ width: `${pct}%` }} />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Seek"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-neutral-500">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${
              shuffle ? "accent-text" : "text-neutral-400 hover:text-white"
            }`}
            aria-label="Shuffle"
          >
            <Shuffle size={22} />
          </button>
          <button
            onClick={prev}
            className="text-neutral-300 hover:text-white p-2"
            aria-label="Previous"
          >
            <SkipBack size={30} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} fill="currentColor" className="translate-x-0.5" />
            )}
          </button>
          <button
            onClick={next}
            className="text-neutral-300 hover:text-white p-2"
            aria-label="Next"
          >
            <SkipForward size={30} fill="currentColor" />
          </button>
          <button
            onClick={cycleRepeat}
            className={`p-2 transition-colors ${
              repeat !== "off" ? "accent-text" : "text-neutral-400 hover:text-white"
            }`}
            aria-label="Repeat"
          >
            {repeat === "one" ? <Repeat1 size={22} /> : <Repeat size={22} />}
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleMute}
            className="text-neutral-400 hover:text-white"
            aria-label="Mute"
          >
            <VolumeIcon size={18} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="koe-range flex-1"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Queue popover ────────────────────────────────────────────────────────────

function QueuePopover({ onClose }: { onClose: () => void }) {
  const { queue, currentIndex, playTrack, removeFromQueue } = usePlayer();
  return (
    <div className="absolute right-4 bottom-[96px] w-[340px] max-h-[60vh] overflow-y-auto bg-[#121212] border border-[#222] rounded-lg shadow-2xl z-50">
      <div className="px-4 py-3 border-b border-[#222] flex items-center justify-between">
        <h3 className="text-sm font-mono uppercase tracking-wide text-neutral-300">
          Queue · {queue.length}
        </h3>
        <button onClick={onClose} className="text-xs text-neutral-500 hover:text-white">
          Close
        </button>
      </div>
      {queue.length === 0 && (
        <div className="px-4 py-6 text-sm text-neutral-500">Queue is empty.</div>
      )}
      <ul>
        {queue.map((id, idx) => (
          <QueueRow
            key={`${id}-${idx}`}
            trackId={id}
            index={idx}
            active={idx === currentIndex}
            onPlay={() => playTrack(id, queue)}
            onRemove={() => removeFromQueue(idx)}
          />
        ))}
      </ul>
    </div>
  );
}

function QueueRow({
  trackId,
  index,
  active,
  onPlay,
  onRemove,
}: {
  trackId: string;
  index: number;
  active: boolean;
  onPlay: () => void;
  onRemove: () => void;
}) {
  const { resolveTrack } = usePlayer();
  const t = resolveTrack(trackId);
  if (!t) return null;
  return (
    <li
      className={`flex items-center gap-3 px-4 py-2 group cursor-pointer hover:bg-[#1a1a1a] ${
        active ? "accent-soft-bg" : ""
      }`}
      onClick={onPlay}
    >
      <span className="text-[10px] font-mono text-neutral-500 w-5">{index + 1}</span>
      {t.coverUrl ? (
        <img src={t.coverUrl} className="w-9 h-9 rounded object-cover shrink-0" alt="" />
      ) : (
        <div className="w-9 h-9 rounded bg-[#1a1a1a] flex items-center justify-center shrink-0">
          <Music size={14} className="text-neutral-600" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className={`text-sm truncate ${active ? "accent-text" : "text-white"}`}>
          {t.title}
        </div>
        <div className="text-xs text-neutral-400 truncate">{t.artist}</div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-white"
        aria-label="Remove from queue"
      >
        <X size={14} />
      </button>
    </li>
  );
}
