import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/repo";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const notifications = await getRepository().listNotifications(user.id);
  return NextResponse.json({ notifications });
}

const schema = z.object({ id: z.string().min(1).max(100) });

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = schema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!parsed.success)
    return NextResponse.json({ error: "id required" }, { status: 400 });

  const user = await getCurrentUser();
  await getRepository().markNotificationRead(user.id, parsed.data.id);
  return NextResponse.json({ ok: true });
}
