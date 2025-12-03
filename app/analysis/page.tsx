'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

import { Button } from '../../components/ui/Button';
import { Card, CardBase } from '../../components/ui/card';
import { ChartContainer } from '../../components/ui/chart';
import type {
  AnalysisResult,
  AnalysisSection,
  Conversation,
  Participant,
  ImportantDate
} from '../../features/analysis/types';
import { useLanguage } from '../../features/i18n';
import { AnalysisRadarChart } from '../../components/analysis/AnalysisRadarChart';
import { AnalysisDashboard } from '../../components/analysis/AnalysisDashboard';
import type { SupportedLocale } from '../../features/i18n/types';

type AnalysisPageProps = {
  analysisId?: string;
};

// In-memory cache for analysis data
const analysisCache = new Map<string, {
  analysis: AnalysisResult;
  participants: Participant[];
  isPremium: boolean;
  timestamp: number;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

type DailyActivity = {
  date: string;
  messageCount: number;
};

type TranslationFn = (key: string) => string;

type SectionCardProps = {
  section: AnalysisSection;
  t: TranslationFn;
  locale: SupportedLocale;
  conversationLanguage: SupportedLocale | 'unknown';
  isPremiumAnalysis: boolean;
  index: number;
  shouldShowReplies: boolean;
  getSectionTitle: (sectionId: string, fallbackTitle: string) => string;
  replaceParticipantIds: (text: string) => string;
  formatParticipantName: (
    text: string
  ) => { name: string; remainingText: string } | null;
};

function SectionCard({
  section,
  t,
  locale,
  conversationLanguage,
  isPremiumAnalysis,
  index,
  shouldShowReplies,
  getSectionTitle,
  replaceParticipantIds,
  formatParticipantName
}: SectionCardProps) {
  const [isRepliesOpen, setIsRepliesOpen] = React.useState(false);
  const [generatedReplies, setGeneratedReplies] = React.useState<string[] | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [visibleReplyCount, setVisibleReplyCount] = React.useState(0);

  const sectionTitle = getSectionTitle(section.id, section.title);
  const formattedSummary =
    section.summary && section.summary.trim()
      ? section.summary
      : t('analysisEmptySummary');

  const baseRecommended = Array.isArray(section.recommendedReplies)
    ? section.recommendedReplies.map((r) => r.text).filter((txt) => txt.trim().length > 0)
    : [];

  const recommended = generatedReplies ?? baseRecommended;

  React.useEffect(() => {
    if (!isRepliesOpen || !recommended || recommended.length === 0) {
      setVisibleReplyCount(0);
      return;
    }

    setVisibleReplyCount(1);
    if (recommended.length === 1) return;

    let i = 1;
    const interval = window.setInterval(() => {
      i += 1;
      setVisibleReplyCount((prev) => {
        if (prev >= recommended.length) {
          window.clearInterval(interval);
          return prev;
        }
        return Math.min(i, recommended.length);
      });
      if (i >= recommended.length) {
        window.clearInterval(interval);
      }
    }, 350);

    return () => {
      window.clearInterval(interval);
    };
  }, [isRepliesOpen, recommended]);

  return (
    <Card
      id={`section-${section.id}-${index}`}
      className="p-3 sm:p-4"
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        transform: 'translate3d(0, 0, 0)'
      }}
    >
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1.5">
        {sectionTitle}
      </h2>
      {section.score !== undefined && (
        <div className="text-xs sm:text-sm text-muted-foreground mb-2">
          {t('score')}: {(section.score * 100).toFixed(0)}%
        </div>
      )}
      <div className="space-y-2 mb-3">
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5">
            {t('scientificAnalysis')}:
          </p>
          <p className="text-sm text-foreground">{formattedSummary}</p>
        </div>
        {section.plainSummary && (
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5">
              {t('plainLanguage')}:
            </p>
            <p className="text-sm text-foreground italic">
              {section.plainSummary}
            </p>
          </div>
        )}
      </div>
      {section.evidenceSnippets.length > 0 && (
        <div className="space-y-2 mb-3">
          <h3 className="text-sm font-medium text-foreground">
            {t('evidence')}
          </h3>
          {section.evidenceSnippets.map((evidence, idx) => {
            const formattedExcerpt = replaceParticipantIds(evidence.excerpt);
            const formattedExplanation = replaceParticipantIds(
              evidence.explanation
            );
            const participantInfo = formatParticipantName(formattedExcerpt);

            return (
              <div
                id={`evidence-${section.id}-${idx}`}
                key={idx}
                className="border-l-4 border-primary/50 pl-3 py-1.5"
              >
                {participantInfo ? (
                  <div className="mb-1">
                    <span className="font-semibold italic text-primary text-sm sm:text-base mr-2">
                      {participantInfo.name}:
                    </span>
                    <span className="italic text-sm text-foreground/90">
                      &ldquo;{participantInfo.remainingText}&rdquo;
                    </span>
                  </div>
                ) : (
                  <p className="italic text-sm text-foreground/90 mb-0.5">
                    &ldquo;{formattedExcerpt}&rdquo;
                  </p>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {formattedExplanation}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {isPremiumAnalysis &&
        shouldShowReplies &&
        isRepliesOpen &&
        conversationLanguage === locale && (
        <div className="mt-2 border-t border-border/60 pt-2">
          <button
            type="button"
            onClick={async () => {
              // If уже есть рекомендованные ответы (из анализа или уже сгенерированные),
              // просто переключаем видимость
              if (recommended && recommended.length > 0) {
                setIsRepliesOpen((prev) => !prev);
                return;
              }

              if (isGenerating) return;
              setIsGenerating(true);
              try {
                const res = await fetch('/api/replies', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    locale,
                    conversationLanguage: locale,
                    section: {
                      id: section.id,
                      title: sectionTitle,
                      summary: formattedSummary,
                      plainSummary: section.plainSummary,
                      score: section.score,
                      evidenceSnippets: section.evidenceSnippets.map((e) => ({
                        excerpt: e.excerpt,
                        explanation: e.explanation
                      }))
                    }
                  })
                });

                if (!res.ok) {
                  throw new Error('Failed to generate replies');
                }
                const data = await res.json() as { replies?: { text: string }[] };
                const texts =
                  Array.isArray(data.replies) && data.replies.length > 0
                    ? data.replies
                        .map((r) => r.text)
                        .filter((txt) => txt && txt.trim().length > 0)
                    : [];

                if (texts.length > 0) {
                  setGeneratedReplies(texts);
                  setIsRepliesOpen(true);
                }
              } catch {
                // swallow for now; in future we can surface a toast
              } finally {
                setIsGenerating(false);
              }
            }}
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-60"
            disabled={isGenerating}
          >
            {recommended && recommended.length > 0
              ? isRepliesOpen
                ? t('recommended_replies_toggle_hide')
                : t('recommended_replies_toggle_show')
              : isGenerating
                ? (locale === 'ru' ? 'ИИ придумывает…' : 'AI is thinking…')
                : (locale === 'ru'
                    ? 'Сгенерировать «а если бы мы говорили осознанно»'
                    : 'Generate "what if we were both conscious"')}
            {recommended && recommended.length > 0 ? (
              isRepliesOpen ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )
            ) : null}
          </button>
          {isRepliesOpen && recommended && recommended.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {recommended.slice(0, visibleReplyCount).map((text, idx) => (
                <li
                  key={idx}
                  className="text-xs sm:text-sm text-foreground/90 bg-muted/40 rounded-md px-2 py-1.5"
                >
                  {text}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}

export default function AnalysisPage() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activityByDay, setActivityByDay] = useState<DailyActivity[]>([]);
  const [conversationLanguage, setConversationLanguage] =
    useState<SupportedLocale | 'unknown'>('unknown');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isPremiumAnalysis, setIsPremiumAnalysis] = useState<boolean>(false);
  const dataLoadedRef = useRef(false);

  // Calculate Emotional Safety Index based on all scores
  const emotionalSafetyIndex = useMemo(() => {
    if (!analysis) return 0;
    
    // Formula: combine negative factors (gaslighting, conflict) and positive factors (support, apology)
    // Higher gaslighting/conflict = lower safety
    // Higher support/apology = higher safety
    const negativeImpact = (analysis.gaslightingRiskScore * 0.4) + (analysis.conflictIntensityScore * 0.3);
    const positiveImpact = (analysis.supportivenessScore * 0.2) + (analysis.apologyFrequencyScore * 0.1);
    
    // Safety index: 1 - negative impact + positive impact, clamped to 0-1
    return Math.max(0, Math.min(1, 1 - negativeImpact + positiveImpact));
  }, [analysis]);

  // Determine safety level
  const safetyLevel = useMemo(() => {
    if (emotionalSafetyIndex < 0.4) return 'low';
    if (emotionalSafetyIndex < 0.7) return 'medium';
    return 'high';
  }, [emotionalSafetyIndex]);

  const activityChartData = useMemo(() => {
    if (!activityByDay || activityByDay.length === 0) return [];
    return activityByDay.map((day) => ({
      dateLabel: new Date(day.date).toLocaleDateString(
        locale === 'ru' ? 'ru-RU' : 'en-US',
        { month: 'short', day: 'numeric' }
      ),
      messageCount: day.messageCount
    }));
  }, [activityByDay, locale]);

  // Get localized safety level text
  const getSafetyLevelText = (level: 'low' | 'medium' | 'high'): string => {
    if (level === 'low') return t('hero_preview_score_low');
    if (level === 'medium') {
      const key = 'emotional_safety_medium' as keyof typeof t;
      return t(key) !== key ? t(key) : 'Medium';
    }
    const key = 'emotional_safety_high' as keyof typeof t;
    return t(key) !== key ? t(key) : 'High';
  };

  // Get color for safety level
  const getSafetyColor = (level: 'low' | 'medium' | 'high') => {
    if (level === 'low') return 'text-red-600 dark:text-red-400';
    if (level === 'medium') return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  // Get localized section title
  const getSectionTitle = (sectionId: string, fallbackTitle: string): string => {
    const translationKey = `section_${sectionId}` as keyof typeof t;
    const translated = t(translationKey);
    // If translation exists and is different from the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    // Otherwise use fallback title from AI
    return fallbackTitle;
  };

  // Load analysis data with caching optimization
  useEffect(() => {
    if (dataLoadedRef.current) return;
    dataLoadedRef.current = true;

    const loadAnalysisData = () => {
      try {
        const stored = sessionStorage.getItem('currentAnalysis');
        const storedParticipants = sessionStorage.getItem('currentParticipants');
        const storedTier = sessionStorage.getItem('currentSubscriptionTier');
        const storedFeatures = sessionStorage.getItem('currentFeatures');
        const storedActivity = sessionStorage.getItem('currentActivityByDay');
        const storedConversation = sessionStorage.getItem('currentConversation');
        
        if (!stored) {
          setError('No analysis found');
          setLoading(false);
          return;
        }

        // Try to get from cache first
        let analysisData: AnalysisResult;
        let participantsData: Participant[] = [];
        let isPremium = false;
        let activityData: DailyActivity[] = [];
        let primaryLanguage: SupportedLocale | 'unknown' = 'unknown';

        try {
          analysisData = JSON.parse(stored);

          if (storedConversation) {
            try {
              const conv = JSON.parse(storedConversation) as Conversation;
              const firstLang =
                conv.languageCodes && conv.languageCodes.length > 0
                  ? conv.languageCodes[0]
                  : '';
              const shortLang = firstLang.slice(0, 2).toLowerCase();
              if (
                shortLang === 'en' ||
                shortLang === 'ru' ||
                shortLang === 'fr' ||
                shortLang === 'de' ||
                shortLang === 'es' ||
                shortLang === 'pt'
              ) {
                primaryLanguage = shortLang as SupportedLocale;
              }
            } catch {
              primaryLanguage = 'unknown';
            }
          }
          
          // Check cache
          const cacheKey = analysisData.id || 'default';
          const cached = analysisCache.get(cacheKey);
          const now = Date.now();
          
          if (cached && (now - cached.timestamp) < CACHE_TTL) {
            // Use cached data
            setAnalysis(cached.analysis);
            setParticipants(cached.participants);
            setIsPremiumAnalysis(cached.isPremium);
            // Activity is small and cheap to re-parse each time
            if (storedActivity) {
              try {
                activityData = JSON.parse(storedActivity);
                setActivityByDay(activityData);
              } catch {
                setActivityByDay([]);
              }
            }
            setConversationLanguage(primaryLanguage);
            setLoading(false);
            return;
          }

          // Parse participants
          if (storedParticipants) {
            participantsData = JSON.parse(storedParticipants);
          }
          if (storedActivity) {
            try {
              activityData = JSON.parse(storedActivity);
            } catch {
              activityData = [];
            }
          }

          // Derive premium status
          const tier = storedTier || 'free';
          let features: { canAnalyzeMedia?: boolean; canUseEnhancedAnalysis?: boolean } = {};
          if (storedFeatures) {
            features = JSON.parse(storedFeatures);
          }
          isPremium =
            tier === 'premium' ||
            features.canAnalyzeMedia === true ||
            features.canUseEnhancedAnalysis === true;

          // Store in cache
          analysisCache.set(cacheKey, {
            analysis: analysisData,
            participants: participantsData,
            isPremium,
            timestamp: now
          });

          // Update state synchronously to avoid pop-in
          setAnalysis(analysisData);
          setParticipants(participantsData);
          setIsPremiumAnalysis(isPremium);
          setActivityByDay(activityData);
          setConversationLanguage(primaryLanguage);
          setLoading(false);
        } catch (parseError) {
          console.error('Failed to parse analysis data:', parseError);
          setError('Failed to parse analysis data');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading analysis:', err);
        setError('Failed to load analysis');
        setLoading(false);
      }
    };

    // Load immediately on mount
    loadAnalysisData();
  }, []);

  if (!loading && (error || !analysis)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full p-6 sm:p-8 text-center space-y-4 shadow-xl border-border/40 backdrop-blur-lg" style={{ backgroundColor: 'hsl(var(--card) / 0.85)', willChange: 'background-color, opacity', backfaceVisibility: 'hidden' }}>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">
              {t('noAnalysisFound')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('noAnalysisFound_help') ?? 'Please go back and upload a conversation to generate a report.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button onClick={() => router.push('/')}>
              {t('backToHome')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Still loading data: render a neutral shell without any "analyzing" text,
  // so the header/layout stay stable and the content just appears when ready.
  if (!analysis) {
    return (
      <div className="min-h-screen bg-background py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-8" />
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatSectionTitle = (section: AnalysisSection): string => {
    return getSectionTitle(section.id, section.title);
  };

  const generateTextReport = (): string => {
    const isGenericFallback =
      analysis.sections.length === 1 &&
      analysis.sections[0].id === 'default' &&
      (!analysis.sections[0].evidenceSnippets ||
        analysis.sections[0].evidenceSnippets.length === 0);

    const dateStr = formatDate(analysis.createdAt);
    const reportTitle = t('exportReportTitle');
    const generatedBy = t('exportGeneratedBy');

    let report = `${reportTitle} - ${dateStr}\n\n`;

    // If analysis fell back to a generic/default section, явно объясняем это и не притворяемся, что есть точные проценты
    if (isGenericFallback) {
      report += `${t('exportOverview')}: ${t('analysisGenericWarningBody')}\n\n`;
      report += `${t('exportPatterns')}:\n\n`;
      report += `- ${t('analysisGenericWarningTitle')}\n`;
      report += `  ${t('analysisGenericWarningBody')}\n\n`;
      report += `\n${generatedBy}`;
      return report;
    }

    // Нормальный детальный отчёт
    report += `${t('exportOverview')}: ${replaceParticipantIds(analysis.overviewSummary)}\n\n`;
    
    report += `${t('exportScores')}:\n`;
    report += `- ${t('gaslightingRisk')}: ${(analysis.gaslightingRiskScore * 100).toFixed(0)}%\n`;
    report += `- ${t('conflictIntensity')}: ${(analysis.conflictIntensityScore * 100).toFixed(0)}%\n`;
    report += `- ${t('supportiveness')}: ${(analysis.supportivenessScore * 100).toFixed(0)}%\n`;
    report += `- ${t('apologyFrequency')}: ${(analysis.apologyFrequencyScore * 100).toFixed(0)}%\n\n`;
    
    report += `${t('exportPatterns')}:\n`;
    analysis.sections.forEach((section) => {
      const title = formatSectionTitle(section);
      report += `\n- ${title}: `;
      if (section.score !== undefined) {
        report += `${t('score')}: ${(section.score * 100).toFixed(0)}%\n`;
      } else {
        report += '\n';
      }
      report += `  ${t('scientificAnalysis')}: ${replaceParticipantIds(section.summary)}\n`;
      if (section.plainSummary) {
        report += `  ${t('plainLanguage')}: ${replaceParticipantIds(section.plainSummary)}\n`;
      }
      if (section.evidenceSnippets.length > 0) {
        report += `  ${t('exportEvidence')}:\n`;
        section.evidenceSnippets.forEach((evidence) => {
          const formattedExcerpt = replaceParticipantIds(evidence.excerpt);
          const formattedExplanation = replaceParticipantIds(evidence.explanation);
          const participantInfo = formatParticipantName(formattedExcerpt);
          
          if (participantInfo) {
            report += `    ${participantInfo.name}: "${participantInfo.remainingText}"\n`;
          } else {
            report += `    "${formattedExcerpt}"\n`;
          }
          report += `    ${formattedExplanation}\n\n`;
        });
      }
    });
    
    report += `\n${generatedBy}`;
    return report;
  };

  const copySummary = async () => {
    const summary = generateTextReport();
    try {
      await navigator.clipboard.writeText(summary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = summary;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  /**
   * Replace participant IDs in text with display names
   * Simple replacement - assumes AI follows format: "Name: \"text\""
   */
  const replaceParticipantIds = (text: string): string => {
    let result = text;
    
    // Replace participant IDs in various formats
    participants.forEach((participant) => {
      const id = participant.id;
      const idWithoutPrefix = id.replace(/^participant_/i, '');
      const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedIdWithoutPrefix = idWithoutPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Replace exact ID matches (case-insensitive)
      result = result.replace(new RegExp(`\\b${escapedId}\\b`, 'gi'), participant.displayName);
      
      // Replace "participant_xxx" patterns
      result = result.replace(new RegExp(`participant_${escapedIdWithoutPrefix}`, 'gi'), participant.displayName);
      
      // Replace patterns like "participant_xxx:" with "Name:"
      result = result.replace(new RegExp(`participant_${escapedIdWithoutPrefix}:`, 'gi'), `${participant.displayName}:`);
    });
    
    return result;
  };

  /**
   * Extract and format participant name from text
   * Assumes format: "Name: \"text\"" (no quotes before name)
   */
  const formatParticipantName = (text: string): { name: string; remainingText: string } | null => {
    // Look for patterns like "Name: \"text\"" or "Name: text"
    const match = text.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const potentialName = match[1].trim();
      let remainingText = match[2].trim();
      
      // Remove quotes from remaining text if they're at the start/end
      if ((remainingText.startsWith('"') && remainingText.endsWith('"')) ||
          (remainingText.startsWith('"') && remainingText.endsWith('"')) ||
          (remainingText.startsWith('«') && remainingText.endsWith('»'))) {
        remainingText = remainingText.slice(1, -1).trim();
      }
      
      // Find participant by ID or display name
      const participant = participants.find(p => {
        const idLower = p.id.toLowerCase();
        const idWithoutPrefix = idLower.replace(/^participant_/, '');
        const potentialNameLower = potentialName.toLowerCase();
        
        return (
          idLower === potentialNameLower ||
          idWithoutPrefix === potentialNameLower ||
          potentialNameLower.includes(idWithoutPrefix) ||
          potentialNameLower === p.displayName.toLowerCase()
        );
      });
      
      if (participant) {
        return { name: participant.displayName, remainingText };
      }
      
      // Try to extract name from participant ID format
      if (potentialName.toLowerCase().startsWith('participant_')) {
        const nameFromId = potentialName
          .replace(/^participant_/i, '')
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        return { name: nameFromId, remainingText };
      }
      
      // If it looks like a name (not an ID), use it as-is
      if (!potentialName.toLowerCase().includes('participant')) {
        return { name: potentialName, remainingText };
      }
    }
    return null;
  };

  const exportTXT = () => {
    const text = generateTextReport();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${analysis.id.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = {
      analysisId: analysis.id,
      createdAt: analysis.createdAt,
      locale: locale,
      overview: analysis.overviewSummary,
      scores: {
        gaslightingRisk: analysis.gaslightingRiskScore,
        conflictIntensity: analysis.conflictIntensityScore,
        supportiveness: analysis.supportivenessScore,
        apologyFrequency: analysis.apologyFrequencyScore
      },
      sections: analysis.sections.map((s) => ({
        id: s.id,
        title: s.title,
        summary: s.summary,
        plainSummary: s.plainSummary,
        score: s.score,
        evidenceSnippets: s.evidenceSnippets.map((e) => ({
          excerpt: replaceParticipantIds(e.excerpt),
          explanation: replaceParticipantIds(e.explanation),
          messageId: e.messageId,
          mediaArtifactId: e.mediaArtifactId
        }))
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${analysis.id.substring(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      // Create a temporary visible container for PDF generation
      // Make it FULLY visible in viewport for html2canvas to capture
      const container = document.createElement('div');
      container.id = 'pdf-export-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '210mm';
      container.style.minWidth = '210mm';
      container.style.maxWidth = '210mm';
      container.style.padding = '5mm';
      container.style.backgroundColor = '#fff';
      container.style.color = '#000';
      container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      container.style.fontSize = '11px';
      container.style.lineHeight = '1.4';
      container.style.zIndex = '-1';
      container.style.boxSizing = 'border-box';
      container.style.overflow = 'visible';
      container.style.display = 'block';
      // Must be visible for html2canvas, but positioned off-screen
      container.style.visibility = 'visible';
      container.style.opacity = '1';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      // Move off-screen but keep visible for rendering
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      container.style.transform = `translateX(${viewportWidth + 200}px)`;
      
      // Build HTML content
      let html = `
        <div style="margin-bottom: 8px;">
          <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 4px; color: #000;">${t('exportReportTitle')}</h1>
          <p style="font-size: 9px; color: #666; margin: 0;">${formatDate(analysis.createdAt)}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: #000;">${t('exportOverview')}</h2>
          <p style="margin: 0; text-align: justify; word-wrap: break-word; font-size: 10px;">${replaceParticipantIds(analysis.overviewSummary)}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: #000;">${t('exportScores')}</h2>
          <ul style="margin: 0; padding-left: 12px;">
            <li style="margin-bottom: 2px; font-size: 10px;">${t('gaslightingRisk')}: ${(analysis.gaslightingRiskScore * 100).toFixed(0)}%</li>
            <li style="margin-bottom: 2px; font-size: 10px;">${t('conflictIntensity')}: ${(analysis.conflictIntensityScore * 100).toFixed(0)}%</li>
            <li style="margin-bottom: 2px; font-size: 10px;">${t('supportiveness')}: ${(analysis.supportivenessScore * 100).toFixed(0)}%</li>
            <li style="margin-bottom: 2px; font-size: 10px;">${t('apologyFrequency')}: ${(analysis.apologyFrequencyScore * 100).toFixed(0)}%</li>
          </ul>
        </div>
        
        <div style="margin-bottom: 8px;">
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: #000;">${t('exportPatterns')}</h2>
      `;

      analysis.sections.forEach((section) => {
        const title = formatSectionTitle(section);
        html += `
          <div style="margin-bottom: 8px; page-break-inside: avoid;">
            <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 3px; color: #000;">${title}</h3>
        `;
        
        if (section.score !== undefined) {
          html += `<p style="font-size: 9px; color: #666; margin: 0 0 4px 0;">${t('score')}: ${(section.score * 100).toFixed(0)}%</p>`;
        }
        
        html += `
            <p style="font-size: 10px; font-weight: bold; margin: 4px 0 2px 0; color: #000;">${t('scientificAnalysis')}:</p>
            <p style="margin: 0 0 4px 0; text-align: justify; word-wrap: break-word; font-size: 10px;">${replaceParticipantIds(section.summary)}</p>
        `;
        
        if (section.plainSummary) {
          html += `
            <p style="font-size: 10px; font-weight: bold; margin: 4px 0 2px 0; color: #000;">${t('plainLanguage')}:</p>
            <p style="margin: 0 0 4px 0; font-style: italic; color: #333; text-align: justify; word-wrap: break-word; font-size: 10px;">${replaceParticipantIds(section.plainSummary)}</p>
          `;
        }
        
        if (section.evidenceSnippets.length > 0) {
          html += `<p style="font-size: 10px; font-weight: bold; margin: 4px 0 2px 0; color: #000;">${t('exportEvidence')}:</p>`;
          section.evidenceSnippets.forEach((evidence) => {
            const formattedExcerpt = replaceParticipantIds(evidence.excerpt);
            const formattedExplanation = replaceParticipantIds(evidence.explanation);
            const participantInfo = formatParticipantName(formattedExcerpt);
            
            html += `
              <div style="margin: 4px 0; padding-left: 8px; border-left: 2px solid #22c55e; page-break-inside: avoid;">
            `;
            
            if (participantInfo) {
              html += `
                <p style="margin: 0 0 2px 0; font-weight: bold; font-style: italic; color: #22c55e; word-wrap: break-word; font-size: 9px;">
                  ${participantInfo.name}: "${participantInfo.remainingText}"
                </p>
              `;
            } else {
              html += `
                <p style="margin: 0 0 2px 0; font-style: italic; color: #22c55e; word-wrap: break-word; font-size: 9px;">
                  "${formattedExcerpt}"
                </p>
              `;
            }
            
            html += `
                <p style="margin: 0; font-size: 9px; color: #666; word-wrap: break-word;">${formattedExplanation}</p>
              </div>
            `;
          });
        }
        
        html += `</div>`;
      });

      html += `
        </div>
        <div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #ddd;">
          <p style="font-size: 7px; color: #999; margin: 0; text-align: center;">${t('exportGeneratedBy')}</p>
        </div>
      `;

      container.innerHTML = html;
      
      // Add to DOM - hidden but still renderable for html2canvas
      document.body.appendChild(container);
      
      // Force layout recalculation
      void container.offsetHeight;
      
      // Wait for fonts and rendering
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Verify element is actually visible
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        throw new Error('Container has zero dimensions');
      }

      // Get actual dimensions
      const containerWidth = container.scrollWidth || container.offsetWidth || 794;
      const containerHeight = container.scrollHeight || container.offsetHeight;
      
      console.log('Container dimensions:', { width: containerWidth, height: containerHeight });
      
      // Use html2canvas directly first to debug
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: containerWidth,
        height: containerHeight,
        windowWidth: containerWidth,
        windowHeight: containerHeight
      });
      
      console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas is empty');
      }
      
      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      const margin = 15; // Increased margins for better spacing
      const pageGap = 10; // Gap between pages when content is split
      const imgWidth = 210 - 2 * margin; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Add image to PDF with proper page breaks and margins
      const pageHeight = doc.internal.pageSize.getHeight();
      // Usable height per page: page height minus top margin, bottom margin, and gap (for pages that continue)
      // The gap creates visual separation between pages
      const usableHeight = pageHeight - margin - margin - pageGap;
      
      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeight / usableHeight);
      
      // Split image across pages with proper margins and spacing
      let sourceY = 0;
      let remainingHeight = imgHeight;
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          doc.addPage();
        }
        
        // Calculate how much of the image to show on this page
        // For pages that aren't the last, leave space for the gap
        const isLastPage = page === totalPages - 1;
        const heightOnThisPage = isLastPage 
          ? Math.min(remainingHeight, pageHeight - margin - margin) // Last page can use full height minus margins
          : Math.min(remainingHeight, usableHeight); // Other pages leave space for gap
        const sourceHeight = (heightOnThisPage / imgHeight) * canvas.height;
        
        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          // Draw the slice of the original canvas
          ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
          // Add to PDF with top margin
          doc.addImage(pageImgData, 'PNG', margin, margin, imgWidth, heightOnThisPage);
        }
        
        sourceY += sourceHeight;
        remainingHeight -= heightOnThisPage;
      }
      
      doc.save(`analysis-${analysis.id.substring(0, 8)}.pdf`);
      
      // Clean up
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(locale === 'ru' 
        ? 'Ошибка при создании PDF. Попробуйте экспортировать в TXT или JSON.' 
        : 'Error generating PDF. Please try exporting as TXT or JSON.');
    }
  };

  return (
    <div className="min-h-screen bg-background py-6 px-4 sm:py-8 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('analysisReport')}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isPremiumAnalysis
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'bg-muted text-muted-foreground border border-border/60'
                }`}
              >
                {isPremiumAnalysis ? t('premium_badge') : t('free_badge')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-0.5">{analysis.overviewSummary}</p>
            {isPremiumAnalysis ? (
              <p className="text-xs text-muted-foreground">
                {t('premium_hint')}
              </p>
            ) : (
              <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50/90 px-3 py-2 text-amber-900 shadow-inner dark:border-amber-600 dark:bg-amber-500/10 dark:text-amber-50">
                <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {t('free_badge')}
                </div>
                <p className="text-sm font-medium leading-snug">
                  {t('free_hint')}
                </p>
              </div>
            )}

            {/* Generic warning only when we fell back to a single default section without evidence */}
            {analysis.sections.length === 1 &&
              analysis.sections[0].id === 'default' &&
              (!analysis.sections[0].evidenceSnippets ||
                analysis.sections[0].evidenceSnippets.length === 0) && (
                <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-600 rounded-md bg-amber-50/80 dark:bg-amber-950/40 px-2.5 py-1.5">
                  <p className="font-medium mb-0.5">
                    {t('analysisGenericWarningTitle')}
                  </p>
                  <p>
                    {t('analysisGenericWarningBody')}
                  </p>
                </div>
              )}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button onClick={copySummary} variant="outline" size="sm">
              {copySuccess ? (locale === 'ru' ? 'Скопировано!' : 'Copied!') : (locale === 'ru' ? 'Копировать' : 'Copy Summary')}
            </Button>
            <Button onClick={exportTXT} variant="outline" size="sm">
              {t('exportTXT')}
            </Button>
            <Button onClick={exportJSON} variant="outline" size="sm">
              {t('exportJSON')}
            </Button>
            <Button onClick={exportPDF} variant="outline" size="sm">
              {t('exportPDF')}
            </Button>
          </div>
        </div>

        {/* Relationship Health Overview with inline radar chart */}
        <CardBase className="p-3 sm:p-4">
          <div className="mb-2">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              {t('relationship_health_title') || 'Relationship Health Overview'}
            </h2>
          </div>

          <div className="md:flex md:justify-end">
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 items-stretch w-full md:pl-6">
              {/* Textual metrics in 2x2 grid */}
              <div className="flex flex-col justify-between">
                <div className="grid grid-cols-2 grid-rows-2 gap-1.5 sm:gap-2 h-full">
                  {/* Gaslighting Risk */}
                  <div className="space-y-0.5 flex flex-col justify-between">
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                      {t('gaslightingRisk')}
                    </div>
                    <div
                      className={`text-sm sm:text-base font-bold ${
                        analysis.gaslightingRiskScore >= 0.7
                          ? 'text-red-600 dark:text-red-400'
                          : analysis.gaslightingRiskScore >= 0.4
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {(analysis.gaslightingRiskScore * 100).toFixed(0)}%
                    </div>
                    <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          analysis.gaslightingRiskScore >= 0.7
                            ? 'bg-red-500'
                            : analysis.gaslightingRiskScore >= 0.4
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${analysis.gaslightingRiskScore * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Conflict Intensity */}
                  <div className="space-y-0.5 flex flex-col justify-between">
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                      {t('conflictIntensity')}
                    </div>
                    <div
                      className={`text-sm sm:text-base font-bold ${
                        analysis.conflictIntensityScore >= 0.7
                          ? 'text-red-600 dark:text-red-400'
                          : analysis.conflictIntensityScore >= 0.4
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {(analysis.conflictIntensityScore * 100).toFixed(0)}%
                    </div>
                    <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          analysis.conflictIntensityScore >= 0.7
                            ? 'bg-red-500'
                            : analysis.conflictIntensityScore >= 0.4
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${analysis.conflictIntensityScore * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Supportiveness */}
                  <div className="space-y-0.5 flex flex-col justify-between">
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                      {t('supportiveness')}
                    </div>
                    <div
                      className={`text-sm sm:text-base font-bold ${
                        analysis.supportivenessScore >= 0.7
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : analysis.supportivenessScore >= 0.4
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {(analysis.supportivenessScore * 100).toFixed(0)}%
                    </div>
                    <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          analysis.supportivenessScore >= 0.7
                            ? 'bg-emerald-500'
                            : analysis.supportivenessScore >= 0.4
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${analysis.supportivenessScore * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Apology Frequency */}
                  <div className="space-y-0.5 flex flex-col justify-between">
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                      {t('apologyFrequency')}
                    </div>
                    <div
                      className={`text-sm sm:text-base font-bold ${
                        analysis.apologyFrequencyScore >= 0.7
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : analysis.apologyFrequencyScore >= 0.4
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {(analysis.apologyFrequencyScore * 100).toFixed(0)}%
                    </div>
                    <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          analysis.apologyFrequencyScore >= 0.7
                            ? 'bg-emerald-500'
                            : analysis.apologyFrequencyScore >= 0.4
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${analysis.apologyFrequencyScore * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inline radar chart */}
              <div className="flex items-center justify-center md:justify-end">
                <div className="w-full max-w-sm md:max-w-full h-full">
                  <AnalysisRadarChart analysis={analysis} variant="compact" />
                </div>
              </div>
            </div>
          </div>
        </CardBase>


        {analysis.participantProfiles && analysis.participantProfiles.length > 0 && (
          <Card className="p-3 sm:p-4 border border-primary/30 bg-primary/5 dark:bg-primary/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  {t('participant_profiles_title')}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t('participant_profiles_description')}
                </p>
              </div>
              <span className="text-[11px] uppercase tracking-wide text-primary font-semibold">
                {t('premium_badge')}
              </span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {analysis.participantProfiles.map((profile, idx) => {
                const matchedParticipant =
                  participants.find(
                    (p) => p.id === profile.participantId || p.displayName === profile.participantId
                  );
                const displayName = matchedParticipant?.displayName || profile.participantId;

                return (
                  <div
                    key={`${profile.participantId}-${idx}`}
                    className="rounded-lg border border-border/60 bg-background/80 px-3 py-2 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {profile.profile}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

         {/* Dashboard with all charts, heatmap and calendar (premium feature) */}
         {isPremiumAnalysis && analysis.importantDates && analysis.importantDates.length > 0 ? (
           <AnalysisDashboard
             analysis={analysis}
             activityByDay={activityByDay}
             importantDates={analysis.importantDates}
             conversationLanguage={conversationLanguage}
             locale={locale}
             onDateSelect={(importantDate: ImportantDate) => {
               // Try to scroll to a specific evidence snippet for this date
               if (!analysis) return;
               let target: HTMLElement | null = null;

               if (importantDate.sectionId) {
                 const sectionIndex = analysis.sections.findIndex(
                   (s) => s.id === importantDate.sectionId
                 );
                 const section =
                   sectionIndex >= 0 ? analysis.sections[sectionIndex] : undefined;

                 if (section) {
                   let evidenceIndex = -1;
                   if (importantDate.excerpt && section.evidenceSnippets?.length) {
                     evidenceIndex = section.evidenceSnippets.findIndex((e) => {
                       const ex = e.excerpt || '';
                       const targetEx = importantDate.excerpt || '';
                       return (
                         ex === targetEx ||
                         ex.includes(targetEx) ||
                         targetEx.includes(ex)
                       );
                     });
                   }

                   if (evidenceIndex >= 0) {
                     const id = `evidence-${section.id}-${evidenceIndex}`;
                     target = document.getElementById(id) as HTMLElement | null;
                   }

                   if (!target) {
                     const id = `section-${section.id}-${sectionIndex >= 0 ? sectionIndex : 0}`;
                     target = document.getElementById(id) as HTMLElement | null;
                   }
               }
               }

               if (!target) {
                 const container = document.querySelector(
                   '[data-analysis-sections="true"]'
                 ) as HTMLElement | null;
                 if (container) {
                   target = container;
                 }
               }

               if (target) {
                 target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 target.classList.add('evidence-highlight');
                 window.setTimeout(() => {
                   target.classList.remove('evidence-highlight');
                 }, 2200);
               }
             }}
           />
        ) : (
          <>
            {activityChartData.length > 1 && (
              <Card
                className="p-3 sm:p-4"
                style={{
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                  transform: 'translate3d(0, 0, 0)'
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">
                      {t('activity_chart_title')}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t('activity_chart_description')}
                    </p>
                  </div>
                </div>
                <div className="h-40 sm:h-48">
                  <ChartContainer
                    config={{
                      messages: {
                        label: t('activity_chart_messages_label'),
                        color: 'hsl(var(--primary))'
                      }
                    }}
                    className="w-full h-full"
                  >
                    <AreaChart data={activityChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="dateLabel"
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        allowDecimals={false}
                        width={28}
                      />
                      <Tooltip
                        contentStyle={{
                          fontSize: 11
                        }}
                        formatter={(value) =>
                          [
                            value,
                            t('activity_chart_messages_label')
                          ] as [string | number, string]
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="messageCount"
                        stroke="var(--color-messages, hsl(var(--primary)))"
                        fill="var(--color-messages, hsl(var(--primary) / 0.2))"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </Card>
            )}
          </>
        )}

         <div className="space-y-3 sm:space-y-4" data-analysis-sections="true">
           {analysis.sections.map((section: AnalysisSection, index: number) => {
             // Decide if we should even show \"what if\" replies for this section.
             // Only for clearly problematic patterns (medium+ scores).
             const sectionScore = section.score ?? 0;
             const isProblematicSection =
               section.id === 'gaslighting' || section.id === 'conflict';
             const shouldShowReplies =
               isPremiumAnalysis &&
               isProblematicSection &&
               sectionScore >= 0.35;

             return (
               <SectionCard
                 key={`${section.id}-${index}`}
                 section={section}
                 t={t}
                 locale={locale}
                 conversationLanguage={conversationLanguage}
                 isPremiumAnalysis={isPremiumAnalysis}
                 index={index}
                 shouldShowReplies={shouldShowReplies}
                 getSectionTitle={getSectionTitle}
                 replaceParticipantIds={replaceParticipantIds}
                 formatParticipantName={formatParticipantName}
               />
             );
           })}
         </div>

        {/* Disclaimers about purpose and limitations */}
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <p>{t('report_disclaimer_main')}</p>
          <p>{t('report_disclaimer_safety')}</p>
        </div>
      </div>
    </div>
  );
}
