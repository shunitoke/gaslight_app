import { extractMediaFromWhatsAppZip } from './mediaExtractor';
import type { NormalizedConversation, ImportPayload } from './types';
import { logError, logInfo } from '../../lib/telemetry';
import type {
  Conversation,
  Message,
  Participant,
  MediaArtifact
} from '../analysis/types';

/**
 * Parse Telegram JSON export format.
 * Expected format: { "messages": [{ "id": 1, "date": "...", "from": "...", "text": "..." }] }
 */
export async function parseTelegramExport(
  fileContent: string,
  fileName: string
): Promise<NormalizedConversation> {
  try {
    const data = JSON.parse(fileContent);
    const messages = data.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid Telegram export: no messages array found');
    }

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const participantsMap = new Map<string, Participant>();
    const normalizedMessages: Message[] = [];
    const mediaArtifacts: MediaArtifact[] = [];
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    for (const msg of messages) {
      const senderName = msg.from || msg.from_id || 'Unknown';
      const senderId = `participant_${senderName.replace(/\s+/g, '_').toLowerCase()}`;

      if (!participantsMap.has(senderId)) {
        participantsMap.set(senderId, {
          id: senderId,
          displayName: senderName,
          role: senderName.toLowerCase().includes('you') || senderName.toLowerCase().includes('me')
            ? 'user'
            : 'other'
        });
      }

      // Parse date - Telegram exports can have date, date_unixtime, or both
      let sentAt: Date;
      if (msg.date_unixtime) {
        // date_unixtime is in seconds, convert to milliseconds
        sentAt = new Date(parseInt(msg.date_unixtime, 10) * 1000);
      } else if (msg.date) {
        sentAt = new Date(msg.date);
      } else {
        sentAt = new Date();
      }
      
      // Validate date
      if (isNaN(sentAt.getTime())) {
        sentAt = new Date(); // Fallback to current date if invalid
      }
      
      if (!earliestDate || sentAt < earliestDate) earliestDate = sentAt;
      if (!latestDate || sentAt > latestDate) latestDate = sentAt;

      const messageId = `msg_${msg.id || Date.now()}_${Math.random().toString(36).substring(7)}`;

      normalizedMessages.push({
        id: messageId,
        conversationId,
        senderId,
        sentAt: sentAt.toISOString(),
        text: msg.text || msg.message || null,
        mediaArtifactId: msg.photo || msg.video || msg.audio ? `media_${messageId}` : null,
        replyToMessageId: msg.reply_to ? `msg_${msg.reply_to.message_id}` : null,
        isSystem: msg.type === 'service' || false
      });

      // Handle media if present (check media_type field for stickers)
      if (msg.photo || msg.video || msg.audio || msg.sticker || msg.document || msg.media_type) {
        const mediaId = `media_${messageId}`;
        let mediaType: 'image' | 'sticker' | 'gif' | 'audio' | 'video' | 'other' = 'other';
        
        if (msg.media_type === 'sticker' || msg.sticker) {
          mediaType = 'sticker';
        } else if (msg.photo) {
          mediaType = 'image';
        } else if (msg.video) {
          mediaType = 'video';
        } else if (msg.audio || msg.voice) {
          mediaType = 'audio';
        } else if (msg.document) {
          const mimeType = msg.mime_type || msg.document?.mime_type || '';
          if (mimeType.includes('gif')) mediaType = 'gif';
          else if (mimeType.includes('image')) mediaType = 'image';
          else if (mimeType.includes('video')) mediaType = 'video';
          else if (mimeType.includes('audio')) mediaType = 'audio';
        }
        
        // Update message to link to media
        const lastMessage = normalizedMessages[normalizedMessages.length - 1];
        if (lastMessage) {
          lastMessage.mediaArtifactId = mediaId;
        }
        
        mediaArtifacts.push({
          id: mediaId,
          conversationId,
          type: mediaType,
          originalFilename: msg.file_name || msg.file || msg.document?.file_name || null,
          contentType: msg.mime_type || msg.document?.mime_type || null,
          transientPathOrUrl: msg.file || msg.document?.file_path || null
        });
      }
    }

    const participants = Array.from(participantsMap.values());
    const conversation: Conversation = {
      id: conversationId,
      sourcePlatform: 'telegram',
      title: data.name || null,
      startedAt: earliestDate?.toISOString() || null,
      endedAt: latestDate?.toISOString() || null,
      participantIds: participants.map((p) => p.id),
      languageCodes: detectLanguages(normalizedMessages),
      messageCount: normalizedMessages.length,
      status: 'imported'
    };

    logInfo('telegram_import_success', {
      conversationId,
      messageCount: normalizedMessages.length,
      participantCount: participants.length
    });

    return {
      conversation,
      participants,
      messages: normalizedMessages,
      media: mediaArtifacts,
      mediaFiles: new Map()
    };
  } catch (error) {
    logError('telegram_parse_error', { fileName, error: (error as Error).message });
    throw new Error(`Failed to parse Telegram export: ${(error as Error).message}`);
  }
}

