import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { usePlayer } from "./PlayerContext";
import type { Track } from "../data/mockData";

// ─── Listening-together rooms ────────────────────────────────────────────────
// A party is one Realtime channel `room:<code>` carrying:
//   • Presence  — who's here (drives the listener list + host election)
//   • Broadcast — `sync` (host playback state), `request_sync`, `ended`
// The host's player is the source of truth; participants mirror it via
// player.syncTo. A durable `listening_rooms` row seeds late joiners and lets a
// stale host be detected for promotion (see claim_host RPC).

export type Participant = {
  userId: string;
  username: string;
  avatarUrl: string | null;
  isHost: boolean;
  joinedAt: number;
};

export type RoomStatus = "idle" | "connecting" | "connected" | "error";

type SyncPayload = {
  track: Track;
  positionMs: number;
  isPlaying: boolean;
  sentAt: number;
};

type RoomState = {
  code: string | null;
  isHost: boolean;
  isInRoom: boolean;
  participants: Participant[];
  hostUsername: string | null;
  unplayable: boolean;
  status: RoomStatus;
  error: string | null;
  startParty: () => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
};

const RoomContext = createContext<RoomState | null>(null);

const HEARTBEAT_MS = 2500; // broadcast cadence (also covers seeks within 2.5s)
const DB_HEARTBEAT_MS = 10000; // room-row refresh; staleness threshold is 12s

const generateCode = () => Math.random().toString(36).slice(2, 8);

