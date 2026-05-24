import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { tracks as allTracks } from "../data/mockData";
import type { Track } from "../data/mockData";

export type RepeatMode = "off" | "all" | "one";

export type LogEntry = {
  id: string;
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  playedAt: number; // epoch ms
};

export type Settings = {
  defaultShuffle: boolean;
  defaultRepeat: RepeatMode;
  defaultVolume: number;
};

type PlayerState = {
  // queue
  queue: string[]; // track ids in play order
  originalQueue: string[]; // pre-shuffle order
  currentIndex: number;
  // playback
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  // collections
  favorites: string[];
  logs: LogEntry[];
  // settings
  settings: Settings;
  accent: string;

  // actions
  resolveTrack: (id: string) => Track | null;
  registerTracks: (tracks: Track[]) => void;
  playTrack: (trackId: string, queueIds?: string[]) => void;
  playAlbum: (trackIds: string[], startId?: string) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (sec: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  clearLogs: () => void;
  setAccent: (hex: string) => void;
  updateSettings: (s: Partial<Settings>) => void;
  removeFromQueue: (index: number) => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const STORAGE_KEY = "koe:state:v1";

type Persisted = {
  favorites: string[];
  logs: LogEntry[];
  settings: Settings;
  accent: string;
  volume: number;
};

const defaultSettings: Settings = {
  defaultShuffle: false,
  defaultRepeat: "off",
  defaultVolume: 0.7,
};

const loadPersisted = (): Partial<Persisted> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Persisted;
  } catch {
    return {};
  }
};

