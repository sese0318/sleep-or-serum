# Credits

## Sample face photo

| | |
|---|---|
| File in this repo | `public/sample/sample-face.jpg` (cropped to 1080x1440 so the face fills about 70% of the width, as the YouCam Skin Analysis docs require) |
| Original | "Portrait of a Woman in Goiânia, Brazil" |
| Author | Wanas Rosa |
| Source URL | https://www.pexels.com/photo/portrait-of-a-woman-in-goiania-brazil-30617269/ |
| Image URL | https://images.pexels.com/photos/30617269/pexels-photo-30617269.jpeg |
| License | Pexels License: https://www.pexels.com/license/ (free to use and modify; attribution not required but given here) |

The person pictured is not affiliated with this project and does not endorse it. The photo is used only as a neutral sample input for the skin analysis demo. Following the Pexels License, the app avoids judgmental wording about the person pictured.

Files in `public/sample/masks/` (if present) are detection overlays that the YouCam AI Skin Analysis API generated from this photo during the one recorded run (`scripts/record-sample.mjs`).

## API

Skin concern scores and overlays come from the **YouCam AI Skin Analysis API** by Perfect Corp.
Docs: https://docs.perfectcorp.com/reference/ai_skin_analysis

## Research cited in the app

- Sundelin T, Lekander M, Kecklund G, Van Someren EJW, Olsson A, Axelsson J. Cues of fatigue: effects of sleep deprivation on facial appearance. *Sleep*. 2013;36(9):1355-1360. https://doi.org/10.5665/sleep.2964 (PubMed 23997369)
- Axelsson J, Sundelin T, Ingre M, Van Someren EJW, Olsson A, Lekander M. Beauty sleep: experimental study on the perceived health and attractiveness of sleep deprived people. *BMJ*. 2010;341:c6614. https://doi.org/10.1136/bmj.c6614 (PubMed 21156746)
- Watson NF, Badr MS, Belenky G, et al. Recommended Amount of Sleep for a Healthy Adult: A Joint Consensus Statement of the American Academy of Sleep Medicine and Sleep Research Society. *Sleep*. 2015;38(6):843-844. https://doi.org/10.5665/sleep.4716 (PubMed 26039963)

## Software

Next.js, React (MIT). Playwright (Apache-2.0) for the end-to-end check and demo capture. No music or third-party media in the demo video.
