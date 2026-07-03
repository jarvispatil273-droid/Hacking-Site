import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Service-role client — SERVER ONLY. Bypasses RLS, so it must never be imported
 * into client components. Used by the repository (data reads/writes) and the
 * ingestion pipeline. Returns null when Supabase admin isn't configured.
 */
let cached: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient | null {
  if (cached) return cached;
  if (!env.supabaseUrl || !env.supabaseServiceKey) return null;
  cached = createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
