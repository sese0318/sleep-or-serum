import sampleJson from "@/data/sample-result.json";
import type { ConcernScore } from "./verdict";
import { CONCERN_IDS, ConcernId } from "./concerns";

export interface SampleData {
  recorded: boolean;
  /** Placeholder values (docs example) used only to preview the UI before the real recording exists. */
  preview: boolean;
  recordedAt?: string;
  unitsUsed?: number | null;
  scores: ConcernScore[];
  overall?: number;
  skinAge?: number;
  image: string;
}

/**
 * The recorded REAL YouCam API result replayed in Sample mode.
 * Produced once by scripts/record-sample.mjs (signed URLs stripped, overlay
 * images saved to public/sample/masks/).
 */
export function loadSample(): SampleData {
  const s: any = sampleJson;
  const output: any[] = s?.response?.data?.results?.output ?? [];
  const scores: ConcernScore[] = output
    .filter((o) => (CONCERN_IDS as string[]).includes(o.type) && typeof o.ui_score === "number")
    .map((o) => ({
      id: o.type as ConcernId,
      uiScore: o.ui_score,
      rawScore: o.raw_score,
      maskUrl: o.saved_mask ?? undefined,
    }));
  const all = output.find((o) => o.type === "all");
  const age = output.find((o) => o.type === "skin_age");
  const preview = Boolean(s?.preview) && scores.length > 0;
  return {
    recorded: Boolean(s?.recorded) && !preview && s?.response?.data?.task_status === "success" && scores.length === CONCERN_IDS.length,
    preview,
    recordedAt: s?.recorded_at,
    unitsUsed: s?.units_used ?? null,
    scores,
    overall: typeof all?.score === "number" ? all.score : undefined,
    skinAge: typeof age?.score === "number" ? age.score : undefined,
    image: "/sample/sample-face.jpg",
  };
}
