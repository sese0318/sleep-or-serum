# Credits

## Demo face photo

| Item | Details |
|---|---|
| Local asset | `public/sample/sample-face.jpg`, cropped for the demo |
| Original | Portrait of a Woman in Goiânia, Brazil |
| Photographer | Wanas Rosa |
| Source | https://www.pexels.com/photo/portrait-of-a-woman-in-goiania-brazil-30617269/ |
| Original image | https://images.pexels.com/photos/30617269/pexels-photo-30617269.jpeg |
| License | [Pexels License](https://www.pexels.com/license/): free use and modification, subject to its restrictions |

The person pictured is not affiliated with this project and does not endorse it. The image is a neutral, licensed demonstration input. No sleep history or health condition is inferred about the person. All sleep values entered during the demo are hypothetical.

The photo keeps its Pexels license; the repository's MIT license applies to the code and does not replace the photo license. Do not imply endorsement or portray the person in an offensive way.

## Analysis output

Skin appearance scores and available overlays in a completed genuine recording are supplied by the **YouCam AI Skin Analysis API**, Perfect Corp. [API documentation](https://docs.perfectcorp.com/reference/ai_skin_analysis).

`data/sample-result.json` records whether a genuine result has been saved. Documentation/example values are previews, not real analysis output. If present, `public/sample/masks/` contains saved API-generated overlays from the sample photo.

## Background research

These sources inspired the question behind the app. They do not validate YouCam scores, demonstrate why the sample person looks a certain way, or establish the app's thresholds or prompts as medical advice.

- Sundelin T, Lekander M, Kecklund G, Van Someren EJW, Olsson A, Axelsson J. Cues of fatigue: effects of sleep deprivation on facial appearance. *Sleep*. 2013;36(9):1355–1360. https://doi.org/10.5665/sleep.2964
- Axelsson J, Sundelin T, Ingre M, Van Someren EJW, Olsson A, Lekander M. Beauty sleep: experimental study on the perceived health and attractiveness of sleep deprived people. *BMJ*. 2010;341:c6614. https://doi.org/10.1136/bmj.c6614
- Watson NF, Badr MS, Belenky G, et al. Recommended Amount of Sleep for a Healthy Adult: A Joint Consensus Statement of the American Academy of Sleep Medicine and Sleep Research Society. *Sleep*. 2015;38(6):843–844. https://doi.org/10.5665/sleep.4716

## Software and video

Next.js and React: MIT. Playwright: Apache-2.0, used for browser checks and capture. The demo uses the credited face photograph and the app's own interface. No music is required or included by the capture workflow.
