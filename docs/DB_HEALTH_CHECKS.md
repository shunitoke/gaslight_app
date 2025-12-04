# Database Health Checks

## Overview

The application now includes comprehensive health checks for all database connections (Redis and Vercel Blob) to ensure reliable file uploads and analysis operations.

## Implementation

### Health Check Module

**File**: `lib/db-health.ts`

Provides:
- `checkDatabaseHealth()`: Checks Redis and Blob connectivity
- `checkUploadReadiness()`: Verifies storage is ready for file uploads

### Health Status

Each service reports:
- **enabled**: Whether the service is configured (env var present)
- **connected/accessible**: Whether the service is actually reachable
- **error**: Error message if connection failed

Overall status:
- **healthy**: All enabled services are connected
- **degraded**: Some services are down but core functionality may work
- **unhealthy**: Critical services are unavailable

## Usage

### Automatic Checks

Health checks are automatically performed in:

1. **`/api/upload-to-blob`**: Before accepting file uploads
   - Returns `503 Service Unavailable` if Blob is not accessible
   - Logs detailed error information

2. **`/api/import/blob`**: Before processing imported files
   - Logs database status for debugging

3. **`/api/health`**: Health check endpoint
   - Returns status of all databases
   - Useful for monitoring and debugging

### Manual Health Check

```typescript
import { checkDatabaseHealth } from '@/lib/db-health';

const status = await checkDatabaseHealth();
console.log('Redis:', status.redis.connected);
console.log('Blob:', status.blob.accessible);
console.log('Overall:', status.overall);
```

## Logging

All health checks log detailed information:

- `database_health_check`: Overall health status
- `upload_readiness_check_passed`: Upload is ready
- `upload_readiness_check_failed`: Upload blocked due to storage issues
- `import_blob_db_check`: Database status during import

## Error Handling

### Upload Errors

If Blob storage is unavailable:
- **Status**: `503 Service Unavailable`
- **Error**: "Storage service is not available"
- **Details**: Array of specific error messages

### Common Issues

1. **BLOB_READ_WRITE_TOKEN not configured**
   - Check Vercel Dashboard → Storage → Blob
   - Ensure token is set in environment variables

2. **Redis connection failed**
   - Check `REDIS_URL` environment variable
   - Verify Redis server is running
   - Check network connectivity

3. **Blob module import failed**
   - Verify `@vercel/blob` package is installed
   - Check package.json dependencies

## Monitoring

Check logs for:
- `database_health_check`: Regular health status
- `upload_to_blob_db_not_ready`: Upload blocked
- `redis_connection_lost`: Redis disconnected
- `blob_store_error`: Blob operation failed

## Health Endpoint

**GET `/api/health`**

Returns:
```json
{
  "status": "ok" | "degraded" | "unhealthy",
  "timestamp": "2025-01-27T...",
  "databases": {
    "redis": {
      "enabled": true,
      "connected": true
    },
    "blob": {
      "enabled": true,
      "accessible": true
    }
  }
}
```

## Testing

Test health checks:

```bash
# Check overall health
curl http://localhost:3000/api/health

# Try uploading a file (will check health automatically)
curl -X POST http://localhost:3000/api/upload-to-blob \
  -F "file=@test.txt"
```


