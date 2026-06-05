import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — copy .env.example to .env.local");
}

export const supabase = createClient(url, key, {
  // Listening-party sync (presence + broadcast) rides Realtime; cap the
  // outbound message rate so a heartbeating host stays well within limits.
  realtime: { params: { eventsPerSecond: 10 } },
});