/**
 * Parse WhatsApp export format.
 * Expected format: Plain text with timestamps like "12/31/23, 3:45 PM - Sender: Message"
 * Or ZIP with _chat.txt and media files.
 */
export async function parseWhatsAppExport(
  fileContent: string | ArrayBuffer,
  fileName: string,
  isZip: boolean = false
): Promise<NormalizedConversation> {
  try {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    let textContent: string;
    let mediaArtifacts: MediaArtifact[] = [];
    // Note: mediaFiles Map is available but not used yet - will be used for vision API analysis
    // In production, you'd convert blobs to data URLs here or store temporarily
    const mediaFiles: Map<string, Blob> = new Map();

    // Handle ZIP files
    if (isZip && fileContent instanceof ArrayBuffer) {
      const extracted = await extractMediaFromWhatsAppZip(fileContent, conversationId);
      textContent = extracted.chatText;
      mediaArtifacts = extracted.mediaArtifacts;
      // Note: extracted.mediaFiles Map is available but not used yet - will be used for vision API analysis
      // In production, you'd convert blobs to data URLs here or store temporarily
      void extracted.mediaFiles; // Suppress unused warning
    } else {
      // Plain text file
      if (fileContent instanceof ArrayBuffer) {
        const decoder = new TextDecoder('utf-8');
        textContent = decoder.decode(fileContent);
      } else {
        textContent = fileContent;
      }
    }

    // WhatsApp formats (examples):
    // - "DD/MM/YY, HH:MM AM/PM - Sender: Message" (EN-style, 12-hour with AM/PM)
    // - "DD.MM.YYYY, HH:MM - Sender: Message" (RU/other locales, 24-hour, no AM/PM)
    // Also handles media indicators like "<attached: IMG-20231231-WA0000.jpg>"
    const messageRegex =
      /(\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4}),\s*(\d{1,2}:\d{2})(?:\s*(AM|PM))?\s*-\s*([^:]+):\s*(.+)/g;
    const mediaRegex = /<attached:\s*([^>]+)>/gi;

    const participantsMap = new Map<string, Participant>();
    const normalizedMessages: Message[] = [];
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;
    let match;

    while ((match = messageRegex.exec(textContent)) !== null) {
      const [, dateStr, timeStr, ampm, senderName, text] = match;
      const senderId = `participant_${senderName.trim().replace(/\s+/g, '_').toLowerCase()}`;

      if (!participantsMap.has(senderId)) {
        participantsMap.set(senderId, {
          id: senderId,
          displayName: senderName.trim(),
          role: senderName.toLowerCase().includes('you') || senderName.toLowerCase().includes('me')
            ? 'user'
            : 'other'
        });
      }

      // Parse date (supports "DD/MM/YY" or "DD.MM.YYYY")
      const [day, month, year] = dateStr.split(/[/.]/).map(Number);
      const fullYear = year < 100 ? 2000 + year : year;
      const [hourRaw, minute] = timeStr.split(':').map(Number);

      // If AM/PM is present, treat as 12-hour; otherwise 24-hour.
      let hour24 = hourRaw;
      if (ampm) {
        const isPM = /PM/i.test(ampm);
        hour24 = isPM && hourRaw !== 12 ? hourRaw + 12 : !isPM && hourRaw === 12 ? 0 : hourRaw;
      }

      const sentAt = new Date(fullYear, month - 1, day, hour24, minute);
      if (!earliestDate || sentAt < earliestDate) earliestDate = sentAt;
      if (!latestDate || sentAt > latestDate) latestDate = sentAt;

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Check if message contains media attachment reference
      let mediaArtifactId: string | null = null;
      const mediaMatch = text.match(mediaRegex);
      if (mediaMatch && mediaArtifacts.length > 0) {
        // Try to match media filename to extracted artifacts
        const filename = mediaMatch[0].replace(/<attached:\s*|>/gi, '').trim();
        const matchedMedia = mediaArtifacts.find(m => 
          m.originalFilename?.toLowerCase().includes(filename.toLowerCase()) ||
          filename.toLowerCase().includes(m.originalFilename?.toLowerCase() || '')
        );
        if (matchedMedia) {
          mediaArtifactId = matchedMedia.id;
        }
      }

      normalizedMessages.push({
        id: messageId,
        conversationId,
        senderId,
        sentAt: sentAt.toISOString(),
        text: text.trim() || null,
        mediaArtifactId,
        isSystem: false
      });
    }

    if (normalizedMessages.length === 0) {
      throw new Error('No messages found in WhatsApp export');
    }

    const participants = Array.from(participantsMap.values());
    const conversation: Conversation = {
      id: conversationId,
      sourcePlatform: 'whatsapp',
      title: null,
      startedAt: earliestDate?.toISOString() || null,
      endedAt: latestDate?.toISOString() || null,
      participantIds: participants.map((p) => p.id),
      languageCodes: detectLanguages(normalizedMessages),
      messageCount: normalizedMessages.length,
      status: 'imported'
    };

    logInfo('whatsapp_import_success', {
      conversationId,
      messageCount: normalizedMessages.length,
      participantCount: participants.length
    });

    return {
      conversation,
      participants,
      messages: normalizedMessages,
      media: mediaArtifacts,
      mediaFiles: mediaFiles
    };
  } catch (error) {
    logError('whatsapp_parse_error', { fileName, error: (error as Error).message });
    throw new Error(`Failed to parse WhatsApp export: ${(error as Error).message}`);
  }
}

