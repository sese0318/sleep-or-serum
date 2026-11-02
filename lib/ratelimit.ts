import "server-only";

/**
 * Best-effort, in-memory limit on live analyses per IP so a public demo
 * cannot burn through the owner's API units. Resets when the server
 * instance restarts. Configure with LIVE_DAILY_LIMIT_PER_IP (default 5).
 */
const hits = new Map<string, { day: string; count: number }>();

export function allowLiveAnalysis(ip: string): boolean {
  const limit = Number(process.env.LIVE_DAILY_LIMIT_PER_IP ?? "5");
  const day = new Date().toISOString().slice(0, 10);
  const entry = hits.get(ip);
  if (!entry || entry.day !== day) {
    hits.set(ip, { day, count: 1 });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}
