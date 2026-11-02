#!/usr/bin/env node
/**
 * End-to-end check of Sample mode with headless Chromium.
 *   npm run dev   (in another terminal)   then   npm run e2e
 * BASE_URL defaults to http://localhost:3000.
 */
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sample = JSON.parse(await readFile(path.join(ROOT, "data", "sample-result.json"), "utf8"));
if (sample.recorded !== true || sample.preview || sample.response?.data?.task_status !== "success") {
  console.error("Sample checks require a genuine successful recorded API response; preview values are not accepted.");
  process.exit(1);
}

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) failures++; };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const consoleErrors = [];
const sampleApiRequests = [];
page.on("request", (request) => {
  if (/yce-api-01\.makeupar\.com/.test(request.url()) || /\/api\/analyze(?:[/?]|$)/.test(request.url())) sampleApiRequests.push(request.url());
});
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));

await page.goto(BASE, { waitUntil: "networkidle" });
const html = await page.content();
ok(!/Bearer\s+[A-Za-z0-9]/.test(html), "no Authorization header or key material in the page");

const sampleTab = page.getByRole("tab", { name: "Sample mode" });
if ((await sampleTab.getAttribute("aria-selected")) !== "true") await sampleTab.click();
ok(await page.getByTestId("sample-banner").isVisible(), "Sample mode banner is visible");
ok(/SAMPLE MODE: recorded result/.test(await page.getByTestId("sample-banner").innerText()), "banner labels it as a recorded real result");

// Case 1: 5 example sleep hours -> a pause prompt, separate from API observations
await page.getByTestId("wanted").selectOption("dark_circle_v2");
await page.getByTestId("hours").fill("5");
await page.getByTestId("analyze").click();
await page.getByTestId("results").waitFor({ timeout: 10_000 });
ok(await page.getByTestId("mirror").isVisible(), "mirror card shows the face");
const rows = await page.getByTestId("scores").locator("li").count();
ok(rows === 5, `5 concern scores shown (got ${rows})`);
ok((await page.getByTestId("verdict").getAttribute("data-kind")) === "sleep-first", "5 example hours -> pause and reassess");
const headline = await page.getByTestId("verdict-headline").innerText();
ok(/Pause & reassess/i.test(headline), `headline: "${headline}"`);

const originalScores = await page.getByTestId("scores").innerText();

ok((await page.getByTestId("verdict").innerText()).includes("Self-reported sleep is under 7 h (entered: 5 h)"), "5-hour explanation matches input");

// Case 2: 8 example sleep hours -> review options, without changing API scores
await page.getByTestId("hours").fill("8");
ok((await page.getByTestId("verdict").getAttribute("data-kind")) === "choose-product", "8 example hours -> review your options");

ok(/Review your options/i.test(await page.getByTestId("verdict-headline").innerText()), "review prompt uses neutral wording");
ok(await page.getByTestId("scores").innerText() === originalScores, "changing example sleep hours does not alter recorded API scores");

ok((await page.getByTestId("verdict").innerText()).includes("Self-reported sleep is at least 7 h (entered: 8 h)"), "8-hour explanation matches input");

// Case 3: all concerns use the same self-reported-hours rule
await page.getByTestId("hours").fill("4");
await page.getByTestId("wanted").selectOption("age_spot");
ok((await page.getByTestId("verdict").getAttribute("data-kind")) === "sleep-first", "age spots + 4 example hours -> the same pause prompt");
ok(/Pause & reassess/i.test(await page.getByTestId("verdict-headline").innerText()), "no unsupported sleep-insensitive classification");

ok(await page.getByTestId("how").isVisible(), "'How we decided' panel is visible");
ok(await page.getByTestId("disclaimer").isVisible(), "disclaimer is visible");
const links = await page.locator("a[href*='doi.org']").count();
ok(links >= 1, `links to ${links} research source(s) with context`);
ok(sampleApiRequests.length === 0, "Sample mode uses no live inference requests");
ok(consoleErrors.length === 0, `no console errors${consoleErrors.length ? ": " + consoleErrors.join(" | ") : ""}`);

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : "\nAll sample-mode checks passed");
process.exit(failures ? 1 : 0);
