# Sleep or Serum — demo script

Target length: **1 minute 35 seconds**. English. No music required.

Use the regenerated recording that contains the genuine saved API response. Do not upload an older file with a “PREVIEW: docs example values” banner. Check the actual video duration is between 1 and 3 minutes and watch it completely before publishing.

Expected files after capture:

- `submission/demo/demo.mp4`: screen recording.
- `submission/demo/demo-captioned.mp4`: captioned version, if successfully generated.
- `submission/demo/captions.srt`: English subtitles, if regenerated for this recording.

Timing below is a narration guide. Captions must be synchronized to the final recording; old captions may contain superseded claims and must not be reused unchanged.

| Time | Screen | Narration |
|---|---|---|
| 0:00–0:08 | Title and start screen | “This is Sleep or Serum: a moment to pause before your next skincare purchase. It uses the YouCam AI Skin Analysis API.” |
| 0:08–0:17 | Recorded sample label | “This demonstration replays a genuine recorded API result for a licensed sample photo. The label makes that clear, and judges can try it without a key.” |
| 0:17–0:27 | Set sleep to 4.5 hours; choose dark circles | “Enter last night's sleep and choose a concern to explore. Here the sleep value is hypothetical. We know nothing about the sample person's sleep.” |
| 0:27–0:40 | Open mirror and show the five results | “YouCam reports five appearance scores. These describe this photo; they do not establish a cause, diagnose a condition or prove that a product is needed.” |
| 0:40–0:49 | Show a returned overlay, if one exists | “Available YouCam overlays help us inspect the returned results. The analysis and the app's own reflection remain separate.” |
| 0:49–1:00 | Pause & reassess; open rule explanation | “With fewer than seven entered hours, the reflection says: pause and reassess. This is a visible app rule, not a prediction that sleep will fix a score.” |
| 1:00–1:10 | Change sleep to 8 hours | “At eight hours, the reflection changes to review your options. Notice that the recorded API scores have not changed.” |
| 1:10–1:21 | Change focus; show sources and limits | “Changing the focus explores another result. Product categories are optional information. The app never concludes that you need to buy something.” |
| 1:21–1:32 | API flow or implementation card | “Fresh analysis uses the YouCam File API, image upload, a Skin Analysis task and polling. Next.js keeps the API key on the server.” |
| 1:32–1:38 | Closing screen | “Sleep or Serum: look, reflect, then decide.” |

If no overlay was returned, spend that segment showing the score labels rather than claiming an overlay exists. If the genuine recording is still unavailable, the demo is not ready for submission; keep the preview labeled and report the blocker.

## Optional introduction

“Hi, I'm Seika. I built Sleep or Serum to add a moment of reflection before a skincare purchase.”

Only add personal background that you want to publish and can confirm. Keep the total video under three minutes.

## Publishing — Seika's actions

1. Watch the final recording end to end. Confirm genuine sample labeling, current copy, legible results, no API key and a duration of 1–3 minutes.
2. Upload it to **YouTube as Public** (or Vimeo as publicly visible). Suggested title: **Sleep or Serum | YouCam AI Skin Analysis Hackathon Demo**.
3. If adding subtitles, use the synchronized current English caption file, not a previous preview's file.
4. Open the public video in a signed-out browser and paste its URL into Devpost.
5. Submit Devpost before **November 2, 2026, 11:45 a.m. EST**.
