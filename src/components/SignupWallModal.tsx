import { Heart, ListMusic, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function SignupWallModal() {
  const { signupWallOpen, closeSignupWall } = useAuth();
  const navigate = useNavigate();

  if (!signupWallOpen) return null;

  const handleSignIn = () => {
    closeSignupWall();
    navigate("/auth");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={closeSignupWall}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-sm bg-[#111] border border-[#222] rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeSignupWall}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-200 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        <div className="font-mono font-extrabold text-lg tracking-tight mb-1">
          Koe<span className="accent-text">.</span>
        </div>
        <h2 className="text-base font-semibold text-white mb-1">
          Sign in to keep your music
        </h2>
        <p className="text-xs text-neutral-400 mb-5">
          Create a free account to save favorites, build playlists, and sync
          your library across devices.
        </p>

        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-[#1a1a1a] rounded-lg p-3 text-center">
            <Heart size={18} className="accent-text mx-auto mb-1" />
            <div className="text-[11px] text-neutral-300">Favorites</div>
          </div>
          <div className="flex-1 bg-[#1a1a1a] rounded-lg p-3 text-center">
            <ListMusic size={18} className="accent-text mx-auto mb-1" />
            <div className="text-[11px] text-neutral-300">Playlists</div>
          </div>
        </div>

        <button
          onClick={handleSignIn}
          className="w-full accent-bg text-black font-semibold text-sm py-2.5 rounded-lg hover:brightness-110 transition-all mb-2"
        >
          Sign in or create account
        </button>
        <button
          onClick={closeSignupWall}
          className="w-full text-xs text-neutral-500 hover:text-neutral-300 transition-colors py-1"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
