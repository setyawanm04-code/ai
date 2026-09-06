import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // Intentionally loud in dev — a missing config should never silently produce fake auth.
  // eslint-disable-next-line no-console
  console.warn(
    "[DEVFORGE AI] Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local."
  );
}

// Fall back to a harmless placeholder URL so createClient doesn't throw at import time;
// isSupabaseConfigured gates all real usage in the UI.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  { auth: { persistSession: true, autoRefreshToken: true } }
);