/**
 * Parse Signal JSON export format.
 * Expected format: { "messages": [{ "sent_at": timestamp, "text": "...", "source": "..." }] }
 */
export async function parseSignalExport(
  fileContent: string,
  fileName: string
): Promise<NormalizedConversation> {
  try {
    const data = JSON.parse(fileContent);
    const messages = data.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid Signal export: no messages array found');
    }

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const participantsMap = new Map<string, Participant>();
    const normalizedMessages: Message[] = [];
    const mediaArtifacts: MediaArtifact[] = [];
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    for (const msg of messages) {
      const senderName = msg.source || msg.source_name || msg.contact_name || 'Unknown';
      const senderId = `participant_${senderName.replace(/\s+/g, '_').toLowerCase()}`;

      if (!participantsMap.has(senderId)) {
        participantsMap.set(senderId, {
          id: senderId,
          displayName: senderName,
          role: msg.type === 'outgoing' || msg.sent_at ? 'user' : 'other'
        });
      }

      // Signal uses milliseconds timestamp
      let sentAt = msg.sent_at 
        ? new Date(msg.sent_at)
        : msg.timestamp 
        ? new Date(msg.timestamp)
        : new Date();

      if (isNaN(sentAt.getTime())) {
        sentAt = new Date();
      }

      if (!earliestDate || sentAt < earliestDate) earliestDate = sentAt;
      if (!latestDate || sentAt > latestDate) latestDate = sentAt;

      const messageId = `msg_${msg.id || Date.now()}_${Math.random().toString(36).substring(7)}`;

      normalizedMessages.push({
        id: messageId,
        conversationId,
        senderId,
        sentAt: sentAt.toISOString(),
        text: msg.body || msg.text || null,
        mediaArtifactId: msg.attachments && msg.attachments.length > 0 ? `media_${messageId}` : null,
        isSystem: msg.type === 'system' || false
      });

      // Handle attachments
      if (msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0) {
        const mediaId = `media_${messageId}`;
        const attachment = msg.attachments[0];
        let mediaType: 'image' | 'sticker' | 'gif' | 'audio' | 'video' | 'other' = 'other';
        
        const contentType = attachment.contentType || attachment.type || '';
        if (contentType.includes('image')) {
          mediaType = contentType.includes('gif') ? 'gif' : 'image';
        } else if (contentType.includes('video')) {
          mediaType = 'video';
        } else if (contentType.includes('audio')) {
          mediaType = 'audio';
        }

        mediaArtifacts.push({
          id: mediaId,
          conversationId,
          type: mediaType,
          originalFilename: attachment.fileName || null,
          contentType: contentType || null,
          transientPathOrUrl: attachment.path || null
        });
      }
    }

    const participants = Array.from(participantsMap.values());
    const conversation: Conversation = {
      id: conversationId,
      sourcePlatform: 'signal',
      title: data.title || data.name || null,
      startedAt: earliestDate?.toISOString() || null,
      endedAt: latestDate?.toISOString() || null,
      participantIds: participants.map((p) => p.id),
      languageCodes: detectLanguages(normalizedMessages),
      messageCount: normalizedMessages.length,
      status: 'imported'
    };

    logInfo('signal_import_success', {
      fileName,
      messageCount: normalizedMessages.length,
      participantCount: participants.length
    });

    return {
      conversation,
      participants,
      messages: normalizedMessages,
      media: mediaArtifacts,
      mediaFiles: new Map()
    };
  } catch (error) {
    logError('signal_parse_error', { fileName, error: (error as Error).message });
    throw new Error(`Failed to parse Signal export: ${(error as Error).message}`);
  }
}

