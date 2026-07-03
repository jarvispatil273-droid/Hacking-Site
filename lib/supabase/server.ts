import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Request-scoped Supabase server client (reads the auth cookie). Returns null
 * when Supabase isn't configured. Used to resolve the signed-in user; data
 * access goes through the repository (service-role) instead.
 */
export async function getServerClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null;
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        toSet: { name: string; value: string; options?: Record<string, unknown> }[]
      ) {
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render — safe to ignore; middleware
          // refreshes the session cookie on navigation.
        }
      },
    },
  });
}
