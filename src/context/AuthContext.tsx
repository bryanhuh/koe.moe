import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// ─── Anon → signed-up migration ─────────────────────────────────────────────
// Runs once per device on first SIGNED_IN event.
// Syncs localStorage favorites + listening history to Supabase with
// source="local" (track IDs from mock data). Will map to real sources once
// the catalog milestone lands.

const MIGRATION_FLAG = "koe:migrated:v1";
const STORAGE_KEY = "koe:state:v1";

type StoredLog = {
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  playedAt: number;
};

async function migrateAnonData(userId: string) {
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(MIGRATION_FLAG, "1");
    return;
  }

  const state = JSON.parse(raw) as {
    favorites?: string[];
    logs?: StoredLog[];
  };

  const favs = state.favorites ?? [];
  const logs = state.logs ?? [];

  if (favs.length) {
    await supabase.from("favorites").upsert(
      favs.map((id) => ({ user_id: userId, source: "local", external_id: id })),
      { onConflict: "user_id,source,external_id" },
    );
  }

  if (logs.length) {
    await supabase.from("listening_history").insert(
      logs.slice(0, 200).map((log) => ({
        user_id: userId,
        source: "local",
        external_id: log.trackId,
        track_title: log.trackTitle,
        track_artist: log.trackArtist,
        played_at: new Date(log.playedAt).toISOString(),
      })),
    );
  }

  localStorage.setItem(MIGRATION_FLAG, "1");
}

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithMagicLink: (
    email: string,
    options?: { shouldCreateUser?: boolean },
  ) => Promise<void>;
  signOut: () => Promise<void>;
  // Signup wall
  signupWallOpen: boolean;
  openSignupWall: () => void;
  closeSignupWall: () => void;
  requireAuth: (action: () => void) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signupWallOpen, setSignupWallOpen] = useState(false);

  const openSignupWall = useCallback(() => setSignupWallOpen(true), []);
  const closeSignupWall = useCallback(() => setSignupWallOpen(false), []);
  const requireAuth = useCallback(
    (action: () => void) => {
      if (session) action();
      else setSignupWallOpen(true);
    },
    [session],
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "SIGNED_IN" && s) {
        migrateAnonData(s.user.id).catch(console.error);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = async (
    email: string,
    options?: { shouldCreateUser?: boolean },
  ) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: options?.shouldCreateUser ?? true,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signInWithMagicLink,
        signOut,
        signupWallOpen,
        openSignupWall,
        closeSignupWall,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
