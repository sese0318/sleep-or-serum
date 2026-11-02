import { CONCERNS, ConcernId, ConcernInfo, concernById } from "./concerns";

/** A transparent reflection prompt, inspired by general adult sleep guidance.
 * It is not a personalized sleep recommendation or a skin-score explanation.
 */
export const SHORT_SLEEP_HOURS = 7;
/** A visual reference only: not a clinical threshold or a severity label. */
export const NOTICEABLE_BELOW = 80;

export interface ConcernScore {
  id: ConcernId;
  uiScore: number;
  rawScore: number;
  maskUrl?: string;
}

/** Stable presentation keys retained for the two existing visual treatments. */
export type VerdictKind = "sleep-first" | "choose-product";

export interface Verdict {
  kind: VerdictKind;
  headline: string;
  detail: string;
  focus: ConcernInfo;
  focusScore: ConcernScore;
  focusWasAuto: boolean;
  shortSleep: boolean;
  noticeable: boolean;
  checks: { label: string; passed: boolean }[];
}

export function pickFocus(
  scores: ConcernScore[],
  wanted: ConcernId | "auto",
): { focus: ConcernScore; auto: boolean } {
  if (wanted !== "auto") {
    const selected = scores.find((score) => score.id === wanted);
    if (selected) return { focus: selected, auto: false };
  }
  const lowest = [...scores].sort((a, b) => a.uiScore - b.uiScore)[0];
  if (!lowest) throw new Error("No skin scores were returned. Please try another photo.");
  return { focus: lowest, auto: true };
}

export function decide(
  scores: ConcernScore[],
  hoursSlept: number,
  wanted: ConcernId | "auto",
): Verdict {
  const { focus: focusScore, auto } = pickFocus(scores, wanted);
  const focus = concernById(focusScore.id) ?? CONCERNS[0];
  const shortSleep = hoursSlept < SHORT_SLEEP_HOURS;
  const noticeable = focusScore.uiScore < NOTICEABLE_BELOW;
  const checks = [
    {
      label: `Self-reported sleep is under ${SHORT_SLEEP_HOURS} h (entered: ${fmtHours(hoursSlept)})`,
      passed: shortSleep,
    },
    {
      label: `${focus.label} is the selected focus; its API score is ${focusScore.uiScore}`,
      passed: true,
    },
    {
      label: "Changing sleep hours changes only this reflection prompt, never the API scores",
      passed: true,
    },
  ];

  return {
    kind: shortSleep ? "sleep-first" : "choose-product",
    headline: shortSleep ? "Pause & reassess" : "Review your options",
    detail: shortSleep
      ? `You entered ${fmtHours(hoursSlept)} of sleep. Before making a purchase, consider taking another photo on a different day in similar light. This result cannot tell whether sleep explains your ${focus.label.toLowerCase()} score or whether a product would help.`
      : `Use this snapshot as one piece of context for your ${focus.label.toLowerCase()} interest. If you choose to browse, ${focus.productCategory.toLowerCase()} is a related category, not a recommendation. A score does not establish a need to buy anything.`,
    focus,
    focusScore,
    focusWasAuto: auto,
    shortSleep,
    noticeable,
    checks,
  };
}

export function fmtHours(h: number): string {
  return `${Number.isInteger(h) ? h : h.toFixed(1)} h`;
}
