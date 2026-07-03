/**
 * Central runtime configuration. Reads process.env once and exposes typed,
 * intent-revealing flags. This is what lets the app "run locally now, plug in
 * real services later" — every integration degrades gracefully when unset.
 */

function get(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

export const env = {
  siteUrl: get("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",

  supabaseUrl: get("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: get("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceKey: get("SUPABASE_SERVICE_ROLE_KEY"),

  openaiKey: get("OPENAI_API_KEY"),
  openaiModel: get("OPENAI_MODEL") ?? "gpt-4o-mini",

  nvdKey: get("NVD_API_KEY"),

  cronSecret: get("CRON_SECRET"),
  guestSecret: get("GUEST_SESSION_SECRET") ?? "insecure-dev-guest-secret",
};

/** True when Supabase is fully configured for client + server use. */
export function hasSupabase(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

/** True when the ingestion pipeline can write to Supabase (needs service key). */
export function hasSupabaseAdmin(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceKey);
}

export function hasOpenAI(): boolean {
  return Boolean(env.openaiKey);
}

/** Human-readable backend label surfaced in the UI/health check. */
export function backendMode(): "supabase" | "local" {
  return hasSupabase() ? "supabase" : "local";
}
