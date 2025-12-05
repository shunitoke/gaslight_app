import type {
  AnalysisResult,
  AnalysisSection,
  EvidenceSnippet,
  RealityCheck,
  HardTruth,
  WhatYouShouldKnow,
  ClosureStatements,
  SafetyConcern
} from './types';

type Defaults = {
  defaultTitle: string;
  defaultOverview: string;
  defaultSectionSummary: string;
};

const clamp01 = (value: unknown, fallback = 0): number => {
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) return fallback;
  return Math.min(1, Math.max(0, num));
};

const cleanString = (value: unknown, fallback = ''): string => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeRealityCheck = (value: unknown): RealityCheck | undefined => {
  if (!isPlainObject(value)) return undefined;
  const whosePerceptionWasAccurate = cleanString(value.whosePerceptionWasAccurate, '');
  const rightAboutRaw = Array.isArray((value as any).whatParticipantWasRightAbout)
    ? (value as any).whatParticipantWasRightAbout
    : [];

  if (!whosePerceptionWasAccurate || rightAboutRaw.length === 0) return undefined;

  const whatParticipantWasRightAbout = rightAboutRaw
    .map((item: any) => {
      if (!isPlainObject(item)) return null;
      const participant = cleanString(item.participant, '');
      const thought = cleanString(item.thought, '');
      const evidence = cleanString(item.evidence, '');
      if (!participant || !thought || !evidence) return null;
      return { participant, thought, evidence };
    })
    .filter(Boolean) as Array<{ participant: string; thought: string; evidence: string }>;

  if (whatParticipantWasRightAbout.length === 0) return undefined;

  const whatParticipantWasWrongAbout = Array.isArray((value as any).whatParticipantWasWrongAbout)
    ? ((value as any).whatParticipantWasWrongAbout
        .map((item: any) => {
          if (!isPlainObject(item)) return null;
          const participant = cleanString(item.participant, '');
          const accusation = cleanString(item.accusation, '');
          const reality = cleanString(item.reality, '');
          if (!participant || !accusation || !reality) return null;
          return { participant, accusation, reality };
        })
        .filter(Boolean) as Array<{ participant: string; accusation: string; reality: string }>)
    : undefined;

  return {
    whatParticipantWasRightAbout,
    whatParticipantWasWrongAbout,
    whosePerceptionWasAccurate
  };
};

const normalizeHardTruth = (value: unknown): HardTruth | undefined => {
  if (!isPlainObject(value)) return undefined;
  const verdictRaw = typeof value.verdict === 'string' ? value.verdict : '';
  const verdict: HardTruth['verdict'] | undefined =
    verdictRaw === 'healthy' ||
    verdictRaw === 'needs_work' ||
    verdictRaw === 'problematic' ||
    verdictRaw === 'toxic' ||
    verdictRaw === 'abusive'
      ? verdictRaw
      : undefined;
  const message = cleanString(value.message, '');
  if (!verdict || !message) return undefined;

  const abusiveBehaviors = Array.isArray((value as any).abusiveBehaviors)
    ? (value as any).abusiveBehaviors
        .map((b: unknown) => cleanString(b, ''))
        .filter((b: string) => b.length > 0)
    : undefined;

  return {
    verdict,
    message,
    abusiveBehaviors: abusiveBehaviors && abusiveBehaviors.length > 0 ? abusiveBehaviors : undefined
  };
};

