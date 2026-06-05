import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LogOut, Music, Radio, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import { useRoom } from "../context/RoomContext";
import type { Participant } from "../context/RoomContext";

export default function Room() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { currentTrack } = usePlayer();
  const {
    isHost,
    isInRoom,
    participants,
    hostUsername,
    unplayable,
    status,
    error,
    joinRoom,
    leaveRoom,
    openShare,
  } = useRoom();

  // Join once the session is known and we have a code. joinRoom no-ops if we're
  // already in this room, so re-runs are harmless.
  useEffect(() => {
    if (loading || !user || !code) return;
    void joinRoom(code);
  }, [loading, user, code, joinRoom]);

  if (loading) return null;

  // Logged-out gate.
  if (!user) {
    return (
      <CenteredCard>
        <Radio size={22} className="accent-text mb-3" />
        <h1 className="text-lg font-semibold text-white mb-1">
          Join the listening party
        </h1>
        <p className="text-sm text-neutral-400 mb-5">
          You need a free account to listen along in sync.
        </p>
        <button
          onClick={() => navigate("/auth")}
          className="accent-bg text-black font-semibold text-sm px-4 py-2 rounded-lg hover:brightness-110 transition-all"
        >
          Sign in or create account
        </button>
      </CenteredCard>
    );
  }

  if (status === "error") {
    return (
      <CenteredCard>
        <h1 className="text-lg font-semibold text-white mb-1">
          {error ?? "Couldn't join the party"}
        </h1>
        <p className="text-sm text-neutral-400 mb-5">
          The party may have ended or the link is wrong.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#1a1a1a] border border-[#2a2a2a] text-sm px-4 py-2 rounded-lg hover:bg-[#222] transition-colors"
        >
          Back to home
        </button>
      </CenteredCard>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Radio size={16} className="accent-text" />
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400">
            {isHost ? "Hosting party" : "Listening party"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isHost && (
            <button
              onClick={openShare}
              className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-neutral-300 hover:text-white transition-colors"
            >
              Share
            </button>
          )}
          {isInRoom && (
            <button
              onClick={() => {
                void leaveRoom();
                navigate("/");
              }}
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded border border-red-900/60 text-red-400 hover:bg-red-950/40 transition-colors"
            >
              <LogOut size={13} />
              {isHost ? "End" : "Leave"}
            </button>
          )}
        </div>
      </div>

      {/* Now-playing card */}
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-6 flex flex-col items-center text-center">
        <div className="w-48 h-48 rounded-xl overflow-hidden bg-[#1a1a1a] mb-5 shadow-2xl">
          {currentTrack?.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music size={56} className="text-neutral-700" />
            </div>
          )}
        </div>
        <div className="text-lg font-semibold text-white truncate max-w-full">
          {currentTrack?.title ?? "Waiting for the host…"}
        </div>
        <div className="text-sm text-neutral-400 truncate max-w-full">
          {currentTrack?.artist ?? ""}
        </div>
        {hostUsername && !isHost && (
          <div className="mt-2 text-xs text-neutral-500">
            hosted by <span className="accent-text">@{hostUsername}</span>
          </div>
        )}
        {unplayable && (
          <div className="mt-4 text-xs text-amber-400/90 bg-amber-950/30 border border-amber-900/40 rounded-lg px-3 py-2">
            The host is playing a local file you can't hear. You're still in
            sync — audio resumes on the next shared track.
          </div>
        )}
      </div>

      {/* Listeners */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-[0.2em] text-neutral-500">
          <Users size={13} />
          {participants.length} listening
        </div>
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <ListenerChip key={p.userId} participant={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ListenerChip({ participant }: { participant: Participant }) {
  const { username, avatarUrl, isHost } = participant;
  return (
    <div className="flex items-center gap-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-full pl-1 pr-3 py-1">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="w-6 h-6 rounded-full object-cover"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-[#1f1f1f] flex items-center justify-center text-[10px] font-mono text-neutral-400 uppercase">
          {username.slice(0, 1)}
        </div>
      )}
      <span className="text-xs text-neutral-300">@{username}</span>
      {isHost && (
        <span className="text-[9px] font-mono uppercase tracking-wider accent-text">
          host
        </span>
      )}
    </div>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-sm mx-auto mt-16 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-8 flex flex-col items-center text-center">
      {children}
    </div>
  );
}
