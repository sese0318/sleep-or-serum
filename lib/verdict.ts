import { CONCERNS, ConcernId, ConcernInfo, concernById } from "./concerns";

/** Below 7 h counts as a short night (Watson et al., 2015: adults need 7+ h). */
export const SHORT_SLEEP_HOURS = 7;
/**
 * A concern is "noticeable" when its YouCam ui_score (1-100, higher = better)
 * is below this value. This is the app's own transparent cut-off, not a
 * clinical threshold.
 */
export const NOTICEABLE_BELOW = 80;

export interface ConcernScore {
  id: ConcernId;
  uiScore: number;
  rawScore: number;
  maskUrl?: string;
}

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
  /** Each rule the app checked, in plain language, for the "How we decided" panel. */
  checks: { label: string; passed: boolean }[];
}

export function pickFocus(
  scores: ConcernScore[],
  wanted: ConcernId | "auto",
): { focus: ConcernScore; auto: boolean } {
  if (wanted !== "auto") {
    const s = scores.find((x) => x.id === wanted);
    if (s) return { focus: s, auto: false };
  }
  const lowest = [...scores].sort((a, b) => a.uiScore - b.uiScore)[0];
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
      label: `${focus.label} is a sleep-sensitive concern`,
      passed: focus.sleepSensitive,
    },
    {
      label: `You slept less than ${SHORT_SLEEP_HOURS} h (you entered ${fmtHours(hoursSlept)})`,
      passed: shortSleep,
    },
    {
      label: `${focus.label} score is below ${NOTICEABLE_BELOW} (it is ${focusScore.uiScore})`,
      passed: noticeable,
    },
  ];

  if (focus.sleepSensitive && shortSleep) {
    return {
      kind: "sleep-first",
      headline: noticeable
        ? `Sleep 3 good nights before buying that ${shortName(focus)}.`
        : `Your ${focus.label.toLowerCase()} score is already fine. Sleep 3 good nights before buying anything.`,
      detail:
        `${focus.label} is one of the looks that changes with sleep loss, and last night was short. ` +
        `Give it three nights of ${SHORT_SLEEP_HOURS}+ hours, then take another photo. If the score is still low, buy with confidence.`,
      focus,
      focusScore,
      focusWasAuto: auto,
      shortSleep,
      noticeable,
      checks,
    };
  }

  return {
    kind: "choose-product",
    headline: focus.sleepSensitive
      ? `You slept enough, so sleep is not the likely fix here. Choose a product for it.`
      : `This concern doesn't change much with sleep. Choose a product for it.`,
    detail: `Product category to look for: ${focus.productCategory}.`,
    focus,
    focusScore,
    focusWasAuto: auto,
    shortSleep,
    noticeable,
    checks,
  };
}

function shortName(c: ConcernInfo): string {
  if (c.id === "radiance") return "glow serum";
  if (c.id === "eye_bag") return "eye gel";
  return "eye cream";
}

export function fmtHours(h: number): string {
  return `${Number.isInteger(h) ? h : h.toFixed(1)} h`;
}
