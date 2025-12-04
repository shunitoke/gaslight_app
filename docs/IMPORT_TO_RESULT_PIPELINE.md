# Import → Analysis → Result Pipeline

This document describes the **end‑to‑end flow** from a user uploading a chat export to receiving an analysis report, including key modules and guarantees.

It is the single source of truth for the runtime pipeline and complements:

- `TWME/specs/master/spec.md` (functional requirements)
- `TWME/specs/master/data-model.md` (entities)
- `gaslight_detector/docs/ARCHITECTURE_ALIGNMENT.md` (implementation checklist)

---

## 1. High‑Level Sequence

1. **User uploads chat export** on the landing page (`app/page.tsx`).
2. Frontend **uploads file to Vercel Blob** and receives a `blobUrl`.
3. Frontend calls **`/api/import` or `/api/import/blob`**, which:
   - Detects platform and format.
   - Optionally runs **AI pre‑validation**.
   - Parses the export (streaming for large files).
   - Normalizes into `Conversation`, `Message[]`, `MediaArtifact[]`, `Participant[]`.
4. Frontend receives normalized data and calls **`/api/analyze/start`**.
5. `/api/analyze/start`:
   - Applies **rate limiting**.
   - Computes **chat hash** and checks **Redis cache**.
   - If cached, short‑circuits and returns a job with pre‑computed result.
   - Otherwise, creates an **AnalysisJob** in Redis and initializes **progress**.
   - Spawns a **background analysis** (fire‑and‑forget) using `analyzeConversation`.
6. Backend runs **LLM‑based analysis** (with optional multimodal Vision) and updates **progress** in Redis.
7. When analysis completes, backend:
   - Stores final `AnalysisResult` + activity data in **jobStore + progressStore**.
   - Updates job status to `completed`.
8. Frontend **polls `/api/analyze/progress` (or SSE stream)** until it sees a completed result.
9. Frontend persists the result in `sessionStorage` and navigates to **`/analysis`**.
10. The **Analysis page** reads `AnalysisResult` + messages + activity data and renders:
    - Relationship Health Overview.
    - Pattern sections with evidence.
    - Timelines, radar chart, activity wave, calendar with important dates.

All intermediate data is **ephemeral** by design (no long‑lived user accounts or databases).

---

## 2. Frontend: Upload & Consent

**Key files:**

- `app/page.tsx`
- `components/ui/FileUpload.tsx`
- `features/import/*`
- `features/i18n/*`

**Flow:**

1. User lands on `/` and sees the **upload card** with:
   - File picker for Telegram/WhatsApp/generic exports.
   - Consent/terms information (GDPR, anonymity, ephemerality).
2. The user selects a file and confirms analysis.
3. The UI switches from platform selection to **circular upload progress**.
4. Language is chosen via `LanguageSwitcher` or auto‑detected; this becomes the **UI locale** and is passed through to analysis (`locale`).

---

## 3. File Upload → Vercel Blob

**Key files:**

- `app/page.tsx`
- `app/api/upload-to-blob/route.ts`
- `lib/blob.ts`

**Flow:**

1. Client code always uploads the raw file to **Vercel Blob**:
   - Large files no longer hit Vercel body limits directly.
   - The backend works with `blobUrl` instead of raw file bodies.
2. `/api/upload-to-blob` validates upload readiness (`checkUploadReadiness()` etc.) and returns the final Blob URL.
3. The UI then calls the **import API** with either:
   - Direct file body (small files) → `/api/import`.
   - `blobUrl` (all files in modern path) → `/api/import/blob`.

---

## 4. Import: Detection, Validation, Parsing, Normalization

**Key files:**

- `app/api/import/route.ts`
- `app/api/import/blob/route.ts`
- `features/import/detectFormat.ts`
- `features/import/preValidation.ts`
- `features/import/parsers.ts`
- `features/import/streamingParser.ts`
- `features/import/mediaExtractor.ts`
- `features/import/types.ts`

**Flow:**

1. **Platform detection** (`detectFormat.ts`):
   - Detects platform (Telegram, WhatsApp, iMessage, Messenger, Discord, generic) from **file name + structure + content**.
   - Returns a structured `DetectedFormat` used by parsers.
2. **AI‑powered pre‑validation** (`preValidation.ts`):
   - Optionally checks if the file “looks like” a conversation export (participant names + messages).
   - For auto‑detected formats, validation is intentionally relaxed (parsers handle edge cases).
3. **Parsing & normalization** (`parsers.ts` + `streamingParser.ts`):
   - For large JSON/ndjson, uses **streaming parsers** to avoid OOM.
   - Each supported platform is normalized into the shared model:
     - `Conversation`
     - `Message[]`
     - `Participant[]`
     - `MediaArtifact[]`
   - Media references keep only **Blob URLs** (no inline base64 in the long term path).
4. **Media extraction** (`mediaExtractor.ts`):
   - Extracts media files from WhatsApp ZIP / Telegram exports.
   - Uploads media into Blob (if not already) and fills `MediaArtifact.blobUrl`.
