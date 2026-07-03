/**
 * Central runtime configuration. Reads process.env and exposes typed,
 * intent-revealing flags. This is what lets AEGIS "run locally now, plug in real
 * services later": every integration degrades gracefully when unset, and the
 * data backend is chosen from these flags at runtime.
 *
 * On Vercel the filesystem is read-only, so a deployed instance MUST have
 * NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set for writes to work —
 * `hasSupabaseAdmin()` gates that.
 */

function get(name: string): string | undefined {
  const v = process.env[name];
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const env = {
  siteUrl: get("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",

  supabaseUrl: get("NEXT_PUBLIC_SUPABASE_URL") ?? get("SUPABASE_URL"),
  supabaseAnonKey:
    get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ?? get("SUPABASE_ANON_KEY"),
  supabaseServiceKey:
    get("SUPABASE_SERVICE_ROLE_KEY") ?? get("SUPABASE_SERVICE_KEY"),

  openaiKey: get("OPENAI_API_KEY"),
  openaiModel: get("OPENAI_MODEL") ?? "gpt-4o-mini",

  nvdKey: get("NVD_API_KEY"),

  cronSecret: get("CRON_SECRET"),
  guestSecret: get("GUEST_SESSION_SECRET") ?? "insecure-dev-guest-secret",
} as const;

/** True when Supabase is configured for client + server auth use. */
export function hasSupabase(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

/**
 * True when the ingestion pipeline / repository can read+write Supabase.
 * Requires the URL and the service-role key (server-only).
 */
export function hasSupabaseAdmin(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceKey);
}

export function hasOpenAI(): boolean {
  return Boolean(env.openaiKey);
}

/** Human-readable backend label surfaced in the UI / health check. */
export function backendMode(): "supabase" | "local" {
  return hasSupabaseAdmin() ? "supabase" : "local";
}
