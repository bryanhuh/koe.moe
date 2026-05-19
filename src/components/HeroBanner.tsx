import { Play, Heart } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import type { Album } from "../data/mockData";

export function HeroBanner({ album }: { album: Album }) {
  const { playAlbum, toggleFavorite, isFavorite, currentTrack, isPlaying } =
    usePlayer();
  const firstTrackId = album.trackIds[0];
  const liked = isFavorite(firstTrackId);
  const playingThis =
    isPlaying && currentTrack && album.trackIds.includes(currentTrack.id);

  return (
    <div className="relative w-full h-[340px] rounded-xl overflow-hidden border border-[#1a1a1a]">
      <img
        src={album.coverUrl.replace("/600/600", "/1600/600")}
        alt={album.title}
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

      <div className="relative h-full flex flex-col justify-end p-8 max-w-xl">
        <div className="font-mono uppercase text-xs tracking-[0.25em] text-neutral-400 mb-2">
          Featured Album
        </div>
        <h1 className="font-mono text-5xl font-extrabold tracking-tight text-white mb-2">
          {album.title}
        </h1>
        <p className="text-neutral-300 text-sm mb-6">
          by <span className="text-white font-medium">{album.artist}</span> ·{" "}
          {album.year}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => playAlbum(album.trackIds)}
            className="flex items-center gap-2 accent-bg text-black font-semibold text-sm px-5 py-2.5 rounded-full hover:brightness-110 transition"
          >
            <Play size={16} fill="currentColor" />
            {playingThis ? "Now Playing" : "Start Listening"}
          </button>
          <button
            onClick={() => toggleFavorite(firstTrackId)}
            className={`w-10 h-10 rounded-full border border-[#333] flex items-center justify-center hover:bg-[#1a1a1a] ${
              liked ? "accent-text" : "text-neutral-300"
            }`}
            aria-label="Like"
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}
