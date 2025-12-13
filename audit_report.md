# Code Audit Report: Cache, Token Usage, and Rate Limits

## 1. Cache Implementation for Analysis
- **Status**: Implemented and Verified.
- **Mechanism**: Analysis results are cached in Redis (or in-memory fallback) using a SHA-256 hash of the conversation content and media metadata.
- **Key**: `analysis_cache:<version>:<hash>`.
- **TTL**: 24 hours.
- **Invalidation**: Automatic via `PROMPT_VERSION` changes or TTL expiry.
- **Behavior**: Repeated "Analyze" requests for the same conversation hit the cache and return immediately, skipping all LLM calls.

## 2. Token Usage & Vision Analysis
- **Text Analysis**: Properly cached. Repeated imports of the same file produce the same hash, reusing cached text analysis results.
- **Vision Analysis (Finding)**: The vision analysis function `analyzeMediaArtifact` was present in the codebase but **never called**. This meant media items were not being analyzed by the vision model, and tokens were technically "saved" but features were broken.
- **Fix Implemented**: 
  - Integrated `analyzeMediaArtifact` into the `app/api/analyze/start` pipeline.
  - Added concurrency control (batch size 3) to prevent rate limit issues with OpenRouter.
  - Vision results (labels, descriptions) are now fed into the text analysis context.
  - Vision calls happen *after* the cache check, ensuring we don't waste tokens on cached conversations.
  - Since vision results are part of the input to `analyzeConversation`, the final result (including vision insights) is cached by the main analysis cache.

## 3. Rate Limiting & Abuse Protection
- **Infrastructure**: Robust `checkRateLimit` utility using Redis with Lua scripts for atomicity (or in-memory fallback).
- **Current Limits**:
  - `analyze_start`: 3 requests per minute per IP.
  - `import`: 5 requests per minute per IP.
  - `import_media`: 5 requests per minute per IP.
- **Concurrency**: OpenRouter client has fallback logic and retry mechanisms.

## 4. Analysis Limits
- **Premium Tier**: Limited to 3 analyses per payment token (hardcoded check).
- **Free Tier (Finding)**: Previously had **unlimited** analyses per day (subject only to the per-minute rate limit). This posed a risk of token abuse.
- **Fix Implemented**: 
  - Added a **Daily Limit** of 10 analyses per IP for free tier users.
  - Used Redis-backed rate limiting with a 24-hour window.

## 5. Summary of Protection Mechanisms
| Mechanism | Scope | Limit |
|-----------|-------|-------|
| IP Rate Limit (Analyze) | Global | 3 requests / min |
| IP Rate Limit (Import) | Global | 5 requests / min |
| Daily Limit (Free Tier) | Free Users | 10 analyses / day |
| Payment Limit (Premium) | Premium Token | 3 analyses / payment |
| Caching | All | 24 hours TTL (skips processing) |
| Vision Concurrency | All | 3 concurrent requests |
| Message Cap | All | 500k messages (hardcoded) |
| Media Cap | All | 1000 items (hardcoded) |
