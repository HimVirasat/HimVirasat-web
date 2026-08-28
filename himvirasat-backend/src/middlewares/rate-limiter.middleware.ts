import { NextFunction, Request, Response } from "express";

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Simple in-memory sliding-window rate limiter. Suitable for single-instance
 * deployments; swap for a Redis-backed store when scaling horizontally.
 */
export function rateLimiter(options: RateLimiterOptions) {
  const { windowMs, max, message = "Too many requests, please try again later." } =
    options;
  const buckets = new Map<string, Bucket>();

  const keyGenerator =
    options.keyGenerator ?? ((req: Request) => req.ip ?? req.socket.remoteAddress ?? "unknown");

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= max) {
      res.status(429).json({ success: false, error: message });
      return;
    }

    bucket.count += 1;
    next();
  };
}