export function RoomProvider({ children }: { children: ReactNode }) {
  const { user, openSignupWall } = useAuth();
  const { currentTrack, isPlaying, progress, syncTo } = usePlayer();

  const [code, setCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [unplayable, setUnplayable] = useState(false);
  const [status, setStatus] = useState<RoomStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const isHostRef = useRef(false);
  const codeRef = useRef<string | null>(null);
  const joinedAtRef = useRef(0);
  const profileRef = useRef<{
    username: string;
    avatarUrl: string | null;
  } | null>(null);

  // Latest player snapshot, read by interval broadcasts without re-arming them.
  const snapRef = useRef({ currentTrack, isPlaying, progress });
  useEffect(() => {
    snapRef.current = { currentTrack, isPlaying, progress };
  });
  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const loadProfile = useCallback(async () => {
    if (profileRef.current || !user) return;
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();
    profileRef.current = {
      username: (data?.username as string) ?? "listener",
      avatarUrl: (data?.avatar_url as string | null) ?? null,
    };
  }, [user]);

  const presencePayload = useCallback(
    (asHost: boolean): Participant => ({
      userId: user?.id ?? "",
      username: profileRef.current?.username ?? "listener",
      avatarUrl: profileRef.current?.avatarUrl ?? null,
      isHost: asHost,
      joinedAt: joinedAtRef.current,
    }),
    [user],
  );

  const broadcastSync = useCallback(() => {
    const ch = channelRef.current;
    const snap = snapRef.current;
    if (!ch || !snap.currentTrack) return;
    const payload: SyncPayload = {
      track: snap.currentTrack,
      positionMs: Math.round(snap.progress * 1000),
      isPlaying: snap.isPlaying,
      sentAt: Date.now(),
    };
    void ch.send({ type: "broadcast", event: "sync", payload });
  }, []);

  const dbHeartbeat = useCallback(() => {
    const c = codeRef.current;
    const snap = snapRef.current;
    if (!c || !user) return;
    void supabase
      .from("listening_rooms")
      .update({
        track_id: snap.currentTrack?.id ?? null,
        track_payload: snap.currentTrack ?? null,
        position_ms: Math.round(snap.progress * 1000),
        is_playing: snap.isPlaying,
        updated_at: new Date().toISOString(),
      })
      .eq("code", c)
      .eq("host_id", user.id);
  }, [user]);

  const handleSync = useCallback(
    (payload: SyncPayload) => {
      if (isHostRef.current) return; // host never follows
      const { track, positionMs, isPlaying: playing, sentAt } = payload;
      const target = positionMs + (playing ? Date.now() - sentAt : 0);
      setUnplayable(track.source === "local");
      syncTo(track, target, playing);
    },
    [syncTo],
  );

  const cleanup = useCallback(() => {
    const ch = channelRef.current;
    if (ch) void supabase.removeChannel(ch);
    channelRef.current = null;
    isHostRef.current = false;
    codeRef.current = null;
    setCode(null);
    setIsHost(false);
    setParticipants([]);
    setUnplayable(false);
    setStatus("idle");
  }, []);

  const claimHost = useCallback(async () => {
    const ch = channelRef.current;
    const c = codeRef.current;
    if (!ch || !c) return;
    // Succeeds only if the room's host heartbeat is stale (RPC guard).
    const { data } = await supabase.rpc("claim_host", { p_code: c });
    if (data) {
      isHostRef.current = true;
      setIsHost(true);
      setUnplayable(false);
      await ch.track(presencePayload(true));
      broadcastSync();
    }
  }, [presencePayload, broadcastSync]);

  const handlePresence = useCallback(() => {
    const ch = channelRef.current;
    if (!ch || !user) return;
    const state = ch.presenceState<Participant>();
    const members = Object.values(state).flat() as Participant[];
    setParticipants(members);

    // Promotion: nobody is flagged host → the earliest joiner claims it.
    const hostPresent = members.some((m) => m.isHost);
    if (!hostPresent && !isHostRef.current) {
      const earliest = [...members].sort((a, b) => a.joinedAt - b.joinedAt)[0];
      if (earliest && earliest.userId === user.id) void claimHost();
    }
  }, [user, claimHost]);

  const subscribeChannel = useCallback(
    (roomCode: string, asHost: boolean) => {
      const ch = supabase.channel(`room:${roomCode}`, {
        config: {
          presence: { key: user?.id ?? "" },
          broadcast: { self: false },
        },
      });
      ch.on("presence", { event: "sync" }, handlePresence);
      ch.on("broadcast", { event: "sync" }, ({ payload }) =>
        handleSync(payload as SyncPayload),
      );
      ch.on("broadcast", { event: "request_sync" }, () => {
        if (isHostRef.current) broadcastSync();
      });
      ch.on("broadcast", { event: "ended" }, () => {
        if (!isHostRef.current) cleanup();
      });
      ch.subscribe(async (st) => {
        if (st === "SUBSCRIBED") {
          await ch.track(presencePayload(asHost));
          if (!asHost) {
            void ch.send({
              type: "broadcast",
              event: "request_sync",
              payload: {},
            });
          }
          setStatus("connected");
        } else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT") {
          setStatus("error");
        }
      });
      channelRef.current = ch;
    },
    [user, handlePresence, handleSync, broadcastSync, cleanup, presencePayload],
  );

  const startParty = useCallback(async () => {
    if (!user) {
      openSignupWall();
      return;
    }
    const snap = snapRef.current;
    setStatus("connecting");
    setError(null);
    await loadProfile();
    const roomCode = generateCode();
    const { error: insErr } = await supabase.from("listening_rooms").insert({
      code: roomCode,
      host_id: user.id,
      track_id: snap.currentTrack?.id ?? null,
      track_payload: snap.currentTrack ?? null,
      position_ms: Math.round(snap.progress * 1000),
      is_playing: snap.isPlaying,
    });
    if (insErr) {
      setError(insErr.message);
      setStatus("error");
      return;
    }
    joinedAtRef.current = Date.now();
    codeRef.current = roomCode;
    isHostRef.current = true;
    setCode(roomCode);
    setIsHost(true);
    subscribeChannel(roomCode, true);
  }, [user, openSignupWall, loadProfile, subscribeChannel]);

  const joinRoom = useCallback(
    async (roomCode: string) => {
      if (!user) {
        openSignupWall();
        return;
      }
      if (codeRef.current === roomCode) return; // already in this room
      setStatus("connecting");
      setError(null);
      await loadProfile();
      const { data: row, error: selErr } = await supabase
        .from("listening_rooms")
        .select("*")
        .eq("code", roomCode)
        .maybeSingle();
      if (selErr) {
        setError(selErr.message);
        setStatus("error");
        return;
      }
      if (!row) {
        setError("Party not found.");
        setStatus("error");
        return;
      }
      const r = row as {
        host_id: string;
        track_payload: Track | null;
        position_ms: number;
        is_playing: boolean;
      };
      const amHost = r.host_id === user.id;
      joinedAtRef.current = Date.now();
      codeRef.current = roomCode;
      isHostRef.current = amHost;
      setCode(roomCode);
      setIsHost(amHost);
      if (!amHost && r.track_payload) {
        setUnplayable(r.track_payload.source === "local");
        syncTo(r.track_payload, r.position_ms, r.is_playing);
      }
      subscribeChannel(roomCode, amHost);
    },
    [user, openSignupWall, loadProfile, subscribeChannel, syncTo],
  );

  const leaveRoom = useCallback(async () => {
    const c = codeRef.current;
    if (isHostRef.current && c && user) {
      // Explicit end: tell everyone and remove the room.
      void channelRef.current?.send({
        type: "broadcast",
        event: "ended",
        payload: {},
      });
      await supabase
        .from("listening_rooms")
        .delete()
        .eq("code", c)
        .eq("host_id", user.id);
    }
    cleanup();
  }, [user, cleanup]);

  // Host: broadcast immediately on track change / play-pause toggle.
  useEffect(() => {
    if (!isHost || !code) return;
    broadcastSync();
  }, [isHost, code, currentTrack?.id, isPlaying, broadcastSync]);

  // Host: periodic broadcast + durable room-row heartbeat.
  useEffect(() => {
    if (!isHost || !code) return;
    const bc = setInterval(broadcastSync, HEARTBEAT_MS);
    const db = setInterval(dbHeartbeat, DB_HEARTBEAT_MS);
    return () => {
      clearInterval(bc);
      clearInterval(db);
    };
  }, [isHost, code, broadcastSync, dbHeartbeat]);

  // Tear the channel down if the provider unmounts.
  useEffect(
    () => () => {
      if (channelRef.current) void supabase.removeChannel(channelRef.current);
    },
    [],
  );

  const hostUsername = participants.find((p) => p.isHost)?.username ?? null;

  const value: RoomState = {
    code,
    isHost,
    isInRoom: code !== null,
    participants,
    hostUsername,
    unplayable,
    status,
    error,
    startParty,
    joinRoom,
    leaveRoom,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within RoomProvider");
  return ctx;
}
