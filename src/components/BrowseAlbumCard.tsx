import { useState } from "react";
import { Link } from "react-router-dom";
import { Disc3, Loader2, Play } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { resolveAlbumTracks } from "../lib/sources/albums";
import type { BrowseAlbum } from "../lib/sources/index";

export function BrowseAlbumCard({ album }: { album: BrowseAlbum }) {
  const { playAlbum, registerTracks } = usePlayer();
  const [busy, setBusy] = useState(false);

  // Quick-play straight from the card without leaving the grid. The card itself
  // navigates to the album's track list (see the wrapping <Link>).
  const play = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (busy) return;
    // AnimeThemes tracks are already known/registered; play immediately.
    if (album.source === "animethemes") {
      if (album.trackIds.length) playAlbum(album.trackIds);
      return;
    }
    // iTunes: resolve the album's tracks on demand, then play.
    setBusy(true);
    try {
      const tracks = await resolveAlbumTracks(album);
      registerTracks(tracks);
      if (tracks.length) playAlbum(tracks.map((t) => t.id));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link
      to={`/albums/${encodeURIComponent(album.id)}`}
      className="group bg-[#121212] border border-[#1a1a1a] p-4 rounded-lg hover:bg-[#161616] transition-colors block text-left w-full"
      aria-label={`Open ${album.title}`}
    >
      <div className="relative mb-3">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            loading="lazy"
            className="w-full aspect-square object-cover rounded-md bg-[#1a1a1a]"
          />
        ) : (
          <div className="w-full aspect-square rounded-md bg-[#1a1a1a] flex items-center justify-center">
            <Disc3 size={32} className="text-neutral-700" />
          </div>
        )}
        <button
          onClick={play}
          aria-label={`Play ${album.title}`}
          className="absolute bottom-2 right-2 w-10 h-10 accent-bg text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} fill="currentColor" className="translate-x-[1px]" />
          )}
        </button>
      </div>
      <div className="text-sm font-medium text-white truncate">{album.title}</div>
      <div className="text-xs text-neutral-400 truncate">
        {album.artist}
        {album.year ? ` · ${album.year}` : ""}
      </div>
    </Link>
  );
}
