import { NextRequest, NextResponse } from "next/server";
import { checkSkinAnalysis, hasApiKey, YouCamError } from "@/lib/youcam";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET -> { status: running | success | error, ... }. The browser polls this every few seconds. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ taskId: string }> }) {
  if (!hasApiKey()) return NextResponse.json({ status: "error", error: "no_key" }, { status: 503 });
  const { taskId } = await ctx.params;
  if (!/^[A-Za-z0-9_\-+/=]{10,200}$/.test(taskId)) {
    return NextResponse.json({ status: "error", error: "bad_task_id" }, { status: 400 });
  }
  try {
    const state = await checkSkinAnalysis(taskId);
    return NextResponse.json(state, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const err = e instanceof YouCamError ? e : new YouCamError("Unexpected error");
    return NextResponse.json({ status: "error", error: err.code, message: err.message }, { status: err.status });
  }
}
