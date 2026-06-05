import { Radio } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { useRoom } from "../context/RoomContext";

// Starts a listening party from the current playback. Hidden while already in a
// room (the RoomBanner takes over then). Two layouts: a compact icon for the
// bottom player bar, and a labelled button for the expanded Now Playing view.
export function StartPartyButton({ variant }: { variant: "bar" | "full" }) {
  const { currentTrack } = usePlayer();
  const { isInRoom, startParty } = useRoom();

  if (isInRoom) return null;

  const disabled = !currentTrack;

  if (variant === "bar") {
    return (
      <button
        onClick={() => void startParty()}
        disabled={disabled}
        className="ml-1 p-1.5 rounded hover:bg-[#1a1a1a] transition-colors shrink-0 text-neutral-400 hover:accent-text disabled:opacity-30 disabled:hover:text-neutral-400"
        aria-label="Start a listening party"
        title="Start a listening party"
      >
        <Radio size={16} />
      </button>
    );
  }

  return (
    <button
      onClick={() => void startParty()}
      disabled={disabled}
      className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-3 py-1.5 rounded bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-40 transition-colors"
    >
      <Radio size={14} /> Start party
    </button>
  );
}
