# Deploy Sleep or Serum on Vercel

**Current status:** https://github.com/sese0318/sleep-or-serum is public and the local production build passes. The Node.js 22 production deployment is **READY** at https://sleep-or-serum.vercel.app . Anonymous access returned HTTP 200 and the genuine recorded-result interaction was verified. The public judge entry is ready. A Production-only `YOUCAM_API_KEY` Secret is saved; the deployment applying that key and a fresh live test remain pending.

**The genuine sample is ready.** `data/sample-result.json` has `recorded: true`, with a successful YouCam result recorded on November 2, 2026, at 15:58:46 UTC. It used 12 free units. The saved replay does not require a deployed API key.

**Deployment:** `dpl_FuinJPcYHRh7sYtijimDcjS6cTZ6`, production, commit `ec32c6edeee129ebc2d47261dd896ad973e64b3e`.

**Public access verified.** With explicit user approval, sign-in protection was removed only for this project. Anonymous HTTP 200 and a successful sample interaction were confirmed at the canonical URL, showing genuine scores 73, 66, 77, 73 and 77. No private bypass credential is needed.

## 1. Open the existing project

1. Open the existing `sleep-or-serum` project at https://vercel.com in your own account; do not create a duplicate. Use the free **Hobby** plan. Do not purchase an upgrade, enter billing details or enable paid usage for this task.
2. Confirm that its Git repository is `sese0318/sleep-or-serum`. If a connection is still required, use existing authorized GitHub access.
3. If a sign-in, permission grant or connection is required, review it yourself. Limit any repository access you choose to grant to **this repository only**; do not grant all-repository access.
4. Confirm **Next.js**, **Node.js 22** and the repository root (`./`). Use the existing package build script.

## 2. Choose whether to enable fresh analysis

The saved genuine sample can be deployed without an API key. The recording script has completed a real API upload, analysis task and polling cycle. Fresh browser analysis is optional for replay and requires separate deployed verification if enabled.

The existing key has now been saved securely as a **Production-only Secret**, without displaying its value. A new deployment must apply it before fresh analysis is verified. For future manual updates, use these scopes:

| Variable | Value | Scope |
|---|---|---|
| `YOUCAM_API_KEY` | Your existing key, pasted directly into Vercel | **Production only**, type **Secret** |
| `LIVE_DAILY_LIMIT_PER_IP` | Optional, e.g. `5` | Production |

Do not put the key in chat, a `NEXT_PUBLIC_*` variable, the GitHub repository or Preview/Development environments. Confirm available free YouCam units first. The in-memory request limit is not a guaranteed spending cap.

## 3. Deploy and verify

The production deployment is READY. Its assigned canonical URL is https://sleep-or-serum.vercel.app . Anonymous public access and the recorded-result interaction have been verified.

Open that URL in a signed-out browser:

- The page must load without a Vercel login for judges.
- A completed genuine Sample mode must show the recorded-result label and actual returned scores.
- Changing sleep from 4.5 to 8 hours should change the reflection while the recorded API scores stay fixed.
- A documentation/example preview is not an acceptable substitute for the genuine recording.
- Only test fresh analysis after confirming the free-unit balance; no purchases or automatic recharge.

The current public judge entry requires no login. Keep that verified access available through judging. Never put a private bypass secret in Devpost.

## 4. Environment changes and judging

Adding, changing or removing an environment variable requires a new deployment before it applies. After any change, verify the new production deployment and its public URL.

Keep the tested judge entry available free through **November 20, 2026, 11:45 a.m. Eastern Time**. Removing the live key only leaves a useful replay if a genuine result is already included in the deployed build.

Paste the verified app URL and public GitHub URL into Devpost. YouTube publishing and Devpost submission are Seika's actions.

References: [Vercel environment variables](https://vercel.com/docs/environment-variables), [Vercel deployments](https://vercel.com/docs/deployments).
