# Sleep or Serum

**A moment to pause before your next skincare purchase.**

Sleep or Serum is a one-screen cosmetic reflection app built with the **YouCam AI Skin Analysis API**. It places five appearance scores beside your self-reported sleep hours, so you can review a photo in context before deciding what to do next.

The API describes visible features in an image. It does not establish why they appear, measure sleep, diagnose a condition, or determine whether you need a product. Sleep hours never change the API scores.

## Current verification status — November 2, 2026

- **Public source:** https://github.com/sese0318/sleep-or-serum (PUBLIC; anonymous access returned HTTP 200).
- **Genuine YouCam recording complete:** recorded at `2026-11-02T15:58:46.772Z`, with 8 output items and 6 saved-overlay entries. The single successful analysis used 12 free units.
- **Local checks passed:** production build; all 17 sample end-to-end checks; home page HTTP 200; invalid task ID and invalid upload HTTP 400. A scan of client build files found no exact API-key value matches.
- **Public judge app READY:** https://sleep-or-serum.vercel.app — anonymous HTTP 200 and genuine recorded-result interaction verified. Scores displayed: 73, 66, 77, 73, 77. Project-only sign-in protection was removed with explicit user approval.
- **Live configuration:** `YOUCAM_API_KEY` is saved as a Production-only Secret. A new deployment to apply it and a fresh live-analysis test are still pending; recorded Sample mode is ready now.
- **Submission media verified:** five refreshed screenshots and a regenerated video use genuine recorded scores. Screenshot and video-frame inspection passed. `submission/demo/demo-captioned.mp4` is H.264, 1280 × 800, 103.2 seconds (1:43), 4,510,381 bytes. Plain MP4, WebM and captions were also regenerated.

The genuine result is in `data/sample-result.json`. The public recorded-sample judge entry and submission media are ready. YouTube publication and Devpost submission are the entrant's actions; the video can be uploaded now.

## The experience

1. Choose Live mode and upload a face photo, or use the clearly labeled recorded sample when available.
2. Enter last night's sleep hours and choose the concern you want to explore.
3. Review the five YouCam scores and any returned overlays in an arched mirror.
4. Read a transparent reflection prompt: **Pause & reassess** below 7 hours, or **Review your options** otherwise.

The 7-hour branch is an app reflection rule inspired by general adult sleep guidance; it is not a personalized recommendation or a validated skin model. The 80-point bar marker is a visual guide, not a medical threshold, and does not determine the reflection. Selecting a concern only changes the focus. Product categories are optional information, never a finding that a purchase is necessary.

## YouCam integration

This project uses **AI Skin Analysis, V2 API, SD concerns, JSON output**. [Official API documentation](https://docs.perfectcorp.com/reference/ai_skin_analysis).

| Step | Request | Implementation |
|---|---|---|
| Register image | `POST /s2s/v2.0/file` | `lib/youcam.ts`, `uploadImage()` |
| Upload bytes | `PUT` to the returned pre-signed URL | `lib/youcam.ts`, `uploadImage()` |
| Start analysis | `POST /s2s/v2.0/task/skin-analysis` | `lib/youcam.ts`, `startSkinAnalysis()` |
| Poll status | `GET /s2s/v2.0/task/skin-analysis/{task_id}` | `lib/youcam.ts`, `checkSkinAnalysis()` |
| Display output | Read concern scores and available masks | `app/SleepOrSerum.tsx` |

Requested concerns are `dark_circle_v2`, `eye_bag`, `droopy_upper_eyelid`, `radiance`, and `age_spot`. These are separate appearance outputs, not classifications of how sleep affects an individual.

`YOUCAM_API_KEY` is read in the server-only module. The browser talks to the app's route handlers. Keep the key in `.env.local` locally and in server environment configuration when deploying. Never put it in a `NEXT_PUBLIC_*` variable, a screenshot, or source control.

## Judge access and recorded sample

Sample mode replays the genuine response recorded on November 2, 2026, for the licensed sample photo. It makes no fresh YouCam request and needs no key. Sleep and concern controls recompute only the app's reflection; the recorded API scores stay fixed.

**The current `data/sample-result.json` has `recorded: true`.** The saved response came from one successful YouCam analysis. A documentation/example preview is not genuine integration evidence; the current screenshots/video have been regenerated and visually checked against this recorded result.

`scripts/record-sample.mjs` uses the same upload, task and polling flow, removes temporary IDs and signed URLs, and saves available overlays locally. Confirm free-unit balance before running it. No purchase or automatic recharge is part of this project.

Judges should have free access through November 20, 2026, 11:45 a.m. Eastern Time. Provide the final deployment URL in the submission and test it in a signed-out browser.

## Run locally

Use Node.js 22 and npm.

```bash
npm install
# For Live mode only, create the git-ignored .env.local:
# YOUCAM_API_KEY=your_key_here
npm run dev
```

Open `http://localhost:3000`.

| Command | Purpose |
|---|---|
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run record-sample` | Record one genuine result using available API units |
| `npm run e2e` | Check the sample interaction with Playwright; start the app first |
| `npm run capture` | Regenerate screenshots and video materials from the running app |

Run `npx playwright install chromium` if Chromium is not installed. The recording script prevents accidental replacement unless explicitly forced.

| Environment variable | Purpose |
|---|---|
| `YOUCAM_API_KEY` | Enables fresh server-side analyses; unnecessary for replay of an existing genuine sample |
| `LIVE_DAILY_LIMIT_PER_IP` | Best-effort in-memory daily limit for fresh requests (default 5); not durable across server instances |

The per-IP limit is a lightweight demo guard, not a guaranteed spending cap. Check the provider account's free-unit balance and settings before enabling public Live mode.

## Photos and privacy

Live mode resizes the selected photo in the browser and forwards it to YouCam for processing. The app has no photo database. The intentionally included sample photo, saved sample result and overlays are public demo assets. User-uploaded photos are not added to those assets.

YouCam processes uploads under its own terms and retention policy. Read those before uploading a photo. Use only a photo you are authorized to submit.

## Project files

- `app/`: interface and server route handlers.
- `lib/youcam.ts`: server-only YouCam client.
- `lib/verdict.ts`: transparent reflection rules, separate from the API outputs.
- `data/sample-result.json`: recording status and sanitized sample response.
- `public/sample/`: licensed demo image and available saved overlays.
- `scripts/`: recording, end-to-end checks and screen capture.
- `submission/`: English project copy, demo script, screenshots, video and final review checklist.

## Credits and limitations

The demo photo is by Wanas Rosa, used under the Pexels License. The person pictured does not endorse the app; no sleep history is inferred about that person. Entered sleep values in the demo are hypothetical. See [CREDITS.md](CREDITS.md).

Research sources are background inspiration, not validation of the YouCam model or the app's thresholds. This is a cosmetic demonstration, not medical advice. Code is [MIT licensed](LICENSE); the photo retains its separate Pexels license.
