import { Heart, Play } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { TrackCard } from "../components/TrackCard";
import { usePlayer } from "../context/PlayerContext";
import { trackById } from "../data/mockData";

export default function Favorites() {
  const { favorites, playAlbum } = usePlayer();
  const liked = favorites.map(trackById).filter(Boolean) as NonNullable<
    ReturnType<typeof trackById>
  >[];

  return (
    <div>
      <PageHeader
        eyebrow="Liked"
        title="Favorites"
        subtitle={`${liked.length} liked track${liked.length === 1 ? "" : "s"}`}
        actions={
          liked.length > 0 ? (
            <button
              onClick={() => playAlbum(favorites)}
              className="flex items-center gap-2 accent-bg text-black font-semibold text-sm px-4 py-2 rounded-full hover:brightness-110"
            >
              <Play size={14} fill="currentColor" />
              Play all
            </button>
          ) : null
        }
      />

      {liked.length === 0 ? (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-12 text-center">
          <Heart size={32} className="mx-auto text-neutral-600 mb-3" />
          <div className="text-sm text-neutral-400">
            No favorites yet. Tap the heart on any track to add it here.
          </div>
        </div>
      ) : (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-2">
          {liked.map((t, i) => (
            <TrackCard
              key={t.id}
              track={t}
              variant="row"
              index={i}
              queueIds={favorites}
            />
          ))}
        </div>
      )}
    </div>
  );
}
