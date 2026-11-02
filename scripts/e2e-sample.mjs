#!/usr/bin/env node
/**
 * End-to-end check of Sample mode with headless Chromium.
 *   npm run dev   (in another terminal)   then   npm run e2e
 * BASE_URL defaults to http://localhost:3000.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) failures++; };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));

await page.goto(BASE, { waitUntil: "networkidle" });
const html = await page.content();
ok(!/Bearer\s+[A-Za-z0-9]/.test(html), "no Authorization header or key material in the page");

const sampleTab = page.getByRole("tab", { name: "Sample mode" });
if ((await sampleTab.getAttribute("aria-selected")) !== "true") await sampleTab.click();
ok(await page.getByTestId("sample-banner").isVisible(), "Sample mode banner is visible");
ok(/SAMPLE MODE: recorded result/.test(await page.getByTestId("sample-banner").innerText()), "banner labels it as a recorded real result");

// Case 1: dark circles + 5 h -> sleep first
await page.getByTestId("wanted").selectOption("dark_circle_v2");
await page.getByTestId("hours").fill("5");
await page.getByTestId("analyze").click();
await page.getByTestId("results").waitFor({ timeout: 10_000 });
ok(await page.getByTestId("mirror").isVisible(), "mirror card shows the face");
const rows = await page.getByTestId("scores").locator("li").count();
ok(rows === 5, `5 concern scores shown (got ${rows})`);
ok((await page.getByTestId("verdict").getAttribute("data-kind")) === "sleep-first", "dark circles + 5 h -> SLEEP verdict");
const headline = await page.getByTestId("verdict-headline").innerText();
ok(/Sleep 3 good nights|Sleep 3 good nights before buying anything/i.test(headline), `headline: "${headline}"`);

// Case 2: same concern, 8 h -> choose a product
await page.getByTestId("hours").fill("8");
ok((await page.getByTestId("verdict").getAttribute("data-kind")) === "choose-product", "dark circles + 8 h -> SERUM verdict");

// Case 3: age spots (not sleep-sensitive) + 4 h -> choose a product
await page.getByTestId("hours").fill("4");
await page.getByTestId("wanted").selectOption("age_spot");
ok((await page.getByTestId("verdict").getAttribute("data-kind")) === "choose-product", "age spots + 4 h -> SERUM verdict");
ok(/doesn't change much with sleep/i.test(await page.getByTestId("verdict-headline").innerText()), "headline explains it doesn't change much with sleep");

ok(await page.getByTestId("how").isVisible(), "'How we decided' panel is visible");
ok(await page.getByTestId("disclaimer").isVisible(), "disclaimer is visible");
const links = await page.locator("a[href*='doi.org']").count();
ok(links >= 3, `cites ${links} DOI links`);
ok(consoleErrors.length === 0, `no console errors${consoleErrors.length ? ": " + consoleErrors.join(" | ") : ""}`);

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : "\nAll sample-mode checks passed");
process.exit(failures ? 1 : 0);
