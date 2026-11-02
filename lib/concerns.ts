/**
 * The five YouCam AI Skin Analysis (SD) concerns this app requests, and how
 * the app treats each one. Concern IDs are the exact `dst_actions` values from
 * the YouCam API docs (POST /s2s/v2.0/task/skin-analysis).
 *
 * "sleepSensitive" is the app's own, deliberately simple classification. It is
 * based on Sundelin et al. (2013), where observers rated photos of the same
 * people after normal sleep vs. after sleep deprivation (see lib/sources.ts).
 */
export type ConcernId =
  | "dark_circle_v2"
  | "eye_bag"
  | "droopy_upper_eyelid"
  | "radiance"
  | "age_spot";

export interface ConcernInfo {
  id: ConcernId;
  label: string;
  /** What the user might be about to buy for this concern. */
  buyingFor: string;
  sleepSensitive: boolean;
  /** One-line, source-backed reason for the classification. */
  evidence: string;
  /** Generic product category (no brands). */
  productCategory: string;
}

export const CONCERNS: ConcernInfo[] = [
  {
    id: "dark_circle_v2",
    label: "Dark circles",
    buyingFor: "Eye cream for dark circles",
    sleepSensitive: true,
    evidence:
      "Darker circles under the eyes were rated after sleep deprivation (Sundelin et al., 2013).",
    productCategory:
      "Brightening eye cream, or a color-correcting concealer for an instant fix",
  },
  {
    id: "eye_bag",
    label: "Eye bags",
    buyingFor: "Depuffing eye gel / patches",
    sleepSensitive: true,
    evidence:
      "More swollen eyes were rated after sleep deprivation (Sundelin et al., 2013).",
    productCategory: "Cooling, depuffing eye gel or under-eye patches",
  },
  {
    id: "droopy_upper_eyelid",
    label: "Droopy upper eyelid",
    buyingFor: "Firming eyelid cream",
    sleepSensitive: true,
    evidence:
      "More hanging eyelids were rated after sleep deprivation (Sundelin et al., 2013).",
    productCategory:
      "Firming eye cream (expect subtle results; ask a dermatologist about persistent hooding)",
  },
  {
    id: "radiance",
    label: "Radiance",
    buyingFor: "Glow / brightening serum",
    sleepSensitive: true,
    evidence:
      "Paler skin was rated after sleep deprivation (Sundelin et al., 2013). This app maps that to YouCam's radiance (skin brightness) score.",
    productCategory: "Gentle exfoliating toner plus a daily SPF moisturizer",
  },
  {
    id: "age_spot",
    label: "Age spots",
    buyingFor: "Dark-spot serum",
    sleepSensitive: false,
    evidence:
      "Pigment spots were not among the facial cues that changed after sleep deprivation in Sundelin et al. (2013), so this app treats them as not sleep-sensitive.",
    productCategory:
      "Brightening / dark-spot serum plus daily broad-spectrum SPF 30+",
  },
];

export const CONCERN_IDS = CONCERNS.map((c) => c.id);

export function concernById(id: string): ConcernInfo | undefined {
  return CONCERNS.find((c) => c.id === id);
}
