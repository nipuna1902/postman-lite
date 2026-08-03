import { redis } from "./redis";

const LIMIT = 20;        // max requests allowed
const WINDOW_SECONDS = 60; // per this many seconds

export async function checkRateLimit(userId: number): Promise<boolean> {
  const key = `ratelimit:execute:${userId}`;

  const count = await redis.incr(key);

  if (count === 1) {
    // First request in this window — set it to expire after WINDOW_SECONDS.
    await redis.expire(key, WINDOW_SECONDS);
  }

  return count <= LIMIT;
}