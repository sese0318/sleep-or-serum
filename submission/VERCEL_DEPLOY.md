# Deploy Sleep or Serum on Vercel (no CLI needed)

You only need a browser. These steps take about 5 minutes.

## 1. Import the GitHub repo

1. Go to https://vercel.com and choose **Continue with GitHub**. Sign in as `sese0318`. The free **Hobby** plan is enough; do not enter payment details.
2. Click **Add New… → Project**.
3. Under **Import Git Repository**, find **`sleep-or-serum`** and click **Import**.
   - If it is missing (the repo is private), click **Adjust GitHub App Permissions →**. Allow access to `sese0318/sleep-or-serum` (or all repositories), save, and come back.
4. Vercel detects **Framework Preset: Next.js**. Leave Root Directory as `./` and keep the default Build/Output settings (`next build`).

## 2. Add the API key as an environment variable

Still on the import screen, open **Environment Variables**:

| Key | Value | Environments |
|---|---|---|
| `YOUCAM_API_KEY` | *(paste your YouCam API key)* | Production, Preview |
| `LIVE_DAILY_LIMIT_PER_IP` *(optional)* | `5` | Production |

The key is used only by server route handlers and never reaches the browser.

If you skip the key, the site still works in **Sample mode** only, which is fine for judges.

## 3. Deploy

1. Click **Deploy** and wait about 1–2 minutes for "Congratulations!".
2. Open the URL (for example `https://sleep-or-serum.vercel.app` or `https://sleep-or-serum-<something>.vercel.app`).
3. Check that:
   - Sample mode → **Look in the mirror (sample)** shows the mirror, the scores and a verdict.
   - If you added the key, **My photo (live)** is enabled. One live test costs 12 units.

## 4. Adding or changing the key later

**Project → Settings → Environment Variables** → add or edit `YOUCAM_API_KEY` → **Save**. Then go to **Deployments → ⋯ (latest) → Redeploy**. Environment variable changes apply only to new deployments.

## 5. Keep it available for judging

- The rules ask that the project stay testable for free until the end of judging (**Nov 20, 2026**). Keep the deployment up until then. Sample mode needs no key and uses no units.
- To stop Live mode from using units, delete `YOUCAM_API_KEY` and redeploy. The app falls back to Sample mode.
- Pushing to `main` on GitHub redeploys automatically.

## Notes

- Paste the deployed URL into the Devpost form as the demo/testing link.
- The repo can stay private on Vercel. For the Devpost "code repository" field, the hackathon page requires a public repo (with license) or a private repo shared with contact_event@PerfectCorp.com.
