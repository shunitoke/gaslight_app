# Import Rules and Limits

## Overview

All platforms (Telegram, WhatsApp, Signal, Viber, Discord, iMessage, Messenger, Generic TXT) follow the **same rules** for file uploads and message limits.

## File Size Limits

### Direct Upload (≤4MB)
- **Vercel Limit**: 4.5MB request body
- **Safe Threshold**: 4MB - files larger automatically use Blob upload
- **Config Limit**: `MAX_UPLOAD_SIZE_MB` (default: 25MB)

### Blob Upload (>4MB)
- Files >4MB automatically uploaded to Vercel Blob
- Same size limits apply (configurable via `MAX_UPLOAD_SIZE_MB`)
- No additional restrictions

## Message Limits (by Subscription Tier)

### Free Tier
- **Max Messages**: 50,000 per analysis
- **Max Media Items**: 0 (no media analysis)
- **ZIP Import**: ❌ Not available
- **Enhanced Analysis**: ❌ Not available

### Premium Tier
- **Max Messages**: 500,000 per analysis
- **Max Media Items**: 1,000 per analysis
- **ZIP Import**: ✅ Available
- **Enhanced Analysis**: ✅ Available

## Platform-Specific Rules

### All Platforms (Unified)
- ✅ Same file size limits
- ✅ Same message limits (by tier)
- ✅ Same rate limiting (5 requests/minute per IP)
- ✅ Same Redis/Blob storage rules
- ✅ Same error handling

### Generic TXT / Plain Text
- **Format**: Free-form text with optional "Name: message" pattern
- **Limits**: Same as other platforms (no special 4000 message cap)
- **Content Types**: `text/plain`, `.txt` files
- **Parsing**: Best-effort line-by-line parsing

### ZIP Files
- **Requires**: Premium subscription
- **Supported Platforms**: WhatsApp (with media)
- **Content Types**: `application/zip`, `application/x-zip-compressed`

## Rate Limiting

### All Import Endpoints
- **Limit**: 5 requests per minute per IP
- **Implementation**: Redis (if available) or in-memory fallback
- **Atomic**: Uses Lua script to prevent race conditions

### Endpoints
- `/api/import` - Direct upload
- `/api/import/blob` - Blob-based import
- `/api/upload-to-blob` - Blob upload

## Storage Rules

### Redis
- **Progress Tracking**: TTL 2 hours (auto-extended)
- **Job Storage**: TTL 2 hours (extended for completed jobs)
- **Memory Limit**: 30MB (free tier)
- **Large Results**: Automatically stored in Vercel Blob (>1MB)

### Vercel Blob
- **Threshold**: Results >1MB stored in Blob
- **Storage**: 1GB free tier
- **TTL**: Managed by application (ephemeral)

## Error Handling

### 413 Payload Too Large
- **Cause**: File >4.5MB sent directly (Vercel limit)
- **Solution**: Automatic Blob upload for files >4MB
- **User Message**: Clear error with retry suggestion

### 429 Too Many Requests
- **Cause**: Rate limit exceeded
- **Solution**: Wait 1 minute before retry
- **User Message**: "Too many requests. Please try again later."

### 403 Forbidden
- **Causes**:
  - ZIP file without premium
  - Message limit exceeded (free tier)
- **User Message**: Clear explanation with upgrade suggestion

## Validation Flow

```
1. Rate Limit Check (all platforms)
   ↓
2. File Size Check (all platforms)
   ↓
3. Subscription Tier Check (all platforms)
   ↓
4. Content Type Check (all platforms)
   ↓
5. Platform-Specific Parsing
   ↓
6. Message Limit Check (all platforms)
   ↓
7. Return Normalized Data
```

## Consistency Guarantees

✅ **All platforms**:
- Use same subscription tier limits
- Use same file size validation
- Use same rate limiting
- Use same Redis/Blob storage
- Use same error messages format

✅ **No special cases**:
- Generic TXT has same limits as Telegram/WhatsApp
- All platforms follow same rules
- No platform-specific restrictions

## Configuration

### Environment Variables
```env
# File size limit (applies to all platforms)
MAX_UPLOAD_SIZE_MB=25

# Redis (for all platforms)
REDIS_URL=redis://...

# Blob (for large files and results)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
```

### Subscription Limits
Defined in `features/subscription/types.ts`:
- Free: 50k messages, no media, no ZIP
- Premium: 500k messages, 1000 media, ZIP support

## Testing

All platforms should be tested with:
- ✅ Small files (<4MB) - direct upload
- ✅ Large files (>4MB) - Blob upload
- ✅ Free tier limits (50k messages)
- ✅ Premium tier limits (500k messages)
- ✅ Rate limiting (5 requests/minute)
- ✅ Error handling (413, 429, 403)