5. Response to frontend:
   - `conversation` (metadata + status = `imported`).
   - `messages`, `participants`, `mediaArtifacts` (ephemeral in memory).
   - Feature flags (free vs premium capabilities).

At this point, **no analysis was run yet**; we only have normalized chat data.

---

## 5. Starting Analysis: `/api/analyze/start`

**Key files:**

- `app/api/analyze/start/route.ts`
- `lib/rateLimit.ts`
- `lib/cache.ts`
- `lib/metrics.ts`
- `app/api/analyze/progress/route.ts`
- `app/api/analyze/progress/stream/route.ts`

**Flow:**

1. Frontend calls `POST /api/analyze/start` with body:
   - `conversation`, `messages`, optional `mediaArtifacts`, `participants`, `locale`, `enhancedAnalysis` flag.
2. Endpoint:
   - Applies **rate limiting** (`checkRateLimit('analyze_start:ip', ...)`).
   - Figures out subscription tier & features (e.g. `canAnalyzeMedia`, `canUseEnhancedAnalysis`).
   - Computes a **chat hash** (`computeChatHash(messages)`).
   - Checks **Redis cache** (`getCachedAnalysis(chatHash, enhancedFlag)`):
     - On **cache hit**:
       - Records metrics (`recordAnalysisStart`, `recordAnalysisComplete` with `cacheHit = true`).
       - Creates a **job** and stores the cached result in both jobStore + progressStore.
       - Immediately returns `{ jobId }` with status `202` and progress `completed`.
   - On **cache miss**:
       - Creates a new **AnalysisJob** in Redis (status `queued`).
       - Initializes progress for `conversation.id` in progressStore (`status: 'starting', progress: 0`).
       - Spawns a **background task** that will call `analyzeConversation(...)` and store the result.
3. Frontend receives `{ jobId, conversationId, status }` and:
   - Starts **client‑side simulated progress**.
   - Starts **real progress polling** (`/api/analyze/progress?conversationId=...`) or SSE.

---

## 6. Background Analysis: `analyzeConversation`

**Key files:**

- `features/analysis/analysisService.ts`
- `features/analysis/prompts.ts`
- `lib/llmClient.ts`
- `lib/metrics.ts`
- `lib/vision.ts`
- `lib/progress.ts`

**Stages inside `analyzeConversation`** (simplified):

1. **Config & metrics**:
   - Validates OpenRouter config (`getConfig()`).
   - Records `recordAnalysisStart(...)`.
2. **Initial progress**:
   - Sets progress to `parsing` (≈5%) via `updateProgress(...)` → `lib/progress` → Redis.
3. **Media analysis (vision/audio)**:
   - Selects up to N media items (currently images/stickers/GIF, audio/video still TODO for deep analysis).
   - Fetches from Blob (`getMediaFromBlob`) and runs Vision model (`analyzeMediaArtifact` / `vision.ts`).
   - Updates `MediaArtifact.labels`, `sentimentHint`, `notes`.
   - Updates progress to `media` (~10–20%).
4. **Chunking**:
   - Splits messages into **chunks** using `chunkMessages()`:
     - Large chunks (up to 1000 messages), capped number of chunks.
     - For extremely large conversations, uses **sampling** across the whole timeline.
   - Progress status → `chunking` (~20%).
5. **Per‑chunk LLM analysis (`analyzeChunk`)**:
   - Formats messages to analysis text (`formatMessagesForLLM`), including media labels/tones.
   - Builds **system prompt** + **user prompt** (`prompts.ts`):
     - Single English prompt with strict JSON contract.
     - Response language = `locale` (EN/RU/FR/DE/ES/PT) controlled via `getLanguageInstruction`.
     - Tone explicitly neutral, educational, non‑judgmental.
   - Calls `callLLM(...)` with timeouts and activity logging.
   - Validates and parses JSON payload, with retries for malformed JSON.
   - For each parsed chunk:
     - Aggregates **scores**, **sections**, **evidence snippets**, **participantProfiles**, **importantDates**.
     - Aggregates extended insight blocks (`communicationStats`, `promiseTracking`, `redFlagCounts`, `emotionalCycle`, `timePatterns`, `contradictions`, `realityCheck`, `frameworkDiagnosis`, `hardTruth`, `whatYouShouldKnow`, `closure`, `safetyConcern`) in a conservative way (merging/summing where meaningful).
   - Updates progress (`status: 'analyzing'`) for each chunk with *real* percentages and chunk indices.
6. **Aggregation & second‑stage holistic analysis**:
   - Deduplicates sections across chunks by normalized section ID (e.g. `"support"`, `"gaslighting"`, `"conflict"`).
   - Merges evidence and summaries; averages scores where needed.
   - **Scores are aggregated *weighted by message count*** (not by simple chunk count) to reduce bias from tiny excerpts.
   - Attempts a **second pass** holistic LLM call (enhanced mode only) to synthesize one cohesive `overviewSummary` from all sections, keeping it descriptive and number‑free.
