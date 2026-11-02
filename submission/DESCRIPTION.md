# Sleep or Serum

**Before you buy that eye cream, check last night.**

## Inspiration

I study psychology at Bunker Hill Community College in Boston, and I keep coming back to sleep, dreams and the brain. Sleep research has a finding that sounds like a beauty tip but comes from controlled experiments: when the same people are photographed after a normal night and after sleep deprivation, observers rate them as having darker circles, more swollen eyes, more hanging eyelids and paler skin (Sundelin et al., 2013, *Sleep*). They also rate them as less healthy and more tired (Axelsson et al., 2010, *BMJ*).

> **[SEIKA: add your own "mirror moment" here in 1–2 sentences, or delete this line.]**

That gave me a shopping question: when you see dark circles in the mirror and reach for an eye cream, are you looking at a skin problem or at last night? Skin-analysis apps usually answer "buy something." I wanted an app that sometimes says "sleep first."

## What it does

1. Take or upload a selfie.
2. Enter how many hours you slept last night (the background moves from pre-dawn navy to morning as you add hours).
3. Pick what you were about to buy, for example an eye cream for dark circles, or let the app use your lowest score.
4. The **YouCam AI Skin Analysis API** scores five concerns. The app shows them in a mirror-shaped card next to your sleep hours, with YouCam's detection overlays.
5. You get one of two verdicts:
   - **Sleep:** "Sleep 3 good nights before buying that eye cream." The concern is sleep-sensitive and the night was short.
   - **Serum:** "This concern doesn't change much with sleep. Choose a product for it." The app gives a product *category* and never names a brand.

A "How we decided" panel lists every check with ✓/✗, the cut-offs used, and the source behind each one. Every claim about sleep links to a peer-reviewed paper. A clear disclaimer says it is not medical advice.

**Judges can try it for free:** Sample mode replays one recorded real YouCam API response for a licensed sample photo. It is labeled as a recorded sample, needs no key, and the hours and product controls still change the verdict live.

## How we built it (Technological Implementation)

- **YouCam AI Skin Analysis, V2 API, SD mode, `format: "json"`**, following the official docs step by step:
  1. `POST /s2s/v2.0/file` → `file_id` + pre-signed URL
  2. `PUT` the photo to the pre-signed URL
  3. `POST /s2s/v2.0/task/skin-analysis` with `dst_actions: ["dark_circle_v2", "eye_bag", "droopy_upper_eyelid", "radiance", "age_spot"]` and `enable_mask_overlay: true`
  4. Poll `GET /s2s/v2.0/task/skin-analysis/{task_id}` until `success`, then read `ui_score`, `raw_score` and `mask_urls` per concern
- **Concern choice:** four concerns map to the facial cues that changed after sleep loss in Sundelin et al. (2013). **Age spots are a deliberate control.** They were not among those cues, so the app can show the honest "Serum" answer too.
- **Next.js (App Router, TypeScript) on Vercel.** The API key lives only in server route handlers (`server-only`). The browser polls our own route, so long tasks never hit a serverless timeout.
- **Photo handling:** the browser resizes photos to YouCam's SD limits (short side ≥ 480 px), and YouCam error codes (`error_src_face_too_small`, `error_lighting_dark`, …) become plain-English retake tips.
- **Cost guard:** 5 SD concerns = 12 units per analysis. A per-IP daily cap protects the demo key.
- **Sample mode** comes from a one-time recording script that runs the same real flow, strips signed URLs and IDs, and saves YouCam's overlay images locally, because the download links expire after about 2 hours.
- **Tested** end to end with Playwright (headless Chromium): verdict switching, sources, disclaimer, and that no key material reaches the page.

## Design

- One question, one screen, one answer. Three steps (face, hours, what you were about to buy), then the result.
- The sky follows your sleep. The background shifts from pre-dawn navy to soft morning as you add hours, and the moon sets.
- Results appear in an arched vanity mirror, with YouCam's overlay for each concern one tap away.
- Each score bar shows the cut-off, and each concern is tagged *sleep-sensitive* or *not sleep-sensitive*. The verdict sits right under the mirror.
- Mobile-first layout. Sample mode is clearly labeled everywhere it appears.

## Potential Impact

- **Who it helps:** shoppers in their late teens and twenties, especially students, who sleep less than 7 hours and see dark circles or puffiness in the mirror the next morning. The AASM/SRS consensus recommends 7 or more hours for adults.
- **The problem:** an under-eye product bought after a short night can look like it "didn't work," or look like it worked when sleep did the job. That wastes money, and it leads to returns and distrust of skincare claims.
- **What it changes:** for sleep-sensitive concerns after a short night, the app says "wait and sleep," then "retake the photo." For concerns that sleep doesn't explain, it confidently points to a product category.
- **eCommerce value:** a retailer could put this check on an eye-cream product page. Fewer regret purchases and returns, more trust. The "Serum" verdict leads straight to the right category, which helps conversion where it is actually warranted. The same pattern extends to other lifestyle factors.

## Quality of the Idea

Most skin-analysis experiences end in "buy this." Sleep or Serum uses YouCam's scores to answer a different question: *is this worth buying today?* It combines an objective skin measurement with one self-reported behavior and a rule grounded in sleep research. It is also honest about its limits:

- The studies used observers' ratings, not YouCam scores.
- The 80-point cut-off and the "3 nights" are the app's own rules of thumb.
- It is not medical advice.

## Challenges

- Finding concerns that match published sleep-loss cues one-to-one, and adding a control concern so the app can also say "this isn't about sleep."
- Keeping the demo free and honest for judges: replaying a real recorded result instead of made-up numbers, and labeling it as such.
- Keeping real API calls (and units) to a minimum during development.

## What's next

- A "3 nights later" check-in that compares the before and after photos.
- More lifestyle factors (hydration, screen time), each with its own cited evidence.
- A retailer widget for product pages.

## Built with

YouCam AI Skin Analysis API · Next.js · React · TypeScript · Vercel · Playwright

## Sources

- Sundelin T, et al. Cues of fatigue: effects of sleep deprivation on facial appearance. *Sleep*. 2013;36(9):1355-1360. https://doi.org/10.5665/sleep.2964
- Axelsson J, et al. Beauty sleep: experimental study on the perceived health and attractiveness of sleep deprived people. *BMJ*. 2010;341:c6614. https://doi.org/10.1136/bmj.c6614
- Watson NF, et al. Recommended Amount of Sleep for a Healthy Adult (AASM/SRS consensus). *Sleep*. 2015;38(6):843-844. https://doi.org/10.5665/sleep.4716

## Testing instructions

Open the app → **Sample mode** (default when no key is set) → move the hours slider, pick "Eye cream for dark circles," then click **Look in the mirror (sample)**. Change hours to 8, or pick "Dark-spot serum," to see the verdict switch. Live mode works when `YOUCAM_API_KEY` is set on the server.

*Not medical advice. Sample photo by Wanas Rosa (Pexels License); the person pictured does not endorse this project.*
