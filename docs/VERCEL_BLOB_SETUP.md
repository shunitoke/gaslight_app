# Vercel Blob Storage Setup

## Overview

Vercel Blob Storage is now integrated to handle large analysis results (>1MB) that would otherwise fill up Redis memory. Small results are still stored in Redis for fast access.

## Setup

### 1. Create Blob Store in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database**
3. Select **Blob**
4. Choose the **Free** tier (1 GB) or upgrade if needed
5. Create the store

### 2. Environment Variables

Vercel automatically sets `BLOB_READ_WRITE_TOKEN` when you create a Blob store. No manual configuration needed in production.

For local development, add to `.env.local`:

```env
# Get this from Vercel dashboard → Storage → Blob → .env.local
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
```

## How It Works

### Automatic Storage Selection

- **Results < 1MB**: Stored in Redis (fast access)
- **Results ≥ 1MB**: Stored in Vercel Blob (saves Redis memory)

### Storage Flow

1. Analysis completes with result
2. System checks result size
3. If large, stores in Blob and saves blob URL in Redis
4. If small, stores directly in Redis
5. On retrieval, if blob URL exists, fetches from Blob

### Benefits

- **Saves Redis memory**: Large results don't fill up 30MB Redis limit
- **Automatic**: No code changes needed, works transparently
- **Fast fallback**: Small results still use Redis for speed
- **Free tier**: 1GB free storage is plenty for analysis results

## Monitoring

Check Blob usage in Vercel dashboard:
- **Storage** → **Blob** → Your store
- View storage usage, operations, etc.

## Troubleshooting

### "Result not found" errors

1. Check if blob URL is in Redis progress data
2. Verify `BLOB_READ_WRITE_TOKEN` is set
3. Check Blob store exists in Vercel dashboard

### Large results still in Redis

- Check logs for `kv_progress_using_blob` - should appear for large results
- Verify Blob package is installed: `npm list @vercel/blob`
- Check Blob token is valid

## Cost

- **Free tier**: 1 GB storage, 1,000 operations/day
- **Pro tier**: $0.15/GB/month, 10,000 operations/day

For most use cases, the free tier is sufficient.


