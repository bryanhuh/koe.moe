import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Volume1,
  ListMusic,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  const [fullscreen, setFullscreen] = useState(false);

  // Fullscreen toggle on root
  useEffect(() => {
    if (fullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    const onChange = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [fullscreen]);

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="h-[88px] bg-[#0b0b0b] border-t border-[#1a1a1a] grid grid-cols-[1fr_2fr_1fr] items-center px-4 gap-4 relative">
      {/* Left: track info */}
      <div className="flex items-center gap-3 min-w-0">
        {currentTrack ? (
          <>
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.album}
              className="w-14 h-14 rounded object-cover bg-[#1a1a1a]"
            />
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {currentTrack.title}
              </div>
              <div className="text-xs text-neutral-400 truncate">
                {currentTrack.artist}
              </div>
            </div>
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className={`ml-2 p-1.5 rounded hover:bg-[#1a1a1a] transition-colors ${
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
            <div className="w-14 h-14 rounded bg-[#1a1a1a]" />
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
            title="Shuffle"
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
            title={`Repeat: ${repeat}`}
          >
            {repeat === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>

        <div className="flex items-center gap-3 w-full max-w-[560px]">
          <span className="text-[10px] font-mono text-neutral-500 w-9 text-right">
            {formatTime(progress)}
          </span>
          <div className="flex-1 group relative">
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

      {/* Right: volume + queue + fullscreen */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => setShowQueue((s) => !s)}
          className={`p-1.5 rounded hover:bg-[#1a1a1a] transition-colors ${
            showQueue ? "accent-text" : "text-neutral-400"
          }`}
          aria-label="Queue"
          title="Queue"
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
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="p-1.5 rounded hover:bg-[#1a1a1a] text-neutral-400 hover:text-white transition-colors"
          aria-label="Fullscreen"
          title="Fullscreen"
        >
          {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {showQueue && <QueuePopover onClose={() => setShowQueue(false)} />}
    </div>
  );
}

function QueuePopover({ onClose }: { onClose: () => void }) {
  const { queue, currentIndex, playTrack, removeFromQueue } = usePlayer();
  return (
    <div className="absolute right-4 bottom-[96px] w-[340px] max-h-[60vh] overflow-y-auto bg-[#121212] border border-[#222] rounded-lg shadow-2xl z-50">
      <div className="px-4 py-3 border-b border-[#222] flex items-center justify-between">
        <h3 className="text-sm font-mono uppercase tracking-wide text-neutral-300">
          Queue · {queue.length}
        </h3>
        <button
          onClick={onClose}
          className="text-xs text-neutral-500 hover:text-white"
        >
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

import { trackById } from "../data/mockData";
import { X } from "lucide-react";

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
  const t = trackById(trackId);
  if (!t) return null;
  return (
    <li
      className={`flex items-center gap-3 px-4 py-2 group cursor-pointer hover:bg-[#1a1a1a] ${
        active ? "accent-soft-bg" : ""
      }`}
      onClick={onPlay}
    >
      <span className="text-[10px] font-mono text-neutral-500 w-5">{index + 1}</span>
      <img src={t.coverUrl} className="w-9 h-9 rounded object-cover" alt="" />
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
