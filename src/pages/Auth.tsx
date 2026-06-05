import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Mode = "signin" | "signup";

export default function Auth() {
  const { user, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setError(null);
    setSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signInWithMagicLink(email, {
        shouldCreateUser: mode === "signup",
      });
      setSent(true);
    } catch (err) {
      setError(humanizeError(err, mode));
    } finally {
      setSubmitting(false);
    }
  };

  const copy = {
    signin: {
      heading: "Sign in",
      subtitle: "Enter your email and we'll send you a magic link.",
      cta: "Send magic link",
    },
    signup: {
      heading: "Create your account",
      subtitle: "No password — just your email. We'll send a link to finish.",
      cta: "Send sign-up link",
    },
  }[mode];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="font-mono font-extrabold text-2xl tracking-tight mb-10">
          Koe<span className="accent-text">.</span>
        </div>

        {/* Segmented sign in / sign up toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg mb-8">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`rounded-md py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                mode === m
                  ? "bg-[#1a1a1a] text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {sent ? (
          <div className="space-y-1">
            <p className="text-sm text-neutral-200">Check your inbox.</p>
            <p className="text-xs text-neutral-500">
              {mode === "signup" ? "Sign-up" : "Magic"} link sent to{" "}
              <span className="text-neutral-300">{email}</span>. Click it to
              {mode === "signup"
                ? " activate your account"
                : " sign in"}{" "}
              — no password needed.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-xs accent-text hover:underline pt-2"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-neutral-100">
                {copy.heading}
              </h1>
              <p className="text-xs text-neutral-500 mt-1">{copy.subtitle}</p>
            </div>

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
                {submitting ? "Sending…" : copy.cta}
              </button>
            </form>
          </>
        )}

        <p className="mt-8 text-xs text-neutral-600">
          {mode === "signin" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="accent-text hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="accent-text hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function humanizeError(err: unknown, mode: Mode): string {
  const message = err instanceof Error ? err.message : "";
  // Supabase returns this when shouldCreateUser is false and no account exists.
  if (/signups not allowed|user not found/i.test(message)) {
    return "No account found for that email. Switch to Sign up to create one.";
  }
  if (mode === "signup" && /already registered/i.test(message)) {
    return "That email already has an account. Switch to Sign in.";
  }
  return message || "Something went wrong.";
}