7. **Result construction**:
   - Builds an `AnalysisResult` object consistent with `TWME/specs/master/data-model.md`:
     - `gaslightingRiskScore`, `conflictIntensityScore`, `supportivenessScore` (0–1).
     - `apologyFrequencyScore` kept for backward compatibility, but
       **derived from `communicationStats.resolutionRate`** so it effectively represents conflict resolution in 0–1 form.
     - `sections`, `participantProfiles`, `importantDates`, and extended analysis parts.
8. **Finalization**:
   - Records `recordAnalysisComplete(conversationId, chunks.length, cacheHit=false)`.
   - Sets progress status to `completed` (100%).  
   - Returns `AnalysisResult` to the background job, which then stores it.

Errors at any stage are logged via `telemetry.ts` and turned into **user‑friendly messages** in progress/result stores without leaking raw content.

---

## 7. Progress & Result Storage

**Key files:**

- `lib/kv.ts` (Redis KV)
- `app/api/analyze/progress/route.ts`
- `app/api/analyze/progress/stream/route.ts`
- `app/api/analyze/start/route.ts` (job/result updates)

**Mechanics:**

- **ProgressStore** (per `conversationId`):
  - Fields: `status`, `progress`, `currentChunk`, `totalChunks`, optional `message`, optional `result`, optional `blobUrl` (for large result offload).
  - Updated by `analysisService` via `lib/progress` helper (direct function calls, no HTTP).
- **JobStore** (per `jobId`):
  - Fields: `status`, `createdAt`, `startedAt`, `finishedAt`, `progress`, `error`, `result`.
  - Updated only in `/api/analyze/start` background task.

Both are backed by **Redis** with TTL and metrics. Result writes are done with **parallel `Promise.allSettled`** to reduce race risk while keeping logs to detect partial failures.

Frontend paths:

- Polling: `GET /api/analyze/progress?conversationId=...`
- Streaming (optional): `GET /api/analyze/progress/stream?conversationId=...`

---

## 8. Frontend: Polling, Navigation, and Report Rendering

**Key files:**

- `app/page.tsx` (progress + navigation)
- `app/analysis/page.tsx`
- `components/analysis/AnalysisDashboard.tsx`
- `components/report/PatternTimeline.tsx`
- `components/report/EvidenceList.tsx`
- `components/report/MediaEvidence.tsx`
- `features/analysis/timelines.ts`
- `features/report/mapAnalysisToViewModel.ts`

**Flow:**

1. While background analysis runs, the upload page:
   - Shows a **simulated smooth progress bar**.
   - Periodically merges real server progress into the UI every ~2s.
2. Once progress reports `completed` + `result` is available:
   - The page writes to `sessionStorage`:
     - `currentAnalysis` (`AnalysisResult`).
     - `currentConversation`, `currentActivityByDay`, `currentParticipants`.
     - Subscription tier + feature flags.
   - Navigates to `/analysis` (prefetch is run earlier for instant load).
3. The **Analysis page**:
   - On mount, reads the values from `sessionStorage` (with conversationId mismatch checks).
   - Computes **Emotional Safety Index** from the scores + `communicationStats.resolutionRate` and displays it in the Relationship Health Overview card.
   - Renders:
     - 4 headline metrics: Gaslighting risk, Conflict intensity, Supportiveness, Conflict resolution rate.
     - Inline radar chart (`AnalysisRadarChart`).
     - Pattern sections with accordions, plain‑language summaries, and **color‑coded participant names**.
     - Evidence list with IDs allowing deep linking from calendar/timeline.
     - Timelines and wave/heatmap views (`PatternTimeline`, `AnalysisDashboard`).
     - Important dates calendar that jumps to relevant evidence blocks.
   - Exports:
     - **TXT** summary (`exportTXT` – human‑readable, with all 4 metrics including resolution rate).
     - **JSON** (`exportJSON` – stable machine‑readable payload with scores + section structure).
     - **PDF** (rendered via DOM snapshot + `jsPDF`, with HTML escaping guardrails for user text).

---

## 9. Privacy, Ephemerality, and Caching

**Key guarantees from specs (`TWME/specs/master/spec.md`):**

- **No accounts / login**; every analysis is bound to an anonymous browser session.
- **Ephemeral processing**:
  - Raw chats and analysis results are kept **only as long as needed** to complete analysis and allow the user to download/export.
  - Redis + Blob stores are treated as transient; TTLs and cleanup are configured in `lib/kv.ts` and `lib/blob.ts`.
- **Minimization**:
  - External LLM calls go through OpenRouter with prompts that **avoid raw identifiers where feasible**.
  - PDF/exports are rendered on the client, so raw content does not leave the browser beyond LLM/Vision calls.
- **Caching**:
  - `computeChatHash(messages)` creates a **content hash**.
  - `setCachedAnalysis` stores analysis for 7 days (`lib/cache.ts`):
    - Helps users re‑run the same chat instantly.
    - Cache keys are **versioned by prompt and pipeline version**, so changes invalidate old results safely.

This completes the specification of the **import → analysis → result** pipeline as implemented in the current codebase. Any future changes to these stages should update this document and the TWME specs to stay in sync.



