"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CONCERNS, ConcernId, concernById } from "@/lib/concerns";
import { decide, fmtHours, NOTICEABLE_BELOW, SHORT_SLEEP_HOURS, type ConcernScore } from "@/lib/verdict";
import { SOURCES } from "@/lib/sources";
import type { SampleData } from "@/lib/sample";

type Mode = "sample" | "live";
type Phase = "setup" | "analyzing" | "result";

interface Props {
  liveAvailable: boolean;
  sample: SampleData;
}

const MAX_SIDE = 2048;
const MIN_SHORT_SIDE = 480; // YouCam SD skin analysis minimum

export default function SleepOrSerum({ liveAvailable, sample }: Props) {
  const [mode, setMode] = useState<Mode>(liveAvailable ? "live" : "sample");
  const [phase, setPhase] = useState<Phase>("setup");
  const [hours, setHours] = useState(5.5);
  const [wanted, setWanted] = useState<ConcernId | "auto">("auto");
  const [photo, setPhoto] = useState<{ url: string; blob: Blob } | null>(null);
  const [scores, setScores] = useState<ConcernScore[] | null>(null);
  const [overlay, setOverlay] = useState<ConcernId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const cancelled = useRef(false);

  // The sky follows the hours slider: 3 h or less = deep night, 9 h = soft morning.
  const dawn = Math.max(0, Math.min(1, (hours - 3) / 6));

  const verdict = useMemo(
    () => (scores && scores.length ? decide(scores, hours, wanted) : null),
    [scores, hours, wanted],
  );

  useEffect(() => () => { cancelled.current = true; }, []);

  function reset() {
    setPhase("setup");
    setScores(null);
    setOverlay(null);
    setError(null);
  }

  function switchMode(m: Mode) {
    setMode(m);
    reset();
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const resized = await resizeImage(f);
      setPhoto(resized);
      reset();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function analyze() {
    setError(null);
    setOverlay(null);
    if (mode === "sample") {
      if (!sample.recorded) {
        setError("The recorded sample has not been added yet. Run `npm run record-sample` once with an API key.");
        return;
      }
      setPhase("analyzing");
      setProgress("Replaying the recorded YouCam result (no API call)...");
      await sleep(1600);
      setScores(sample.scores);
      setPhase("result");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      return;
    }
    if (!photo) {
      setError("Add a front-facing selfie first.");
      return;
    }
    setPhase("analyzing");
    try {
      setProgress("Uploading your photo to YouCam AI Skin Analysis...");
      const fd = new FormData();
      fd.append("image", new File([photo.blob], "selfie.jpg", { type: "image/jpeg" }));
      const start = await fetch("/api/analyze", { method: "POST", body: fd });
      const startJson = await start.json();
      if (!start.ok) throw new Error(startJson.error ?? "Could not start the analysis");
      const taskId: string = startJson.taskId;
      const t0 = Date.now();
      while (!cancelled.current) {
        setProgress(`Analyzing skin concerns... ${Math.round((Date.now() - t0) / 1000)} s`);
        await sleep(3000);
        const r = await fetch(`/api/analyze/${encodeURIComponent(taskId)}`, { cache: "no-store" });
        const j = await r.json();
        if (j.status === "success") {
          setScores(j.scores);
          setPhase("result");
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
          return;
        }
        if (j.status === "error") throw new Error(friendlyError(j.error, j.message));
        if (Date.now() - t0 > 120_000) throw new Error("The analysis took too long. Please try again.");
      }
    } catch (err) {
      setError((err as Error).message);
      setPhase("setup");
    }
  }

  const mirrorImage = mode === "sample" ? sample.image : photo?.url;
  const overlayUrl = overlay && scores ? scores.find((s) => s.id === overlay)?.maskUrl : undefined;

  return (
    <div className="sky" style={{ ["--dawn" as string]: dawn }}>
      <div className="sky-morning" aria-hidden />
      <div className="stars" aria-hidden />
      <Moon dawn={dawn} />
      <div className="sun-glow" aria-hidden />

      <main className="wrap">
        <header className="hero">
          <p className="eyebrow">Sleep or Serum</p>
          <h1>Before you buy that eye cream, check last night.</h1>
          <p className="lede">
            Take a selfie and tell us how long you slept. YouCam AI Skin Analysis scores five concerns, and a simple,
            visible rule tells you whether to <strong>sleep first</strong> or <strong>choose a product</strong>.
          </p>
        </header>

        <div className="mode-switch" role="tablist" aria-label="Mode">
          <button role="tab" aria-selected={mode === "sample"} className={mode === "sample" ? "on" : ""} onClick={() => switchMode("sample")}>
            Sample mode
          </button>
          <button
            role="tab"
            aria-selected={mode === "live"}
            className={mode === "live" ? "on" : ""}
            onClick={() => liveAvailable && switchMode("live")}
            disabled={!liveAvailable}
            title={liveAvailable ? "Analyze your own photo" : "Live mode needs YOUCAM_API_KEY on the server"}
          >
            My photo (live)
          </button>
        </div>

        {mode === "sample" && !sample.recorded ? (
          <div className="banner sample" data-testid="sample-banner">
            <strong>SAMPLE MODE: no recording yet.</strong> The recorded sample result has not been added to this build. Run{" "}
            <code>npm run record-sample</code> once with an API key, then rebuild.
          </div>
        ) : mode === "sample" && sample.preview ? (
          <div className="banner sample" data-testid="sample-banner">
            <strong>PREVIEW DATA: not a recording.</strong> These scores are the example values from the YouCam Skin Analysis
            docs, used only to preview the layout until the real sample is recorded with <code>npm run record-sample</code>.
          </div>
        ) : mode === "sample" ? (
          <div className="banner sample" data-testid="sample-banner">
            <strong>SAMPLE MODE: recorded result.</strong> This replays a real YouCam AI Skin Analysis API response that
            was recorded once{sample.recordedAt ? ` on ${sample.recordedAt.slice(0, 10)}` : ""} for the sample photo below.
            No API call is made and no key is needed. Change the hours slept to see how the verdict changes.
            {!liveAvailable && <span className="muted"> (Live mode is off because no API key is configured.)</span>}
          </div>
        ) : (
          <div className="banner live">
            <strong>LIVE MODE.</strong> Your photo is sent to the YouCam AI Skin Analysis API for this one analysis. This app
            does not store it.
          </div>
        )}

        <section className="panel steps">
          <div className="step">
            <span className="num">1</span>
            <div className="step-body">
              <h2>Your face</h2>
              {mode === "sample" ? (
                <p className="muted small">
                  Sample photo: &ldquo;Portrait of a Woman in Goi&acirc;nia, Brazil&rdquo; by Wanas Rosa on Pexels (Pexels License), cropped. The person pictured does not endorse this app.
                </p>
              ) : (
                <div className="pickers">
                  <label className="btn ghost">
                    Upload a photo
                    <input type="file" accept="image/jpeg,image/png" onChange={onPickFile} hidden />
                  </label>
                  <label className="btn ghost">
                    Take a selfie
                    <input type="file" accept="image/*" capture="user" onChange={onPickFile} hidden />
                  </label>
                  <p className="muted small">
                    Front-facing, no glasses, forehead visible, even light, face filling most of the frame.
                  </p>
                </div>
              )}
            </div>
            <div className="thumb">
              {mirrorImage ? <img src={mirrorImage} alt="Face photo to analyze" /> : <span className="muted small">No photo yet</span>}
            </div>
          </div>

          <div className="step">
            <span className="num">2</span>
            <div className="step-body">
              <h2>
                <label htmlFor="hours">Hours slept last night</label>
              </h2>
              <div className="hours-row">
                <input
                  id="hours"
                  data-testid="hours"
                  type="range"
                  min={0}
                  max={12}
                  step={0.5}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                />
                <output className="hours-out" data-testid="hours-out">{fmtHours(hours)}</output>
              </div>
              <p className="muted small">
                {hours < SHORT_SLEEP_HOURS
                  ? `Short night: under the ${SHORT_SLEEP_HOURS} h adults are advised to get (${SOURCES.watson2015.short}).`
                  : `${SHORT_SLEEP_HOURS} h or more: in line with the adult recommendation (${SOURCES.watson2015.short}).`}
              </p>
            </div>
          </div>

          <div className="step">
            <span className="num">3</span>
            <div className="step-body">
              <h2>
                <label htmlFor="wanted">What were you about to buy?</label>
              </h2>
              <select id="wanted" data-testid="wanted" value={wanted} onChange={(e) => setWanted(e.target.value as ConcernId | "auto")}>
                <option value="auto">Not sure: use my lowest score</option>
                {CONCERNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.buyingFor}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="error" role="alert">{error}</p>}

          <button className="btn primary big" data-testid="analyze" onClick={analyze} disabled={phase === "analyzing"}>
            {phase === "analyzing" ? "Looking in the mirror..." : mode === "sample" ? "Look in the mirror (sample)" : "Look in the mirror"}
          </button>
          {phase === "analyzing" && (
            <p className="progress" aria-live="polite">
              <span className="spinner" aria-hidden /> {progress}
            </p>
          )}
        </section>

        {phase === "result" && scores && verdict && (
          <section ref={resultRef} className="results" data-testid="results">
            {mode === "sample" && (
              <p className="pill sample-pill">
                {sample.preview ? "PREVIEW: docs example values, not a real result" : "Recorded sample result: real YouCam API output, replayed"}
              </p>
            )}
            <div className="result-grid">
              <div className="mirror-col">
                <div className="mirror" data-testid="mirror">
                  <div className="mirror-glass">
                    {mirrorImage && <img className="face" src={mirrorImage} alt="Analyzed face" />}
                    {overlayUrl && <img className="face overlay" src={overlayUrl} alt={`${concernById(overlay!)?.label} detection overlay from YouCam`} />}
                    <div className="mirror-shine" aria-hidden />
                  </div>
                </div>
                <div className="overlay-chips" aria-label="Show YouCam detection overlay">
                  <button className={!overlay ? "chip on" : "chip"} onClick={() => setOverlay(null)}>Photo</button>
                  {scores.filter((s) => s.maskUrl).map((s) => (
                    <button key={s.id} className={overlay === s.id ? "chip on" : "chip"} onClick={() => setOverlay(s.id)}>
                      {concernById(s.id)?.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="scores-col">
                <h2 className="section-title">What the mirror measured</h2>
                <p className="muted small">YouCam ui_score, 1 to 100: higher means less visible. Marker = {NOTICEABLE_BELOW}.</p>
                <ul className="scores" data-testid="scores">
                  {CONCERNS.map((c) => {
                    const s = scores.find((x) => x.id === c.id);
                    if (!s) return null;
                    const isFocus = verdict.focus.id === c.id;
                    return (
                      <li key={c.id} className={isFocus ? "focus" : ""}>
                        <div className="score-head">
                          <span className="score-label">{c.label}{isFocus && <em> (focus)</em>}</span>
                          <span className={c.sleepSensitive ? "tag tag-sleep" : "tag tag-steady"}>
                            {c.sleepSensitive ? "sleep-sensitive" : "not sleep-sensitive"}
                          </span>
                          <span className="score-num">{s.uiScore}</span>
                        </div>
                        <div className="bar">
                          <div className={s.uiScore < NOTICEABLE_BELOW ? "fill low" : "fill"} style={{ width: `${s.uiScore}%` }} />
                          <div className="marker" style={{ left: `${NOTICEABLE_BELOW}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="sleep-meter">
                  <div className="score-head">
                    <span className="score-label">Sleep last night</span>
                    <span className="score-num">{fmtHours(hours)}</span>
                  </div>
                  <div className="bar sleep">
                    <div className={hours < SHORT_SLEEP_HOURS ? "fill low" : "fill"} style={{ width: `${(Math.min(hours, 12) / 12) * 100}%` }} />
                    <div className="marker" style={{ left: `${(SHORT_SLEEP_HOURS / 12) * 100}%` }} />
                  </div>
                  <p className="muted small">Marker = {SHORT_SLEEP_HOURS} h</p>
                </div>
              </div>
            </div>

            <div className={`verdict ${verdict.kind}`} data-testid="verdict" data-kind={verdict.kind}>
              <p className="verdict-kicker">{verdict.kind === "sleep-first" ? "Verdict: SLEEP" : "Verdict: SERUM"}</p>
              <h2 data-testid="verdict-headline">{verdict.headline}</h2>
              <p>{verdict.detail}</p>
              {verdict.kind === "choose-product" && (
                <p className="muted small">Product categories only. We do not recommend brands.</p>
              )}
            </div>

            <div className="panel how" data-testid="how">
              <h2 className="section-title">How we decided</h2>
              <p className="small">
                Focus concern: <strong>{verdict.focus.label}</strong>{" "}
                {verdict.focusWasAuto ? "(your lowest score)" : "(what you were about to buy)"}.
              </p>
              <ul className="checks">
                {verdict.checks.map((c) => (
                  <li key={c.label} className={c.passed ? "yes" : "no"}>
                    <span aria-hidden>{c.passed ? "✓" : "✗"}</span> {c.label}
                  </li>
                ))}
              </ul>
              <p className="small rule">
                Rule: if the focus concern is sleep-sensitive <em>and</em> you slept under {SHORT_SLEEP_HOURS} h, sleep first.
                Otherwise, choose a product for it. &ldquo;3 nights&rdquo; is this app&rsquo;s rule of thumb, not a clinical number:
                long enough to retake the photo before spending money.
              </p>
              <p className="small">Why it is sleep-sensitive (or not): {verdict.focus.evidence}</p>
            </div>
          </section>
        )}

        <section className="panel evidence">
          <h2 className="section-title">The evidence behind the rule</h2>
          <ul className="sources">
            {Object.values(SOURCES).map((s) => (
              <li key={s.short}>
                <p className="small">{s.finding}</p>
                <p className="cite">
                  {s.cite}{" "}
                  <a href={s.url} target="_blank" rel="noreferrer">DOI</a> &middot;{" "}
                  <a href={s.pubmed} target="_blank" rel="noreferrer">PubMed</a>
                </p>
              </li>
            ))}
          </ul>
          <p className="small muted">
            These studies used observers&rsquo; ratings of photos, not YouCam scores. Sleep-sensitivity here is a simple
            classification by this app, not a measurement of you.
          </p>
        </section>

        <footer className="footer">
          <p className="disclaimer" data-testid="disclaimer">
            <strong>Not medical advice.</strong> Sleep or Serum is a consumer demo for cosmetic shopping decisions. It does not
            diagnose any condition. If you have persistent swelling, eyelid drooping, skin changes or sleep problems, talk to a
            doctor or dermatologist.
          </p>
          <p className="small muted">
            Skin scores by the YouCam AI Skin Analysis API (Perfect Corp.). Sample photo by Wanas Rosa (Pexels). MIT licensed.
          </p>
        </footer>
      </main>
    </div>
  );
}

function Moon({ dawn }: { dawn: number }) {
  return (
    <svg
      className="moon"
      viewBox="0 0 100 100"
      aria-hidden
      style={{ transform: `translateY(${dawn * 140}px)`, opacity: 1 - dawn * 0.75 }}
    >
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#fff6d8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff6d8" stopOpacity="0" />
        </radialGradient>
        <mask id="crescent">
          <rect width="100" height="100" fill="white" />
          <circle cx="63" cy="40" r="26" fill="black" />
        </mask>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#moonGlow)" />
      <circle cx="50" cy="50" r="28" fill="#fdf3cf" mask="url(#crescent)" />
    </svg>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function friendlyError(code?: string, message?: string): string {
  const map: Record<string, string> = {
    error_no_face: "No face was found. Try a clear, front-facing photo.",
    error_src_face_too_small: "Your face is too small in the photo. Move closer so it fills most of the frame.",
    error_src_face_out_of_bound: "Part of your face is outside the photo. Center your face and try again.",
    error_lighting_dark: "The photo is too dark. Face a window or a lamp and try again.",
    error_below_min_image_size: "The photo resolution is too low.",
    error_large_face_angle: "Please face the camera straight on.",
  };
  return (code && map[code]) || message || `Analysis failed (${code ?? "unknown error"}).`;
}

/** Resize in the browser so uploads stay small and within YouCam's SD limits. */
async function resizeImage(file: File): Promise<{ url: string; blob: Blob }> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Could not read that image. Please use a JPG or PNG photo.");
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  if (Math.min(w, h) < MIN_SHORT_SIDE) {
    throw new Error(`Photo is too small: the short side must be at least ${MIN_SHORT_SIDE} px.`);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Could not process the image"))), "image/jpeg", 0.9),
  );
  return { url: URL.createObjectURL(blob), blob };
}
