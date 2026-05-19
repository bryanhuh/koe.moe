import { PageHeader } from "../components/PageHeader";
import { usePlayer } from "../context/PlayerContext";

const presets: { name: string; value: string }[] = [
  { name: "Spotify Green", value: "#1ed760" },
  { name: "Sakura", value: "#ff6fa3" },
  { name: "Electric Blue", value: "#3b82f6" },
  { name: "Sunset", value: "#f97316" },
  { name: "Ultraviolet", value: "#a855f7" },
  { name: "Lemon", value: "#facc15" },
  { name: "Crimson", value: "#ef4444" },
  { name: "Mint", value: "#10b981" },
];

export default function ThemeEditor() {
  const { accent, setAccent } = usePlayer();

  return (
    <div>
      <PageHeader
        eyebrow="Customize"
        title="Theme Editor"
        subtitle="Pick an accent color used across the app"
      />

      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-lg border border-[#222]"
            style={{ backgroundColor: accent }}
          />
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Current accent
            </div>
            <div className="font-mono text-lg text-white">{accent.toUpperCase()}</div>
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="mt-2 bg-transparent cursor-pointer"
            />
          </div>
        </div>

        <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3">
          Presets
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => setAccent(p.value)}
              className={`flex items-center gap-3 px-3 py-3 rounded border ${
                accent.toLowerCase() === p.value.toLowerCase()
                  ? "accent-soft-bg"
                  : "bg-[#0a0a0a]"
              } border-[#222] hover:border-[#444] text-left`}
            >
              <span
                className="w-6 h-6 rounded"
                style={{ backgroundColor: p.value }}
              />
              <div>
                <div className="text-sm text-white">{p.name}</div>
                <div className="text-[10px] font-mono text-neutral-500">
                  {p.value}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3">
            Preview
          </div>
          <div className="flex items-center gap-3">
            <button className="accent-bg text-black font-semibold text-sm px-4 py-2 rounded-full">
              Primary button
            </button>
            <span className="accent-text font-mono text-sm">accent text</span>
            <span className="accent-soft-bg accent-text px-3 py-1 rounded font-mono text-xs">
              soft chip
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
