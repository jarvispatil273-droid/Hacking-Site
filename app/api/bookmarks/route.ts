import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/repo";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ articleId: z.string().min(1).max(100) });

async function parse(req: Request) {
  try {
    return schema.safeParse(await req.json());
  } catch {
    return { success: false as const };
  }
}

export async function POST(req: Request) {
  const parsed = await parse(req);
  if (!parsed.success)
    return NextResponse.json({ error: "articleId required" }, { status: 400 });

  const user = await getCurrentUser();
  await getRepository().addBookmark(user.id, parsed.data.articleId);
  return NextResponse.json({ ok: true, saved: true });
}

export async function DELETE(req: Request) {
  const parsed = await parse(req);
  if (!parsed.success)
    return NextResponse.json({ error: "articleId required" }, { status: 400 });

  const user = await getCurrentUser();
  await getRepository().removeBookmark(user.id, parsed.data.articleId);
  return NextResponse.json({ ok: true, saved: false });
}
