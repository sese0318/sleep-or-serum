/** Exact SD concern IDs requested from the YouCam AI Skin Analysis API.
 * Research context is background reading, not a classifier or an explanation
 * of an individual's score. Product categories are shopping context only.
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
  buyingFor: string;
  evidence: string;
  productCategory: string;
}

export const CONCERNS: ConcernInfo[] = [
  {
    id: "dark_circle_v2",
    label: "Dark circles",
    buyingFor: "Eye cream for dark circles",
    evidence: "Observer-rated dark circles changed in a small sleep-deprivation study. That does not establish why this photo received its YouCam score.",
    productCategory: "Eye cream or concealer",
  },
  {
    id: "eye_bag",
    label: "Eye bags",
    buyingFor: "Eye gel / patches",
    evidence: "Observer-rated eye swelling changed in a small sleep-deprivation study. A single photo cannot identify its cause or predict a product's effect.",
    productCategory: "Eye gel or under-eye patches",
  },
  {
    id: "droopy_upper_eyelid",
    label: "Droopy upper eyelid",
    buyingFor: "Eyelid skincare",
    evidence: "Observer-rated hanging eyelids changed in a small sleep-deprivation study. This app cannot determine a cause or whether skincare would help.",
    productCategory: "Eye-area skincare",
  },
  {
    id: "radiance",
    label: "Radiance",
    buyingFor: "Glow / brightening serum",
    evidence: "The study assessed perceived paleness, not the YouCam radiance score. These are different measures and are not treated as equivalent here.",
    productCategory: "Moisturizer or radiance-focused skincare",
  },
  {
    id: "age_spot",
    label: "Age spots",
    buyingFor: "Dark-spot serum",
    evidence: "The cited study does not establish how this YouCam metric relates to sleep. This app makes no sleep-related claim about pigment spots.",
    productCategory: "Skincare marketed for uneven tone",
  },
];

export const CONCERN_IDS = CONCERNS.map((c) => c.id);

export function concernById(id: string): ConcernInfo | undefined {
  return CONCERNS.find((c) => c.id === id);
}
