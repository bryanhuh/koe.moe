import { Trash2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { usePlayer } from "../context/PlayerContext";

const fmt = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleString();
};

export default function Logs() {
  const { logs, clearLogs } = usePlayer();

  return (
    <div>
      <PageHeader
        eyebrow="History"
        title="Logs"
        subtitle={`${logs.length} playback event${logs.length === 1 ? "" : "s"}`}
        actions={
          logs.length > 0 ? (
            <button
              onClick={clearLogs}
              className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white border border-[#222] px-3 py-2 rounded hover:bg-[#1a1a1a]"
            >
              <Trash2 size={14} />
              Clear logs
            </button>
          ) : null
        }
      />

      {logs.length === 0 ? (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-12 text-center text-sm text-neutral-400">
          No playback history yet.
        </div>
      ) : (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg overflow-hidden font-mono text-xs">
          {logs.map((l) => (
            <div
              key={l.id}
              className="grid grid-cols-[160px_1fr_1fr_80px] gap-4 px-4 py-2 border-b border-[#1a1a1a] last:border-b-0 hover:bg-[#161616]"
            >
              <span className="text-neutral-500">{fmt(l.playedAt)}</span>
              <span className="text-white truncate">{l.trackTitle}</span>
              <span className="text-neutral-400 truncate">{l.trackArtist}</span>
              <span className="accent-text">▶ play</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
