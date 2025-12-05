/**
 * Vercel Blob Storage for large analysis results
 * 
 * Uses Vercel Blob to store large analysis results (>1MB) to avoid Redis memory limits.
 * Small results are still stored in Redis for fast access.
 */

import { put, list, del } from '@vercel/blob';
import { logInfo, logWarn, logError } from './telemetry';

const BLOB_STORAGE_THRESHOLD = 1024 * 1024; // 1MB - use blob for results larger than this
const BLOB_TOTAL_BUDGET_BYTES = 1000 * 1024 * 1024; // ~1000MB safety cap

/**
 * Keep blob usage under a budget by deleting oldest matching blobs first.
 * Safe best-effort; failures do not throw.
 */
async function enforceBlobBudget(prefixes: string[] = ['analysis-', 'media-'], budgetBytes = BLOB_TOTAL_BUDGET_BYTES) {
  try {
    const { blobs } = await list();
    const candidates = blobs.filter((b: any) =>
      prefixes.some((p) => b.pathname?.startsWith(p) || b.url?.includes(`/${p}`))
    );

    const totalBytes = candidates.reduce((sum, b: any) => sum + (b.size ?? 0), 0);
    if (totalBytes <= budgetBytes) return;

    // Oldest first
    const sorted = candidates.sort(
      (a: any, b: any) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
    );

    let current = totalBytes;
    const toDelete: any[] = [];
    for (const blob of sorted) {
      if (current <= budgetBytes) break;
      current -= blob.size ?? 0;
      toDelete.push(blob);
    }

    for (const blob of toDelete) {
      try {
        await del(blob.url || blob.pathname);
        logInfo('blob_budget_deleted', {
          url: blob.url,
          pathname: blob.pathname,
          sizeBytes: blob.size,
          uploadedAt: blob.uploadedAt,
          budgetBytes,
        });
      } catch (deleteError) {
        logWarn('blob_budget_delete_failed', {
          url: blob.url,
          pathname: blob.pathname,
          error: (deleteError as Error).message,
        });
      }
    }
  } catch (budgetError) {
    logWarn('blob_budget_enforce_failed', { error: (budgetError as Error).message });
  }
}

/**
 * Store large result in Vercel Blob
 */
export async function storeResultInBlob(
  conversationId: string,
  result: {
    conversation: any;
    analysis: any;
    activityByDay: Array<{ date: string; messageCount: number }>;
  }
): Promise<string | null> {
  try {
    const serialized = JSON.stringify(result);
    const sizeBytes = Buffer.byteLength(serialized, 'utf8');

    // Only use blob for large results
    if (sizeBytes < BLOB_STORAGE_THRESHOLD) {
      return null; // Use Redis instead
    }

    const blob = await put(`analysis-${conversationId}-${Date.now()}.json`, serialized, {
      access: 'public',
      addRandomSuffix: false,
    });

    logInfo('blob_result_stored', {
      conversationId,
      url: blob.url,
      sizeBytes,
    });

    // Best-effort cleanup to stay under budget
    enforceBlobBudget();

    return blob.url;
  } catch (error) {
    logError('blob_store_error', {
      conversationId,
      error: (error as Error).message,
    });
    return null;
  }
}

/**
 * Retrieve result from Vercel Blob
 */
export async function getResultFromBlob(blobUrl: string): Promise<any | null> {
  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      logWarn('blob_get_error', {
        url: blobUrl,
        status: response.status,
      });
      return null;
    }

    const data = await response.json();
    logInfo('blob_result_retrieved', {
      url: blobUrl,
      sizeBytes: JSON.stringify(data).length,
    });

    return data;
  } catch (error) {
    logWarn('blob_get_error', {
      url: blobUrl,
      error: (error as Error).message,
    });
    return null;
  }
}

/**
 * Delete result from Vercel Blob (cleanup)
 * Note: Vercel Blob automatically cleans up based on TTL, manual deletion not needed
 */
export async function deleteResultFromBlob(blobUrl: string): Promise<void> {
  // Vercel Blob handles cleanup automatically via TTL
  // Manual deletion not required for ephemeral storage
  logInfo('blob_result_marked_for_cleanup', { url: blobUrl });
}

/**
 * Check if blob URL is valid
 */
export async function checkBlobExists(blobUrl: string): Promise<boolean> {
  try {
    const response = await fetch(blobUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Store media file in Vercel Blob
 */
export async function storeMediaInBlob(
  mediaId: string,
  blob: Blob,
  contentType?: string | null
): Promise<string | null> {
  try {
    const blobResult = await put(`media-${mediaId}-${Date.now()}`, blob, {
      access: 'public',
      addRandomSuffix: false,
      contentType: contentType || blob.type || 'application/octet-stream',
    });

    logInfo('blob_media_stored', {
      mediaId,
      url: blobResult.url,
      sizeBytes: blob.size,
      contentType: contentType || blob.type,
    });

    // Best-effort cleanup to stay under budget
    enforceBlobBudget();

    return blobResult.url;
  } catch (error) {
    logError('blob_media_store_error', {
      mediaId,
      error: (error as Error).message,
    });
    return null;
  }
}

/**
 * Get media from Vercel Blob as Blob
 */
export async function getMediaFromBlob(blobUrl: string): Promise<Blob | null> {
  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      logWarn('blob_media_get_error', {
        url: blobUrl,
        status: response.status,
      });
      return null;
    }

    const blob = await response.blob();
    logInfo('blob_media_retrieved', {
      url: blobUrl,
      sizeBytes: blob.size,
    });

    return blob;
  } catch (error) {
    logWarn('blob_media_get_error', {
      url: blobUrl,
      error: (error as Error).message,
    });
    return null;
  }
}

