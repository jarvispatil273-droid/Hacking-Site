"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Browser Supabase client for auth flows in client components. Returns null when
 * Supabase isn't configured (local guest-session mode handles auth instead).
 */
export function getBrowserClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null;
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
