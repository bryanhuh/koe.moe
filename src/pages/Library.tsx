import { Play } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { TrackCard } from "../components/TrackCard";
import { tracks } from "../data/mockData";
import { usePlayer } from "../context/PlayerContext";

export default function Library() {
  const { playAlbum } = usePlayer();
  const ids = tracks.map((t) => t.id);

  return (
    <div>
      <PageHeader
        eyebrow="Collection"
        title="Library"
        subtitle={`${tracks.length} tracks`}
        actions={
          <button
            onClick={() => playAlbum(ids)}
            className="flex items-center gap-2 accent-bg text-black font-semibold text-sm px-4 py-2 rounded-full hover:brightness-110"
          >
            <Play size={14} fill="currentColor" />
            Play all
          </button>
        }
      />

      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg overflow-hidden">
        <div className="grid grid-cols-[24px_56px_1fr_1fr_auto_24px] gap-4 px-3 py-2 border-b border-[#1a1a1a] text-[10px] font-mono uppercase tracking-wider text-neutral-500">
          <span>#</span>
          <span></span>
          <span>Title</span>
          <span>Album</span>
          <span></span>
          <span>Time</span>
        </div>
        <div className="p-2">
          {tracks.map((t, i) => (
            <TrackCard
              key={t.id}
              track={t}
              variant="row"
              index={i}
              queueIds={ids}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
