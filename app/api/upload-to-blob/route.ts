/**
 * Handle client-side upload to Vercel Blob
 * 
 * This endpoint uses handleUpload from @vercel/blob/client to allow direct
 * uploads from the browser to Blob Storage, bypassing Vercel's 4.5MB
 * serverless function body size limit.
 * 
 * The file is uploaded directly from the client to Blob Storage, not through
 * this serverless function, so there's no size limit.
 */

import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { logError, logInfo } from '../../../lib/telemetry';
import { checkUploadReadiness } from '../../../lib/db-health';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // Check database connections before processing
    const readiness = await checkUploadReadiness();
    
    if (!readiness.ready) {
      logError('upload_to_blob_db_not_ready', {
        errors: readiness.errors,
        status: readiness.status,
      });

      return NextResponse.json(
        {
          error: 'Storage service is not available',
          details: readiness.errors,
          status: readiness.status.overall,
        },
        { status: 503 } // Service Unavailable
      );
    }

    const body = (await request.json()) as HandleUploadBody;

    // Extract metadata from body (may be in different formats)
    const pathname = 'pathname' in body ? body.pathname : `import-${Date.now()}.txt`;
    const size = 'size' in body ? body.size : undefined;
    const contentType = 'contentType' in body ? body.contentType : 'application/octet-stream';

    logInfo('upload_to_blob_handle_upload_started', {
      pathname,
      size,
      contentType,
      dbStatus: readiness.status.overall,
    });

    // Verify BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      logError('blob_token_missing', {});
      return NextResponse.json(
        {
          error: 'Blob storage is not configured. Please contact support.',
        },
        { status: 503 }
      );
    }

    // Handle the upload - this generates a token for client-side upload
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string, clientPayload: string | null, multipart: boolean) => {
        // Validate file type and size before allowing upload
        const config = await import('../../../lib/config').then(m => m.getConfig());
        const maxSizeBytes = config.maxUploadSizeMb * 1024 * 1024;

        if (typeof size === 'number' && size > maxSizeBytes) {
          throw new Error(`File too large. Maximum size is ${config.maxUploadSizeMb}MB`);
        }

        // Allow all file types for import (validation happens during import)
        return {
          allowedContentTypes: [
            // text / exports
            'application/json',
            'text/plain',
            'application/zip',
            'application/x-zip-compressed',
            'application/octet-stream',
            // images
            'image/png',
            'image/jpeg',
            'image/webp',
            'image/gif',
            // audio / voice
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'audio/opus',
            'audio/webm',
            'audio/mp4',
            'audio/m4a',
            // some browsers label mic blobs as video/webm even for audio-only
            'video/webm',
          ],
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({
            fileName: pathname,
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Log successful upload
        const payload = tokenPayload ? JSON.parse(tokenPayload) : {};
        logInfo('upload_to_blob_completed', {
          blobUrl: blob.url,
          pathname: blob.pathname,
          fileName: payload.fileName,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    const errorStack = (error as Error).stack?.substring(0, 500);

    logError('upload_to_blob_error', {
      error: errorMessage,
      stack: errorStack,
    });

    // Provide more detailed error information
    let statusCode = 500;
    let userMessage = 'Failed to upload file to storage';

    if (errorMessage.includes('BLOB_READ_WRITE_TOKEN') || errorMessage.includes('token')) {
      statusCode = 503;
      userMessage = 'Storage service configuration error. Please contact support.';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      statusCode = 503;
      userMessage = 'Network error connecting to storage. Please check your connection and try again.';
    } else if (errorMessage.includes('size') || errorMessage.includes('too large')) {
      statusCode = 413;
      userMessage = errorMessage; // Use the specific error message
    }

    return NextResponse.json(
      {
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: statusCode }
    );
  }
}