/**
 * Parse Discord JSON export format.
 * Expected format: { "messages": [{ "timestamp": "...", "author": {...}, "content": "..." }] }
 */
export async function parseDiscordExport(
  fileContent: string,
  fileName: string
): Promise<NormalizedConversation> {
  try {
    const data = JSON.parse(fileContent);
    const messages = data.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid Discord export: no messages array found');
    }

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const participantsMap = new Map<string, Participant>();
    const normalizedMessages: Message[] = [];
    const mediaArtifacts: MediaArtifact[] = [];
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    for (const msg of messages) {
      const author = msg.author || {};
      const senderName = author.name || author.username || author.displayName || 'Unknown';
      const senderId = `participant_${(author.id || senderName).toString().replace(/\s+/g, '_').toLowerCase()}`;

      if (!participantsMap.has(senderId)) {
        participantsMap.set(senderId, {
          id: senderId,
          displayName: senderName,
          role: author.bot ? 'groupMember' : 'other'
        });
      }

      // Discord uses ISO timestamp or Unix timestamp
      let sentAt: Date;
      if (msg.timestamp) {
        sentAt = new Date(msg.timestamp);
      } else if (msg.timestamp_ms) {
        sentAt = new Date(msg.timestamp_ms);
      } else {
        sentAt = new Date();
      }

      if (isNaN(sentAt.getTime())) {
        sentAt = new Date();
      }

      if (!earliestDate || sentAt < earliestDate) earliestDate = sentAt;
      if (!latestDate || sentAt > latestDate) latestDate = sentAt;

      const messageId = `msg_${msg.id || Date.now()}_${Math.random().toString(36).substring(7)}`;

      normalizedMessages.push({
        id: messageId,
        conversationId,
        senderId,
        sentAt: sentAt.toISOString(),
        text: msg.content || msg.body || null,
        mediaArtifactId: msg.attachments && msg.attachments.length > 0 ? `media_${messageId}` : null,
        isSystem: msg.type !== 0 || false
      });

      // Handle attachments
      if (msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0) {
        const mediaId = `media_${messageId}`;
        const attachment = msg.attachments[0];
        let mediaType: 'image' | 'sticker' | 'gif' | 'audio' | 'video' | 'other' = 'other';
        
        const url = attachment.url || attachment.proxy_url || '';
        const contentType = attachment.content_type || '';
        if (contentType.includes('image') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          mediaType = contentType.includes('gif') || url.match(/\.gif$/i) ? 'gif' : 'image';
        } else if (contentType.includes('video') || url.match(/\.(mp4|webm|mov)$/i)) {
          mediaType = 'video';
        } else if (contentType.includes('audio') || url.match(/\.(mp3|wav|ogg)$/i)) {
          mediaType = 'audio';
        }

        mediaArtifacts.push({
          id: mediaId,
          conversationId,
          type: mediaType,
          originalFilename: attachment.filename || null,
          contentType: contentType || null,
          transientPathOrUrl: url || null
        });
      }
    }

    const participants = Array.from(participantsMap.values());
    const conversation: Conversation = {
      id: conversationId,
      sourcePlatform: 'discord',
      title: data.guild?.name || data.channel?.name || data.title || null,
      startedAt: earliestDate?.toISOString() || null,
      endedAt: latestDate?.toISOString() || null,
      participantIds: participants.map((p) => p.id),
      languageCodes: detectLanguages(normalizedMessages),
      messageCount: normalizedMessages.length,
      status: 'imported'
    };

    logInfo('discord_import_success', {
      fileName,
      messageCount: normalizedMessages.length,
      participantCount: participants.length
    });

    return {
      conversation,
      participants,
      messages: normalizedMessages,
      media: mediaArtifacts,
      mediaFiles: new Map()
    };
  } catch (error) {
    logError('discord_parse_error', { fileName, error: (error as Error).message });
    throw new Error(`Failed to parse Discord export: ${(error as Error).message}`);
  }
}

