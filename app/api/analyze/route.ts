import { NextRequest, NextResponse } from "next/server";
import { hasApiKey, startSkinAnalysis, uploadImage, YouCamError } from "@/lib/youcam";
import { allowLiveAnalysis } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BYTES = 4 * 1024 * 1024; // the browser resizes photos well below this

/** POST multipart/form-data { image } -> { taskId }. The photo is forwarded to YouCam, not stored. */
export async function POST(req: NextRequest) {
  if (!hasApiKey()) {
    return NextResponse.json({ error: "Live mode is off (no API key on the server). Use Sample mode." , code: "no_key" }, { status: 503 });
  }
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (!allowLiveAnalysis(ip)) {
    return NextResponse.json({ error: "Daily live-analysis limit reached for this demo. Sample mode is still available.", code: "rate_limited" }, { status: 429 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data", code: "bad_request" }, { status: 400 });
  }
  const file = form.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image uploaded", code: "bad_request" }, { status: 400 });
  }
  if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
    return NextResponse.json({ error: "Please upload a JPG or PNG photo", code: "bad_type" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Photo is too large", code: "too_large" }, { status: 413 });
  }
  try {
    const bytes = await file.arrayBuffer();
    const contentType = file.type === "image/png" ? "image/png" : "image/jpg";
    const fileId = await uploadImage(bytes, contentType, file.type === "image/png" ? "selfie.png" : "selfie.jpg");
    const taskId = await startSkinAnalysis(fileId);
    return NextResponse.json({ taskId });
  } catch (e) {
    const err = e instanceof YouCamError ? e : new YouCamError("Unexpected error");
    console.error("[analyze]", err.code, err.message);
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
  }
}
