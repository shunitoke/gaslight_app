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
  transientPathOrUrl?: string; // Deprecated: use blobUrl instead
  blobUrl?: string; // Vercel Blob URL for media storage
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

// PART 2: STATISTICAL BREAKDOWN
export type CommunicationStats = {
  initiatorBalance?: { participant1: number; participant2: number } | Record<string, number>; // percentages
  apologyCount?: { participant1: number; participant2: number } | Record<string, number>;
  conflictFrequency?: string; // "X per week/month"
  resolutionRate?: number; // percentage (0-100)
};

export type PromiseTracking = {
  participant1?: { made: number; kept: number; percentage: number };
  participant2?: { made: number; kept: number; percentage: number };
} | Record<string, { made: number; kept: number; percentage: number }>;

export type RedFlagCounts = {
  yellow: number; // concerning
  orange: number; // problematic
  red: number; // dangerous
};

// PART 3: PATTERN ANALYSIS (extended)
export type TimePatterns = {
  conflictTimes?: string; // "mostly on weekends"
  triggers?: string[]; // ["money", "jealousy", etc.]
};

// PART 4: CONTRADICTION TRACKER
export type Contradiction = {
  date: string; // ISO date
  originalStatement: string;
  denialStatement: string;
  type: 'promise_denial' | 'reality_denial' | 'claim_denial';
  severity: number; // 0-1
};

// PART 5: REALITY CHECK
export type RealityCheck = {
  whatParticipantWasRightAbout: Array<{
    participant: string; // participant name
    thought: string;
    evidence: string;
  }>;
  whatParticipantWasWrongAbout?: Array<{
    participant: string; // participant name
    accusation: string;
    reality: string;
  }>;
  whosePerceptionWasAccurate: string; // brief description
};

// PART 6: FRAMEWORK DIAGNOSIS
export type NVCAnalysis = {
  participant1UnmetNeeds?: string[];
  participant2UnmetNeeds?: string[];
  participantUnmetNeeds?: Record<string, string[]>; // participant name -> needs array
  needsDirectlyStated: boolean;
  couldBeResolved: boolean;
};

export type CBTAnalysis = {
  participant1Distortions?: Array<{ type: string; example: string }>;
  participant2Distortions?: Array<{ type: string; example: string }>;
  participantDistortions?: Record<string, Array<{ type: string; example: string }>>; // participant name -> distortions
  whoseMoreDistorted: string;
};

export type AttachmentAnalysis = {
  participant1Style?: 'anxious' | 'avoidant' | 'secure' | 'fearful-avoidant';
  participant2Style?: 'anxious' | 'avoidant' | 'secure' | 'fearful-avoidant';
  participantStyles?: Record<string, 'anxious' | 'avoidant' | 'secure' | 'fearful-avoidant'>; // participant name -> style
  dancePattern: string; // description of how styles interacted
};

export type TransactionalAnalysis = {
  dominantTransaction: string; // "Parent-Child", "Adult-Adult", etc.
  healthiestMoments: string;
  mostToxicMoments: string;
};

export type FrameworkDiagnosis = {
  nvc?: NVCAnalysis;
  cbt?: CBTAnalysis;
  attachment?: AttachmentAnalysis;
  transactional?: TransactionalAnalysis;
};

// PART 7: THE HARD TRUTH
export type HardTruth = {
  verdict: 'healthy' | 'needs_work' | 'problematic' | 'toxic' | 'abusive';
  message: string; // full "hard truth" text
  abusiveBehaviors?: string[]; // if abusive
};

// PART 8: WHAT YOU SHOULD KNOW
export type WhatYouShouldKnow = {
  couldHaveDoneDifferently?: string[];
  communicationTools?: string[];
  couldHaveBeenSaved?: boolean;
  whyNotFault?: string;
  whatMadeVulnerable?: string;
  patternsToWatch?: string[];
  resources?: string[];
  redFlagsForNextTime?: string[];
};

// PART 9: CLOSURE STATEMENTS
export type ClosureStatements = {
  whatWasRightAbout: string;
  whatWasDeserved: string;
  whatWasGot: string;
  permissionToMoveOn: string;
  endStatement: string; // final statement
};

// SPECIAL: Safety concerns
export type SafetyConcern = {
  isPresent: boolean;
  behaviors: string[];
  resources?: string[];
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
  
  // PART 2: STATISTICAL BREAKDOWN
  communicationStats?: CommunicationStats;
  promiseTracking?: PromiseTracking;
  redFlagCounts?: RedFlagCounts;
  
  // PART 3: PATTERN ANALYSIS (extended)
  emotionalCycle?: string; // "Tension → Explosion → Honeymoon → Repeat"
  timePatterns?: TimePatterns;
  
  // PART 4: CONTRADICTION TRACKER
  contradictions?: Contradiction[];
  
  // PART 5: REALITY CHECK
  realityCheck?: RealityCheck;
  
  // PART 6: FRAMEWORK DIAGNOSIS
  frameworkDiagnosis?: FrameworkDiagnosis;
  
  // PART 7: THE HARD TRUTH
  hardTruth?: HardTruth;
  
  // PART 8: WHAT YOU SHOULD KNOW
  whatYouShouldKnow?: WhatYouShouldKnow;
  
  // PART 9: CLOSURE STATEMENTS
  closure?: ClosureStatements;
  
  // SPECIAL: Safety concerns
  safetyConcern?: SafetyConcern;
};