/**
 * Parse Facebook Messenger JSON export format.
 * Expected format: { "messages": [{ "sender_name": "...", "timestamp_ms": ..., "content": "..." }] }
 */
export async function parseMessengerExport(
  fileContent: string,
  fileName: string
): Promise<NormalizedConversation> {
  try {
    const data = JSON.parse(fileContent);
    const messages = data.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid Messenger export: no messages array found');
    }

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const participantsMap = new Map<string, Participant>();
    const normalizedMessages: Message[] = [];
    const mediaArtifacts: MediaArtifact[] = [];
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    for (const msg of messages) {
      const senderName = msg.sender_name || msg.from?.name || 'Unknown';
      const senderId = `participant_${senderName.replace(/\s+/g, '_').toLowerCase()}`;

      if (!participantsMap.has(senderId)) {
        participantsMap.set(senderId, {
          id: senderId,
          displayName: senderName,
          role: 'other'
        });
      }

      // Messenger uses milliseconds timestamp
      let sentAt = msg.timestamp_ms 
        ? new Date(msg.timestamp_ms)
        : msg.timestamp
        ? new Date(msg.timestamp * 1000)
        : new Date();

      if (isNaN(sentAt.getTime())) {
        sentAt = new Date();
      }

      if (!earliestDate || sentAt < earliestDate) earliestDate = sentAt;
      if (!latestDate || sentAt > latestDate) latestDate = sentAt;

      const messageId = `msg_${msg.timestamp_ms || Date.now()}_${Math.random().toString(36).substring(7)}`;

      normalizedMessages.push({
        id: messageId,
        conversationId,
        senderId,
        sentAt: sentAt.toISOString(),
        text: msg.content || msg.message || null,
        mediaArtifactId: msg.photos || msg.videos || msg.audio_files || msg.files ? `media_${messageId}` : null,
        isSystem: msg.type === 'Generic' && !msg.content || false
      });

      // Handle media
      if (msg.photos || msg.videos || msg.audio_files || msg.files) {
        const mediaId = `media_${messageId}`;
        let mediaType: 'image' | 'sticker' | 'gif' | 'audio' | 'video' | 'other' = 'other';
        
        if (msg.photos) {
          mediaType = 'image';
        } else if (msg.videos) {
          mediaType = 'video';
        } else if (msg.audio_files) {
          mediaType = 'audio';
        } else if (msg.files) {
          const uri = msg.files[0]?.uri || '';
          if (uri.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            mediaType = uri.match(/\.gif$/i) ? 'gif' : 'image';
          } else if (uri.match(/\.(mp4|webm|mov)$/i)) {
            mediaType = 'video';
          } else if (uri.match(/\.(mp3|wav|ogg)$/i)) {
            mediaType = 'audio';
          }
        }

        const mediaUri = msg.photos?.[0]?.uri || msg.videos?.[0]?.uri || msg.audio_files?.[0]?.uri || msg.files?.[0]?.uri || null;

        mediaArtifacts.push({
          id: mediaId,
          conversationId,
          type: mediaType,
          originalFilename: null,
          contentType: null,
          transientPathOrUrl: mediaUri
        });
      }
    }

    const participants = Array.from(participantsMap.values());
    const conversation: Conversation = {
      id: conversationId,
      sourcePlatform: 'messenger',
      title: data.title || data.participants?.join(', ') || null,
      startedAt: earliestDate?.toISOString() || null,
      endedAt: latestDate?.toISOString() || null,
      participantIds: participants.map((p) => p.id),
      languageCodes: detectLanguages(normalizedMessages),
      messageCount: normalizedMessages.length,
      status: 'imported'
    };

    logInfo('messenger_import_success', {
      fileName,
      messageCount: normalizedMessages.length,
      participantCount: participants.length
    });

    return {
      conversation,
      participants,
      messages: normalizedMessages,
      media: mediaArtifacts,
      mediaFiles: new Map()
    };
  } catch (error) {
    logError('messenger_parse_error', { fileName, error: (error as Error).message });
    throw new Error(`Failed to parse Messenger export: ${(error as Error).message}`);
  }
}

