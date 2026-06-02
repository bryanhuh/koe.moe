import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Play, User } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { getArtistById } from "../lib/sources/artists";
import type { BrowseArtist } from "../lib/sources/index";

export function ArtistGrid({ artists }: { artists: BrowseArtist[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {artists.map((a) => (
        <ArtistCard key={a.id} artist={a} />
      ))}
    </div>
  );
}

function ArtistCard({ artist }: { artist: BrowseArtist }) {
  const { playAlbum, registerTracks } = usePlayer();
  const [busy, setBusy] = useState(false);

  // Quick-play all of the artist's tracks without leaving the grid. The card
  // itself navigates to the artist's page (see the wrapping <Link>).
  const play = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await getArtistById(artist.id);
      if (res?.tracks.length) {
        registerTracks(res.tracks);
        playAlbum(res.tracks.map((t) => t.id));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link
      to={`/artists/${encodeURIComponent(artist.id)}`}
      aria-label={`Open ${artist.name}`}
      className="group bg-[#121212] border border-[#1a1a1a] p-4 rounded-lg hover:bg-[#161616] transition-colors text-center block"
    >
      <div className="relative w-32 h-32 mx-auto mb-3">
        {artist.imageUrl ? (
          <img
            src={artist.imageUrl}
            alt={artist.name}
            loading="lazy"
            className="w-32 h-32 rounded-full object-cover bg-[#1a1a1a]"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <User size={32} className="text-neutral-700" />
          </div>
        )}
        <button
          onClick={play}
          aria-label={`Play ${artist.name}`}
          className="absolute bottom-1 right-1 w-10 h-10 accent-bg text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} fill="currentColor" className="translate-x-[1px]" />
          )}
        </button>
      </div>
      <div className="text-sm font-medium text-white truncate">{artist.name}</div>
      <div className="text-xs text-neutral-500 mt-1 truncate">{artist.subtitle}</div>
    </Link>
  );
}
