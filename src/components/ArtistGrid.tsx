import type { Artist } from "../data/mockData";

export function ArtistGrid({ artists }: { artists: Artist[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {artists.map((a) => (
        <div
          key={a.id}
          className="bg-[#121212] border border-[#1a1a1a] p-4 rounded-lg hover:bg-[#161616] transition-colors cursor-pointer text-center"
        >
          <img
            src={a.coverUrl}
            alt={a.name}
            className="w-32 h-32 mx-auto rounded-full object-cover mb-3"
          />
          <div className="text-sm font-medium text-white truncate">{a.name}</div>
          <div className="text-xs text-neutral-500 mt-1">Artist</div>
        </div>
      ))}
    </div>
  );
}
