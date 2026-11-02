#!/usr/bin/env node
/**
 * Captures submission screenshots and a screen-recorded demo of Sample mode.
 *   npm run dev   (in another terminal)   then   npm run capture
 * Output: submission/screenshots/*.png, submission/demo/demo.webm (+ demo.mp4,
 * demo-captioned.mp4, captions.srt when ffmpeg is on PATH).
 */
import { chromium } from "playwright";
import { mkdir, rm, rename, readdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SHOTS = path.join(ROOT, "submission", "screenshots");
const DEMO = path.join(ROOT, "submission", "demo");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir(SHOTS, { recursive: true });
await mkdir(DEMO, { recursive: true });
const browser = await chromium.launch();

async function openSample(page) {
  await page.goto(BASE, { waitUntil: "networkidle" });
  const tab = page.getByRole("tab", { name: "Sample mode" });
  if ((await tab.getAttribute("aria-selected")) !== "true") await tab.click();
}

// ---------------- screenshots ----------------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await openSample(page);
  await page.getByTestId("hours").fill("4.5");
  await page.screenshot({ path: path.join(SHOTS, "01-start-sample-mode.png") });

  await page.getByTestId("wanted").selectOption("dark_circle_v2");
  await page.getByTestId("analyze").click();
  await page.getByTestId("results").waitFor();
  await wait(900);
  await page.getByTestId("results").scrollIntoViewIfNeeded();
  await page.evaluate(() => document.querySelector("[data-testid=results]").scrollIntoView({ block: "start" }));
  await wait(500);
  await page.screenshot({ path: path.join(SHOTS, "02-mirror-scores.png") });

  await page.evaluate(() => document.querySelector("[data-testid=verdict]").scrollIntoView({ block: "start" }));
  await wait(500);
  await page.screenshot({ path: path.join(SHOTS, "03-verdict-sleep-first.png") });

  await page.getByTestId("hours").fill("8");
  await page.getByTestId("wanted").selectOption("age_spot");
  await wait(700);
  await page.evaluate(() => document.querySelector("[data-testid=verdict]").scrollIntoView({ block: "start" }));
  await wait(400);
  await page.screenshot({ path: path.join(SHOTS, "04-verdict-choose-product.png") });
  await ctx.close();

  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mp = await m.newPage();
  await openSample(mp);
  await mp.getByTestId("hours").fill("5");
  await mp.getByTestId("analyze").click();
  await mp.getByTestId("results").waitFor();
  await wait(900);
  await mp.evaluate(() => document.querySelector("[data-testid=results]").scrollIntoView({ block: "start" }));
  await wait(500);
  await mp.screenshot({ path: path.join(SHOTS, "05-mobile-mirror.png") });
  await m.close();
  console.log("Screenshots saved to submission/screenshots/");
}

// ---------------- demo video ----------------
const cues = [];
const t0 = Date.now();
let cueStart = 0;
function cue(text) {
  const now = (Date.now() - t0) / 1000;
  if (cues.length) cues[cues.length - 1].end = now;
  cues.push({ start: now, end: now + 4, text });
  cueStart = now;
}

const vctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: DEMO, size: { width: 1280, height: 800 } },
});
const page = await vctx.newPage();

const card = (title, body) => `<!doctype html><html><body style="margin:0;height:100vh;display:grid;place-items:center;
  background:linear-gradient(180deg,#070d22,#13204a 60%,#3b4a86);color:#f4f1ea;font-family:Georgia,serif;text-align:center">
  <div style="max-width:900px;padding:40px">
  <div style="font:600 13px system-ui;letter-spacing:.25em;text-transform:uppercase;color:#e8c98f;margin-bottom:18px">Sleep or Serum</div>
  <h1 style="font-size:46px;line-height:1.15;margin:0 0 22px">${title}</h1>
  <div style="font:18px/1.6 system-ui;color:rgba(244,241,234,.85)">${body}</div></div></body></html>`;

cue("Sleep or Serum: before you buy that eye cream, check last night.");
await page.setContent(card("Before you buy that eye cream,<br/>check last night.",
  "A one-question shopping assistant built on the <b>YouCam AI Skin Analysis API</b>."));
await wait(6000);

cue("Judges can try Sample mode for free: it replays a real, recorded YouCam API result.");
await openSample(page);
await page.getByTestId("hours").fill("7.5");
await wait(5500);

cue("Step 2: how long did you sleep? The sky gets darker as the night gets shorter.");
for (const v of ["7", "6.5", "6", "5.5", "5", "4.5"]) {
  await page.getByTestId("hours").fill(v);
  await wait(900);
}
await wait(1500);

cue("Step 3: what were you about to buy? Here: an eye cream for dark circles.");
await page.getByTestId("wanted").selectOption("dark_circle_v2");
await wait(4000);

cue("Look in the mirror. In live mode this uploads the photo and polls the YouCam skin-analysis task.");
await page.getByTestId("analyze").click();
await page.getByTestId("results").waitFor();
await wait(1200);
await page.evaluate(() => document.querySelector("[data-testid=results]").scrollIntoView({ behavior: "smooth", block: "start" }));
await wait(4500);

