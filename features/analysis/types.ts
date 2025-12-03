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
  | 'messenger'
  | 'generic';

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

export type RecommendedReply = {
  /**
   * Free-form reply text, in the same language as the conversation.
   */
  text: string;
  /**
   * Optional high-level tone or style marker (e.g. "soft", "firm", "boundary").
   */
  tone?: string | null;
  /**
   * Optional role indicator for whom this reply is written.
   * This is advisory only; the UI remains neutral.
   */
  fromRole?: 'user' | 'other' | 'neutral';
};

export type AnalysisSection = {
  id: string;
  title: string;
  summary: string; // Scientific/technical summary
  plainSummary?: string; // Layman's terms summary (simple, everyday language)
  score?: number;
  evidenceSnippets: EvidenceSnippet[];
  recommendedReplies?: RecommendedReply[];
};

export type ParticipantProfile = {
  /**
   * Participant ID or display name as it appears in the conversation.
   */
  participantId: string;
  /**
   * Brief psychological and semantic profile (like a "cast of characters" description).
   * Written in the same language as the analysis.
   * Should describe communication style, attachment patterns, typical reactions, etc.
   */
  profile: string;
  /**
   * Optional inferred gender/role markers if clearly identifiable from conversation context.
   * Used for natural language generation (e.g., verb forms, pronouns).
   */
  inferredGender?: 'male' | 'female' | 'neutral' | null;
};

export type ImportantDate = {
  /**
   * ISO date string (YYYY-MM-DD format).
   */
  date: string;
  /**
   * Optional section identifier this date is most related to.
   * Should match one of sections[].id in the analysis result.
   */
  sectionId?: string;
  /**
   * Brief reason why this date is important (e.g., "Major conflict escalation", "Gaslighting incident").
   * Written in the same language as the analysis.
   */
  reason: string;
  /**
   * Severity level (0-1), where 1 is most severe.
   */
  severity?: number;
  /**
   * Optional excerpt of a representative quote for this date.
   * Ideally copied from one of sections[].evidenceSnippets[].excerpt to allow UI linking.
   */
  excerpt?: string;
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
  /**
   * Participant profiles (premium feature).
   * Brief psychological and semantic descriptions of each participant,
   * written in the same language as the analysis.
   */
  participantProfiles?: ParticipantProfile[];
  /**
   * Important dates (premium feature).
   * Dates identified as significant due to conflicts, gaslighting incidents, or other notable events.
   */
  importantDates?: ImportantDate[];
};

