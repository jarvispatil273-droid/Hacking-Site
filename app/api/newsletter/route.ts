import { NextResponse } from "next/server";
import { z } from "zod";
import { CATEGORIES } from "@/types";
import { getRepository } from "@/lib/repo";
import { clientKey, rateLimit, rateLimitHeaders } from "@/lib/security/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMIT = 5;

const schema = z.object({
  email: z.string().email().max(200),
  categories: z.array(z.enum(CATEGORIES)).optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "newsletter"), LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again shortly." },
      { status: 429, headers: rateLimitHeaders(rl, LIMIT) }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 }
    );
  }

  const sub = await getRepository().subscribeNewsletter(
    parsed.data.email.toLowerCase(),
    parsed.data.categories ?? []
  );

  return NextResponse.json({ ok: true, subscription: sub });
}