cue("Five SD concerns from YouCam: dark circles, eye bags, droopy upper eyelid, radiance and age spots.");
await wait(4500);
const chips = page.locator(".overlay-chips .chip");
if ((await chips.count()) > 1) {
  cue("The mirror can show YouCam's own detection overlay for each concern.");
  for (let i = 1; i < Math.min(await chips.count(), 4); i++) {
    await chips.nth(i).click();
    await wait(2000);
  }
  await chips.nth(0).click();
  await wait(1000);
}

cue("Verdict: dark circles are sleep-sensitive and the night was short, so sleep 3 good nights first.");
await page.evaluate(() => document.querySelector("[data-testid=verdict]").scrollIntoView({ behavior: "smooth", block: "start" }));
await wait(6000);

cue("No black box: every rule the app checked is listed, with the cut-offs it used.");
await page.evaluate(() => document.querySelector("[data-testid=how]").scrollIntoView({ behavior: "smooth", block: "center" }));
await wait(6000);

cue("Slept 8 hours instead? Sleep is not the likely fix, so the app suggests a product category.");
await page.evaluate(() => document.querySelector("[data-testid=results]").scrollIntoView({ behavior: "smooth", block: "start" }));
await wait(1200);
for (const v of ["5.5", "6.5", "7.5", "8"]) {
  await page.getByTestId("hours").fill(v);
  await wait(700);
}
await page.evaluate(() => document.querySelector("[data-testid=verdict]").scrollIntoView({ behavior: "smooth", block: "start" }));
await wait(5000);

cue("Age spots are not sleep-sensitive, so the verdict says: choose a product for it. Categories only, no brands.");
await page.getByTestId("wanted").selectOption("age_spot");
await wait(6000);

cue("Every sleep claim cites peer-reviewed research, and the app says clearly: not medical advice.");
await page.evaluate(() => document.querySelector(".evidence").scrollIntoView({ behavior: "smooth", block: "start" }));
await wait(5000);
await page.evaluate(() => document.querySelector("[data-testid=disclaimer]").scrollIntoView({ behavior: "smooth", block: "center" }));
await wait(4000);

cue("Under the hood: YouCam File API upload, skin-analysis task, then polling. The API key stays on the server.");
await page.setContent(card("Under the hood",
  `<div style="text-align:left;display:inline-block;font:16px/1.9 ui-monospace,Consolas,monospace">
  1&nbsp; POST /s2s/v2.0/file &nbsp;&rarr; file_id + pre-signed URL<br/>
  2&nbsp; PUT&nbsp; selfie &rarr; pre-signed URL<br/>
  3&nbsp; POST /s2s/v2.0/task/skin-analysis<br/>&nbsp;&nbsp;&nbsp; dst_actions: dark_circle_v2, eye_bag, droopy_upper_eyelid, radiance, age_spot<br/>
  4&nbsp; GET&nbsp; /s2s/v2.0/task/skin-analysis/{task_id} &nbsp;(poll)<br/>
  5&nbsp; ui_score per concern + hours slept &rarr; transparent rule &rarr; verdict</div>
  <p style="margin-top:22px">Next.js on Vercel &middot; key only in a server route &middot; Sample mode replays one recorded real result</p>`));
await wait(9000);

cue("Sleep or Serum: sleep first, or buy with confidence.");
await page.setContent(card("Sleep first, or buy with confidence.",
  "Built with the YouCam AI Skin Analysis API &middot; Not medical advice"));
await wait(5000);
cues[cues.length - 1].end = (Date.now() - t0) / 1000;

const video = page.video();
await vctx.close();
await browser.close();

const raw = await video.path();
const webm = path.join(DEMO, "demo.webm");
await rm(webm, { force: true });
await rename(raw, webm);
for (const f of await readdir(DEMO)) if (f.endsWith(".webm") && f !== "demo.webm") await rm(path.join(DEMO, f));

const srt = cues
  .map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`)
  .join("\n");
await writeFile(path.join(DEMO, "captions.srt"), srt);
console.log(`Video saved: submission/demo/demo.webm (${Math.round(cues[cues.length - 1].end)} s), captions.srt`);

try {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", webm, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", path.join(DEMO, "demo.mp4")], { cwd: DEMO });
  console.log("Saved submission/demo/demo.mp4");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", "demo.webm", "-vf",
    "subtitles=captions.srt:force_style='Fontsize=12,PrimaryColour=&H00F4F1EA,BackColour=&H90000000,BorderStyle=4,Outline=0,MarginV=24'",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", "demo-captioned.mp4"], { cwd: DEMO });
  console.log("Saved submission/demo/demo-captioned.mp4");
} catch (e) {
  console.log("ffmpeg step skipped or failed:", e.message?.split("\n")[0]);
}

function ts(s) {
  const ms = Math.round(s * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${sec},${String(ms % 1000).padStart(3, "0")}`;
}
