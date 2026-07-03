import { NextResponse } from "next/server";
import { backendMode, hasOpenAI } from "@/lib/env";
import { getRepository } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getRepository().stats();
    return NextResponse.json({
      ok: true,
      backend: backendMode(),
      ai: hasOpenAI() ? "openai" : "extractive-fallback",
      stats,
      time: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
