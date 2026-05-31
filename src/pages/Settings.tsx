import { useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { usePlayer } from "../context/PlayerContext";
import type { RepeatMode } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import { exportUserData, downloadUserData } from "../lib/userData";

export default function Settings() {
  const { settings, updateSettings } = usePlayer();
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const data = await exportUserData();
      downloadUserData(data);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Configure"
        title="Settings"
        subtitle="Defaults applied when the app launches"
      />

      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg divide-y divide-[#1a1a1a]">
        <Row
          label="Shuffle by default"
          hint="Start every queue in shuffle mode"
          control={
            <Toggle
              checked={settings.defaultShuffle}
              onChange={(v) => updateSettings({ defaultShuffle: v })}
            />
          }
        />

        <Row
          label="Repeat mode"
          hint="off · all · one"
          control={
            <select
              value={settings.defaultRepeat}
              onChange={(e) =>
                updateSettings({ defaultRepeat: e.target.value as RepeatMode })
              }
              className="bg-[#0a0a0a] border border-[#222] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#444] font-mono"
            >
              <option value="off">off</option>
              <option value="all">all</option>
              <option value="one">one</option>
            </select>
          }
        />

        <Row
          label="Default volume"
          hint={`${Math.round(settings.defaultVolume * 100)}%`}
          control={
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={settings.defaultVolume}
              onChange={(e) =>
                updateSettings({ defaultVolume: Number(e.target.value) })
              }
              className="koe-range w-40"
            />
          }
        />

      </div>

      <div className="mt-6 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
        Settings persist locally · localStorage key{" "}
        <span className="text-neutral-300">koe:state:v1</span>
      </div>

      {user && (
        <div className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-3">
            Your data
          </h2>
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg divide-y divide-[#1a1a1a]">
            <Row
              label="Export my data"
              hint="Download all your favorites, playlists, history & uploads as JSON"
              control={
                <button
                  onClick={() => void handleExport()}
                  disabled={exporting}
                  className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed border border-[#2a2a2a] rounded px-3 py-1.5 text-sm transition-colors"
                >
                  <Download size={14} />
                  {exporting ? "Exporting…" : "Export"}
                </button>
              }
            />
          </div>
          {exportError && (
            <div className="mt-2 text-xs text-red-400 font-mono">
              {exportError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  hint,
  control,
}: {
  label: string;
  hint?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-6">
      <div>
        <div className="text-sm text-white">{label}</div>
        {hint && <div className="text-xs text-neutral-500 mt-0.5">{hint}</div>}
      </div>
      <div>{control}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? "accent-bg" : "bg-[#2a2a2a]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-black rounded-full transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}
