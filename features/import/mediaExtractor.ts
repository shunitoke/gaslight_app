import JSZip from 'jszip';

import { logError, logInfo } from '../../lib/telemetry';
import { storeMediaInBlob } from '../../lib/blob';
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
  mediaFiles: Map<string, Blob>; // Deprecated: media is now in Blob, kept for backward compatibility
}> {
  try {
    const zip = await JSZip.loadAsync(zipBuffer);
    const mediaArtifacts: MediaArtifact[] = [];
    const mediaFiles = new Map<string, Blob>();
    let chatText = '';

    // Extract chat text file
    const chatFileCandidates = Object.keys(zip.files).filter((name) => {
      const lower = name.toLowerCase();
      // Ignore directories and Media/ attachments
      return !zip.files[name].dir && lower.endsWith('.txt') && !lower.startsWith('media/');
    });

    const preferredChatName =
      chatFileCandidates.find((name) => {
        const lower = name.toLowerCase();
        return lower === '_chat.txt' || lower === 'chat.txt';
      }) ||
      // Prefer root-level txt if the canonical names are missing (Android exports often name it "WhatsApp Chat with ... .txt")
      chatFileCandidates.find((name) => !name.includes('/')) ||
      chatFileCandidates[0];

    if (preferredChatName) {
      const chatFile = zip.files[preferredChatName];
      if (chatFile) {
        chatText = await chatFile.async('string');
      }
    } else {
      logError('whatsapp_chat_file_missing', { conversationId });
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

        // Upload media to Vercel Blob to avoid RAM issues
        const blobUrl = await storeMediaInBlob(mediaId, blob, contentType);

        const artifact: MediaArtifact = {
          id: mediaId,
          conversationId,
          type: mediaType,
          originalFilename: filename,
          contentType,
          sizeBytes: blob.size,
          blobUrl: blobUrl || undefined, // Store Blob URL instead of keeping in RAM
          transientPathOrUrl: undefined, // Deprecated: use blobUrl instead
          labels: [],
          sentimentHint: 'unknown'
        };

        mediaArtifacts.push(artifact);
        // Don't store in mediaFiles Map - media is now in Blob
        // mediaFiles.set(mediaId, blob); // Removed to save RAM

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
