# Rate Limiting for VPS Deployment

## Current Implementation

The current rate limiting uses in-memory `Map` objects, which works fine for:
- Single-server deployments
- Development/testing
- Small-scale production

However, it **won't work** for:
- Multiple server instances (load balancing)
- Serverless environments (Vercel, AWS Lambda)
- Horizontal scaling

## VPS Deployment Options

Since you're planning to deploy on a VPS (single server), you have several options:

### Option 1: Keep In-Memory (Simplest - Recommended for VPS)

**Best for**: Single VPS, no load balancing

The current implementation will work fine on a single VPS server. Just ensure:
- You're running a single Node.js process (or use PM2 with 1 instance)
- No load balancer in front (or use sticky sessions if you do)

**Pros:**
- No additional dependencies
- Zero latency
- Simple to maintain

**Cons:**
- Doesn't work with multiple instances
- Rate limits reset on server restart

**Implementation**: Current code is fine, no changes needed.

---

### Option 2: Redis (Recommended for Future Scaling)

**Best for**: Multiple servers, load balancing, or future scaling

Use Redis for distributed rate limiting that works across multiple instances.

**Installation:**
```bash
# On your VPS
sudo apt-get install redis-server
# Or use Docker:
docker run -d -p 6379:6379 redis:alpine
```

**Implementation:**

1. Install Redis client:
```bash
npm install ioredis
```

2. Create `lib/rateLimit.ts`:
```typescript
import Redis from 'ioredis';

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP

export async function checkRateLimit(
  key: string,
  maxRequests: number = RATE_LIMIT_MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Use Redis sorted set to track requests
  const redisKey = `ratelimit:${key}`;
  
  // Remove old entries
  await redis.zremrangebyscore(redisKey, 0, windowStart);
  
  // Count current requests in window
  const count = await redis.zcard(redisKey);
  
  if (count >= maxRequests) {
    return false;
  }
  
  // Add current request
  await redis.zadd(redisKey, now, `${now}-${Math.random()}`);
  
  // Set expiry on the key
  await redis.expire(redisKey, Math.ceil(windowMs / 1000));
  
  return true;
}

export async function getRateLimitInfo(key: string): Promise<{
  remaining: number;
  resetAt: number;
}> {
  const redisKey = `ratelimit:${key}`;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  
  await redis.zremrangebyscore(redisKey, 0, windowStart);
  const count = await redis.zcard(redisKey);
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - count);
  
  // Get oldest entry to calculate reset time
  const oldest = await redis.zrange(redisKey, 0, 0, 'WITHSCORES');
  const resetAt = oldest.length > 0 
    ? parseInt(oldest[1]) + RATE_LIMIT_WINDOW_MS 
    : now + RATE_LIMIT_WINDOW_MS;
  
  return { remaining, resetAt };
}
```

3. Update API routes to use Redis:
```typescript
// In app/api/import/route.ts
import { checkRateLimit } from '../../../lib/rateLimit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const allowed = await checkRateLimit(`import:${ip}`, 5, 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }
  // ... rest of handler
}
```

**Pros:**
- Works across multiple servers
- Persistent across restarts
- Industry standard
- Can add more features (rate limit info, etc.)

**Cons:**
- Additional dependency
- Slight latency (usually < 1ms)
- Requires Redis server

---

### Option 3: Database (PostgreSQL/MySQL)

**Best for**: If you already have a database

Use your existing database to track rate limits. Similar to Redis but uses your existing infrastructure.

**Implementation**: Similar to Redis but using SQL queries instead.

---

### Option 4: File-based (Not Recommended)

Store rate limit data in files. Works but has performance issues and race conditions.

---

## Recommendation for Your VPS

**Start with Option 1 (In-Memory)**:
- Simplest to deploy
- No additional services needed
- Works perfectly for single VPS

**Upgrade to Option 2 (Redis) when**:
- You add a second server
- You implement load balancing
- You need persistent rate limits across restarts
- You want to add rate limit info endpoints

## Environment Variables

For Redis option, add to `.env`:
```env
REDIS_URL=redis://localhost:6379
# Or separately:
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Testing Rate Limiting

Test with:
```bash
# Make 10 requests quickly
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/import \
    -F "file=@test.json" \
    -F "platform=telegram"
  echo ""
done
```

You should see 429 errors after the limit is exceeded.