/**
 * Parse iMessage/SMS export format (JSON or text).
 * JSON format: { "items": [{ "properties": { "author": [...], "content": [...], "published": [...] } }] }
 * Text format: Similar to WhatsApp
 */
export async function parseIMessageExport(
  fileContent: string,
  fileName: string
): Promise<NormalizedConversation> {
  try {
    // Try JSON first (h-entry format)
    let data: any;
    try {
      data = JSON.parse(fileContent);
    } catch {
      // Fall back to text parsing (similar to WhatsApp)
      return parseWhatsAppExport(fileContent, fileName, false);
    }

    const items = data.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid iMessage export: no items array found');
    }

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const participantsMap = new Map<string, Participant>();
    const normalizedMessages: Message[] = [];
    const mediaArtifacts: MediaArtifact[] = [];
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    for (const item of items) {
      const props = item.properties || {};
      const author = props.author?.[0] || {};
      const authorName = author.properties?.name?.[0] || author.value || 'Unknown';
      const senderId = `participant_${authorName.replace(/\s+/g, '_').toLowerCase()}`;

      if (!participantsMap.has(senderId)) {
        participantsMap.set(senderId, {
          id: senderId,
          displayName: authorName,
          role: authorName.toLowerCase().includes('me') || author.url?.includes('sms:') ? 'user' : 'other'
        });
      }

      const published = props.published?.[0] || props.date?.[0];
      let sentAt = published ? new Date(published) : new Date();

      if (isNaN(sentAt.getTime())) {
        sentAt = new Date();
      }

      if (!earliestDate || sentAt < earliestDate) earliestDate = sentAt;
      if (!latestDate || sentAt > latestDate) latestDate = sentAt;

      const content = props.content?.[0] || props.name?.[0] || '';
      const text = typeof content === 'string' ? content : content.value || content.html || '';

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      normalizedMessages.push({
        id: messageId,
        conversationId,
        senderId,
        sentAt: sentAt.toISOString(),
        text: text || null,
        isSystem: false
      });
    }

    const participants = Array.from(participantsMap.values());
    const conversation: Conversation = {
      id: conversationId,
      sourcePlatform: 'imessage',
      title: null,
      startedAt: earliestDate?.toISOString() || null,
      endedAt: latestDate?.toISOString() || null,
      participantIds: participants.map((p) => p.id),
      languageCodes: detectLanguages(normalizedMessages),
      messageCount: normalizedMessages.length,
      status: 'imported'
    };

    logInfo('imessage_import_success', {
      fileName,
      messageCount: normalizedMessages.length,
      participantCount: participants.length
    });

    return {
      conversation,
      participants,
      messages: normalizedMessages,
      media: mediaArtifacts,
      mediaFiles: new Map()
    };
  } catch (error) {
    logError('imessage_parse_error', { fileName, error: (error as Error).message });
    throw new Error(`Failed to parse iMessage export: ${(error as Error).message}`);
  }
}

