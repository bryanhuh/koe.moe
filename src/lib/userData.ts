import { supabase } from "./supabase";

// Every table that holds user-owned rows. RLS restricts each select to the
// caller's own rows, so a plain `select('*')` returns only this user's data.
const USER_TABLES = [
  "profiles",
  "playlists",
  "playlist_tracks",
  "favorites",
  "listening_history",
  "uploads_metadata",
] as const;

export type UserDataExport = {
  exported_at: string;
  user: { id: string; email: string | null };
  tables: Record<string, unknown[]>;
};

/** Collect all of the signed-in user's rows across every table into one object. */
export async function exportUserData(): Promise<UserDataExport> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Not signed in");

  const tables: Record<string, unknown[]> = {};
  for (const table of USER_TABLES) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) throw error;
    tables[table] = data ?? [];
  }

  return {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email ?? null },
    tables,
  };
}

/**
 * Permanently delete the signed-in user's account via the `delete-account`
 * Edge Function. The function removes the auth user; foreign-key cascades wipe
 * every public-table row. On success the local session is cleared.
 */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke("delete-account", {
    method: "POST",
  });
  if (error) throw error;
  await supabase.auth.signOut();
}

/** Trigger a browser download of the export as a pretty-printed JSON file. */
export function downloadUserData(data: UserDataExport): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `koe-data-export-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
