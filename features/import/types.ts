import type { Conversation, MediaArtifact, Message, Participant } from '../analysis/types';

export type SupportedPlatform = 
  | 'telegram' 
  | 'whatsapp' 
  | 'signal' 
  | 'viber' 
  | 'discord' 
  | 'imessage' 
  | 'messenger';

export type ImportPayload = {
  platform: SupportedPlatform;
  fileName: string;
  sizeBytes: number;
  contentType: string;
};

export type NormalizedConversation = {
  conversation: Conversation;
  participants: Participant[];
  messages: Message[];
  media: MediaArtifact[];
  mediaFiles: Map<string, Blob>;
};

