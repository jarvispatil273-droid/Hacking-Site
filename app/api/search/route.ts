import { NextResponse } from "next/server";
import { unifiedSearch } from "@/lib/search";
import { clientKey, rateLimit, rateLimitHeaders } from "@/lib/security/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMIT = 40;

export async function GET(req: Request) {
  const rl = rateLimit(clientKey(req, "search"), LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: rateLimitHeaders(rl, LIMIT) }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").slice(0, 120);
  const results = await unifiedSearch(q, 20);

  return NextResponse.json(
    { query: q, results },
    { headers: rateLimitHeaders(rl, LIMIT) }
  );
}
