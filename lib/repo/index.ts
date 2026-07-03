import { hasSupabaseAdmin } from "@/lib/env";
import { LocalRepository } from "./local";
import { SupabaseRepository } from "./supabase";
import type { Repository } from "./repository";

export type { Repository } from "./repository";
export type {
  ListArticlesParams,
  UpsertResult,
  RepoStats,
} from "./repository";

let instance: Repository | null = null;

/**
 * Returns the active repository, resolved once per process:
 *   - SupabaseRepository when a Supabase URL + service-role key are configured
 *     (required for server-side writes on Vercel, whose filesystem is read-only).
 *   - LocalRepository (file-backed JSON) otherwise, for zero-config local dev.
 *
 * Every server component, API route, and script goes through this selector, so
 * switching backends never requires touching feature code.
 */
export function getRepository(): Repository {
  if (instance) return instance;
  instance = hasSupabaseAdmin()
    ? new SupabaseRepository()
    : new LocalRepository();
  return instance;
}
