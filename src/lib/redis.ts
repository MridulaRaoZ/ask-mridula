import { Redis } from "@upstash/redis";

// Upstash Redis when its env vars are set (Vercel's Upstash integration adds them);
// null otherwise, e.g. in local dev, where callers fall back or skip.
export const redis =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL ? Redis.fromEnv() : null;
