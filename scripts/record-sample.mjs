#!/usr/bin/env node
/**
 * Records ONE real YouCam AI Skin Analysis result for the sample photo and
 * saves a sanitized copy for Sample mode.
 *
 *   npm run record-sample            (refuses if a recording already exists)
 *   npm run record-sample -- --force (re-record; costs units again)
 *
 * Reads YOUCAM_API_KEY from the environment or .env.local. The key is never
 * printed or written anywhere. Cost: 12 units (5 SD concerns, per the docs).
 *
 * Writes:
 *   data/sample-result.json        sanitized API response (signed URLs removed)
 *   public/sample/masks/<id>.jpg   YouCam detection overlays for each concern
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://yce-api-01.makeupar.com";
const DST_ACTIONS = ["dark_circle_v2", "eye_bag", "droopy_upper_eyelid", "radiance", "age_spot"];
const MINISERVER_ARGS = { enable_mask_overlay: true };
const IMAGE = path.join(ROOT, "public", "sample", "sample-face.jpg");
const OUT_JSON = path.join(ROOT, "data", "sample-result.json");
const MASK_DIR = path.join(ROOT, "public", "sample", "masks");

async function loadKey() {
  if (process.env.YOUCAM_API_KEY?.trim()) return process.env.YOUCAM_API_KEY.trim();
  for (const f of [".env.local", ".env"]) {
    const p = path.join(ROOT, f);
    if (!existsSync(p)) continue;
    const line = (await readFile(p, "utf8")).split(/\r?\n/).find((l) => /^\s*YOUCAM_API_KEY\s*=/.test(l));
    if (!line) continue;
    const v = line.replace(/^\s*YOUCAM_API_KEY\s*=\s*/, "").trim().replace(/^["']|["']$/g, "");
    if (v) return v;
  }
  return "";
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const force = process.argv.includes("--force");
  if (!force && existsSync(OUT_JSON)) {
    const cur = JSON.parse(await readFile(OUT_JSON, "utf8"));
    if (cur.recorded) {
      console.log("A recorded sample already exists (data/sample-result.json). Use --force to spend units and re-record.");
      return;
    }
  }
  const key = await loadKey();
  if (!key) {
    console.error("YOUCAM_API_KEY is empty. Add it to .env.local (YOUCAM_API_KEY=...) and run again.");
    process.exit(1);
  }
  const auth = { Authorization: `Bearer ${key}` };
  const json = { ...auth, "Content-Type": "application/json" };

  const unitsBefore = await totalUnits(auth);
  if (unitsBefore == null || unitsBefore < 12) {
    console.error("Recording stopped: at least 12 available units must be verified. Redeem the free hackathon code in your account first. No analysis was started.");
    process.exit(1);
  }

  // 1) File API: get a pre-signed upload URL + file_id
  const bytes = await readFile(IMAGE);
  console.log(`1/4 File API (${bytes.length} bytes)...`);
  const fRes = await fetch(`${BASE}/s2s/v2.0/file`, {
    method: "POST",
    headers: json,
    body: JSON.stringify({ files: [{ content_type: "image/jpg", file_name: "sample-face.jpg", file_size: bytes.length }] }),
  });
  const fJson = await fRes.json().catch(() => ({}));
  if (!fRes.ok) fail("File API", fRes.status, fJson);
  const file = (fJson?.data?.files ?? fJson?.files ?? [])[0];
  const up = file?.requests?.[0];
  if (!file?.file_id || !up?.url) fail("File API (no upload URL)", fRes.status, fJson);

  // 2) Upload bytes to the pre-signed URL
  console.log("2/4 Uploading image to the pre-signed URL...");
  const headers = Object.fromEntries(Object.entries(up.headers ?? { "Content-Type": "image/jpg" }).map(([k, v]) => [k, String(v)]));
  const put = await fetch(up.url, { method: up.method ?? "PUT", headers, body: bytes });
  if (!put.ok) fail("Upload", put.status, { error: await put.text().catch(() => "") });

  // 3) Start the skin analysis task
  console.log(`3/4 Starting skin analysis: ${DST_ACTIONS.join(", ")}`);
  const tRes = await fetch(`${BASE}/s2s/v2.0/task/skin-analysis`, {
    method: "POST",
    headers: json,
    body: JSON.stringify({ src_file_id: file.file_id, dst_actions: DST_ACTIONS, miniserver_args: MINISERVER_ARGS, format: "json" }),
  });
  const tJson = await tRes.json().catch(() => ({}));
  if (!tRes.ok || !tJson?.data?.task_id) fail("Run task", tRes.status, tJson);
  const taskId = tJson.data.task_id;

  // 4) Poll
  console.log("4/4 Polling task status every 5 s...");
  const t0 = Date.now();
  let result;
  while (Date.now() - t0 < 5 * 60_000) {
    await sleep(5000);
    const r = await fetch(`${BASE}/s2s/v2.0/task/skin-analysis/${encodeURIComponent(taskId)}`, { headers: json });
    const j = await r.json().catch(() => ({}));
    const st = j?.data?.task_status;
    console.log(`   status: ${st ?? r.status} (${Math.round((Date.now() - t0) / 1000)} s)`);
    if (st === "success") { result = j; break; }
    if (st === "error" || !r.ok) fail("Task", r.status, j);
  }
  if (!result) { console.error("Timed out waiting for the task."); process.exit(1); }

  // Save overlays locally (signed URLs expire after ~2 h) and strip URLs from the JSON
  await mkdir(MASK_DIR, { recursive: true });
  const output = [];
  for (const item of result.data.results?.output ?? []) {
    const clean = { ...item };
    if (Array.isArray(item.mask_urls) && item.mask_urls.length) {
      try {
        const m = await fetch(item.mask_urls[0]);
        if (m.ok) {
          const ct = m.headers.get("content-type") ?? "";
          const ext = ct.includes("png") ? "png" : "jpg";
          const name = `${item.type}${item.region && item.region !== "whole" ? "-" + item.region : ""}.${ext}`;
          await writeFile(path.join(MASK_DIR, name), Buffer.from(await m.arrayBuffer()));
          clean.saved_mask = `/sample/masks/${name}`;
        }
      } catch { /* overlay is optional */ }
      clean.mask_urls = item.mask_urls.map(() => "[signed URL removed; see saved_mask]");
    }
    output.push(clean);
  }

  const unitsAfter = await totalUnits(auth);
  const unitsUsed = unitsBefore != null && unitsAfter != null ? Math.round((unitsBefore - unitsAfter) * 100) / 100 : null;

  const saved = {
    recorded: true,
    recorded_at: new Date().toISOString(),
    _note: "Real YouCam AI Skin Analysis API response for public/sample/sample-face.jpg, recorded once by scripts/record-sample.mjs and replayed in Sample mode. Task/file IDs and signed URLs were removed.",
    source_image: "public/sample/sample-face.jpg (Pexels photo by Wanas Rosa, see CREDITS.md)",
    api: {
      base: BASE,
      steps: ["POST /s2s/v2.0/file", "PUT <pre-signed URL>", "POST /s2s/v2.0/task/skin-analysis", "GET /s2s/v2.0/task/skin-analysis/{task_id}"],
      docs: "https://docs.perfectcorp.com/reference/ai_skin_analysis",
    },
    request: { dst_actions: DST_ACTIONS, miniserver_args: MINISERVER_ARGS, format: "json" },
    units_used: unitsUsed,
    response: { status: result.status, data: { task_status: result.data.task_status, results: { output } } },
  };
  await writeFile(OUT_JSON, JSON.stringify(saved, null, 2) + "\n");
  console.log(`Saved data/sample-result.json with ${output.length} output items.`);
  console.log(unitsUsed != null ? `Units used (balance delta): ${unitsUsed}` : "Units used: not visible via the credit endpoint (expected 12 per the docs).");
}

/** Sum of unit balances, if the credit endpoint answers; null otherwise. */
async function totalUnits(auth) {
  try {
    const r = await fetch(`${BASE}/s2s/v1.0/client/credit`, { headers: auth });
    if (!r.ok) return null;
    const j = await r.json();
    const list = j?.results ?? j?.data?.results ?? [];
    if (!Array.isArray(list)) return null;
    return list.reduce((a, x) => a + (Number(x.amount) || 0), 0);
  } catch {
    return null;
  }
}

function fail(step, status, body) {
  const code = body?.error_code ?? body?.data?.error ?? "";
  const msg = body?.error ?? body?.data?.error_message ?? body?.message ?? "";
  console.error(`${step} failed (HTTP ${status}) ${code} ${String(msg).slice(0, 300)}`);
  process.exit(1);
}

main().catch((e) => {
  console.error("Unexpected error:", e?.message ?? e);
  process.exit(1);
});
