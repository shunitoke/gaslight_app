import JSZip from 'jszip';

import { logError, logInfo } from '../../lib/telemetry';
import type { MediaArtifact } from '../analysis/types';

/**
 * Extract media files from a WhatsApp ZIP export.
 * WhatsApp exports typically contain:
 * - _chat.txt (the chat log)
 * - Media/ folder with images, videos, audio files
 */
export async function extractMediaFromWhatsAppZip(
  zipBuffer: ArrayBuffer,
  conversationId: string
): Promise<{
  chatText: string;
  mediaArtifacts: MediaArtifact[];
  mediaFiles: Map<string, Blob>; // Map of media artifact ID to file blob
}> {
  try {
    const zip = await JSZip.loadAsync(zipBuffer);
    const mediaArtifacts: MediaArtifact[] = [];
    const mediaFiles = new Map<string, Blob>();
    let chatText = '';

    // Extract chat text file
    const chatFileNames = Object.keys(zip.files).filter(
      (name) => name.toLowerCase() === '_chat.txt' || name.toLowerCase() === 'chat.txt'
    );
    if (chatFileNames.length > 0) {
      const chatFile = zip.files[chatFileNames[0]];
      if (chatFile) {
        chatText = await chatFile.async('string');
      }
    }

    // Extract media files from Media/ folder
    const mediaFolderNames = Object.keys(zip.files).filter(
      (name) => name.toLowerCase().startsWith('media/') && !zip.files[name].dir
    );

    for (const relativePath of mediaFolderNames) {
      const file = zip.files[relativePath];
      if (!file || file.dir) continue;

      const filename = relativePath.split('/').pop() || relativePath;

      try {
        const blob = await file.async('blob');
        const mediaId = `media_${conversationId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Determine media type from filename/extension
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        let mediaType: MediaArtifact['type'] = 'other';
        let contentType: string | null = null;

        if (['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(ext)) {
          mediaType = 'image';
          contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        } else if (ext === 'gif') {
          mediaType = 'gif';
          contentType = 'image/gif';
        } else if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) {
          mediaType = 'video';
          contentType = `video/${ext}`;
        } else if (['mp3', 'wav', 'ogg', 'm4a', 'opus'].includes(ext)) {
          mediaType = 'audio';
          contentType = `audio/${ext}`;
        }

        const artifact: MediaArtifact = {
          id: mediaId,
          conversationId,
          type: mediaType,
          originalFilename: filename,
          contentType,
          sizeBytes: blob.size,
          transientPathOrUrl: undefined, // Will be set to data URL if needed
          labels: [],
          sentimentHint: 'unknown'
        };

        mediaArtifacts.push(artifact);
        mediaFiles.set(mediaId, blob);

        logInfo('media_extracted', {
          conversationId,
          mediaId,
          filename,
          type: mediaType,
          size: blob.size
        });
      } catch (fileError) {
        logError('media_extraction_error', {
          conversationId,
          filename,
          error: (fileError as Error).message
        });
      }
    }

    return { chatText, mediaArtifacts, mediaFiles };
  } catch (error) {
    logError('zip_extraction_error', {
      conversationId,
      error: (error as Error).message
    });
    throw new Error(`Failed to extract ZIP: ${(error as Error).message}`);
  }
}

/**
 * Convert a blob to a data URL for vision API.
 */
export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
