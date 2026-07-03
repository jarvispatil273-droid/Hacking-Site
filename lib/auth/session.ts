import { hasSupabase } from "@/lib/env";
import { getServerClient } from "@/lib/supabase/server";
import { GUEST_USER_ID } from "./constants";

export interface CurrentUser {
  id: string;
  name: string;
  email: string | null;
  isGuest: boolean;
}

/**
 * Resolve the active user. With Supabase configured we read the real session;
 * otherwise everyone shares a local "guest" identity so the dashboard,
 * bookmarks and notifications work with no auth provider. Never throws.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  if (hasSupabase()) {
    try {
      const supabase = await getServerClient();
      const { data } = await supabase!.auth.getUser();
      if (data.user) {
        return {
          id: data.user.id,
          name: data.user.email?.split("@")[0] ?? "analyst",
          email: data.user.email ?? null,
          isGuest: false,
        };
      }
    } catch {
      // fall through to guest
    }
  }
  return { id: GUEST_USER_ID, name: "guest", email: null, isGuest: true };
}
