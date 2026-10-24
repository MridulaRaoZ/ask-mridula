import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const PER_VISITOR = { max: 20, window: "1 h", ms: 60 * 60 * 1000 } as const;
const SITE_DAILY = { max: 300, window: "1 d", ms: 24 * 60 * 60 * 1000 } as const;

type Limiter = (key: string) => Promise<boolean>;

// Shared counters in Upstash Redis when configured (needed on Vercel, where
// each serverless instance has its own memory); in-memory for local dev.
function makeLimiter(limit: { max: number; window: "1 h" | "1 d"; ms: number }, prefix: string): Limiter {
  if (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) {
    const rl = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit.max, limit.window),
      prefix: `ask-mridula:${prefix}`,
    });
    return async (key) => (await rl.limit(key)).success;
  }
  const hits = new Map<string, { count: number; resetAt: number }>();
  return async (key) => {
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + limit.ms });
      return true;
    }
    entry.count += 1;
    return entry.count <= limit.max;
  };
}

const visitorLimit = makeLimiter(PER_VISITOR, "visitor");
const siteLimit = makeLimiter(SITE_DAILY, "site");

const plain = (body: string, status: number) =>
  new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

// Returns a response to send instead of calling the AI, or null to go ahead.
export async function guard(request: Request): Promise<Response | null> {
  if (process.env.AI_ENABLED === "false") {
    return plain("The AI is paused right now. You can reach Mridula at aludrim@gmail.com.", 503);
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!(await visitorLimit(ip))) {
    return plain("You've asked a lot in the last hour. Please try again later, or email aludrim@gmail.com.", 429);
  }
  if (!(await siteLimit("all"))) {
    return plain("The AI has hit its daily limit. Please try again tomorrow, or email aludrim@gmail.com.", 429);
  }
  return null;
}
