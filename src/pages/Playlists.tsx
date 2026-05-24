import { useState } from "react";
import { Plus, Play, Music2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { playlists as initialPlaylists } from "../data/mockData";
import type { Playlist } from "../data/mockData";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const { playAlbum } = usePlayer();
  const { requireAuth } = useAuth();

  const doCreate = () => {
    const id = `pl-${Date.now()}`;
    setPlaylists((p) => [
      ...p,
      {
        id,
        name: name.trim(),
        description: desc.trim(),
        coverUrl: `https://picsum.photos/seed/koe-${id}/600/600`,
        trackIds: [],
      },
    ]);
    setName("");
    setDesc("");
  };

  const create = () => {
    if (!name.trim()) return;
    requireAuth(doCreate);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Your collections"
        title="Playlists"
        subtitle={`${playlists.length} playlists`}
      />

      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-4 mb-6">
        <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3">
          New playlist
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="bg-[#0a0a0a] border border-[#222] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#444]"
          />
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description (optional)"
            className="bg-[#0a0a0a] border border-[#222] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#444]"
          />
          <button
            onClick={create}
            className="flex items-center justify-center gap-2 accent-bg text-black font-semibold text-sm px-4 py-2 rounded hover:brightness-110"
          >
            <Plus size={14} />
            Create
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((pl) => (
          <div
            key={pl.id}
            className="bg-[#121212] border border-[#1a1a1a] p-4 rounded-lg hover:bg-[#161616] transition-colors group"
          >
            <div className="relative mb-3">
              {pl.trackIds.length > 0 ? (
                <img
                  src={pl.coverUrl}
                  alt={pl.name}
                  className="w-full aspect-square object-cover rounded-md"
                />
              ) : (
                <div className="w-full aspect-square rounded-md bg-[#1a1a1a] flex items-center justify-center text-neutral-600">
                  <Music2 size={48} />
                </div>
              )}
              {pl.trackIds.length > 0 && (
                <button
                  onClick={() => playAlbum(pl.trackIds)}
                  className="absolute bottom-2 right-2 w-10 h-10 accent-bg text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shadow-lg"
                  aria-label={`Play ${pl.name}`}
                >
                  <Play size={16} fill="currentColor" className="translate-x-[1px]" />
                </button>
              )}
            </div>
            <div className="text-sm font-medium text-white truncate">{pl.name}</div>
            <div className="text-xs text-neutral-400 truncate">
              {pl.trackIds.length} tracks{pl.description ? ` · ${pl.description}` : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
