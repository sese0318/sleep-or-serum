import SleepOrSerum from "./SleepOrSerum";
import { hasApiKey } from "@/lib/youcam";
import { loadSample } from "@/lib/sample";

// Read the env var at request time so adding the key on Vercel takes effect without code changes.
export const dynamic = "force-dynamic";

export default function Page() {
  return <SleepOrSerum liveAvailable={hasApiKey()} sample={loadSample()} />;
}
