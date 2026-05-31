// Permanently delete the calling user's account.
//
// Deleting the auth user cascades to every public table (profiles, playlists,
// playlist_tracks, favorites, listening_history, uploads_metadata) via their
// `references auth.users (id) on delete cascade` foreign keys.
//
// The anon key can't delete an auth user, so this runs server-side with the
// service-role key. The caller proves identity with their own access token;
// we only ever delete that token's user — never an id from the request body.
//
// Setup (one-time):
//   supabase functions deploy delete-account
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Missing bearer token" }, 401);
  }
  const token = authHeader.slice("Bearer ".length);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Resolve the access token to a user — this is the only account we delete.
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return json({ error: "Invalid or expired token" }, 401);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(
    userData.user.id,
  );
  if (deleteError) {
    console.error("deleteUser failed:", deleteError);
    return json({ error: deleteError.message }, 500);
  }

  return json({ success: true });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