/**
 * Parse Viber text export format (similar to WhatsApp).
 * Format: "DD/MM/YYYY, HH:MM - Sender: Message"
 */
export async function parseViberExport(
  fileContent: string,
  fileName: string
): Promise<NormalizedConversation> {
  // Viber exports are similar to WhatsApp text format
  return parseWhatsAppExport(fileContent, fileName, false);
}

/**
 * Route to appropriate parser based on platform and file content.
 */
export async function parseExport(
  payload: ImportPayload,
  fileContent: string | ArrayBuffer
): Promise<NormalizedConversation> {
  const textContent = fileContent instanceof ArrayBuffer
    ? new TextDecoder('utf-8').decode(fileContent)
    : fileContent;

  switch (payload.platform) {
    case 'telegram':
      return parseTelegramExport(textContent, payload.fileName);
    case 'whatsapp': {
      const isZip = payload.fileName.toLowerCase().endsWith('.zip') ||
                    payload.contentType === 'application/zip' ||
                    payload.contentType === 'application/x-zip-compressed';
      return parseWhatsAppExport(fileContent, payload.fileName, isZip);
    }
    case 'signal':
      return parseSignalExport(textContent, payload.fileName);
    case 'discord':
      return parseDiscordExport(textContent, payload.fileName);
    case 'messenger':
      return parseMessengerExport(textContent, payload.fileName);
    case 'imessage':
      return parseIMessageExport(textContent, payload.fileName);
    case 'viber':
      return parseViberExport(textContent, payload.fileName);
    default:
      throw new Error(`Unsupported platform: ${payload.platform}`);
  }
}

/**
 * Simple language detection based on message text (basic heuristic).
 */
function detectLanguages(messages: Message[]): string[] {
  const textSamples = messages
    .filter((m) => m.text)
    .slice(0, 100)
    .map((m) => m.text!)
    .join(' ');

  const detected: string[] = [];
  // Basic heuristics (can be enhanced with proper language detection library)
  if (/[а-яё]/i.test(textSamples)) detected.push('ru');
  if (/[àáâãäåæçèéêë]/i.test(textSamples)) detected.push('fr');
  if (/[äöüß]/i.test(textSamples)) detected.push('de');
  if (/[ñáéíóúü]/i.test(textSamples)) detected.push('es');
  if (!detected.length) detected.push('en'); // Default

  return detected;
}