const normalizeWhatYouShouldKnow = (value: unknown): WhatYouShouldKnow | undefined => {
  if (!isPlainObject(value)) return undefined;

  const stringArray = (arr: unknown): string[] | undefined =>
    Array.isArray(arr)
      ? arr.map((v) => cleanString(v, '')).filter((v) => v.length > 0)
      : undefined;

  const normalized: WhatYouShouldKnow = {};
  const couldHaveDoneDifferently = stringArray((value as any).couldHaveDoneDifferently);
  if (couldHaveDoneDifferently?.length) normalized.couldHaveDoneDifferently = couldHaveDoneDifferently;

  const communicationTools = stringArray((value as any).communicationTools);
  if (communicationTools?.length) normalized.communicationTools = communicationTools;

  if (typeof (value as any).couldHaveBeenSaved === 'boolean') {
    normalized.couldHaveBeenSaved = (value as any).couldHaveBeenSaved;
  }

  const whyNotFault = cleanString((value as any).whyNotFault, '');
  if (whyNotFault) normalized.whyNotFault = whyNotFault;

  const whatMadeVulnerable = cleanString((value as any).whatMadeVulnerable, '');
  if (whatMadeVulnerable) normalized.whatMadeVulnerable = whatMadeVulnerable;

  const patternsToWatch = stringArray((value as any).patternsToWatch);
  if (patternsToWatch?.length) normalized.patternsToWatch = patternsToWatch;

  const resources = stringArray((value as any).resources);
  if (resources?.length) normalized.resources = resources;

  const redFlagsForNextTime = stringArray((value as any).redFlagsForNextTime);
  if (redFlagsForNextTime?.length) normalized.redFlagsForNextTime = redFlagsForNextTime;

  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const normalizeClosureStatements = (value: unknown): ClosureStatements | undefined => {
  if (!isPlainObject(value)) return undefined;
  const whatWasRightAbout = cleanString((value as any).whatWasRightAbout, '');
  const whatWasDeserved = cleanString((value as any).whatWasDeserved, '');
  const whatWasGot = cleanString((value as any).whatWasGot, '');
  const permissionToMoveOn = cleanString((value as any).permissionToMoveOn, '');
  const endStatement = cleanString((value as any).endStatement, '');

  if (!whatWasRightAbout || !whatWasDeserved || !whatWasGot || !permissionToMoveOn || !endStatement) {
    return undefined;
  }

  return {
    whatWasRightAbout,
    whatWasDeserved,
    whatWasGot,
    permissionToMoveOn,
    endStatement
  };
};

const normalizeSafetyConcern = (value: unknown): SafetyConcern | undefined => {
  if (!isPlainObject(value)) return undefined;
  const isPresent = typeof (value as any).isPresent === 'boolean' ? (value as any).isPresent : false;
  const behaviors = Array.isArray((value as any).behaviors)
    ? (value as any).behaviors
        .map((b: unknown) => cleanString(b, ''))
        .filter((b: string) => b.length > 0)
    : [];
  const resources = Array.isArray((value as any).resources)
    ? (value as any).resources
        .map((r: unknown) => cleanString(r, ''))
        .filter((r: string) => r.length > 0)
    : undefined;

  if (!isPresent && behaviors.length === 0 && !resources) return undefined;

  return {
    isPresent,
    behaviors,
    resources: resources && resources.length > 0 ? resources : undefined
  };
};

const normalizeEvidence = (value: unknown): EvidenceSnippet[] => {
  if (!Array.isArray(value)) return [];
  const snippets: EvidenceSnippet[] = [];
  value.forEach((item) => {
    if (!isPlainObject(item)) return;
    const excerpt = cleanString(item.excerpt, '');
    const explanation = cleanString(item.explanation, '');
    if (!excerpt || !explanation) return;
    snippets.push({
      messageId: typeof item.messageId === 'string' ? item.messageId : null,
      mediaArtifactId: typeof item.mediaArtifactId === 'string' ? item.mediaArtifactId : null,
      excerpt,
      explanation
    });
  });
  return snippets;
};

const normalizeSection = (
  value: unknown,
  index: number,
  defaults: Defaults
): AnalysisSection | null => {
  if (!isPlainObject(value)) return null;
  const id = cleanString(value.id, `section_${index + 1}`);
  const title = cleanString(value.title, defaults.defaultTitle);
  const summary = cleanString(value.summary, defaults.defaultSectionSummary);
  const plainSummary =
    typeof value.plainSummary === 'string' && value.plainSummary.trim().length > 0
      ? value.plainSummary.trim()
      : undefined;
  const score =
    typeof value.score === 'number' && Number.isFinite(value.score) ? clamp01(value.score) : undefined;
  const evidenceSnippets = normalizeEvidence(value.evidenceSnippets);
  return {
    id,
    title,
    summary,
    plainSummary,
    score,
    evidenceSnippets,
    // recommended replies removed
  };
};

/**
 * Best-effort normalization/validation of an AnalysisResult coming from the LLM.
 * Keeps the shape predictable and removes empty sections/evidence.
 */
export const normalizeAnalysisResult = (
  raw: unknown,
  defaults: Defaults
): AnalysisResult => {
  const source = isPlainObject(raw) ? raw : {};

  const sectionsRaw = Array.isArray(source.sections) ? source.sections : [];
  const normalizedSections = sectionsRaw
    .map((section, idx) => normalizeSection(section, idx, defaults))
    .filter((s): s is AnalysisSection => s !== null);

  const fallbackSection: AnalysisSection = {
    id: 'default',
    title: defaults.defaultTitle,
    summary: defaults.defaultSectionSummary,
    evidenceSnippets: []
  };

  return {
    id: cleanString(source.id, `analysis_${Date.now()}`),
    conversationId: cleanString(source.conversationId, ''),
    createdAt: cleanString(source.createdAt, new Date().toISOString()),
    version: cleanString(source.version, ''),
    gaslightingRiskScore: clamp01(source.gaslightingRiskScore, 0),
    conflictIntensityScore: clamp01(source.conflictIntensityScore, 0),
    supportivenessScore: clamp01(source.supportivenessScore, 0),
    apologyFrequencyScore: clamp01(source.apologyFrequencyScore, 0.5),
    otherPatternScores: isPlainObject(source.otherPatternScores)
      ? (source.otherPatternScores as Record<string, number>)
      : {},
    overviewSummary: cleanString(source.overviewSummary, defaults.defaultOverview),
    sections: normalizedSections.length > 0 ? normalizedSections : [fallbackSection],
    participantProfiles: Array.isArray(source.participantProfiles)
      ? source.participantProfiles
          .filter((p) => isPlainObject(p) && typeof p.participantId === 'string' && typeof p.profile === 'string')
          .map((p: any) => ({
            participantId: p.participantId,
            profile: p.profile.trim(),
            inferredGender:
              p.inferredGender === 'male' ||
              p.inferredGender === 'female' ||
              p.inferredGender === 'neutral'
                ? p.inferredGender
                : null
          }))
      : undefined,
    importantDates: Array.isArray(source.importantDates)
      ? source.importantDates.filter((d) => isPlainObject(d) && typeof (d as any).date === 'string')
      : undefined,
    communicationStats: isPlainObject(source.communicationStats) ? source.communicationStats : undefined,
    promiseTracking: isPlainObject(source.promiseTracking) ? source.promiseTracking : undefined,
    redFlagCounts: isPlainObject(source.redFlagCounts) ? (source.redFlagCounts as any) : undefined,
    emotionalCycle: cleanString(source.emotionalCycle, ''),
    timePatterns: isPlainObject(source.timePatterns) ? source.timePatterns : undefined,
    contradictions: Array.isArray(source.contradictions) ? source.contradictions : undefined,
    realityCheck: normalizeRealityCheck(source.realityCheck),
    frameworkDiagnosis: isPlainObject(source.frameworkDiagnosis) ? source.frameworkDiagnosis : undefined,
    hardTruth: normalizeHardTruth(source.hardTruth),
    whatYouShouldKnow: normalizeWhatYouShouldKnow(source.whatYouShouldKnow),
    closure: normalizeClosureStatements(source.closure),
    safetyConcern: normalizeSafetyConcern(source.safetyConcern)
  };
};

