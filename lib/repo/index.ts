import { hasSupabaseAdmin } from "@/lib/env";
import { LocalRepository } from "./local";
import { SupabaseRepository } from "./supabase";
import type { Repository } from "./repository";

export type { Repository } from "./repository";

let instance: Repository | null = null;

export function getRepository(): Repository {
  if (instance) return instance;

  console.log("=================================");
  console.log("hasSupabaseAdmin:", hasSupabaseAdmin());
  console.log("=================================");

  instance = hasSupabaseAdmin()
    ? new SupabaseRepository()
    : new LocalRepository();

  return instance;
}