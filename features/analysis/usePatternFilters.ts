'use client';

import { useState } from 'react';

import type { AnalysisSection, EvidenceSnippet } from './types';

export type PatternType =
  | 'gaslighting'
  | 'conflict'
  | 'support'
  | 'apology'
  | 'all'
  | string; // Allow custom pattern IDs

export type TimeRange = {
  startDate?: string;
  endDate?: string;
};

export type ParticipantFilter = {
  participantIds?: string[];
};

export type PatternFilters = {
  patternType: PatternType;
  timeRange?: TimeRange;
  participants?: ParticipantFilter;
  minScore?: number;
  maxScore?: number;
};

export function usePatternFilters(initialFilters?: Partial<PatternFilters>) {
  const [filters, setFilters] = useState<PatternFilters>({
    patternType: initialFilters?.patternType ?? 'all',
    timeRange: initialFilters?.timeRange,
    participants: initialFilters?.participants,
    minScore: initialFilters?.minScore,
    maxScore: initialFilters?.maxScore
  });

  const updateFilter = <K extends keyof PatternFilters>(
    key: K,
    value: PatternFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      patternType: 'all',
      timeRange: undefined,
      participants: undefined,
      minScore: undefined,
      maxScore: undefined
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    setFilters
  };
}

/**
 * Filter sections based on pattern filters.
 */
export function filterSections(
  sections: AnalysisSection[],
  filters: PatternFilters
): AnalysisSection[] {
  let filtered = [...sections];

  // Filter by pattern type
  if (filters.patternType !== 'all') {
    filtered = filtered.filter((section) => section.id === filters.patternType);
  }

  // Filter by score range
  if (filters.minScore !== undefined || filters.maxScore !== undefined) {
    filtered = filtered.filter((section) => {
      const score = section.score ?? 0;
      const minOk = filters.minScore === undefined || score >= filters.minScore;
      const maxOk = filters.maxScore === undefined || score <= filters.maxScore;
      return minOk && maxOk;
    });
  }

  return filtered;
}

/**
 * Filter evidence snippets based on time range and participants.
 * Note: This is a simplified version - in a real implementation,
 * you'd need to look up message dates and participants from the conversation.
 */
export function filterEvidence(evidence: EvidenceSnippet[]): EvidenceSnippet[] {
  // For now, return all evidence
  // In a full implementation, this would filter by:
  // - Time range (if messageId is available and we can look up dates)
  // - Participants (if we can determine which participant sent the message)
  return evidence;
}

