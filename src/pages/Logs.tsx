import { Play, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { usePlayer } from "../context/PlayerContext";
import type { LogEntry } from "../context/PlayerContext";

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
            <LogRow key={l.id} log={l} />
          ))}
        </div>
      )}
    </div>
  );
}

function LogRow({ log }: { log: LogEntry }) {
  const { resolveTrack, playTrack } = usePlayer();
  const track = resolveTrack(log.trackId);

  const play = () => {
    if (track) playTrack(track.id, [track.id]);
  };

  return (
    <div className="grid grid-cols-[150px_1fr_1fr_1fr_64px] gap-4 px-4 py-2 border-b border-[#1a1a1a] last:border-b-0 hover:bg-[#161616] items-center">
      <span className="text-neutral-500">{fmt(log.playedAt)}</span>

      {track ? (
        <button
          onClick={play}
          className="text-left text-white truncate hover:accent-text transition-colors"
          title={`Play ${log.trackTitle}`}
        >
          {log.trackTitle}
        </button>
      ) : (
        <span className="text-white truncate">{log.trackTitle}</span>
      )}

      <span className="text-neutral-400 truncate">{log.trackArtist}</span>

      {track ? (
        <Link
          to={`/albums/${track.albumId}`}
          className="text-neutral-400 truncate hover:accent-text transition-colors"
          title={track.album}
        >
          {track.album}
        </Link>
      ) : (
        <span className="text-neutral-600 truncate">—</span>
      )}

      {track ? (
        <button
          onClick={play}
          className="flex items-center gap-1 accent-text hover:opacity-80 justify-self-start"
          aria-label={`Play ${log.trackTitle}`}
        >
          <Play size={11} fill="currentColor" /> play
        </button>
      ) : (
        <span className="text-neutral-600 justify-self-start">—</span>
      )}
    </div>
  );
}
