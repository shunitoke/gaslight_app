# Admin Dashboard

Secure admin dashboard for monitoring metrics and analysis performance.

## Setup

1. Set `ADMIN_SECRET` environment variable:
```bash
ADMIN_SECRET=your-secret-key-here
```

2. Access the dashboard at `/admin`

3. Enter the admin secret to authenticate

## Features

- **System Status**: Redis availability and connection status
- **Cache Metrics**: Hit rate, total requests, hits/misses
- **Analysis Metrics**: Average duration, total analyses
- **Auto-refresh**: Optional 5-second auto-refresh
- **Real-time Updates**: Manual refresh button

## API Endpoints

### GET `/api/admin/metrics`
Returns aggregate metrics and system status.

**Headers:**
- `x-admin-secret`: Admin secret key
- OR `Authorization: Bearer <secret>`

**Response:**
```json
{
  "timestamp": "2025-12-03T22:18:56.633Z",
  "aggregate": {
    "averageDurationMs": 125000,
    "totalAnalyses": 42,
    "cacheMetrics": {
      "hits": 15,
      "misses": 27,
      "hitRate": 0.357,
      "totalRequests": 42
    }
  },
  "cache": {
    "hits": 15,
    "misses": 27,
    "hitRate": 0.357,
    "totalRequests": 42
  },
  "redis": {
    "available": true,
    "connected": true
  },
  "system": {
    "adminEnabled": true,
    "redisAvailable": true
  }
}
```

### GET `/api/admin/analysis/[conversationId]`
Returns detailed metrics for a specific conversation.

**Headers:**
- `x-admin-secret`: Admin secret key

**Response:**
```json
{
  "conversationId": "conv_123",
  "metrics": {
    "conversationId": "conv_123",
    "startTime": 1234567890,
    "endTime": 1234567891,
    "durationMs": 1000,
    "fileSizeBytes": 1024,
    "messageCount": 100,
    "chunkCount": 5,
    "cacheHit": false,
    "enhancedAnalysis": true,
    "platform": "telegram"
  },
  "progress": {
    "status": "completed",
    "progress": 100
  }
}
```

## Security

- Uses timing-safe comparison to prevent timing attacks
- Secret key must be set via environment variable
- All requests are logged for audit
- Unauthorized access attempts are logged

## LLM Activity Monitoring

### Real-time Activity Stream

1. Enter a `conversationId` in the "LLM Activity Monitor" section
2. The dashboard will connect to `/api/admin/llm-activity/[conversationId]` via SSE
3. You'll see real-time events:
   - `request_start`: LLM request initiated
   - `chunk_received`: Streaming chunk received (every 10th chunk)
   - `request_complete`: Request finished with content preview
   - `error`: Error occurred

### Activity Events

Each event includes:
- `timestamp`: When the event occurred
- `conversationId`: Conversation being analyzed
- `chunkIndex`: Which chunk is being processed
- `eventType`: Type of event
- `model`: LLM model used
- `data`: Event-specific data (content preview, tokens, duration, error)

### API Endpoint

**GET `/api/admin/llm-activity/[conversationId]`**
Returns Server-Sent Events stream of LLM activity.

**Headers:**
- `x-admin-secret`: Admin secret key

**Response:**
SSE stream with events:
```
data: {"type":"connected","conversationId":"conv_123"}
data: {"type":"activity","event":{"timestamp":1234567890,"eventType":"request_start",...}}
data: {"type":"activity","event":{"timestamp":1234567891,"eventType":"chunk_received",...}}
```

## Troubleshooting

### Dashboard not accessible
- Check that `ADMIN_SECRET` is set in environment variables
- Verify the secret key matches what you're entering

### No metrics shown
- Check Redis connection status in dashboard
- Verify metrics are being recorded (check logs for `metrics_analysis_start`)

### Analysis stuck on "starting"
- Check logs for `analysis_started` event
- Verify `OPENROUTER_API_KEY` is configured (should show "configured" not "MISSING" in logs)
- Check logs for `analysis_llm_request_start` to see if LLM calls are being made
- Look for `llm_no_response` or `analysis_llm_error` events
- Use LLM Activity Monitor in admin dashboard - enter conversationId to see real-time LLM activity

### No LLM activity shown
- Verify conversationId is correct
- Check that analysis is actually running (not cached)
- Look for `llm_activity_logged` events in logs
- Ensure Redis is available (activity logs stored in Redis)

