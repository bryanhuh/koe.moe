import { useState } from "react";
import { Loader2, Play, User } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { sourceById } from "../lib/sources/registry";
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

  // No artist pages yet — clicking plays the artist's tracks from their source.
  const play = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const tracks = await sourceById[artist.source].search(artist.name, 25);
      registerTracks(tracks);
      if (tracks.length) playAlbum(tracks.map((t) => t.id));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={play}
      aria-label={`Play ${artist.name}`}
      className="group bg-[#121212] border border-[#1a1a1a] p-4 rounded-lg hover:bg-[#161616] transition-colors text-center w-full"
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
        <span className="absolute bottom-1 right-1 w-10 h-10 accent-bg text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg">
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} fill="currentColor" className="translate-x-[1px]" />
          )}
        </span>
      </div>
      <div className="text-sm font-medium text-white truncate">{artist.name}</div>
      <div className="text-xs text-neutral-500 mt-1 truncate">{artist.subtitle}</div>
    </button>
  );
}
