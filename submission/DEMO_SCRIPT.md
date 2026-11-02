# Demo video script: Sleep or Serum (about 1:30–1:45)

**Files:** `submission/demo/demo.mp4` (clean screen recording), `demo-captioned.mp4` (same recording with burned-in English captions), `demo.webm` (raw Playwright recording), and `captions.srt` (caption file you can upload to YouTube as subtitles).

The video has no music. You can upload `demo-captioned.mp4` as is, or record your own voice reading the narration below over `demo.mp4`. Each line is written to fit its segment at a calm pace. Timings are approximate and move by a few seconds between recordings; `captions.srt` has the exact times for the current file.

Required by the rules and covered here:
- Names the YouCam API used: **YouCam AI Skin Analysis API** (0:00, 0:30, 1:15)
- Shows the project running in the browser it was built for
- Under 3 minutes, English, no third-party music

| Time | On screen | Narration / subtitle |
|---|---|---|
| 0:00 | Title card | "This is Sleep or Serum. Before you buy that eye cream, check last night. It's built on the YouCam AI Skin Analysis API." |
| 0:06 | App home, **Sample mode** banner | "Judges can try it for free in Sample mode. It replays one real, recorded YouCam API result for a licensed sample photo, and it's labeled that way." |
| 0:12 | Hours slider goes from 7.5 h down to 4.5 h; the sky gets darker and the moon rises | "Step two: how long did you sleep? The sky follows your answer. The shorter the night, the darker it gets." |
| 0:19 | Picks "Eye cream for dark circles" | "Step three: what were you about to buy? Let's say an eye cream for dark circles." |
| 0:23 | Clicks **Look in the mirror** | "In live mode, the server uploads your photo with YouCam's File API, starts a skin-analysis task, and polls until it's done. The API key never leaves the server." |
| 0:30 | Mirror card with five score bars | "YouCam scores five concerns: dark circles, eye bags, droopy upper eyelid, radiance and age spots. Four of them match the facial cues that changed after sleep loss in a 2013 study in the journal *Sleep*. Age spots are the control." |
| 0:36 | *(only with the real recording)* Overlay chips: YouCam detection overlays on the mirror | "The mirror can also show YouCam's own detection overlay for each concern." |
| 0:41 | Verdict: **Sleep 3 good nights before buying that eye cream.** | "The verdict: dark circles are sleep-sensitive and the night was short, so sleep three good nights first, then retake the photo." |
| 0:47 | "How we decided" panel | "No black box. Every rule the app checked is listed with its cut-off. The seven-hour line comes from the sleep-medicine consensus. The three nights is our own rule of thumb, and we say so." |
| 0:56 | Slider moves to 8 h, verdict flips | "If you slept eight hours, sleep isn't the likely fix, so the app suggests a product category instead." |
| 1:02 | Picks "Dark-spot serum" → **This concern doesn't change much with sleep. Choose a product for it.** | "Age spots don't change much with sleep, so the answer is: choose a product for it. We show categories only, never brands." |
| 1:11 | Evidence section, then the disclaimer | "Every sleep claim links to peer-reviewed research, and the app says clearly that it's not medical advice." |
| 1:20 | "Under the hood" card with the 4 API steps | "Under the hood: YouCam File API upload, the skin-analysis task with five SD concerns, then polling. Next.js on Vercel, with the key kept server-side." |
| 1:29 | End card | "Sleep or Serum: sleep first, or buy with confidence." |

## Optional personal intro (Seika, 10–15 s, recorded by you)

> "Hi, I'm Seika. I study psychology at Bunker Hill Community College in Boston, and I'm fascinated by sleep and the brain. **[your mirror moment, one sentence]**. So I built Sleep or Serum."

## Upload checklist

1. Upload to YouTube as **Public** (or Unlisted only if the rules allow it; the rules ask that it be publicly visible). Title: "Sleep or Serum: YouCam AI Skin Analysis API hackathon demo".
2. Optional: add `captions.srt` under Subtitles → English.
3. Paste the link into the Devpost "Video demo link" field.
