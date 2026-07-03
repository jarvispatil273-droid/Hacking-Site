import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { runIngest } from "@/lib/ingest/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Allow long-running ingestion on platforms that honor it.
export const maxDuration = 300;

/**
 * Hourly ingestion trigger. Vercel Cron calls this with
 * `Authorization: Bearer <CRON_SECRET>`. When CRON_SECRET is unset (local dev)
 * the endpoint is open so you can trigger it by hand.
 */
function authorized(req: Request): boolean {
  if (!env.cronSecret) return true; // dev: no secret configured
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${env.cronSecret}`) return true;
  const url = new URL(req.url);
  return url.searchParams.get("secret") === env.cronSecret;
}

async function handle(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const report = await runIngest({ limitPerFeed: 15 });
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;
