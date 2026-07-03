/**
 * Framework-agnostic auth constants (safe to import in Node scripts and the
 * ingestion pipeline — no next/headers here).
 */

/** Stable id for the local guest session used when Supabase auth is absent. */
export const GUEST_USER_ID = "guest-local-user";

/** Cookie name holding the signed guest session token. */
export const GUEST_COOKIE = "aegis_guest";
