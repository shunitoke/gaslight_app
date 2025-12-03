# Redis Setup Guide

This guide explains how to set up Redis to solve the worker isolation problem in serverless environments.

## Problem

In serverless environments (Vercel), each API request can be handled by a different worker instance. In-memory stores (`progressStore`, `jobStore`) don't work because:

- Worker A saves data to its in-memory store
- Worker B tries to read the data, but it's in Worker A's memory
- Result: `hasResult: false`, data not found

## Solution: Redis

Redis provides a shared data store that all workers can access, solving the isolation problem. Vercel offers Redis as one of their storage options.

## Setup Steps

### 1. Create Redis Database in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database**
3. Select **Redis**
4. Choose the **Free** tier (30 MB) or upgrade if needed
5. Create the database

### 2. Link Redis to Your Project

Vercel automatically links the Redis database to your project and sets environment variables:

- `REDIS_URL` - Redis connection URL (automatically set by Vercel)

### 3. Install Package

The package is already installed:
```bash
npm install redis
```

### 4. Environment Variables

Vercel automatically sets `REDIS_URL` in production. For local development, add to `.env.local`:

```env
# This is automatically set by Vercel in production
# For local dev, you can get it from Vercel dashboard → Storage → Redis → .env.local
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
```

**Note**: For local development, you can:
- Use the actual Redis URL from Vercel (works but slower)
- Or skip Redis in local dev (falls back to in-memory stores)
- Or use a local Redis instance: `REDIS_URL=redis://localhost:6379`

### 5. How It Works

The code automatically detects if Redis is available:

```typescript
// lib/kv.ts
export function isKvAvailable(): boolean {
  return !!process.env.REDIS_URL;
}
```

- **If Redis is available**: Uses Redis for shared state
- **If Redis is not available**: Falls back to in-memory stores (works for local dev or VPS)

### 6. Data Structure

Data is stored in Redis with TTL (Time To Live):

- **Progress**: `progress:{conversationId}` - TTL: 1 hour
- **Jobs**: `job:{jobId}` - TTL: 1 hour
- **Job Index**: `job_index:{conversationId}` → `jobId` - TTL: 1 hour

### 7. Testing

1. Deploy to Vercel
2. Run an analysis
3. Check logs - you should see `usingKv: true` in logs
4. The result should be available across all workers

## Monitoring

Check Redis usage in Vercel dashboard:
- **Storage** → **Redis** → Your database
- View memory usage, operations, etc.

## Troubleshooting

### "Result not found" errors

1. Check if Redis is available: Look for `redis_client_connected` in logs
2. Check Redis connection: Verify `REDIS_URL` environment variable is set
3. Check Redis limits: Free tier is 30 MB, upgrade if needed

### Local development issues

If Redis is not configured locally, the app falls back to in-memory stores. This is fine for development, but remember:
- Results won't persist across server restarts
- Multiple instances won't share state

**Option**: Run Redis locally:
```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Then set in .env.local
REDIS_URL=redis://localhost:6379
```

### Memory limits

Free tier: 30 MB
- Each analysis result: ~50-200 KB (depends on size)
- Progress data: ~1-5 KB per conversation
- Estimated capacity: ~150-300 analyses before cleanup

Data is automatically cleaned up after 1 hour (TTL).

## Cost

- **Free tier**: 30 MB, 10,000 commands/day
- **Pro tier**: $0.20/GB/month, 100,000 commands/day
- **Enterprise**: Custom pricing

For most use cases, the free tier is sufficient.

## Migration from In-Memory

The code automatically uses Redis if available, no migration needed. The fallback to in-memory ensures backward compatibility.

## Next Steps

1. Create KV database in Vercel
2. Deploy your app
3. Test analysis functionality
4. Monitor KV usage in dashboard

