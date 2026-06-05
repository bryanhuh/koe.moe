import { useState } from "react";
import { Check, Copy, Radio, X } from "lucide-react";
import { useRoom } from "../context/RoomContext";

export function ShareRoomModal() {
  const { shareOpen, code, closeShare } = useRoom();
  const [copied, setCopied] = useState(false);

  if (!shareOpen || !code) return null;

  const link = `${window.location.origin}/room/${code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the link is still shown for manual copy */
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={closeShare}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-sm bg-[#111] border border-[#222] rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeShare}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-200 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Radio size={18} className="accent-text" />
          <h2 className="text-base font-semibold text-white">
            Your listening party is live
          </h2>
        </div>
        <p className="text-xs text-neutral-400 mb-5">
          Share this link and anyone signed in can listen along in sync.
        </p>

        <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
          Party code
        </div>
        <div className="font-mono text-2xl tracking-[0.3em] text-white bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-3 text-center mb-4">
          {code}
        </div>

        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link}
            className="flex-1 min-w-0 bg-[#0a0a0a] border border-[#222] rounded px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none"
          />
          <button
            onClick={copy}
            className="shrink-0 flex items-center gap-1.5 accent-bg text-black font-semibold text-xs px-3 py-2 rounded hover:brightness-110 transition-all"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
