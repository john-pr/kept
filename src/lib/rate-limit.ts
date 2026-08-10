import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

const limiters = new Map<string, Ratelimit>();

function getLimiter(name: string, limit: number, windowSeconds: number): Ratelimit | null {
  if (!redis) return null;

  const key = `${name}:${limit}:${windowSeconds}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: `ratelimit:${name}`,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

/**
 * Checks a rate limit for the given identifier. Fails open (allows the request)
 * if Upstash isn't configured or the check itself throws, so an outage never
 * blocks auth traffic.
 */
export async function checkRateLimit(
  name: string,
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const limiter = getLimiter(name, limit, windowSeconds);
  if (!limiter) {
    return { success: true, remaining: limit, reset: Date.now() + windowSeconds * 1000 };
  }

  try {
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining, reset: result.reset };
  } catch {
    return { success: true, remaining: limit, reset: Date.now() + windowSeconds * 1000 };
  }
}

export function getRequestIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  // Some proxies (or platforms that don't set x-forwarded-for) expose the
  // client IP via x-real-ip instead. Falling straight to "unknown" would
  // otherwise bucket every such client into one shared rate limit.
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}

export function retryAfterMessage(reset: number): string {
  const minutes = Math.max(1, Math.ceil((reset - Date.now()) / 60000));
  return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

export function rateLimitResponse(reset: number) {
  const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { success: false, error: retryAfterMessage(reset) },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}