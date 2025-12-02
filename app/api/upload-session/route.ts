import { NextResponse } from 'next/server';

import { getSubscriptionFeatures, getSubscriptionTier } from '../../../features/subscription/types';
import { generateUploadToken } from '../../../features/import/uploadToken';
import { getConfig } from '../../../lib/config';
import { logError, logInfo } from '../../../lib/telemetry';

export const runtime = 'nodejs';
export const maxDuration = 30;

type UploadSessionRequest = {
  approxSizeBytes?: number;
  platform?: 'telegram' | 'whatsapp';
  contentType?: string;
};

export async function POST(request: Request) {
  try {
    const config = getConfig();

    let body: UploadSessionRequest;
    try {
      body = await request.json();
    } catch (error) {
      logError('upload_session_parse_error', {
        error: (error as Error).message
      });
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const approxSizeBytes = body.approxSizeBytes ?? 0;

    // Determine subscription tier and feature limits
    const subscriptionTier = await getSubscriptionTier(request);
    const features = getSubscriptionFeatures(subscriptionTier);

    // Derive a conservative max upload size based on tier and existing config.
    const maxUploadSizeMb = config.maxUploadSizeMb;
    const hardLimitBytes = maxUploadSizeMb * 1024 * 1024;

    // For free tier, additionally cap at a smaller value if desired.
    const tierLimitBytes =
      subscriptionTier === 'premium'
        ? hardLimitBytes
        : Math.min(hardLimitBytes, 25 * 1024 * 1024); // e.g., 25MB for free tier

    if (approxSizeBytes > 0 && approxSizeBytes > tierLimitBytes) {
      logError('upload_session_size_exceeded', {
        approxSizeBytes,
        tierLimitBytes,
        subscriptionTier
      });
      return NextResponse.json(
        {
          error:
            'File appears to be too large for the current plan. For now, please use a smaller export (shorter date range or fewer chats).',
          code: 'file_too_large_for_plan',
          approxSizeBytes,
          maxBytesForTier: tierLimitBytes,
          subscriptionTier
        },
        { status: 413 }
      );
    }

    const uploadId = `upl_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const uploadToken = generateUploadToken(uploadId);

    logInfo('upload_session_created', {
      uploadId,
      subscriptionTier,
      approxSizeBytes,
      tierLimitBytes
    });

    // NOTE: In a future iteration, this endpoint should be extended to return
    // a real pre-signed URL for an object storage provider (e.g., S3/R2).
    // For now, this is just a skeleton to align with FR-013 and to be used
    // by future clients once storage is configured.

    return NextResponse.json({
      uploadId,
      uploadToken,
      subscriptionTier,
      limits: {
        maxBytesForTier: tierLimitBytes,
        maxBytesHard: hardLimitBytes
      },
      storage: {
        // Placeholder describing the intended storage backend; clients should
        // not attempt to use this value directly until implemented.
        type: 'object_store',
        uploadUrl: null as string | null,
        provider: null as string | null
      }
    });
  } catch (error) {
    logError('upload_session_unexpected_error', {
      error: (error as Error).message
    });
    return NextResponse.json(
      { error: 'Upload session creation failed' },
      { status: 500 }
    );
  }
}







