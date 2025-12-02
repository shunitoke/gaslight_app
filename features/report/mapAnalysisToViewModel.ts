import type { PatternTimeline } from '../analysis/timelines';
import { getAllPatternTimelines } from '../analysis/timelines';
import type { AnalysisResult, Message } from '../analysis/types';

export type ReportViewModel = {
  analysis: AnalysisResult;
  timelines: PatternTimeline[];
  filteredSections: AnalysisResult['sections'];
  totalEvidenceCount: number;
};

/**
 * Map an AnalysisResult to a view model that includes timelines and filtered data.
 */
export function mapAnalysisToViewModel(
  analysis: AnalysisResult,
  messages: Message[],
  filters?: {
    patternType?: string;
    timeRange?: { startDate?: string; endDate?: string };
    minScore?: number;
    maxScore?: number;
  }
): ReportViewModel {
  // Generate timelines
  const timelines = getAllPatternTimelines(messages, analysis);

  // Filter sections if needed
  let filteredSections = analysis.sections;
  if (filters?.patternType && filters.patternType !== 'all') {
    filteredSections = filteredSections.filter((s) => s.id === filters.patternType);
  }
  if (filters?.minScore !== undefined || filters?.maxScore !== undefined) {
    filteredSections = filteredSections.filter((section) => {
      const score = section.score ?? 0;
      const minOk = filters.minScore === undefined || score >= filters.minScore;
      const maxOk = filters.maxScore === undefined || score <= filters.maxScore;
      return minOk && maxOk;
    });
  }

  // Count total evidence
  const totalEvidenceCount = analysis.sections.reduce(
    (sum, section) => sum + section.evidenceSnippets.length,
    0
  );

  return {
    analysis,
    timelines,
    filteredSections,
    totalEvidenceCount
  };
}






