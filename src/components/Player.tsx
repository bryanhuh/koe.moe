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
  Video,
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
  const hasVideo = !!videoUrl;

  // Music videos are opt-in: the MV is a second download on top of the audio
  // stream, so on weak connections autoplaying it starves the audio. The choice
  // is a single global preference, remembered across sessions, default off.
  const [videoEnabled, setVideoEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("koe:mv") === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("koe:mv", videoEnabled ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [videoEnabled]);
  const showVideo = hasVideo && videoEnabled;

  // Transient hint shown after dropping back to cover art (manual or fallback).
  const [mvNotice, setMvNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!mvNotice) return;
    const t = setTimeout(() => setMvNotice(null), 5000);
    return () => clearTimeout(t);
  }, [mvNotice]);

  const enableVideo = () => {
    setMvNotice(null);
    setVideoEnabled(true);
  };
  const disableVideo = (notice?: string) => {
    setVideoEnabled(false);
    setMvNotice(notice ?? null);
  };

  // Bad-network guard: if the MV stalls for too long or errors, fall back to
  // audio-only so the video stops competing with the audio for bandwidth.
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearStallTimer = () => {
    if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    stallTimerRef.current = null;
  };
  const handleVideoWaiting = () => {
    clearStallTimer();
    stallTimerRef.current = setTimeout(() => {
      disableVideo("Music video paused to keep your audio smooth on this connection.");
    }, 7000);
  };
  const handleVideoError = () => {
    clearStallTimer();
    disableVideo("Couldn't load the music video — playing audio only.");
  };
  useEffect(() => () => clearStallTimer(), []);

  const syncVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    if (Math.abs(v.currentTime - progress) > 0.4) v.currentTime = progress;
    if (open && isPlaying) void v.play().catch(() => {});
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !showVideo) return;
    if (open && isPlaying) void v.play().catch(() => {});
    else v.pause();
  }, [open, isPlaying, showVideo, currentTrack?.id]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !showVideo || !open) return;
    // Don't reseek a video that's mid-seek/buffering — it just thrashes the
    // network. Catching up on the next tick is fine.
    if (!v.seeking && Math.abs(v.currentTime - progress) > 0.4) {
      v.currentTime = progress;
    }
  }, [progress, showVideo, open]);

  // ── Auto-hiding controls + tap-to-play (video layout only) ─────────────────
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealControls = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  };

  // Keep controls up while paused/closed; fade them out 3s after playback
  // (re)starts. Pointer movement and taps re-reveal them.
  useEffect(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setControlsVisible(true);
    if (!showVideo || !open || !isPlaying) return;
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isPlaying, showVideo, open]);

  // Tap the video: reveal hidden controls, otherwise toggle play/pause.
  const handleVideoTap = () => {
    if (!controlsVisible) revealControls();
    else togglePlay();
  };

  const fade = `transition-opacity duration-300 ${
    controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
  }`;

  // ── Cover → dock animation (video layout) ──────────────────────────────────
  // On open with an MV, the cover art shows large and centered as a loading
  // state. Once the video has buffered enough to play, the cover shrinks and
  // flies into the small box beside the track details, revealing the video.
  const dockRef = useRef<HTMLDivElement | null>(null);
  const [dockRect, setDockRect] = useState<DOMRect | null>(null);
  const [coverPhase, setCoverPhase] = useState<"hero" | "docking" | "docked">(
    "hero",
  );

  // Reset to the loading/hero state whenever a new MV opens; skip straight to
  // docked if the video is already buffered (e.g. reopening the same track).
  useEffect(() => {
    if (!open || !showVideo) return;
    const v = videoRef.current;
    setCoverPhase(v && v.readyState >= 3 ? "docked" : "hero");
  }, [open, showVideo, currentTrack?.id]);

  // Measure the dock slot, surface the controls so the cover lands somewhere
  // visible, then kick off the shrink transition.
  const startDockingIfHero = () => {
    const el = dockRef.current;
    if (el) setDockRect(el.getBoundingClientRect());
    revealControls();
    setCoverPhase((p) => (p === "hero" ? "docking" : p));
  };

  // Video can play through → begin docking.
  const handleCanPlay = () => {
    clearStallTimer();
    syncVideo();
    startDockingIfHero();
  };

  // Settle into the docked state once the shrink transition finishes.
  useEffect(() => {
    if (coverPhase !== "docking") return;
    const t = setTimeout(() => setCoverPhase("docked"), 760);
    return () => clearTimeout(t);
  }, [coverPhase]);

  // Safety net: if readiness never fires (slow network/error), dock anyway.
  useEffect(() => {
    if (!open || !showVideo || coverPhase !== "hero") return;
    const t = setTimeout(startDockingIfHero, 8000);
    return () => clearTimeout(t);
  }, [open, showVideo, coverPhase]);

  // Hero (large/centered) geometry plus the transform that lands it in the dock.
  const heroSize = Math.min(window.innerWidth * 0.7, window.innerHeight * 0.5, 380);
  const heroTop = window.innerHeight * 0.26;
  let dockTransform = "none";
  if (dockRect) {
    const scale = dockRect.width / heroSize;
    const tx = dockRect.left + dockRect.width / 2 - window.innerWidth / 2;
    const ty = dockRect.top + dockRect.height / 2 - (heroTop + heroSize / 2);
    dockTransform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  // Shared transport + seek + volume controls, rendered for both layouts.
  const transport = (
    <>
      {/* Seek bar */}
      <div className="mb-5">
        <div className="relative mb-2">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
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
        <div className="flex justify-between text-[10px] font-mono text-neutral-300">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={toggleShuffle}
          className={`p-2 transition-colors ${
            shuffle ? "accent-text" : "text-neutral-300 hover:text-white"
          }`}
          aria-label="Shuffle"
        >
          <Shuffle size={22} />
        </button>
        <button
          onClick={prev}
          className="text-neutral-200 hover:text-white p-2"
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
          className="text-neutral-200 hover:text-white p-2"
          aria-label="Next"
        >
          <SkipForward size={30} fill="currentColor" />
        </button>
        <button
          onClick={cycleRepeat}
          className={`p-2 transition-colors ${
            repeat !== "off" ? "accent-text" : "text-neutral-300 hover:text-white"
          }`}
          aria-label="Repeat"
        >
          {repeat === "one" ? <Repeat1 size={22} /> : <Repeat size={22} />}
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMute}
          className="text-neutral-300 hover:text-white"
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
    </>
  );

  const titleRow = (
    <div className="flex items-end gap-4 mb-5">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold text-white truncate drop-shadow">
          {currentTrack?.title ?? "—"}
        </h2>
        <p className="text-sm text-neutral-300 mt-0.5 truncate drop-shadow">
          {currentTrack?.artist ?? ""}
        </p>
      </div>
      {currentTrack && (
        <button
          onClick={() => toggleFavorite(currentTrack.id)}
          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
            isFavorite(currentTrack.id) ? "accent-text" : "text-neutral-200"
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
  );

  // Title row for the video layout — includes the dock slot the cover flies into.
  const videoTitleRow = (
    <div className="flex items-center gap-4 mb-5">
      <div
        ref={dockRef}
        className="w-16 h-16 rounded-lg overflow-hidden bg-black/30 border border-white/15 shadow-lg shrink-0"
      >
        {coverPhase === "docked" && currentTrack?.coverUrl && (
          <img
            src={currentTrack.coverUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold text-white truncate drop-shadow">
          {currentTrack?.title ?? "—"}
        </h2>
        <p className="text-sm text-neutral-300 mt-0.5 truncate drop-shadow">
          {currentTrack?.artist ?? ""}
        </p>
      </div>
      {currentTrack && (
        <button
          onClick={() => toggleFavorite(currentTrack.id)}
          className={`p-2 rounded-full hover:bg-white/10 transition-colors shrink-0 ${
            isFavorite(currentTrack.id) ? "accent-text" : "text-neutral-200"
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
  );

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#090909] transition-transform duration-300 ease-in-out ${
        open ? "translate-y-0" : "translate-y-full pointer-events-none"
      } ${showVideo ? "" : "flex flex-col"}`}
      aria-hidden={!open}
    >
      {showVideo ? (
        /* ── Immersive video layout (MV plays full-screen behind controls) ── */
        <div
          className={`absolute inset-0 ${controlsVisible ? "" : "cursor-none"}`}
          onPointerMove={revealControls}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            poster={currentTrack?.coverUrl || undefined}
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={syncVideo}
            onCanPlay={handleCanPlay}
            onPlaying={clearStallTimer}
            onWaiting={handleVideoWaiting}
            onError={handleVideoError}
            onClick={handleVideoTap}
            className={`absolute inset-0 w-full h-full object-cover bg-black cursor-pointer transition-opacity duration-700 ${
              coverPhase === "hero" ? "opacity-0" : "opacity-100"
            }`}
          />
          {/* Gradient scrim: darkens top (header) and bottom (controls) */}
          <div
            className={`absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/95 pointer-events-none ${fade}`}
          />

          {/* Header over the video */}
          <div
            className={`absolute top-0 inset-x-0 z-10 flex items-center justify-between px-6 pt-6 ${fade}`}
          >
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
              aria-label="Collapse"
            >
              <ChevronDown size={20} />
            </button>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/80">
              Now Playing
            </span>
            <button
              onClick={() => disableVideo()}
              className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-colors"
              aria-pressed={true}
              aria-label="Switch to cover art"
            >
              <Video size={11} /> MV
            </button>
          </div>

          {/* Full-width controls anchored at the bottom */}
          <div
            className={`absolute inset-x-0 bottom-0 z-10 px-6 md:px-10 pb-10 pt-24 ${fade}`}
          >
            <div className="max-w-3xl mx-auto w-full">
              {videoTitleRow}
              {transport}
            </div>
          </div>

          {/* Cover art: shown large while the MV buffers, then flies into the
              dock slot. Removed once docked (the dock slot renders it instead). */}
          {currentTrack?.coverUrl && coverPhase !== "docked" && (
            <>
              <img
                src={currentTrack.coverUrl}
                alt=""
                aria-hidden
                className="absolute z-20 rounded-2xl object-cover shadow-2xl pointer-events-none"
                style={{
                  left: (window.innerWidth - heroSize) / 2,
                  top: heroTop,
                  width: heroSize,
                  height: heroSize,
                  transform: coverPhase === "hero" ? "none" : dockTransform,
                  transformOrigin: "center center",
                  transition:
                    coverPhase === "docking"
                      ? "transform 720ms cubic-bezier(0.22, 1, 0.36, 1)"
                      : "none",
                  willChange: "transform",
                }}
              />
              {coverPhase === "hero" && (
                <div
                  className="absolute z-20 inset-x-0 text-center pointer-events-none"
                  style={{ top: heroTop + heroSize + 24 }}
                >
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/60 animate-pulse">
                    Preparing music video
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* ── Standard centered layout (cover art) ── */
        <>
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
            {hasVideo ? (
              <button
                onClick={enableVideo}
                className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
                aria-pressed={false}
                aria-label="Watch music video"
              >
                <Video size={11} /> MV
              </button>
            ) : (
              <div className="w-9" />
            )}
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col px-8 py-4 max-w-[480px] mx-auto w-full">
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
            {titleRow}
            {transport}
          </div>

          {mvNotice && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 max-w-[90%] px-4 py-2 rounded-full bg-black/80 border border-white/10 text-xs text-neutral-200 text-center shadow-lg">
              {mvNotice}
            </div>
          )}
        </>
      )}
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
