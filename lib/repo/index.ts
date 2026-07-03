import { hasSupabaseAdmin } from "@/lib/env";
import { LocalRepository } from "./local";
import { SupabaseRepository } from "./supabase";
import type { Repository } from "./repository";

export type { Repository } from "./repository";

let instance: Repository | null = null;

/**
 * Returns the active repository, chosen once per process:
 * Supabase when a URL + service-role key are present, otherwise the local
 * JSON store. Every server component / API route / script goes through this.
 */
export function getRepository(): Repository {
  if (instance) return instance;
  instance = hasSupabaseAdmin() ? new SupabaseRepository() : new LocalRepository();
  return instance;
}
