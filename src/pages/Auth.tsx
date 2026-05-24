import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const { user, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signInWithMagicLink(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="font-mono font-extrabold text-2xl tracking-tight mb-10">
          Koe<span className="accent-text">.</span>
        </div>

        {sent ? (
          <div className="space-y-1">
            <p className="text-sm text-neutral-200">Check your inbox.</p>
            <p className="text-xs text-neutral-500">
              Magic link sent to{" "}
              <span className="text-neutral-300">{email}</span>. Click it to
              sign in — no password needed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#333] placeholder:text-neutral-600"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full accent-bg rounded px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}

        <p className="mt-8 text-xs text-neutral-600">
          Signing up? Same flow — just enter your email and we'll create your
          account.
        </p>
      </div>
    </div>
  );
}
