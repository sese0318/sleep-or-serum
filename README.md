# Sleep or Serum

**Before you buy that eye cream, check last night.**

Sleep or Serum is a one-screen web app. You take or upload a selfie and enter how many hours you slept last night. The app sends the photo to the **YouCam AI Skin Analysis API**, shows five skin-concern scores in a mirror-shaped card next to your sleep hours, and gives one of two verdicts:

- **Sleep:** "Sleep 3 good nights before buying that eye cream." The concern you were about to buy for is one that changes with sleep loss, and last night was short.
- **Serum:** "This concern doesn't change much with sleep. Choose a product for it." The app suggests a product *category*. It never names a brand.

The rule is simple and the app shows it: every check, every cut-off, and the peer-reviewed source behind each one.

> **Not medical advice.** This is a consumer demo for cosmetic shopping decisions. It does not diagnose anything.

## Which YouCam API is used, and how

**AI Skin Analysis, V2 API, SD mode, `format: "json"`.** Docs: https://docs.perfectcorp.com/reference/ai_skin_analysis

| Step | Call | Where in the code |
|---|---|---|
| 1 | `POST https://yce-api-01.makeupar.com/s2s/v2.0/file` with `{ files: [{ content_type, file_name, file_size }] }` returns a `file_id` and a pre-signed upload URL | `lib/youcam.ts` `uploadImage()` |
| 2 | `PUT` the image bytes to the pre-signed URL with the headers the File API returned | `lib/youcam.ts` `uploadImage()` |
| 3 | `POST /s2s/v2.0/task/skin-analysis` with `src_file_id`, `dst_actions`, `miniserver_args.enable_mask_overlay: true`, `format: "json"` returns a `task_id` | `lib/youcam.ts` `startSkinAnalysis()` |
| 4 | `GET /s2s/v2.0/task/skin-analysis/{task_id}` until `task_status` is `success` or `error`. The browser polls our route every 3 s | `lib/youcam.ts` `checkSkinAnalysis()`, `app/api/analyze/[taskId]/route.ts` |
| 5 | Read `results.output[]` (`type`, `ui_score`, `raw_score`, `mask_urls`) and apply the verdict rule | `lib/verdict.ts` |

Auth is `Authorization: Bearer <YOUCAM_API_KEY>`. The key is read from `process.env` inside server route handlers only (`import "server-only"`). It is never sent to the browser, logged, or committed.

**Concerns requested (`dst_actions`, all SD):** `dark_circle_v2`, `eye_bag`, `droopy_upper_eyelid`, `radiance`, `age_spot`. According to the docs, 5 to 8 SD concerns cost **12 units** per successful analysis. Failed tasks cost nothing.

| Concern | Treated as | Why |
|---|---|---|
| Dark circles | sleep-sensitive | Darker circles were rated after sleep deprivation (Sundelin et al., 2013) |
| Eye bags | sleep-sensitive | More swollen eyes (Sundelin et al., 2013) |
| Droopy upper eyelid | sleep-sensitive | More hanging eyelids (Sundelin et al., 2013) |
| Radiance | sleep-sensitive | Paler skin (Sundelin et al., 2013), mapped to YouCam's skin-brightness score |
| Age spots | **not** sleep-sensitive | Not among the cues that changed with sleep loss in Sundelin et al. (2013). This is the control concern |

### The verdict rule (`lib/verdict.ts`)

1. **Focus concern** = what the user says they were about to buy, or their lowest `ui_score` if they are not sure.
2. **Short night** = under 7 hours. Adults are advised to sleep 7 or more hours (Watson et al., 2015, AASM/SRS consensus).
3. If the focus concern is sleep-sensitive **and** the night was short, the verdict is **Sleep**. Otherwise it is **Serum**, with a product category.
4. A `ui_score` below 80 is shown as "noticeable". That cut-off is the app's own choice, not a clinical threshold, and the UI says so. "3 nights" is a rule of thumb: long enough to retake the photo before spending money.

## Sample mode (for judges, no key needed)

Sample mode replays **one recorded real API response** for the sample photo (`data/sample-result.json`, plus YouCam's overlay images in `public/sample/masks/`). The app labels it as a recorded sample, makes no API call, and needs no key. Moving the hours slider or changing the product choice recomputes the verdict, so judges can test the logic for free. If the server has no `YOUCAM_API_KEY`, the app opens in Sample mode and turns Live mode off.

The recording was made with `scripts/record-sample.mjs`. The script does the same File → task → poll flow, removes task/file IDs and signed URLs, and saves the overlays locally because YouCam's download links expire after about 2 hours.

## Run it locally

Requires Node.js 18.18+ (tested with Node 22).

```bash
npm install
# optional, for Live mode: put your key in .env.local
#   YOUCAM_API_KEY=your_key_here
npm run dev          # http://localhost:3000
npm run build        # production build
```

| Env var | Required | Purpose |
|---|---|---|
| `YOUCAM_API_KEY` | No (Sample mode works without it) | Enables Live mode. Server-side only |
| `LIVE_DAILY_LIMIT_PER_IP` | No (default 5) | Best-effort, in-memory cap on live analyses per IP per day, so a public demo cannot burn through your units |

### Scripts

| Command | What it does |
|---|---|
| `npm run record-sample` | Runs ONE real analysis on the sample photo (12 units) and saves the sanitized result. Refuses to run again unless you pass `-- --force` |
| `npm run e2e` | Headless Chromium end-to-end check of Sample mode (start `npm run dev` first) |
| `npm run capture` | Regenerates `submission/screenshots/*.png` and the demo video in `submission/demo/` |

Run `npx playwright install chromium` once before `e2e` or `capture`.

## Privacy

In Live mode the photo is resized in the browser (long side ≤ 2048 px) and forwarded to the YouCam API for that one analysis. This app has no database and does not store photos or results. YouCam's docs say uploaded files are kept on their servers for 24 hours.

## Project layout

```
app/page.tsx                    server component: picks Live vs Sample mode
app/SleepOrSerum.tsx            the whole UI (client component)
app/api/analyze/route.ts        POST: File API upload + start task
app/api/analyze/[taskId]/...    GET: poll task status
lib/youcam.ts                   YouCam API client (server-only)
lib/verdict.ts                  the transparent verdict rule
lib/concerns.ts, lib/sources.ts concern config and verified citations
data/sample-result.json         recorded real API result (Sample mode)
scripts/                        record-sample, e2e-sample, capture-demo
submission/                     Devpost text, screenshots, demo video, deploy guide
```

## Credits and license

The sample photo is by Wanas Rosa on Pexels, used under the Pexels License. Skin analysis is by the YouCam AI Skin Analysis API (Perfect Corp.). The full list of sources is in [CREDITS.md](CREDITS.md).

Code is released under the [MIT License](LICENSE).
