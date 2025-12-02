import type { AnalysisResult, Message } from './types';

export type TimelineBin = {
  startDate: string;
  endDate: string;
  gaslightingScore: number;
  conflictScore: number;
  supportScore: number;
  apologyScore: number;
  messageCount: number;
  evidenceCount: number;
};

export type PatternTimeline = {
  patternId: string;
  patternName: string;
  bins: TimelineBin[];
  overallScore: number;
};

/**
 * Aggregate pattern scores over time by binning messages into time periods.
 * @param messages Messages from the conversation
 * @param analysisResult The analysis result containing sections and scores
 * @param binSizeDays Number of days per bin (default: 7 for weekly bins)
 * @returns Array of timeline bins with aggregated scores
 */
export function aggregatePatternTimeline(
  messages: Message[],
  analysisResult: AnalysisResult,
  binSizeDays: number = 7
): TimelineBin[] {
  if (messages.length === 0) {
    return [];
  }

  // Find date range
  const dates = messages.map((m) => new Date(m.sentAt).getTime()).sort((a, b) => a - b);
  const startTime = dates[0];
  const endTime = dates[dates.length - 1];
  const binSizeMs = binSizeDays * 24 * 60 * 60 * 1000;

  // Create bins
  const bins: Map<number, TimelineBin> = new Map();
  let currentBinStart = startTime;

  while (currentBinStart <= endTime) {
    const binKey = Math.floor(currentBinStart / binSizeMs);
    const binEnd = currentBinStart + binSizeMs;

    bins.set(binKey, {
      startDate: new Date(currentBinStart).toISOString(),
      endDate: new Date(binEnd).toISOString(),
      gaslightingScore: 0,
      conflictScore: 0,
      supportScore: 0,
      apologyScore: 0,
      messageCount: 0,
      evidenceCount: 0
    });

    currentBinStart = binEnd;
  }

  // Distribute messages into bins and count evidence
  const evidenceByDate = new Map<string, number>();
  analysisResult.sections.forEach((section) => {
    section.evidenceSnippets.forEach((evidence) => {
      // Try to find the message date if messageId is available
      if (evidence.messageId) {
        const message = messages.find((m) => m.id === evidence.messageId);
        if (message) {
          const dateKey = new Date(message.sentAt).toISOString().split('T')[0];
          evidenceByDate.set(dateKey, (evidenceByDate.get(dateKey) || 0) + 1);
        }
      }
    });
  });

  messages.forEach((message) => {
    const messageTime = new Date(message.sentAt).getTime();
    const binKey = Math.floor(messageTime / binSizeMs);
    const bin = bins.get(binKey);

    if (bin) {
      bin.messageCount += 1;

      // Check if this message has associated evidence
      const dateKey = new Date(message.sentAt).toISOString().split('T')[0];
      if (evidenceByDate.has(dateKey)) {
        bin.evidenceCount += 1;
      }
    }
  });

  // Calculate average scores per bin (weighted by message count)
  const totalMessages = messages.length;
  const result: TimelineBin[] = Array.from(bins.values()).map((bin) => {
    const weight = bin.messageCount / totalMessages;
    return {
      ...bin,
      gaslightingScore: analysisResult.gaslightingRiskScore * weight,
      conflictScore: analysisResult.conflictIntensityScore * weight,
      supportScore: analysisResult.supportivenessScore * weight,
      apologyScore: analysisResult.apologyFrequencyScore * weight
    };
  });

  return result.filter((bin) => bin.messageCount > 0);
}

/**
 * Create a timeline for a specific pattern from analysis sections.
 */
export function createPatternTimeline(
  patternId: string,
  patternName: string,
  messages: Message[],
  analysisResult: AnalysisResult,
  binSizeDays: number = 7
): PatternTimeline {
  const bins = aggregatePatternTimeline(messages, analysisResult, binSizeDays);

  // Find the section for this pattern
  const section = analysisResult.sections.find((s) => s.id === patternId);
  const overallScore = section?.score ?? 0;

  return {
    patternId,
    patternName,
    bins,
    overallScore
  };
}

/**
 * Get all pattern timelines from an analysis result.
 */
export function getAllPatternTimelines(
  messages: Message[],
  analysisResult: AnalysisResult,
  binSizeDays: number = 7
): PatternTimeline[] {
  const timelines: PatternTimeline[] = [];

  // Main patterns
  const mainPatterns = [
    { id: 'gaslighting', name: 'Gaslighting Risk', score: analysisResult.gaslightingRiskScore },
    { id: 'conflict', name: 'Conflict Intensity', score: analysisResult.conflictIntensityScore },
    { id: 'support', name: 'Supportiveness', score: analysisResult.supportivenessScore },
    { id: 'apology', name: 'Apology Frequency', score: analysisResult.apologyFrequencyScore }
  ];

  mainPatterns.forEach((pattern) => {
    const section = analysisResult.sections.find((s) => s.id === pattern.id);
    if (section) {
      timelines.push(createPatternTimeline(pattern.id, pattern.name, messages, analysisResult, binSizeDays));
    }
  });

  // Other patterns from sections
  analysisResult.sections.forEach((section) => {
    if (!mainPatterns.find((p) => p.id === section.id)) {
      timelines.push(
        createPatternTimeline(section.id, section.title, messages, analysisResult, binSizeDays)
      );
    }
  });

  return timelines;
}

