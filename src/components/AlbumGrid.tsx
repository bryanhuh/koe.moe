import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import type { Album } from "../data/mockData";

export function AlbumGrid({
  albums,
  columns = 3,
}: {
  albums: Album[];
  columns?: 2 | 3 | 4 | 5;
}) {
  const cols = {
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  }[columns];

  return (
    <div className={`grid ${cols} gap-4`}>
      {albums.map((a) => (
        <AlbumCard key={a.id} album={a} />
      ))}
    </div>
  );
}

function AlbumCard({ album }: { album: Album }) {
  const { playAlbum } = usePlayer();
  return (
    <Link
      to={`/albums#${album.id}`}
      className="group bg-[#121212] border border-[#1a1a1a] p-4 rounded-lg hover:bg-[#161616] transition-colors block"
    >
      <div className="relative mb-3">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-full aspect-square object-cover rounded-md"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            playAlbum(album.trackIds);
          }}
          className="absolute bottom-2 right-2 w-10 h-10 accent-bg text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg"
          aria-label={`Play ${album.title}`}
        >
          <Play size={16} fill="currentColor" className="translate-x-[1px]" />
        </button>
      </div>
      <div className="text-sm font-medium text-white truncate">{album.title}</div>
      <div className="text-xs text-neutral-400 truncate">{album.artist}</div>
    </Link>
  );
}
