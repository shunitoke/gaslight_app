import type {
  AnalysisResult,
  AnalysisSection,
  EvidenceSnippet
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
  if (evidenceSnippets.length === 0) return null;
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
    realityCheck: isPlainObject(source.realityCheck) ? source.realityCheck : undefined,
    frameworkDiagnosis: isPlainObject(source.frameworkDiagnosis) ? source.frameworkDiagnosis : undefined,
    hardTruth: isPlainObject(source.hardTruth) ? source.hardTruth : undefined,
    whatYouShouldKnow: isPlainObject(source.whatYouShouldKnow) ? source.whatYouShouldKnow : undefined,
    closure: isPlainObject(source.closure) ? source.closure : undefined,
    safetyConcern: isPlainObject(source.safetyConcern) ? source.safetyConcern : undefined
  };
};

