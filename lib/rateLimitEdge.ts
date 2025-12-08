/**
 * Edge-safe, in-memory rate limiter for middleware/proxy.
 * Not distributed. Keeps per-process counters; acceptable for admin guard.
 */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimitEdge(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