export function PlayerProvider({ children }: { children: ReactNode }) {
  const persisted = useMemo(loadPersisted, []);
  const settings: Settings = { ...defaultSettings, ...(persisted.settings ?? {}) };

  const [queue, setQueue] = useState<string[]>([]);
  const [originalQueue, setOriginalQueue] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState<number>(
    persisted.volume ?? settings.defaultVolume,
  );
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(settings.defaultShuffle);
  const [repeat, setRepeat] = useState<RepeatMode>(settings.defaultRepeat);
  const [favorites, setFavorites] = useState<string[]>(persisted.favorites ?? []);
  const [logs, setLogs] = useState<LogEntry[]>(persisted.logs ?? []);
  const [settingsState, setSettingsState] = useState<Settings>(settings);
  const [accent, setAccentState] = useState<string>(persisted.accent ?? "#1ed760");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current && typeof Audio !== "undefined") {
    audioRef.current = new Audio();
    audioRef.current.preload = "metadata";
  }

  const trackCacheRef = useRef<Map<string, Track>>(
    new Map(allTracks.map((t) => [t.id, t])),
  );

  const currentTrack: Track | null =
    currentIndex >= 0 && currentIndex < queue.length
      ? (trackCacheRef.current.get(queue[currentIndex]) ?? null)
      : null;

  // Persist
  useEffect(() => {
    const data: Persisted = {
      favorites,
      logs,
      settings: settingsState,
      accent,
      volume,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [favorites, logs, settingsState, accent, volume]);

  // Apply accent to CSS
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", accent);
    // build a soft rgba
    const hex = accent.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    root.style.setProperty("--accent-soft", `rgba(${r}, ${g}, ${b}, 0.18)`);
  }, [accent]);

  // Audio element wiring
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onTime = () => setProgress(a.currentTime);
    const onLoaded = () => setDuration(a.duration || 0);
    const onEnded = () => {
      // handled below via state machine
      handleEnded();
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnded);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Volume + mute apply
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // Load src when current track changes
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!currentTrack) {
      a.pause();
      a.src = "";
      setProgress(0);
      setDuration(0);
      return;
    }
    if (currentTrack.audioUrl && a.src !== currentTrack.audioUrl) {
      a.src = currentTrack.audioUrl;
      a.load();
    }
    if (isPlaying) {
      void a.play().catch(() => setIsPlaying(false));
    }
    // log play
    setLogs((prev) => [
      {
        id: `${Date.now()}-${currentTrack.id}`,
        trackId: currentTrack.id,
        trackTitle: currentTrack.title,
        trackArtist: currentTrack.artist,
        playedAt: Date.now(),
      },
      ...prev,
    ].slice(0, 200));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  // Play/pause apply
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      void a.play().catch(() => setIsPlaying(false));
    } else {
      a.pause();
    }
  }, [isPlaying]);

  const handleEnded = useCallback(() => {
    setProgress(0);
    if (repeat === "one") {
      const a = audioRef.current;
      if (a) {
        a.currentTime = 0;
        void a.play().catch(() => {});
      }
      return;
    }
    setCurrentIndex((idx) => {
      const last = queue.length - 1;
      if (idx < last) return idx + 1;
      if (repeat === "all") return 0;
      setIsPlaying(false);
      return idx;
    });
  }, [queue, repeat]);

  const playTrack = useCallback(
    (trackId: string, queueIds?: string[]) => {
      const base = queueIds && queueIds.length ? queueIds : allTracks.map((t) => t.id);
      const startIdx = base.indexOf(trackId);
      const seedIdx = startIdx >= 0 ? startIdx : 0;
      let q = base;
      let oq = base;
      if (shuffle) {
        const rest = base.filter((id) => id !== trackId);
        q = [trackId, ...shuffleArray(rest)];
        oq = base;
      } else {
        q = base;
        oq = base;
      }
      setOriginalQueue(oq);
      setQueue(q);
      setCurrentIndex(shuffle ? 0 : seedIdx);
      setIsPlaying(true);
    },
    [shuffle],
  );

  const resolveTrack = useCallback(
    (id: string): Track | null => trackCacheRef.current.get(id) ?? null,
    [],
  );

  const registerTracks = useCallback((tracks: Track[]) => {
    for (const t of tracks) trackCacheRef.current.set(t.id, t);
  }, []);

  const playAlbum = useCallback(
    (trackIds: string[], startId?: string) => {
      const start = startId ?? trackIds[0];
      playTrack(start, trackIds);
    },
    [playTrack],
  );

  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      // start something
      if (allTracks.length) {
        playTrack(allTracks[0].id);
      }
      return;
    }
    setIsPlaying((p) => !p);
  }, [currentTrack, playTrack]);

  const next = useCallback(() => {
    setCurrentIndex((idx) => {
      if (idx < queue.length - 1) return idx + 1;
      if (repeat === "all") return 0;
      return idx;
    });
    setIsPlaying(true);
  }, [queue.length, repeat]);

  const prev = useCallback(() => {
    const a = audioRef.current;
    if (a && a.currentTime > 3) {
      a.currentTime = 0;
      return;
    }
    setCurrentIndex((idx) => (idx > 0 ? idx - 1 : 0));
    setIsPlaying(true);
  }, []);

  const seek = useCallback((sec: number) => {
    const a = audioRef.current;
    if (a) {
      a.currentTime = sec;
      setProgress(sec);
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.min(1, Math.max(0, v)));
    if (v > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => {
      const ns = !s;
      // rebuild queue
      if (queue.length && currentIndex >= 0) {
        const cur = queue[currentIndex];
        if (ns) {
          const rest = originalQueue.filter((id) => id !== cur);
          const shuffled = [cur, ...shuffleArray(rest)];
          setQueue(shuffled);
          setCurrentIndex(0);
        } else {
          const newIdx = originalQueue.indexOf(cur);
          setQueue(originalQueue);
          setCurrentIndex(newIdx >= 0 ? newIdx : 0);
        }
      }
      return ns;
    });
  }, [queue, currentIndex, originalQueue]);

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
  }, []);

  const toggleFavorite = useCallback((trackId: string) => {
    setFavorites((f) =>
      f.includes(trackId) ? f.filter((id) => id !== trackId) : [trackId, ...f],
    );
  }, []);

  const isFavorite = useCallback(
    (trackId: string) => favorites.includes(trackId),
    [favorites],
  );

  const clearLogs = useCallback(() => setLogs([]), []);

  const setAccent = useCallback((hex: string) => setAccentState(hex), []);

  const updateSettings = useCallback((s: Partial<Settings>) => {
    setSettingsState((cur) => {
      const merged = { ...cur, ...s };
      if (s.defaultShuffle !== undefined) setShuffle(s.defaultShuffle);
      if (s.defaultRepeat !== undefined) setRepeat(s.defaultRepeat);
      if (s.defaultVolume !== undefined) setVolumeState(s.defaultVolume);
      return merged;
    });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((q) => {
      const nq = [...q];
      nq.splice(index, 1);
      return nq;
    });
    setCurrentIndex((idx) => {
      if (index < idx) return idx - 1;
      return idx;
    });
  }, []);

  const value: PlayerState = {
    queue,
    originalQueue,
    currentIndex,
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    favorites,
    logs,
    settings: settingsState,
    accent,
    resolveTrack,
    registerTracks,
    playTrack,
    playAlbum,
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
    clearLogs,
    setAccent,
    updateSettings,
    removeFromQueue,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
