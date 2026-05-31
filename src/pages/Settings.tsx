import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Trash2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { usePlayer } from "../context/PlayerContext";
import type { RepeatMode } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import { exportUserData, downloadUserData, deleteAccount } from "../lib/userData";

export default function Settings() {
  const { settings, updateSettings } = usePlayer();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      navigate("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
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

      {user && (
        <div className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-red-500/70 mb-3">
            Danger zone
          </h2>
          <div className="bg-[#0f0f0f] border border-red-900/40 rounded-lg p-5">
            {!confirmingDelete ? (
              <div className="flex items-center justify-between gap-6">
                <div>
                  <div className="text-sm text-white">Delete my account</div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Permanently erases your profile, playlists, favorites,
                    history & uploads. This cannot be undone.
                  </div>
                </div>
                <button
                  onClick={() => {
                    setConfirmingDelete(true);
                    setDeleteError(null);
                  }}
                  className="shrink-0 flex items-center gap-2 border border-red-900/60 text-red-400 hover:bg-red-950/40 rounded px-3 py-1.5 text-sm transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            ) : (
              <div>
                <div className="text-sm text-white mb-1">
                  Are you absolutely sure?
                </div>
                <div className="text-xs text-neutral-500 mb-3">
                  Type <span className="font-mono text-red-400">DELETE</span> to
                  confirm. This is irreversible.
                </div>
                <input
                  autoFocus
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-red-900/60 mb-3"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void handleDelete()}
                    disabled={confirmText !== "DELETE" || deleting}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded px-3 py-1.5 text-sm transition-colors"
                  >
                    <Trash2 size={14} />
                    {deleting ? "Deleting…" : "Permanently delete"}
                  </button>
                  <button
                    onClick={() => {
                      setConfirmingDelete(false);
                      setConfirmText("");
                    }}
                    disabled={deleting}
                    className="text-sm text-neutral-400 hover:text-neutral-100 px-3 py-1.5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {deleteError && (
              <div className="mt-3 text-xs text-red-400 font-mono">
                {deleteError}
              </div>
            )}
          </div>
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
