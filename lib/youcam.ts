import "server-only";
import { CONCERN_IDS, ConcernId } from "./concerns";
import type { ConcernScore } from "./verdict";

/**
 * Minimal server-side client for the YouCam AI Skin Analysis API (V2).
 * Docs: https://docs.perfectcorp.com/reference/ai_skin_analysis
 *
 *   1. POST /s2s/v2.0/file                      -> file_id + pre-signed upload URL
 *   2. PUT  <pre-signed URL>                    (upload the image bytes)
 *   3. POST /s2s/v2.0/task/skin-analysis        -> task_id
 *   4. GET  /s2s/v2.0/task/skin-analysis/{id}   (poll until success | error)
 *
 * Auth: "Authorization: Bearer <YOUCAM_API_KEY>". The key is read from
 * process.env on the server only and is never sent to the browser.
 */
export const YOUCAM_API_BASE = process.env.YOUCAM_API_BASE_URL || "https://yce-api-01.makeupar.com";

/** 5 SD concerns = 12 units per successful analysis (docs: SD 5~8 concerns). */
export const DST_ACTIONS: ConcernId[] = [...CONCERN_IDS];

export function hasApiKey(): boolean {
  return (process.env.YOUCAM_API_KEY ?? "").trim().length > 0;
}

function authHeaders(): Record<string, string> {
  const key = (process.env.YOUCAM_API_KEY ?? "").trim();
  if (!key) throw new YouCamError("YOUCAM_API_KEY is not set", 503, "no_key");
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

/** Refuse inference when the account does not have enough prepaid/free units. */
export async function requireAvailableUnits(): Promise<void> {
  const res = await fetch(`${YOUCAM_API_BASE}/s2s/v1.0/client/credit`, {
    headers: authHeaders(), cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  const body = await res.json().catch(() => ({}));
  const entries = body?.results ?? body?.data?.results;
  const available = Array.isArray(entries)
    ? entries.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0)
    : 0;
  if (!res.ok || available < 12) {
    throw new YouCamError("Live analysis is temporarily unavailable. Please use the recorded sample.", 503, "insufficient_units");
  }
}

export class YouCamError extends Error {
  constructor(
    message: string,
    public status = 502,
    public code = "youcam_error",
  ) {
    super(message);
  }
}

async function readJson(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 300) };
  }
}

/** Steps 1 + 2: register the file and upload the bytes to the pre-signed URL. */
export async function uploadImage(
  bytes: ArrayBuffer,
  contentType: string,
  fileName: string,
): Promise<string> {
  const res = await fetch(`${YOUCAM_API_BASE}/s2s/v2.0/file`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      files: [{ content_type: contentType, file_name: fileName, file_size: bytes.byteLength }],
    }),
  });
  const json = await readJson(res);
  if (!res.ok) {
    throw new YouCamError(`File API failed (${res.status}): ${json?.error ?? "unknown"}`, res.status === 401 ? 401 : 502, json?.error_code ?? "file_api");
  }
  const file = (json?.data?.files ?? json?.files ?? [])[0];
  const upload = file?.requests?.[0];
  if (!file?.file_id || !upload?.url) throw new YouCamError("File API returned no upload URL");

  const put = await fetch(upload.url, {
    method: upload.method ?? "PUT",
    headers: Object.fromEntries(
      Object.entries(upload.headers ?? { "Content-Type": contentType }).map(([k, v]) => [k, String(v)]),
    ),
    body: bytes,
  });
  if (!put.ok) throw new YouCamError(`Upload to pre-signed URL failed (${put.status})`);
  return file.file_id as string;
}

/** Step 3: start the skin analysis task. */
export async function startSkinAnalysis(fileId: string): Promise<string> {
  const res = await fetch(`${YOUCAM_API_BASE}/s2s/v2.0/task/skin-analysis`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      src_file_id: fileId,
      dst_actions: DST_ACTIONS,
      miniserver_args: { enable_mask_overlay: true },
      format: "json",
    }),
  });
  const json = await readJson(res);
  if (!res.ok || !json?.data?.task_id) {
    throw new YouCamError(`Skin analysis task failed to start (${res.status}): ${json?.error ?? "unknown"}`, res.status === 429 ? 429 : 502, json?.error_code ?? "task_api");
  }
  return json.data.task_id as string;
}

export type TaskState =
  | { status: "running" }
  | { status: "error"; error: string; message?: string }
  | { status: "success"; scores: ConcernScore[]; overall?: number; skinAge?: number };

/** Step 4: check the task once (the browser polls this through our API route). */
export async function checkSkinAnalysis(taskId: string): Promise<TaskState> {
  const res = await fetch(
    `${YOUCAM_API_BASE}/s2s/v2.0/task/skin-analysis/${encodeURIComponent(taskId)}`,
    { headers: authHeaders(), cache: "no-store" },
  );
  const json = await readJson(res);
  if (!res.ok) {
    return { status: "error", error: json?.error_code ?? `http_${res.status}`, message: json?.error };
  }
  const data = json?.data ?? {};
  if (data.task_status === "success") return { status: "success", ...normalizeOutput(data.results?.output ?? []) };
  if (data.task_status === "error") return { status: "error", error: data.error ?? "unknown_error", message: data.error_message };
  return { status: "running" };
}

/** Turn the `results.output` array (format=json) into our ConcernScore list. */
export function normalizeOutput(output: any[]): { scores: ConcernScore[]; overall?: number; skinAge?: number } {
  const scores: ConcernScore[] = [];
  let overall: number | undefined;
  let skinAge: number | undefined;
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    if (item.type === "all" && typeof item.score === "number") overall = item.score;
    if (item.type === "skin_age" && typeof item.score === "number") skinAge = item.score;
    if ((CONCERN_IDS as string[]).includes(item.type) && typeof item.ui_score === "number") {
      scores.push({
        id: item.type,
        uiScore: item.ui_score,
        rawScore: typeof item.raw_score === "number" ? item.raw_score : item.ui_score,
        maskUrl: Array.isArray(item.mask_urls) ? item.mask_urls[0] : undefined,
      });
    }
  }
  return { scores, overall, skinAge };
}
