import { LogOut, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../context/RoomContext";

// Slim persistent bar shown above the player whenever the user is in a party,
// from any page. Tapping it opens the room lobby; the trailing button leaves
// (or ends, for the host).
export function RoomBanner() {
  const { isInRoom, isHost, code, participants, hostUsername, leaveRoom } =
    useRoom();
  const navigate = useNavigate();

  if (!isInRoom) return null;

  return (
    <div className="h-9 bg-[#0d0d0d] border-t border-[#1a1a1a] flex items-center justify-between px-4 text-xs">
      <button
        onClick={() => navigate(`/room/${code}`)}
        className="flex items-center gap-2 min-w-0 text-neutral-300 hover:text-white transition-colors"
      >
        <Radio size={13} className="accent-text shrink-0" />
        <span className="font-mono uppercase tracking-wider accent-text shrink-0">
          {isHost ? "Hosting" : "Party"}
        </span>
        <span className="text-neutral-500 shrink-0">·</span>
        <span className="text-neutral-400 shrink-0">
          {participants.length} listening
        </span>
        {!isHost && hostUsername && (
          <>
            <span className="text-neutral-500 shrink-0">·</span>
            <span className="text-neutral-400 truncate">
              hosted by @{hostUsername}
            </span>
          </>
        )}
      </button>

      <button
        onClick={() => void leaveRoom()}
        className="flex items-center gap-1.5 shrink-0 text-red-400 hover:text-red-300 font-mono uppercase tracking-wider transition-colors"
      >
        <LogOut size={12} />
        {isHost ? "End" : "Leave"}
      </button>
    </div>
  );
}
