# Sleep or Serum

**Tagline:** A moment to pause before your next skincare purchase.

**Track:** Skin AI

## Inspiration

A single glance in a mirror can become an impulse purchase. I wanted to create a small pause between noticing a feature and adding a product to a cart.

Sleep research was the starting point, but this project makes an important distinction: a photo and one self-reported number cannot tell us what caused someone's appearance. Sleep or Serum places appearance observations and personal context side by side, without pretending to make that causal judgment.

## What it does

Sleep or Serum is a one-screen web app powered by the **YouCam AI Skin Analysis API**.

1. Upload a face photo in configured Live mode, or explore the clearly labeled genuine recorded sample.
2. Enter last night's sleep hours and choose the appearance concern you want to review.
3. See five YouCam outputs in a mirror: dark circles, eye bags, droopy upper eyelid, radiance and age spots, with available analysis overlays.
4. Read one transparent reflection: **Pause & reassess** when entered sleep is below 7 hours, or **Review your options** otherwise.

Changing the sleep input changes the reflection, never the API scores. The app does not say that sleep caused a score, that an appearance feature is a disease, or that a product is necessary. Product categories are optional information; no brand or affiliate link is recommended.

A “How this prompt works” panel explains the app's rule. The 7-hour branch is a reflection threshold inspired by general adult sleep guidance, not personalized advice. The 80-point score marker is a visual guide, not a clinical cutoff.

## How we built it

The app uses Next.js, React and TypeScript, with a server-only YouCam API client and a responsive browser interface.

The integration follows four steps:

1. Register the image through YouCam's File API.
2. Upload the bytes to the returned pre-signed URL.
3. Create an AI Skin Analysis task requesting five SD concerns in JSON format.
4. Poll the task and display the returned scores and available overlay images.

The API key remains in server environment configuration. The browser uses the app's route handlers. A separate recording script saved a sanitized genuine response and its overlays on November 2, 2026, for a stable judge demonstration without repeated API use. That successful analysis used 12 units.

Sample mode is explicitly separated from fresh analysis. It replays a fixed result while allowing judges to explore the app's reflection logic without supplying their own face photo or API key. A preview made from example values is not a genuine API recording and is not final submission evidence.

## Design

The interface turns an analytical result into a familiar mirror moment: an arched portrait frame, a deep navy background, warm gold accents and readable score bars. The background moves toward dawn as the sleep input increases. That visual change represents the entered number, not a predicted improvement in skin.

The user can finish the experience on one screen. Live processing, recorded samples and incomplete/error states are identified explicitly. Scores remain separate from the reflection, and source notes explain the limits of the idea.

## Potential impact

The intended users are people considering a cosmetic purchase after noticing a feature in a photo or mirror. The app offers a chance to review observations, remember context and decide whether they want to pause or explore options.

For eCommerce, the concept is a more transparent pre-purchase interaction. A future retailer integration could let a shopper inspect an analysis without automatically turning every score into a product recommendation. Reduced regret or returns would be a hypothesis to test, not a result demonstrated by this prototype.

## What makes it different

The interface is built around reflection before conversion. YouCam provides appearance outputs; the app keeps its own simple rule visible. It deliberately avoids presenting either a cosmetic score or a sleep input as proof that someone needs a product.

## Challenges and limitations

- Separating genuine API output from application rules and example data.
- Keeping API credentials on the server while offering a reliable, free judge experience.
- Preserving temporary analysis overlays as local sample assets when available.
- Using sleep research as background without claiming it validates this app's scoring or recommendations.

Lighting, pose and the source photo can affect analysis. One image cannot establish a cause or a diagnosis. The sample person's sleep history is unknown; all demo sleep values are hypothetical.

## What's next

Test whether the pause-and-review interaction is useful to shoppers, improve accessibility with user feedback, and explore optional repeat-photo journaling with explicit consent and retention controls. A change between photos would still need careful interpretation and would not prove a treatment or sleep effect.

## Built with

YouCam AI Skin Analysis API · Next.js · React · TypeScript · Playwright · Vercel deployment target

## Testing instructions

App URL: https://sleep-or-serum.vercel.app . The recorded-sample judge entry is publicly accessible without login; anonymous access and genuine result interaction have been verified.

Open the app URL in a browser. Choose **Sample mode**, enter a sleep value below 7 hours, choose a focus concern and open the mirror. Review the recorded result and the reflection. Change the sleep value to 8 hours: the reflection should change while all recorded API scores remain the same. Change the concern to inspect a different result. Replaying the saved genuine sample does not require a YouCam account or API key. All 19 sample end-to-end checks passed locally. The public judge URL was verified with anonymous HTTP 200 and a successful recorded-result interaction.

Live mode was verified on the production deployment: a fresh upload request returned HTTP 200 and polling completed with five scores and five overlays. The API key is configured only as a Production Secret. Sample mode also passed all 17 public end-to-end checks. Use only a photo you are authorized to upload.

## Sources and credits

- [YouCam AI Skin Analysis documentation](https://docs.perfectcorp.com/reference/ai_skin_analysis).
- Sundelin T, et al. *Cues of fatigue: effects of sleep deprivation on facial appearance.* Sleep, 2013. https://doi.org/10.5665/sleep.2964
- Axelsson J, et al. *Beauty sleep: experimental study on the perceived health and attractiveness of sleep deprived people.* BMJ, 2010. https://doi.org/10.1136/bmj.c6614
- Watson NF, et al. *Recommended Amount of Sleep for a Healthy Adult.* Sleep, 2015. https://doi.org/10.5665/sleep.4716
- Sample photo: [Wanas Rosa on Pexels](https://www.pexels.com/photo/portrait-of-a-woman-in-goiania-brazil-30617269/), under the [Pexels License](https://www.pexels.com/license/). The person pictured is not affiliated with and does not endorse the project.

*This is a cosmetic demonstration, not medical advice. The cited studies do not validate this app's individual scores, thresholds or reflection prompts.*
