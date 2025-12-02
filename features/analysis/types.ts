export type ParticipantRole = 'user' | 'other' | 'groupMember' | 'unknown';

export type Participant = {
  id: string;
  displayName: string;
  role: ParticipantRole;
};

export type MediaType = 'image' | 'sticker' | 'gif' | 'audio' | 'video' | 'other';

export type MediaArtifact = {
  id: string;
  conversationId: string;
  type: MediaType;
  originalFilename?: string | null;
  contentType?: string | null;
  sizeBytes?: number;
  transientPathOrUrl?: string;
  labels?: string[];
  sentimentHint?: 'positive' | 'neutral' | 'negative' | 'unknown';
  notes?: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  sentAt: string;
  text?: string | null;
  mediaArtifactId?: string | null;
  replyToMessageId?: string | null;
  isSystem?: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed' | 'unknown';
  toneTags?: string[];
  patternTags?: string[];
};

export type ConversationStatus = 'imported' | 'analyzing' | 'completed' | 'failed';

export type SupportedPlatform = 
  | 'telegram' 
  | 'whatsapp' 
  | 'signal' 
  | 'viber' 
  | 'discord' 
  | 'imessage' 
  | 'messenger';

export type Conversation = {
  id: string;
  sourcePlatform: SupportedPlatform;
  title?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  participantIds: string[];
  languageCodes: string[];
  messageCount: number;
  status: ConversationStatus;
};

export type EvidenceSnippet = {
  messageId?: string | null;
  mediaArtifactId?: string | null;
  excerpt: string;
  explanation: string;
};

export type AnalysisSection = {
  id: string;
  title: string;
  summary: string; // Scientific/technical summary
  plainSummary?: string; // Layman's terms summary (simple, everyday language)
  score?: number;
  evidenceSnippets: EvidenceSnippet[];
};

export type AnalysisResult = {
  id: string;
  conversationId: string;
  createdAt: string;
  version: string;
  gaslightingRiskScore: number;
  conflictIntensityScore: number;
  supportivenessScore: number;
  apologyFrequencyScore: number;
  otherPatternScores: Record<string, number>;
  overviewSummary: string;
  sections: AnalysisSection[];
};

