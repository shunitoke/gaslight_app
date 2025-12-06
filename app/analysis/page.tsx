'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, X } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Button } from '../../components/ui/Button';
import { Card, CardBase } from '../../components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../components/ui/chart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/accordion';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
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
import { getQrImageUrl, WALLET_ADDRESSES, WalletInfo } from '../../lib/donations';

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

// Global cache for participant → color mapping (stable across renders/hot reloads)
const participantColorCache = new Map<string, string>();

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
  getSectionTitle: (sectionId: string, fallbackTitle: string) => string;
  replaceParticipantIds: (text: string) => string;
  formatParticipantName: (
    text: string
  ) => { name: string; remainingText: string } | null;
  getParticipantColor: (participantName: string) => string;
};

type SeverityLevel = 'low' | 'medium' | 'high';
type MetricPolarity = 'higher-worse' | 'higher-better';
type Tone = 'success' | 'warning' | 'danger';
type Polarity = 'higher-is-worse' | 'higher-is-better';
type Sentiment = 'negative' | 'positive' | 'neutral';

const getLevelFromPercent = (percentage: number): SeverityLevel => {
  if (percentage >= 70) return 'high';
  if (percentage >= 40) return 'medium';
  return 'low';
};

const getBadgeTone = (level: SeverityLevel, polarity: MetricPolarity): Tone => {
  if (polarity === 'higher-worse') {
    if (level === 'high') return 'danger';
    if (level === 'medium') return 'warning';
    return 'success';
  }
  // higher = better
  if (level === 'high') return 'success';
  if (level === 'medium') return 'warning';
  return 'danger';
};

const getToneFromMeta = (
  level: SeverityLevel,
  defaultPolarity: MetricPolarity,
  polarity?: Polarity,
  sentiment?: Sentiment
): Tone => {
  if (sentiment === 'negative') return 'danger';
  if (sentiment === 'positive') return 'success';
  if (sentiment === 'neutral') return 'warning';
  const mappedPolarity: MetricPolarity =
    polarity === 'higher-is-worse'
      ? 'higher-worse'
      : polarity === 'higher-is-better'
      ? 'higher-better'
      : defaultPolarity;
  return getBadgeTone(level, mappedPolarity);
};

const getLevelLabel = (level: SeverityLevel, locale: SupportedLocale): string => {
  if (level === 'high') return locale === 'ru' ? 'Высокий' : 'High';
  if (level === 'medium') return locale === 'ru' ? 'Средний' : 'Medium';
  return locale === 'ru' ? 'Низкий' : 'Low';
};

const getToneTextColor = (tone: Tone) => {
  if (tone === 'danger') return 'text-red-600 dark:text-red-500';
  if (tone === 'warning') return 'text-amber-600 dark:text-amber-500';
  return 'text-green-600 dark:text-green-500';
};

const getBadgeToneClass = (tone: Tone) => {
  if (tone === 'danger') return 'border-rose-600 bg-rose-600 text-white dark:border-rose-500 dark:bg-rose-500';
  if (tone === 'warning') return 'border-amber-500 bg-amber-500 text-white dark:border-amber-400 dark:bg-amber-400';
  return 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500';
};

function SectionCard({
  section,
  t,
  locale,
  conversationLanguage,
  isPremiumAnalysis,
  index,
  getSectionTitle,
  replaceParticipantIds,
  formatParticipantName,
  getParticipantColor
}: SectionCardProps) {
  const sectionTitle = getSectionTitle(section.id, section.title);
  const formattedSummary =
    section.summary && section.summary.trim()
      ? section.summary
      : t('analysisEmptySummary');

  return (
    <Card
      id={`section-${section.id}`}
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
        <div className="space-y-3 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">
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
                className="border-l-4 border-primary/50 pl-4 py-2.5 bg-muted/30 rounded-r-md"
              >
                {participantInfo ? (
                  <div className="mb-2">
                    <span className={`font-bold not-italic ${getParticipantColor(participantInfo.name)} text-sm sm:text-base mr-2 tracking-tight`}>
                      {participantInfo.name}:
                    </span>
                    <span className="italic text-sm sm:text-base text-foreground/95 leading-relaxed">
                      &ldquo;{participantInfo.remainingText}&rdquo;
                    </span>
                  </div>
                ) : (
                  <p className="italic text-sm sm:text-base text-foreground/95 leading-relaxed mb-1">
                    &ldquo;{formattedExcerpt}&rdquo;
                  </p>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                  {formattedExplanation}
                </p>
              </div>
            );
          })}
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
  const [selectedDateQuotes, setSelectedDateQuotes] = useState<{
    date: ImportantDate;
    quotes: Array<{ excerpt: string; explanation: string; sectionTitle: string }>;
  } | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const dataLoadedRef = useRef(false);

  const intlLocale = useMemo(() => {
    const map: Record<SupportedLocale, string> = {
      en: 'en-US',
      ru: 'ru-RU',
      fr: 'fr-FR',
      de: 'de-DE',
      es: 'es-ES',
      pt: 'pt-PT'
    };
    return map[locale] ?? 'en-US';
  }, [locale]);

  const formatPercent = (value: number) => `${Math.round(value)}%`;

  const transliterateCyrillic = (value: string): string => {
    const map: Record<string, string> = {
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
      и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
      с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
      щ: 'sch', ы: 'y', э: 'e', ю: 'yu', я: 'ya', ъ: '', ь: '',
    };
    return value.replace(/[А-Яа-яЁё]/g, (ch) => {
      const lower = ch.toLowerCase();
      const tr = map[lower] ?? '';
      return ch === ch.toUpperCase() ? tr.toUpperCase() : tr;
    });
  };

  /**
   * Replace participant IDs in text with display names
   * Simple replacement - assumes AI follows format: "Name: \"text\""
   */
  const replaceParticipantIds = useCallback((text: string): string => {
    let result = text;

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
  }, [participants]);

  const safeDisplayName = useCallback((name: string) => {
    const raw = name ?? '';
    const replaced = replaceParticipantIds(raw).trim();
    const display = replaced || raw.trim() || 'Participant';
    return display;
  }, [replaceParticipantIds]);

  const makeParticipantKey = useCallback((name: string) => {
    const display = safeDisplayName(name);
    const translit = transliterateCyrillic(display);
    const normalized = translit
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .trim();
    const fallback = display.toLowerCase().replace(/\s+/g, '');
    return { key: normalized || fallback, display };
  }, [safeDisplayName]);

  const aggregateNumericByParticipant = useCallback((
    entries: Record<string, number> | undefined,
    formatter: (value: number) => number = (v) => v
  ) => {
    if (!entries) return [];
    const acc = new Map<string, { display: string; value: number }>();
    Object.entries(entries).forEach(([participant, value]) => {
      const { key, display } = makeParticipantKey(participant);
      const prev = acc.get(key);
      acc.set(key, { display: prev?.display ?? display, value: (prev?.value ?? 0) + formatter(value) });
    });
    return Array.from(acc.values())
      .map(({ display, value }) => ({
        participant: display && display.trim() ? display : 'Participant',
        value
      }))
      .sort((a, b) => b.value - a.value);
  }, [makeParticipantKey]);

  const getLegacyParticipantLabel = useCallback(
    (idx: number) => {
      const p = participants[idx];
      if (p?.displayName?.trim()) return safeDisplayName(p.displayName);
      if (p?.id?.trim()) return safeDisplayName(p.id);
      return locale === 'ru' ? `Участник ${idx + 1}` : `Participant ${idx + 1}`;
    },
    [participants, locale, safeDisplayName]
  );

  const aggregatePromisesByParticipant = useCallback((entries: Record<string, { made: number; kept: number }> | undefined) => {
    if (!entries) return [];
    const acc = new Map<string, { display: string; made: number; kept: number }>();
    Object.entries(entries).forEach(([participant, data]) => {
      const { key, display } = makeParticipantKey(participant);
      const prev = acc.get(key) ?? { display, made: 0, kept: 0 };
      acc.set(key, { display: prev.display, made: prev.made + data.made, kept: prev.kept + data.kept });
    });
    return Array.from(acc.values()).map(({ display, made, kept }) => ({
      participant: display && display.trim() ? display : 'Participant',
      made,
      kept,
      percentage: made ? Math.round((kept / made) * 100) : 0
    }));
  }, [makeParticipantKey]);

  const aggregatedInitiatorBalance = useMemo(() => {
    return aggregateNumericByParticipant(analysis?.communicationStats?.initiatorBalance);
  }, [analysis?.communicationStats?.initiatorBalance, participants]);

  const aggregatedApologyCounts = useMemo(() => {
    return aggregateNumericByParticipant(analysis?.communicationStats?.apologyCount);
  }, [analysis?.communicationStats?.apologyCount, participants]);

  const aggregatedPromiseTracking = useMemo(() => {
    return aggregatePromisesByParticipant(analysis?.promiseTracking).sort((a, b) => b.percentage - a.percentage);
  }, [analysis?.promiseTracking, participants]);

  // Normalize framework diagnosis participant-specific fields (handles dynamic keys like "<name>UnmetNeeds")
  const normalizedNvcNeeds = useMemo(() => {
    const entries: Array<{ name: string; needs: string[] }> = [];
    const nvc = analysis?.frameworkDiagnosis?.nvc;
    if (!nvc) return entries;

    if (nvc.participantUnmetNeeds) {
      Object.entries(nvc.participantUnmetNeeds).forEach(([participant, needs]) => {
        if (Array.isArray(needs)) {
          entries.push({ name: replaceParticipantIds(participant), needs });
        }
      });
      return entries;
    }

    Object.entries(nvc).forEach(([key, value]) => {
      const m = key.match(/^(.*)UnmetNeeds$/i);
      if (m && Array.isArray(value)) {
        const rawName = m[1];
        entries.push({ name: replaceParticipantIds(rawName), needs: value as string[] });
      }
    });
    return entries;
  }, [analysis?.frameworkDiagnosis?.nvc, replaceParticipantIds]);

  const normalizedCbtDistortions = useMemo(() => {
    const entries: Array<{ name: string; distortions: Array<{ type: string; example: string }> }> = [];
    const cbt = analysis?.frameworkDiagnosis?.cbt;
    if (!cbt) return entries;

    if (cbt.participantDistortions) {
      Object.entries(cbt.participantDistortions).forEach(([participant, distortions]) => {
        if (Array.isArray(distortions)) {
          entries.push({ name: replaceParticipantIds(participant), distortions: distortions as Array<{ type: string; example: string }> });
        }
      });
      return entries;
    }

    Object.entries(cbt).forEach(([key, value]) => {
      const m = key.match(/^(.*)Distortions$/i);
      if (m && Array.isArray(value)) {
        const rawName = m[1];
        entries.push({ name: replaceParticipantIds(rawName), distortions: value as Array<{ type: string; example: string }> });
      }
    });
    return entries;
  }, [analysis?.frameworkDiagnosis?.cbt, replaceParticipantIds]);

  const normalizedAttachmentStyles = useMemo(() => {
    const entries: Array<{ name: string; style: string }> = [];
    const attachment = analysis?.frameworkDiagnosis?.attachment;
    if (!attachment) return entries;

    if (attachment.participantStyles) {
      Object.entries(attachment.participantStyles).forEach(([participant, style]) => {
        if (style) {
          entries.push({ name: replaceParticipantIds(participant), style: String(style) });
        }
      });
      return entries;
    }

    Object.entries(attachment).forEach(([key, value]) => {
      const m = key.match(/^(.*)Style$/i);
      if (m && value) {
        const rawName = m[1];
        entries.push({ name: replaceParticipantIds(rawName), style: String(value) });
      }
    });
    return entries;
  }, [analysis?.frameworkDiagnosis?.attachment, replaceParticipantIds]);

  // Calculate Emotional Safety Index based on all scores
  // Formula: Safety = (1 - negative factors) * positive factors
  // This ensures that high negative factors (gaslighting, conflict) reduce safety,
  // while positive factors (support, resolution) increase it, but can't exceed what negative factors allow
  const emotionalSafetyIndex = useMemo(() => {
    if (!analysis) return 0;
    
    // Negative factors reduce safety (0-1 scale, higher = worse)
    const negativeImpact = (analysis.gaslightingRiskScore * 0.5) + (analysis.conflictIntensityScore * 0.5);
    
    // Use resolutionRate if available, otherwise fallback to supportiveness
    const resolutionRate = analysis.communicationStats?.resolutionRate !== undefined 
      ? analysis.communicationStats.resolutionRate / 100 
      : analysis.supportivenessScore;
    
    // Positive factors (0-1 scale, higher = better)
    const positiveImpact = (analysis.supportivenessScore * 0.5) + (resolutionRate * 0.5);
    
    // Safety index: (1 - negative) * positive, clamped to 0-1
    // This ensures that even with high positive factors, high negative factors will reduce safety
    return Math.max(0, Math.min(1, (1 - negativeImpact) * positiveImpact));
  }, [analysis]);

  // Determine safety level
  const safetyLevel = useMemo(() => {
    if (emotionalSafetyIndex < 0.4) return 'low';
    if (emotionalSafetyIndex < 0.7) return 'medium';
    return 'high';
  }, [emotionalSafetyIndex]);

  const safetyBadgeTone = useMemo(
    () => getBadgeTone(getLevelFromPercent(emotionalSafetyIndex * 100), 'higher-better'),
    [emotionalSafetyIndex]
  );

  const gaslightingPercent = (analysis?.gaslightingRiskScore ?? 0) * 100;
  const gaslightingLevel = getLevelFromPercent(gaslightingPercent);
  const gaslightingTone = getToneFromMeta(
    gaslightingLevel,
    'higher-worse',
    analysis?.gaslightingRiskPolarity,
    analysis?.gaslightingRiskSentiment
  );

  const conflictPercent = (analysis?.conflictIntensityScore ?? 0) * 100;
  const conflictLevel = getLevelFromPercent(conflictPercent);
  const conflictTone = getToneFromMeta(
    conflictLevel,
    'higher-worse',
    analysis?.conflictIntensityPolarity,
    analysis?.conflictIntensitySentiment
  );

  const supportPercent = (analysis?.supportivenessScore ?? 0) * 100;
  const supportLevel = getLevelFromPercent(supportPercent);
  const supportTone = getToneFromMeta(
    supportLevel,
    'higher-better',
    analysis?.supportivenessPolarity,
    analysis?.supportivenessSentiment
  );

  const resolutionPercent = analysis?.communicationStats?.resolutionRate ?? 0;
  const resolutionLevel = getLevelFromPercent(resolutionPercent);
  const resolutionTone = getBadgeTone(resolutionLevel, 'higher-better');

  const activityChartData = useMemo(() => {
    if (!activityByDay || activityByDay.length === 0) return [];
    return activityByDay.map((day) => ({
      dateLabel: new Date(day.date).toLocaleDateString(
        intlLocale,
        { month: 'short', day: 'numeric', year: 'numeric' }
      ),
      messageCount: day.messageCount
    }));
  }, [activityByDay, intlLocale]);

  // Get localized safety level text
  const getSafetyLevelText = (level: SeverityLevel): string => {
    if (level === 'low') return t('hero_preview_score_low');
    if (level === 'medium') {
      const key = 'emotional_safety_medium' as keyof typeof t;
      return t(key) !== key ? t(key) : 'Medium';
    }
    const key = 'emotional_safety_high' as keyof typeof t;
    return t(key) !== key ? t(key) : 'High';
  };

  // Get progress bar color based on percentage (for negative metrics - higher = worse)
  const getNegativeProgressColor = (percentage: number): string => {
    // Match the color logic used for percentage text: >= 70% red, >= 40% orange/yellow, < 40% green
    // For negative metrics: higher = worse = redder
    if (percentage >= 70) {
      return 'bg-red-600 dark:bg-red-500';
    } else if (percentage >= 40) {
      return 'bg-orange-600 dark:bg-orange-500';
    } else {
      return 'bg-green-600 dark:bg-green-500';
    }
  };

  // Get progress bar color based on percentage (for positive metrics - higher = better)
  const getPositiveProgressColor = (percentage: number): string => {
    // Match the color logic used for percentage text: >= 70% green, >= 40% yellow, < 40% red
    if (percentage >= 70) {
      return 'bg-green-600 dark:bg-green-500';
    } else if (percentage >= 40) {
      return 'bg-yellow-600 dark:bg-yellow-500';
    } else {
      return 'bg-red-600 dark:bg-red-500';
    }
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

  const derivePrimaryLanguage = useCallback((conv: Conversation | null | undefined) => {
    if (!conv || !Array.isArray(conv.languageCodes) || conv.languageCodes.length === 0) {
      return 'unknown';
    }
    const firstLang = conv.languageCodes[0] || '';
    const shortLang = firstLang.slice(0, 2).toLowerCase();
    return (['en', 'ru', 'fr', 'de', 'es', 'pt'] as const).includes(shortLang as any)
      ? (shortLang as SupportedLocale)
      : 'unknown';
  }, []);

  const applyLoadedData = useCallback(
    (
      analysisData: AnalysisResult,
      participantsData: Participant[],
      activityData: DailyActivity[],
      primaryLanguage: SupportedLocale | 'unknown',
      isPremium: boolean
    ) => {
      const cacheKey = analysisData.id || 'default';
      const now = Date.now();
      analysisCache.set(cacheKey, {
        analysis: analysisData,
        participants: participantsData,
        isPremium,
        timestamp: now
      });

      setAnalysis(analysisData);
      setParticipants(participantsData);
      setIsPremiumAnalysis(isPremium);
      setActivityByDay(activityData);
      setConversationLanguage(primaryLanguage);
      setLoading(false);
    },
    []
  );

  // Load analysis data with caching optimization
  useEffect(() => {
    if (dataLoadedRef.current) return;
    dataLoadedRef.current = true;

    const loadAnalysisData = async () => {
      try {
        // Check if stored analysis matches current conversation
        const storedConversationId = sessionStorage.getItem('currentConversationId');
        const stored = sessionStorage.getItem('currentAnalysis');
        const storedConversation = sessionStorage.getItem('currentConversation');
        
        // Get current conversationId from stored conversation or use storedConversationId
        let currentConversationId: string | null = null;
        if (storedConversation) {
          try {
            const conv = JSON.parse(storedConversation) as Conversation;
            currentConversationId = conv.id;
          } catch (e) {
            // Ignore parse errors
          }
        }
        if (!currentConversationId && storedConversationId) {
          currentConversationId = storedConversationId;
        }
        
        // If conversationId doesn't match, clear old data
        if (storedConversationId && currentConversationId && storedConversationId !== currentConversationId) {
          console.log('[Analysis] Conversation ID mismatch, clearing old data:', {
            stored: storedConversationId,
            current: currentConversationId
          });
          sessionStorage.removeItem('currentAnalysis');
          sessionStorage.removeItem('currentConversation');
          sessionStorage.removeItem('currentActivityByDay');
          sessionStorage.removeItem('currentParticipants');
          sessionStorage.removeItem('currentConversationId');
          // Continue to fetch from server
        }
        const storedParticipants = sessionStorage.getItem('currentParticipants');
        const storedTier = sessionStorage.getItem('currentSubscriptionTier');
        const storedFeatures = sessionStorage.getItem('currentFeatures');
        const storedActivity = sessionStorage.getItem('currentActivityByDay');

        let participantsData: Participant[] = [];
        let activityData: DailyActivity[] = [];
        let primaryLanguage: SupportedLocale | 'unknown' = 'unknown';
        let parsedConversation: Conversation | null = null;

        if (storedParticipants) {
          try {
            participantsData = JSON.parse(storedParticipants);
          } catch {
            participantsData = [];
          }
        }
        if (storedActivity) {
          try {
            activityData = JSON.parse(storedActivity);
          } catch {
            activityData = [];
          }
        }
        if (storedConversation) {
          try {
            parsedConversation = JSON.parse(storedConversation) as Conversation;
            primaryLanguage = derivePrimaryLanguage(parsedConversation);
          } catch {
            parsedConversation = null;
            primaryLanguage = 'unknown';
          }
        }

        const tier = storedTier || 'free';
        let features: { canAnalyzeMedia?: boolean; canUseEnhancedAnalysis?: boolean } = {};
        if (storedFeatures) {
          try {
            features = JSON.parse(storedFeatures);
          } catch {
            features = {};
          }
        }
        const isPremium =
          tier === 'premium' ||
          features.canAnalyzeMedia === true ||
          features.canUseEnhancedAnalysis === true;

        const refetchFromServer = async () => {
          if (!currentConversationId) {
            throw new Error('No conversationId to refetch analysis');
          }
          const res = await fetch(
            `/api/analyze/result-by-conversation?conversationId=${currentConversationId}`
          );
          if (!res.ok) {
            throw new Error('Result not found');
          }
          const data = await res.json();
          if (!data?.analysis) {
            throw new Error('Result missing analysis payload');
          }
          const analysisData = data.analysis as AnalysisResult;
          const activityFromServer: DailyActivity[] = Array.isArray(data.activityByDay)
            ? data.activityByDay
            : [];
          const conversationFromServer = data.conversation as Conversation | undefined;
          const language = derivePrimaryLanguage(conversationFromServer ?? parsedConversation);

          sessionStorage.setItem('currentAnalysis', JSON.stringify(analysisData));
          sessionStorage.setItem('currentConversationId', currentConversationId);
          if (conversationFromServer) {
            sessionStorage.setItem('currentConversation', JSON.stringify(conversationFromServer));
          }
          if (activityFromServer.length > 0) {
            sessionStorage.setItem('currentActivityByDay', JSON.stringify(activityFromServer));
          }
          if (participantsData.length > 0) {
            sessionStorage.setItem('currentParticipants', JSON.stringify(participantsData));
          }
          sessionStorage.setItem('currentSubscriptionTier', tier);
          if (storedFeatures) {
            sessionStorage.setItem('currentFeatures', storedFeatures);
          }

          applyLoadedData(
            analysisData,
            participantsData,
            activityFromServer,
            language,
            isPremium
          );
        };

        if (!stored) {
          try {
            await refetchFromServer();
            return;
          } catch (fetchErr) {
            console.error('Error fetching analysis:', fetchErr);
            setError('No analysis found');
            setLoading(false);
            return;
          }
        }

        // Try to get from cache first
        let analysisData: AnalysisResult;

        try {
          analysisData = JSON.parse(stored);
          
          const cacheKey = analysisData.id || 'default';
          const cached = analysisCache.get(cacheKey);
          const now = Date.now();
          
          if (cached && (now - cached.timestamp) < CACHE_TTL) {
            // Use cached data
            applyLoadedData(
              cached.analysis,
              cached.participants,
              activityData,
              primaryLanguage,
              cached.isPremium
            );
            return;
          }

          // Store in cache + state
          applyLoadedData(
            analysisData,
            participantsData,
            activityData,
            primaryLanguage,
            isPremium
          );
        } catch (parseError) {
          console.error('Failed to parse analysis data:', parseError);
          try {
            await refetchFromServer();
            return;
          } catch (fetchErr) {
            console.error('Error fetching analysis after parse failure:', fetchErr);
            setError('Failed to parse analysis data');
            setLoading(false);
          }
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

  const getIsoDateForFileName = (dateString: string): string => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return 'unknown-date';
    return d.toISOString().slice(0, 10);
  };

  const getSafeIdForFileName = (id: string): string => {
    if (!id) return 'unknown';
    const cleaned = id.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!cleaned) return 'unknown';
    return cleaned.slice(-12);
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
    report += `${t('exportOverview')}: ${replaceParticipantIds(getOverviewSummaryText())}\n\n`;
    
    report += `${t('exportScores')}:\n`;
    report += `- ${t('gaslightingRisk')}: ${(analysis.gaslightingRiskScore * 100).toFixed(0)}%\n`;
    report += `- ${t('conflictIntensity')}: ${(analysis.conflictIntensityScore * 100).toFixed(0)}%\n`;
    report += `- ${t('supportiveness')}: ${(analysis.supportivenessScore * 100).toFixed(0)}%\n`;
    const resolutionLabel =
      locale === 'ru'
        ? 'Процент разрешённых конфликтов'
        : t('apologyFrequency');
    const resolutionValue = analysis.communicationStats?.resolutionRate ?? null;
    if (resolutionValue !== null) {
      report += `- ${resolutionLabel}: ${resolutionValue.toFixed(0)}%\n\n`;
    } else {
      report += '\n';
    }
    
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

    if (analysis.safetyConcern?.isPresent) {
      report += `\n${t('pdf_safety_concern_title')}:\n`;
      if (analysis.safetyConcern.behaviors?.length) {
        analysis.safetyConcern.behaviors.forEach((b) => {
          report += `- ${replaceParticipantIds(b)}\n`;
        });
      }
      if (analysis.safetyConcern.resources?.length) {
        report += `${t('pdf_safety_resources')}:\n`;
        analysis.safetyConcern.resources.forEach((r) => {
          report += `  - ${replaceParticipantIds(r)}\n`;
        });
      }
      report += '\n';
    }

    if (analysis.importantDates && analysis.importantDates.length > 0) {
      report += `${t('important_dates_label')}:\n`;
      analysis.importantDates.forEach((d) => {
        const dateStr = formatDate(d.date);
        const severity = d.severity !== undefined ? ` (${(d.severity * 100).toFixed(0)}%)` : '';
        report += `- ${dateStr}${severity}: ${replaceParticipantIds(d.reason)}\n`;
        if (d.excerpt) {
          report += `  "${replaceParticipantIds(d.excerpt)}"\n`;
        }
      });
      report += '\n';
    }

    if (analysis.participantProfiles && analysis.participantProfiles.length > 0) {
      report += `${t('participant_profiles_title')}:\n`;
      analysis.participantProfiles.forEach((p) => {
        const matchedParticipant =
          participants.find(
            (pt) => pt.id === p.participantId || pt.displayName === p.participantId
          );
        const displayName = matchedParticipant?.displayName || p.participantId;
        report += `- ${displayName}: ${replaceParticipantIds(p.profile)}\n`;
      });
      report += '\n';
    }

    if (analysis.realityCheck) {
      report += `${t('reality_check_title') ?? 'Reality check'}:\n`;
      if (analysis.realityCheck.whatParticipantWasRightAbout?.length) {
        report += `${t('reality_check_right') ?? 'What was right'}:\n`;
        analysis.realityCheck.whatParticipantWasRightAbout.forEach((item) => {
          report += `- ${replaceParticipantIds(item.participant)}: ${replaceParticipantIds(item.thought)} (evidence: ${replaceParticipantIds(item.evidence)})\n`;
        });
      }
      if (analysis.realityCheck.whatParticipantWasWrongAbout?.length) {
        report += `${t('reality_check_wrong') ?? 'What was wrong'}:\n`;
        analysis.realityCheck.whatParticipantWasWrongAbout.forEach((item) => {
          report += `- ${replaceParticipantIds(item.participant)}: ${replaceParticipantIds(item.accusation)} → ${replaceParticipantIds(item.reality)}\n`;
        });
      }
      if (analysis.realityCheck.whosePerceptionWasAccurate) {
        report += `${t('reality_check_whose') ?? 'Whose perception was accurate'}: ${replaceParticipantIds(analysis.realityCheck.whosePerceptionWasAccurate)}\n`;
      }
      report += '\n';
    }

    if (analysis.hardTruth) {
      report += `${t('hard_truth_title') ?? 'Hard truth'}:\n`;
      report += `- ${t('hard_truth_verdict') ?? 'Verdict'}: ${analysis.hardTruth.verdict}\n`;
      report += `- ${replaceParticipantIds(analysis.hardTruth.message)}\n`;
      if (analysis.hardTruth.abusiveBehaviors?.length) {
        report += `${t('hard_truth_abusive') ?? 'Abusive behaviors'}:\n`;
        analysis.hardTruth.abusiveBehaviors.forEach((b) => {
          report += `  - ${replaceParticipantIds(b)}\n`;
        });
      }
      report += '\n';
    }

    if (analysis.whatYouShouldKnow) {
      report += `${t('what_you_should_know_title') ?? 'What you should know'}:\n`;
      const pushList = (label: string, arr?: string[]) => {
        if (arr && arr.length) {
          report += `${label}:\n`;
          arr.forEach((item) => (report += `- ${replaceParticipantIds(item)}\n`));
        }
      };
      pushList(t('wysk_could_have_done') ?? 'Could have done differently', analysis.whatYouShouldKnow.couldHaveDoneDifferently);
      pushList(t('wysk_comm_tools') ?? 'Communication tools', analysis.whatYouShouldKnow.communicationTools);
      if (analysis.whatYouShouldKnow.couldHaveBeenSaved !== undefined) {
        report += `${t('wysk_could_be_saved') ?? 'Could the relationship be saved'}: ${analysis.whatYouShouldKnow.couldHaveBeenSaved ? 'Yes' : 'No'}\n`;
      }
      if (analysis.whatYouShouldKnow.whyNotFault) {
        report += `${t('wysk_why_not_fault') ?? 'Why it is not your fault'}: ${replaceParticipantIds(analysis.whatYouShouldKnow.whyNotFault)}\n`;
      }
      if (analysis.whatYouShouldKnow.whatMadeVulnerable) {
        report += `${t('wysk_what_made_vulnerable') ?? 'What made you vulnerable'}: ${replaceParticipantIds(analysis.whatYouShouldKnow.whatMadeVulnerable)}\n`;
      }
      pushList(t('wysk_patterns_to_watch') ?? 'Patterns to watch', analysis.whatYouShouldKnow.patternsToWatch);
      pushList(t('wysk_resources') ?? 'Resources', analysis.whatYouShouldKnow.resources);
      pushList(t('wysk_red_flags_next') ?? 'Red flags for next time', analysis.whatYouShouldKnow.redFlagsForNextTime);
      report += '\n';
    }

    if (analysis.closure) {
      report += `${t('pdf_closure_title')}:\n`;
      if (analysis.closure.whatWasRightAbout) report += `- ${t('pdf_closure_right')}: ${replaceParticipantIds(analysis.closure.whatWasRightAbout)}\n`;
      if (analysis.closure.whatWasDeserved) report += `- ${t('pdf_closure_deserved')}: ${replaceParticipantIds(analysis.closure.whatWasDeserved)}\n`;
      if (analysis.closure.whatWasGot) report += `- ${t('pdf_closure_got')}: ${replaceParticipantIds(analysis.closure.whatWasGot)}\n`;
      if (analysis.closure.permissionToMoveOn) report += `- ${t('pdf_closure_permission')}: ${replaceParticipantIds(analysis.closure.permissionToMoveOn)}\n`;
      if (analysis.closure.endStatement) report += `- ${t('pdf_closure_end')}: ${replaceParticipantIds(analysis.closure.endStatement)}\n`;
      report += '\n';
    }

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
   * Safely extract overview summary as a string
   * Handles cases where overviewSummary might be an object instead of a string
   */
  const getOverviewSummaryText = (): string => {
    if (!analysis || !analysis.overviewSummary) return '';
    
    const summary = analysis.overviewSummary;
    
    // If it's already a string, check if it's a JSON string that needs parsing
    if (typeof summary === 'string') {
      const trimmed = summary.trim();
      
      // First, try to extract using regex if it looks like JSON with overviewSummary
      if (trimmed.includes('"overviewSummary"') || trimmed.includes("'overviewSummary'")) {
        // Try to extract the value using regex (handles both complete and incomplete JSON)
        const regex = /"overviewSummary"\s*:\s*"((?:[^"\\]|\\.|\\n)*)"/;
        const match = trimmed.match(regex);
        if (match && match[1]) {
          // Unescape the string
          let extracted = match[1]
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\\\/g, '\\');
          return extracted;
        }
      }
      
      // Check if the string looks like a JSON object (starts with {)
      if (trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          // If it's a JSON object with overviewSummary property, extract it
          if (parsed && typeof parsed === 'object' && parsed !== null) {
            if ('overviewSummary' in parsed) {
              const extracted = parsed.overviewSummary;
              // Recursively extract if it's nested
              if (typeof extracted === 'string') {
                // Check if the extracted string is also a JSON object
                const extractedTrimmed = extracted.trim();
                if (extractedTrimmed.startsWith('{') && extractedTrimmed.includes('overviewSummary')) {
                  try {
                    const nestedParsed = JSON.parse(extractedTrimmed);
                    if (nestedParsed && typeof nestedParsed === 'object' && 'overviewSummary' in nestedParsed) {
                      const nestedExtracted = nestedParsed.overviewSummary;
                      if (typeof nestedExtracted === 'string') {
                        return nestedExtracted;
                      }
                    }
                  } catch {
                    // If nested parsing fails, try regex extraction
                    const nestedRegex = /"overviewSummary"\s*:\s*"((?:[^"\\]|\\.|\\n)*)"/;
                    const nestedMatch = extractedTrimmed.match(nestedRegex);
                    if (nestedMatch && nestedMatch[1]) {
                      return nestedMatch[1]
                        .replace(/\\"/g, '"')
                        .replace(/\\n/g, '\n')
                        .replace(/\\t/g, '\t')
                        .replace(/\\\\/g, '\\');
                    }
                  }
                }
                return extracted;
              }
            }
          }
        } catch {
          // If parsing fails, try regex extraction as fallback
          if (trimmed.includes('"overviewSummary"')) {
            const regex = /"overviewSummary"\s*:\s*"((?:[^"\\]|\\.|\\n)*)"/;
            const match = trimmed.match(regex);
            if (match && match[1]) {
              return match[1]
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t')
                .replace(/\\\\/g, '\\');
            }
          }
        }
      }
      // If it's a normal string (not JSON), return it
      return summary;
    }
    
    // If it's an object, try to extract the string value
    if (typeof summary === 'object' && summary !== null) {
      // Check if it has an overviewSummary property
      if ('overviewSummary' in summary) {
        const extracted = (summary as any).overviewSummary;
        if (typeof extracted === 'string') {
          return extracted;
        }
        // If it's nested, recursively call this logic
        if (typeof extracted === 'object' && extracted !== null && 'overviewSummary' in extracted) {
          const nestedExtracted = (extracted as any).overviewSummary;
          if (typeof nestedExtracted === 'string') {
            return nestedExtracted;
          }
        }
      }
    }
    
    return '';
  };

  /**
   * Get color for participant based on their index
   * Uses a consistent color palette for visual distinction
   */
  const participantColors = [
    'text-blue-600 dark:text-blue-400',
    'text-purple-600 dark:text-purple-400',
    'text-cyan-600 dark:text-cyan-400',
    'text-pink-600 dark:text-pink-400',
    'text-indigo-600 dark:text-indigo-400',
    'text-teal-600 dark:text-teal-400'
  ];

  const getParticipantColor = (participantName?: string): string => {
    const display = safeDisplayName(participantName || '');
    const { key } = makeParticipantKey(display);
    if (participantColorCache.has(key)) {
      return participantColorCache.get(key)!;
    }

    const nameLc = display.toLowerCase();

    const participantIndex = participants.findIndex(
      (p) =>
        p.displayName?.toLowerCase() === nameLc ||
        p.id?.toLowerCase().includes(nameLc.replace(/\s+/g, '_'))
    );

    let color: string;
    if (participantIndex === -1) {
      const found = participants.find((p) => p.displayName?.toLowerCase() === nameLc);
      if (found) {
        const idx = participants.indexOf(found);
        color = participantColors[idx % participantColors.length] || 'text-primary';
      } else {
        const hash = key.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        color = participantColors[hash % participantColors.length] || 'text-primary';
      }
    } else {
      color = participantColors[participantIndex % participantColors.length] || 'text-primary';
    }

    participantColorCache.set(key, color);
    return color;
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
    const fileDate = getIsoDateForFileName(analysis.createdAt);
    const safeId = getSafeIdForFileName(analysis.id);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${fileDate}-${safeId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const mapEvidence = (e: typeof analysis.sections[number]['evidenceSnippets'][number]) => ({
      excerpt: replaceParticipantIds(e.excerpt),
      explanation: replaceParticipantIds(e.explanation),
      messageId: e.messageId,
      mediaArtifactId: e.mediaArtifactId
    });

    const data = {
      analysisId: analysis.id,
      conversationId: analysis.conversationId,
      createdAt: analysis.createdAt,
      locale,
      version: analysis.version,
      overview: getOverviewSummaryText(),
      scores: {
        gaslightingRisk: analysis.gaslightingRiskScore,
        conflictIntensity: analysis.conflictIntensityScore,
        supportiveness: analysis.supportivenessScore,
        apologyFrequency: analysis.apologyFrequencyScore,
        conflictResolutionRate: analysis.communicationStats?.resolutionRate ?? null,
        otherPatternScores: analysis.otherPatternScores
      },
      communicationStats: analysis.communicationStats,
      promiseTracking: analysis.promiseTracking,
      redFlagCounts: analysis.redFlagCounts,
      emotionalCycle: analysis.emotionalCycle,
      timePatterns: analysis.timePatterns,
      contradictions: analysis.contradictions,
      realityCheck: analysis.realityCheck
        ? {
            whatParticipantWasRightAbout: analysis.realityCheck.whatParticipantWasRightAbout?.map((item) => ({
              participant: replaceParticipantIds(item.participant),
              thought: replaceParticipantIds(item.thought),
              evidence: replaceParticipantIds(item.evidence)
            })),
            whatParticipantWasWrongAbout: analysis.realityCheck.whatParticipantWasWrongAbout?.map((item) => ({
              participant: replaceParticipantIds(item.participant),
              accusation: replaceParticipantIds(item.accusation),
              reality: replaceParticipantIds(item.reality)
            })),
            whosePerceptionWasAccurate: replaceParticipantIds(analysis.realityCheck.whosePerceptionWasAccurate)
          }
        : undefined,
      frameworkDiagnosis: analysis.frameworkDiagnosis,
      hardTruth: analysis.hardTruth
        ? {
            verdict: analysis.hardTruth.verdict,
            message: replaceParticipantIds(analysis.hardTruth.message),
            abusiveBehaviors: analysis.hardTruth.abusiveBehaviors?.map((b) => replaceParticipantIds(b))
          }
        : undefined,
      whatYouShouldKnow: analysis.whatYouShouldKnow
        ? {
            couldHaveDoneDifferently: analysis.whatYouShouldKnow.couldHaveDoneDifferently?.map((i) => replaceParticipantIds(i)),
            communicationTools: analysis.whatYouShouldKnow.communicationTools?.map((i) => replaceParticipantIds(i)),
            couldHaveBeenSaved: analysis.whatYouShouldKnow.couldHaveBeenSaved,
            whyNotFault: analysis.whatYouShouldKnow.whyNotFault
              ? replaceParticipantIds(analysis.whatYouShouldKnow.whyNotFault)
              : undefined,
            whatMadeVulnerable: analysis.whatYouShouldKnow.whatMadeVulnerable
              ? replaceParticipantIds(analysis.whatYouShouldKnow.whatMadeVulnerable)
              : undefined,
            patternsToWatch: analysis.whatYouShouldKnow.patternsToWatch?.map((i) => replaceParticipantIds(i)),
            resources: analysis.whatYouShouldKnow.resources?.map((i) => replaceParticipantIds(i)),
            redFlagsForNextTime: analysis.whatYouShouldKnow.redFlagsForNextTime?.map((i) => replaceParticipantIds(i))
          }
        : undefined,
      sections: analysis.sections.map((s) => ({
        id: s.id,
        title: s.title,
        summary: replaceParticipantIds(s.summary),
        plainSummary: s.plainSummary ? replaceParticipantIds(s.plainSummary) : undefined,
        score: s.score,
        evidenceSnippets: s.evidenceSnippets.map(mapEvidence)
      })),
      participantProfiles: analysis.participantProfiles?.map((p) => ({
        participantId: p.participantId,
        profile: replaceParticipantIds(p.profile)
      })),
      importantDates: analysis.importantDates?.map((d) => ({
        ...d,
        reason: replaceParticipantIds(d.reason),
        excerpt: d.excerpt ? replaceParticipantIds(d.excerpt) : undefined
      })),
      closure: analysis.closure
        ? {
            whatWasRightAbout: replaceParticipantIds(analysis.closure.whatWasRightAbout),
            whatWasDeserved: replaceParticipantIds(analysis.closure.whatWasDeserved),
            whatWasGot: replaceParticipantIds(analysis.closure.whatWasGot),
            permissionToMoveOn: replaceParticipantIds(analysis.closure.permissionToMoveOn),
            endStatement: replaceParticipantIds(analysis.closure.endStatement)
          }
        : undefined,
      safetyConcern: analysis.safetyConcern
        ? {
            isPresent: analysis.safetyConcern.isPresent,
            behaviors: analysis.safetyConcern.behaviors?.map((b) => replaceParticipantIds(b)),
            resources: analysis.safetyConcern.resources?.map((r) => replaceParticipantIds(r))
          }
        : undefined
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileDate = getIsoDateForFileName(analysis.createdAt);
    const safeId = getSafeIdForFileName(analysis.id);
    a.download = `analysis-${fileDate}-${safeId}.json`;
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
      
      // Import escapeHtml for XSS protection
      const { escapeHtml } = await import('../../lib/utils');
      
      // Build HTML content with escaped user data to prevent XSS
      let html = `
        <div style="margin-bottom: 8px;">
          <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 4px; color: #000;">${escapeHtml(t('exportReportTitle'))}</h1>
          <p style="font-size: 9px; color: #666; margin: 0;">${escapeHtml(formatDate(analysis.createdAt))}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: #000;">${escapeHtml(t('exportOverview'))}</h2>
          <p style="margin: 0; text-align: justify; word-wrap: break-word; font-size: 10px;">${escapeHtml(replaceParticipantIds(getOverviewSummaryText()))}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: #000;">${escapeHtml(t('exportScores'))}</h2>
          <ul style="margin: 0; padding-left: 12px;">
            <li style="margin-bottom: 2px; font-size: 10px;">${escapeHtml(t('gaslightingRisk'))}: ${(analysis.gaslightingRiskScore * 100).toFixed(0)}%</li>
            <li style="margin-bottom: 2px; font-size: 10px;">${escapeHtml(t('conflictIntensity'))}: ${(analysis.conflictIntensityScore * 100).toFixed(0)}%</li>
            <li style="margin-bottom: 2px; font-size: 10px;">${escapeHtml(t('supportiveness'))}: ${(analysis.supportivenessScore * 100).toFixed(0)}%</li>
            <li style="margin-bottom: 2px; font-size: 10px;">${escapeHtml(t('apologyFrequency'))}: ${(analysis.apologyFrequencyScore * 100).toFixed(0)}%</li>
          </ul>
        </div>
        
        <div style="margin-bottom: 8px;">
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: #000;">${escapeHtml(t('exportPatterns'))}</h2>
      `;

      analysis.sections.forEach((section) => {
        const title = formatSectionTitle(section);
        html += `
          <div style="margin-bottom: 8px; page-break-inside: avoid;">
            <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 3px; color: #000;">${escapeHtml(title)}</h3>
        `;
        
        if (section.score !== undefined) {
          html += `<p style="font-size: 9px; color: #666; margin: 0 0 4px 0;">${escapeHtml(t('score'))}: ${(section.score * 100).toFixed(0)}%</p>`;
        }
        
        html += `
            <p style="font-size: 10px; font-weight: bold; margin: 4px 0 2px 0; color: #000;">${escapeHtml(t('scientificAnalysis'))}:</p>
            <p style="margin: 0 0 4px 0; text-align: justify; word-wrap: break-word; font-size: 10px;">${escapeHtml(replaceParticipantIds(section.summary))}</p>
        `;
        
        if (section.plainSummary) {
          html += `
            <p style="font-size: 10px; font-weight: bold; margin: 4px 0 2px 0; color: #000;">${escapeHtml(t('plainLanguage'))}:</p>
            <p style="margin: 0 0 4px 0; font-style: italic; color: #333; text-align: justify; word-wrap: break-word; font-size: 10px;">${escapeHtml(replaceParticipantIds(section.plainSummary))}</p>
          `;
        }
        
        if (section.evidenceSnippets.length > 0) {
          html += `<p style="font-size: 10px; font-weight: bold; margin: 4px 0 2px 0; color: #000;">${escapeHtml(t('exportEvidence'))}:</p>`;
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
                  ${escapeHtml(participantInfo.name)}: "${escapeHtml(participantInfo.remainingText)}"
                </p>
              `;
            } else {
              html += `
                <p style="margin: 0 0 2px 0; font-style: italic; color: #22c55e; word-wrap: break-word; font-size: 9px;">
                  "${escapeHtml(formattedExcerpt)}"
                </p>
              `;
            }
            
            html += `
                <p style="margin: 0; font-size: 9px; color: #666; word-wrap: break-word;">${escapeHtml(formattedExplanation)}</p>
              </div>
            `;
          });
        }

        html += `</div>`;
      });

      if (analysis.participantProfiles && analysis.participantProfiles.length > 0) {
        html += `
          <div style="margin-top: 10px; padding: 8px; border: 1px solid #dbeafe; background: #eff6ff; page-break-inside: avoid;">
            <h2 style="font-size: 13px; font-weight: bold; margin: 0 0 4px 0; color: #1d4ed8;">${escapeHtml(t('participant_profiles_title'))}</h2>
            <ul style="margin: 0; padding-left: 12px; font-size: 9px; color: #0f172a; line-height: 1.5;">
              ${analysis.participantProfiles
                .map((p) => {
                  const matchedParticipant =
                    participants.find(
                      (pt) => pt.id === p.participantId || pt.displayName === p.participantId
                    );
                  const displayName = matchedParticipant?.displayName || p.participantId;
                  return `<li><strong>${escapeHtml(displayName)}:</strong> ${escapeHtml(replaceParticipantIds(p.profile))}</li>`;
                })
                .join('')}
            </ul>
          </div>
        `;
      }

      if (analysis.importantDates && analysis.importantDates.length > 0) {
        html += `
          <div style="margin-top: 10px; padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb; page-break-inside: avoid;">
            <h2 style="font-size: 13px; font-weight: bold; margin: 0 0 4px 0; color: #111827;">${escapeHtml(t('important_dates_label'))}</h2>
            <ul style="margin: 0; padding-left: 12px; font-size: 9px; color: #111827; line-height: 1.5;">
              ${analysis.importantDates
                .map((d) => {
                  const dateStr = formatDate(d.date);
                  const severity = d.severity !== undefined ? ` (${(d.severity * 100).toFixed(0)}%)` : '';
                  const excerpt = d.excerpt ? `<div style="margin: 2px 0 0 0; font-style: italic; color: #4b5563;">"${escapeHtml(replaceParticipantIds(d.excerpt))}"</div>` : '';
                  return `<li><strong>${dateStr}${severity}:</strong> ${escapeHtml(replaceParticipantIds(d.reason))}${excerpt}</li>`;
                })
                .join('')}
            </ul>
          </div>
        `;
      }

      if (analysis.safetyConcern && analysis.safetyConcern.isPresent) {
        html += `
          <div style="margin-top: 10px; padding: 8px; border: 1px solid #f87171; background: #fef2f2; page-break-inside: avoid;">
            <h2 style="font-size: 13px; font-weight: bold; margin: 0 0 4px 0; color: #b91c1c;">${escapeHtml(t('pdf_safety_concern_title'))}</h2>
            <p style="margin: 0 0 4px 0; font-size: 10px; color: #7f1d1d;">${escapeHtml(t('pdf_safety_concern_intro'))}</p>
            <ul style="margin: 0 0 4px 0; padding-left: 12px; color: #7f1d1d; font-size: 9px;">
              ${analysis.safetyConcern.behaviors.map((b) => `<li>${escapeHtml(replaceParticipantIds(b))}</li>`).join('')}
            </ul>
            ${
              analysis.safetyConcern.resources && analysis.safetyConcern.resources.length
                ? `
                  <p style="margin: 0 0 2px 0; font-size: 10px; font-weight: bold; color: #7f1d1d;">${escapeHtml(t('pdf_safety_resources'))}:</p>
                  <ul style="margin: 0; padding-left: 12px; color: #7f1d1d; font-size: 9px;">
                    ${analysis.safetyConcern.resources.map((r) => `<li>${escapeHtml(replaceParticipantIds(r))}</li>`).join('')}
                  </ul>
                `
                : ''
            }
          </div>
        `;
      }

      if (analysis.closure) {
        html += `
          <div style="margin-top: 10px; padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb; page-break-inside: avoid;">
            <h2 style="font-size: 13px; font-weight: bold; margin: 0 0 6px 0; color: #111827;">${escapeHtml(t('pdf_closure_title'))}</h2>
            <ul style="margin: 0; padding-left: 12px; font-size: 9px; color: #111827; line-height: 1.45;">
              ${analysis.closure.whatWasRightAbout ? `<li><strong>${escapeHtml(t('pdf_closure_right'))}:</strong> ${escapeHtml(replaceParticipantIds(analysis.closure.whatWasRightAbout))}</li>` : ''}
              ${analysis.closure.whatWasDeserved ? `<li><strong>${escapeHtml(t('pdf_closure_deserved'))}:</strong> ${escapeHtml(replaceParticipantIds(analysis.closure.whatWasDeserved))}</li>` : ''}
              ${analysis.closure.whatWasGot ? `<li><strong>${escapeHtml(t('pdf_closure_got'))}:</strong> ${escapeHtml(replaceParticipantIds(analysis.closure.whatWasGot))}</li>` : ''}
              ${analysis.closure.permissionToMoveOn ? `<li><strong>${escapeHtml(t('pdf_closure_permission'))}:</strong> ${escapeHtml(replaceParticipantIds(analysis.closure.permissionToMoveOn))}</li>` : ''}
              ${analysis.closure.endStatement ? `<li><strong>${escapeHtml(t('pdf_closure_end'))}:</strong> ${escapeHtml(replaceParticipantIds(analysis.closure.endStatement))}</li>` : ''}
            </ul>
          </div>
        `;
      }

      html += `
        </div>
        <div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #ddd;">
          <p style="font-size: 7px; color: #999; margin: 0; text-align: center;">${escapeHtml(t('exportGeneratedBy'))}</p>
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
      
      const fileDate = getIsoDateForFileName(analysis.createdAt);
      const safeId = getSafeIdForFileName(analysis.id);
      doc.save(`analysis-${fileDate}-${safeId}.pdf`);
      
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
            <p className="text-base sm:text-lg text-muted-foreground mb-2 leading-relaxed">{replaceParticipantIds(getOverviewSummaryText())}</p>
            {isPremiumAnalysis ? (
              <p className="text-xs text-muted-foreground">
                {t('premium_hint')}
              </p>
            ) : (
              <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50/90 px-3 py-2 text-amber-900 shadow-inner dark:border-amber-600 dark:bg-amber-500/10 dark:text-amber-50">
                <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
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

        {/* Main Report Content with Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview">
              {locale === 'ru' ? 'Обзор' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="patterns">
              {locale === 'ru' ? 'Паттерны' : 'Patterns'}
            </TabsTrigger>
            <TabsTrigger value="statistics">
              {locale === 'ru' ? 'Статистика' : 'Statistics'}
            </TabsTrigger>
            <TabsTrigger value="insights">
              {locale === 'ru' ? 'Инсайты' : 'Insights'}
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-5">
            {/* Relationship Health Overview with inline radar chart */}
            <CardBase className="p-4 sm:p-5">
          <div className="mb-4 sm:mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {t('relationship_health_title') || 'Relationship Health Overview'}
            </h2>
            {analysis && (
              <div className="flex items-center gap-2">
                <div className={`text-lg sm:text-xl font-bold ${getToneTextColor(safetyBadgeTone)}`}>
                  {(emotionalSafetyIndex * 100).toFixed(0)}%
                </div>
                <Badge
                  variant="outline"
                  tone={safetyBadgeTone}
                  size="sm"
                >
                  {getSafetyLevelText(safetyLevel)}
                </Badge>
              </div>
            )}
          </div>

          <div className="md:flex md:justify-end md:items-start">
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 items-stretch w-full md:pl-6">
              {/* Textual metrics in 2x2 grid */}
              <div className="flex flex-col justify-between">
                <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 h-full">
                  {/* Gaslighting Risk */}
                  <CardBase 
                    className="p-3 sm:p-4 h-full"
                    style={{
                      backgroundColor: 'hsl(var(--card) / 0.95)',
                    }}
                  >
                    <div className="flex flex-col justify-between gap-1.5 h-full">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`text-lg sm:text-xl font-bold ${getToneTextColor(gaslightingTone)}`}
                        >
                          {gaslightingPercent.toFixed(0)}%
                        </div>
                      <Badge
                        variant="outline"
                        tone={gaslightingTone}
                        size="sm"
                      >
                          {getLevelLabel(gaslightingLevel, locale)}
                        </Badge>
                      </div>
                      <div className="space-y-0">
                        <div className="text-xs text-muted-foreground">
                          {t('gaslightingRisk')}
                        </div>
                        <Progress
                          value={analysis.gaslightingRiskScore * 100}
                          className="h-1.5 sm:h-2"
                          indicatorClassName={getNegativeProgressColor(analysis.gaslightingRiskScore * 100)}
                        />
                      </div>
                    </div>
                  </CardBase>

                  {/* Conflict Intensity */}
                  <CardBase 
                    className="p-3 sm:p-4 h-full"
                    style={{
                      backgroundColor: 'hsl(var(--card) / 0.95)',
                    }}
                  >
                    <div className="flex flex-col justify-between gap-1.5 h-full">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`text-lg sm:text-xl font-bold ${getToneTextColor(conflictTone)}`}
                        >
                          {conflictPercent.toFixed(0)}%
                        </div>
                      <Badge
                        variant="outline"
                        tone={conflictTone}
                        size="sm"
                      >
                          {getLevelLabel(conflictLevel, locale)}
                        </Badge>
                      </div>
                      <div className="space-y-0">
                        <div className="text-xs text-muted-foreground">
                          {t('conflictIntensity')}
                        </div>
                        <Progress
                          value={analysis.conflictIntensityScore * 100}
                          className="h-1.5 sm:h-2"
                          indicatorClassName={getNegativeProgressColor(analysis.conflictIntensityScore * 100)}
                        />
                      </div>
                    </div>
                  </CardBase>

                  {/* Supportiveness */}
                  <CardBase 
                    className="p-3 sm:p-4 h-full"
                    style={{
                      backgroundColor: 'hsl(var(--card) / 0.95)',
                    }}
                  >
                    <div className="flex flex-col justify-between gap-1.5 h-full">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`text-lg sm:text-xl font-bold ${getToneTextColor(supportTone)}`}
                        >
                          {supportPercent.toFixed(0)}%
                        </div>
                      <Badge
                        variant="outline"
                        tone={supportTone}
                        size="sm"
                      >
                          {getLevelLabel(supportLevel, locale)}
                        </Badge>
                      </div>
                      <div className="space-y-0">
                        <div className="text-xs text-muted-foreground">
                          {t('supportiveness')}
                        </div>
                        <Progress
                          value={analysis.supportivenessScore * 100}
                          className="h-1.5 sm:h-2"
                          indicatorClassName={getPositiveProgressColor(analysis.supportivenessScore * 100)}
                        />
                      </div>
                    </div>
                  </CardBase>

                  {/* Conflict Resolution */}
                  <CardBase 
                    className="p-3 sm:p-4 h-full"
                    style={{
                      backgroundColor: 'hsl(var(--card) / 0.95)',
                    }}
                  >
                    <div className="flex flex-col justify-between gap-1.5 h-full">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`text-lg sm:text-xl font-bold ${getToneTextColor(resolutionTone)}`}
                        >
                          {resolutionPercent.toFixed(0)}%
                        </div>
                      <Badge
                        variant="outline"
                        tone={resolutionTone}
                        size="sm"
                      >
                          {getLevelLabel(resolutionLevel, locale)}
                        </Badge>
                      </div>
                      <div className="space-y-0">
                        <div className="text-xs text-muted-foreground">
                          {locale === 'ru' ? 'Разрешение конфликтов' : 'Conflict Resolution'}
                        </div>
                        <Progress
                          value={analysis.communicationStats?.resolutionRate ?? 0}
                          className="h-1.5 sm:h-2"
                          indicatorClassName={getPositiveProgressColor(analysis.communicationStats?.resolutionRate ?? 0)}
                        />
                      </div>
                    </div>
                  </CardBase>
                </div>
              </div>

              {/* Inline radar chart */}
              <div className="flex items-center justify-center md:justify-end md:items-start">
                <div className="w-full max-w-md md:max-w-full h-full">
                  <AnalysisRadarChart 
                    analysis={analysis} 
                    variant="compact"
                    primaryMetricColor={(() => {
                      // Use emotionalSafetyIndex color to match the top-right indicator
                      // Match safetyLevel logic: < 0.4 = red (low), < 0.7 = yellow (medium), >= 0.7 = green (high)
                      if (emotionalSafetyIndex >= 0.7) {
                        return 'hsl(142 71% 45%)'; // green-600 (High = green)
                      } else if (emotionalSafetyIndex >= 0.4) {
                        return 'hsl(45 93% 47%)'; // yellow-600 (Medium = yellow)
                      } else {
                        // < 0.4 = red (Low, matches "40% Низкий" indicator)
                        return 'hsl(0 72% 51%)'; // red-600
                      }
                    })()}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardBase>


            {analysis.participantProfiles && analysis.participantProfiles.length > 0 && (
              <CardBase className="p-3 sm:p-4 border border-primary/30 bg-primary/5 dark:bg-primary/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  {t('participant_profiles_title')}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t('participant_profiles_description')}
                </p>
              </div>
              <span className="text-xs uppercase tracking-wide text-primary font-semibold">
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
            </CardBase>
            )}

            {/* Dashboard with all charts, heatmap and calendar (premium feature) */}
         {isPremiumAnalysis && (activityByDay.length > 0 || (analysis.importantDates?.length ?? 0) > 0) ? (
           <AnalysisDashboard
             analysis={analysis}
             activityByDay={activityByDay}
             importantDates={analysis.importantDates || []}
             conversationLanguage={conversationLanguage}
             locale={locale}
             onDateSelect={(importantDate: ImportantDate) => {
               // Collect quotes that are specifically related to this date
               // Only show quotes that match the excerpt from importantDate
               if (!analysis) return;
               
               const quotes: Array<{ excerpt: string; explanation: string; sectionTitle: string }> = [];
               
               // If there's a specific excerpt, use it to find matching quotes
               if (importantDate.excerpt) {
                 const targetExcerpt = importantDate.excerpt.trim();
                 
                 // Search in the specified section first, then all sections
                 const sectionsToSearch = importantDate.sectionId
                   ? [analysis.sections.find((s) => s.id === importantDate.sectionId)].filter(Boolean)
                   : analysis.sections;
                 
                 sectionsToSearch.forEach((section) => {
                   if (!section || !section.evidenceSnippets) return;
                   
                   const sectionTitle = getSectionTitle(section.id, section.title);
                   
                   section.evidenceSnippets.forEach((evidence) => {
                     const evidenceExcerpt = evidence.excerpt?.trim() || '';
                     
                     // Try to match: exact match, or excerpt is contained in evidence, or evidence is contained in excerpt
                     // Also check if the quotes are similar (normalize for whitespace and quotes)
                     const normalizedTarget = targetExcerpt.replace(/[""]/g, '"').replace(/\s+/g, ' ').trim();
                     const normalizedEvidence = evidenceExcerpt.replace(/[""]/g, '"').replace(/\s+/g, ' ').trim();
                     
                     const isMatch =
                       normalizedEvidence === normalizedTarget ||
                       normalizedEvidence.includes(normalizedTarget) ||
                       normalizedTarget.includes(normalizedEvidence) ||
                       // Check if the core quote text (after participant name) matches
                       (normalizedEvidence.includes(':') && normalizedTarget.includes(':') &&
                        normalizedEvidence.split(':').slice(1).join(':').trim() === normalizedTarget.split(':').slice(1).join(':').trim());
                     
                     if (isMatch) {
                       // Avoid duplicates
                       const alreadyAdded = quotes.some(
                         (q) => q.excerpt.trim() === evidenceExcerpt
                       );
                       if (!alreadyAdded) {
                         quotes.push({
                           excerpt: replaceParticipantIds(evidence.excerpt),
                           explanation: replaceParticipantIds(evidence.explanation),
                           sectionTitle
                         });
                       }
                     }
                   });
                 });
               }
               
               // Only show modal if we found matching quotes
               // Don't show all quotes from a section - only those specifically related to this date
               if (quotes.length > 0) {
                 setSelectedDateQuotes({
                   date: importantDate,
                   quotes
                 });
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
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
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
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            className="bg-background text-foreground"
                            formatter={(value) =>
                              [
                                value,
                                t('activity_chart_messages_label')
                              ] as [string | number, string]
                            }
                          />
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
          </TabsContent>

          {/* PATTERNS TAB */}
          <TabsContent value="patterns" className="space-y-4 sm:space-y-5">
            <Accordion type="multiple" className="w-full space-y-3 sm:space-y-4" data-analysis-sections="true">
              {analysis.sections.map((section: AnalysisSection, index: number) => {
                const sectionScore = section.score ?? 0;
                const { isProblematicSection, isAvoidance } = (() => {
                  const id = (section.id || '').toLowerCase();
                  const title = (section.title || '').toLowerCase();
                  // Prefer stable IDs; fall back to localized keyword detection.
                  const negativeIds = [
                    'gaslighting',
                    'conflict',
                    'jealousy',
                    'devaluation',
                    'manipulation',
                    'abuse',
                    'toxicity',
                    'control',
                    'boundary',
                    'attachment',
                    'avoidance',
                    'avoidant',
                    'avoid',
                    'financial',
                    'finance',
                    'money'
                  ];
                  const negativeKeywords = [
                    // English
                    'gaslight', 'conflict', 'jealous', 'devalu', 'manip', 'control', 'abuse', 'toxic',
                    'attachment', 'avoidant', 'avoidance', 'avoid', 'anxious', 'financial', 'money', 'finance',
                    // Russian
                    'конфл', 'ревн', 'ревно', 'обесцен', 'манип', 'контрол', 'абью', 'насили', 'токс', 'финанс', 'финансов', 'деньг',
                    'избег', 'уклон', 'отстран',
                    // Spanish
                    'celos', 'conflic', 'toxic', 'abuso', 'financ', 'dinero', 'manipul', 'control', 'evita', 'evitaci', 'evas',
                    // French
                    'jalous', 'conflit', 'tox', 'abus', 'financ', 'argent', 'manip', 'contrôl', 'évit', 'evit',
                    // German
                    'eifersucht', 'konflikt', 'tox', 'missbrauch', 'finanz', 'geld', 'manip', 'kontroll', 'vermeid',
                    // Portuguese
                    'ciúme', 'conflito', 'tóxic', 'abuso', 'financ', 'dinheiro', 'manip', 'controle', 'evita', 'evitaç'
                  ];
                  const isAvoidance = ['avoid', 'избег', 'evit', 'vermeid', 'уклон', 'отстран'].some(
                    (k) => id.includes(k) || title.includes(k)
                  );
                  const isProblematic =
                    negativeIds.some((k) => id.includes(k)) ||
                    negativeKeywords.some((k) => title.includes(k));
                  return { isProblematicSection: isProblematic, isAvoidance };
                })();
                const sectionPercent = sectionScore * 100;
                const sectionLevel = getLevelFromPercent(sectionPercent);
                const sectionTone = (() => {
                  if (section.sentiment || section.scorePolarity) {
                    return getToneFromMeta(
                      sectionLevel,
                      isProblematicSection ? 'higher-worse' : 'higher-better',
                      section.scorePolarity,
                      section.sentiment
                    );
                  }
                  if (isAvoidance) return 'danger';
                  return getBadgeTone(
                    sectionLevel,
                    isProblematicSection ? 'higher-worse' : 'higher-better'
                  );
                })();
                return (
                  <AccordionItem key={section.id} value={`section-${section.id}`} className="border border-primary/10 dark:border-primary/20 rounded-2xl bg-card/90 px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg sm:text-xl font-bold text-foreground text-left tracking-tight">
                            {getSectionTitle(section.id, section.title)}
                          </h3>
                          {section.score !== undefined && (
                            <Badge
                              variant="outline"
                              tone={sectionTone}
                              size="sm"
                            >
                              {getLevelLabel(sectionLevel, locale)} • {sectionPercent.toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-4">
                      <div className="space-y-4">
                        <Separator />
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                              {t('scientificAnalysis')}
                            </p>
                            <p className="text-sm sm:text-base text-foreground leading-relaxed">
                              {section.summary && section.summary.trim()
                                ? section.summary
                                : t('analysisEmptySummary')}
                            </p>
                          </div>
                          {section.plainSummary && (
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                                {t('plainLanguage')}
                              </p>
                              <p className="text-sm sm:text-base text-foreground italic leading-relaxed">
                                {section.plainSummary}
                              </p>
                            </div>
                          )}
                        </div>
                        {section.evidenceSnippets.length > 0 && (
                          <div className="space-y-3">
                            <Separator />
                            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                              {t('evidence')}
                            </h3>
                            {section.evidenceSnippets.map((evidence, idx) => {
                              const formattedExcerpt = replaceParticipantIds(evidence.excerpt);
                              const formattedExplanation = replaceParticipantIds(evidence.explanation);
                              const participantInfo = formatParticipantName(formattedExcerpt);

                              return (
                                <div
                                  id={`evidence-${section.id}-${idx}`}
                                  key={idx}
                                  className="border-l-4 border-primary/50 pl-4 py-2.5 bg-muted/30 rounded-r-md"
                                >
                                  {participantInfo ? (
                                    <div className="mb-2">
                                      <span className={`font-bold not-italic ${getParticipantColor(participantInfo.name)} text-sm sm:text-base mr-2 tracking-tight`}>
                                        {participantInfo.name}:
                                      </span>
                                      <span className="italic text-sm sm:text-base text-foreground/95 leading-relaxed">
                                        &ldquo;{participantInfo.remainingText}&rdquo;
                                      </span>
                                    </div>
                                  ) : (
                                    <p className="italic text-sm sm:text-base text-foreground/95 leading-relaxed mb-1">
                                      &ldquo;{formattedExcerpt}&rdquo;
                                    </p>
                                  )}
                                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                                    {formattedExplanation}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>

          {/* STATISTICS TAB */}
          <TabsContent value="statistics" className="space-y-4 sm:space-y-5">
            {/* PART 2: STATISTICAL BREAKDOWN */}
        {analysis.communicationStats && (
          <CardBase className="p-3 sm:p-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 tracking-tight">
              {locale === 'ru' ? 'Статистика коммуникации' : 'Communication Statistics'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aggregatedInitiatorBalance.length > 0 && (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    {locale === 'ru' ? 'Кто инициирует разговоры' : 'Who initiates conversations'}
                  </p>
                  <div className="space-y-1">
                    {aggregatedInitiatorBalance.map(({ participant, value }, idx) => (
                      <div key={`${participant}-${idx}`} className="flex justify-between items-center text-sm sm:text-base py-1">
                        <span className={`font-medium ${getParticipantColor(participant)}`}>
                          {participant || 'Participant'}
                        </span>
                        <span className="font-bold text-foreground">{formatPercent(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {aggregatedApologyCounts.length > 0 && (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    {locale === 'ru' ? 'Кто извиняется' : 'Who apologizes'}
                  </p>
                  <div className="space-y-1">
                    {aggregatedApologyCounts.map(({ participant, value }, idx) => (
                      <div key={`${participant}-${idx}`} className="flex justify-between items-center text-sm sm:text-base py-1">
                        <span className={`font-medium ${getParticipantColor(participant)}`}>
                          {participant || 'Participant'}
                        </span>
                        <span className="font-bold text-foreground">
                          {value} {locale === 'ru' ? 'раз' : 'times'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analysis.communicationStats.conflictFrequency && (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {locale === 'ru' ? 'Частота конфликтов' : 'Conflict frequency'}
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed">{analysis.communicationStats.conflictFrequency}</p>
                </div>
              )}
              {analysis.communicationStats.resolutionRate !== undefined && (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {locale === 'ru' ? 'Процент разрешенных конфликтов' : 'Resolution rate'}
                  </p>
                  <p className="text-lg sm:text-xl font-bold">
                    {formatPercent(analysis.communicationStats.resolutionRate)}
                  </p>
                </div>
              )}
            </div>
            {aggregatedPromiseTracking.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/60">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 tracking-tight">
                  {locale === 'ru' ? 'Отслеживание обещаний' : 'Promise Tracking'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aggregatedPromiseTracking.map(({ participant, made, kept, percentage }, idx) => (
                    <div key={`${participant}-${idx}`}>
                      <p className={`text-sm sm:text-base font-semibold mb-3 ${getParticipantColor(participant)}`}>
                        {participant || 'Participant'}
                      </p>
                      <div className="space-y-1.5 text-sm sm:text-base">
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-muted-foreground">{locale === 'ru' ? 'Дано' : 'Made'}</span>
                          <span className="font-semibold">{made}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-muted-foreground">{locale === 'ru' ? 'Выполнено' : 'Kept'}</span>
                          <span className="font-semibold">{kept}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 font-bold border-t border-border/40 pt-1.5 mt-1.5">
                          <span>{locale === 'ru' ? 'Процент' : 'Percentage'}</span>
                          <span className="text-foreground">{formatPercent(percentage)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {analysis.redFlagCounts && (
              <div className="mt-4 pt-4 border-t border-border/60">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">
                  {locale === 'ru' ? 'Красные флаги' : 'Red Flags'}
                </h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🟡</span>
                    <div>
                      <p className="text-xs text-muted-foreground">{locale === 'ru' ? 'Тревожные' : 'Concerning'}</p>
                      <p className="text-sm font-semibold">{analysis.redFlagCounts.yellow}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🟠</span>
                    <div>
                      <p className="text-xs text-muted-foreground">{locale === 'ru' ? 'Проблемные' : 'Problematic'}</p>
                      <p className="text-sm font-semibold">{analysis.redFlagCounts.orange}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔴</span>
                    <div>
                      <p className="text-xs text-muted-foreground">{locale === 'ru' ? 'Опасные' : 'Dangerous'}</p>
                      <p className="text-sm font-semibold">{analysis.redFlagCounts.red}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardBase>
            )}

            {/* PART 3: PATTERN ANALYSIS (extended) */}
            {(analysis.emotionalCycle || analysis.timePatterns) && (
          <CardBase className="p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3">
              {locale === 'ru' ? 'Анализ паттернов' : 'Pattern Analysis'}
            </h2>
            {analysis.emotionalCycle && (
              <div className="mb-4">
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  {locale === 'ru' ? 'Эмоциональный цикл' : 'Emotional Cycle'}
                </p>
                <p className="text-sm sm:text-base leading-relaxed">{analysis.emotionalCycle}</p>
              </div>
            )}
            {analysis.timePatterns && (
              <div>
                {analysis.timePatterns.conflictTimes && (
                  <div className="mb-2">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      {locale === 'ru' ? 'Когда происходят конфликты' : 'When conflicts happen'}
                    </p>
                    <p className="text-sm sm:text-base leading-relaxed">{analysis.timePatterns.conflictTimes}</p>
                  </div>
                )}
                {analysis.timePatterns.triggers && analysis.timePatterns.triggers.length > 0 && (
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      {locale === 'ru' ? 'Обычно провоцируется' : 'Usually triggered by'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.timePatterns.triggers.map((trigger, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 rounded-full bg-muted text-foreground">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            </CardBase>
            )}

            {/* PART 4: CONTRADICTION TRACKER */}
            {analysis.contradictions && analysis.contradictions.length > 0 && (
          <CardBase className="p-3 sm:p-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 tracking-tight">
              {locale === 'ru' ? 'Трекер противоречий' : 'Contradiction Tracker'}
            </h2>
            <div className="space-y-4">
              {analysis.contradictions.map((contradiction, idx) => (
                <div key={idx} className="border-l-4 border-amber-500/50 pl-4 py-3 bg-amber-50/30 dark:bg-amber-950/20 rounded-r-md">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-base">📅</span>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 font-medium">
                        {formatDate(contradiction.date)}
                      </p>
                      <p className="text-sm sm:text-base mb-2 leading-relaxed">
                        <span className="font-semibold">{locale === 'ru' ? 'Сказано:' : 'Said:'}</span> <span className="italic">"{contradiction.originalStatement}"</span>
                      </p>
                      <p className="text-sm sm:text-base mb-3 leading-relaxed">
                        <span className="font-semibold">{locale === 'ru' ? 'Позже отрицалось:' : 'Later denied:'}</span> <span className="italic">"{contradiction.denialStatement}"</span>
                      </p>
                      <div className="flex items-center gap-3 text-xs sm:text-sm">
                        <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/50">
                          ⚠️ {locale === 'ru' ? 'Тип:' : 'Type:'} {contradiction.type === 'promise_denial' ? (locale === 'ru' ? 'Отрицание обещания' : 'Promise denial') : contradiction.type === 'reality_denial' ? (locale === 'ru' ? 'Отрицание реальности' : 'Reality denial') : (locale === 'ru' ? 'Отрицание утверждения' : 'Claim denial')}
                        </Badge>
                        <Badge variant="outline" className="text-muted-foreground">
                          🎯 {locale === 'ru' ? 'Серьезность:' : 'Severity:'} {(contradiction.severity * 10).toFixed(1)}/10
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </CardBase>
            )}

            {/* PART 5: REALITY CHECK */}
            {analysis.realityCheck && (
          <CardBase className="p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3">
              {locale === 'ru' ? 'Проверка реальности' : 'Reality Check'}
            </h2>
            {analysis.realityCheck.whatParticipantWasRightAbout && analysis.realityCheck.whatParticipantWasRightAbout.length > 0 && (
              <div className="mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                  {locale === 'ru' ? 'В чем участники были правы' : 'What participants were right about'}
                </h3>
                <div className="space-y-2">
                  {analysis.realityCheck.whatParticipantWasRightAbout.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-emerald-500/50 pl-4 py-2.5 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-r-md">
                      {item.participant && (
                        <p className={`text-sm sm:text-base font-bold mb-1.5 ${getParticipantColor(replaceParticipantIds(item.participant))}`}>
                          {replaceParticipantIds(item.participant)}
                        </p>
                      )}
                      <p className="text-sm sm:text-base font-semibold mb-1.5 leading-relaxed">
                        <span className="text-muted-foreground">{locale === 'ru' ? 'Думали:' : 'Thought:'}</span> <span className="italic">"{item.thought}"</span>
                      </p>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{locale === 'ru' ? 'Были ПРАВЫ. Доказательство:' : 'Were RIGHT. Proof:'}</span> {item.evidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {analysis.realityCheck.whatParticipantWasWrongAbout && analysis.realityCheck.whatParticipantWasWrongAbout.length > 0 && (
              <div className="mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  {locale === 'ru' ? 'В чем участники ошибались' : 'What participants were wrong about'}
                </h3>
                <div className="space-y-2">
                  {analysis.realityCheck.whatParticipantWasWrongAbout.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-amber-500/50 pl-4 py-2.5 bg-amber-50/30 dark:bg-amber-950/20 rounded-r-md">
                      {item.participant && (
                        <p className={`text-sm sm:text-base font-bold mb-1.5 ${getParticipantColor(replaceParticipantIds(item.participant))}`}>
                          {replaceParticipantIds(item.participant)}
                        </p>
                      )}
                      <p className="text-sm sm:text-base font-semibold mb-1.5 leading-relaxed">
                        <span className="text-muted-foreground">{locale === 'ru' ? 'Обвинение:' : 'Accusation:'}</span> <span className="italic">"{item.accusation}"</span>
                      </p>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        <span className="font-semibold">{locale === 'ru' ? 'Реальность:' : 'Reality:'}</span> {item.reality}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {analysis.realityCheck.whosePerceptionWasAccurate && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  {locale === 'ru' ? 'Чье восприятие было точным' : 'Whose perception was accurate'}
                </h3>
                <p className="text-sm">{analysis.realityCheck.whosePerceptionWasAccurate}</p>
              </div>
            )}
            </CardBase>
            )}
          </TabsContent>

          {/* INSIGHTS TAB */}
          <TabsContent value="insights" className="space-y-4 sm:space-y-5">
            {/* PART 6: FRAMEWORK DIAGNOSIS */}
            {analysis.frameworkDiagnosis && (
          <CardBase className="p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3">
              {locale === 'ru' ? 'Диагностика по фреймворкам' : 'Framework Diagnosis'}
            </h2>
            <div className="space-y-4">
              {analysis.frameworkDiagnosis.nvc && (
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 tracking-tight">
                    {locale === 'ru' ? 'ННО (Ненасильственное общение)' : 
                     locale === 'fr' ? 'CNV (Communication Non Violente)' :
                     locale === 'de' ? 'GFK (Gewaltfreie Kommunikation)' :
                     locale === 'es' ? 'CNV (Comunicación No Violenta)' :
                     locale === 'pt' ? 'CNV (Comunicação Não Violenta)' :
                     'NVC (Nonviolent Communication)'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {normalizedNvcNeeds.length > 0 ? (
                      normalizedNvcNeeds.map(({ name, needs }) => (
                        <div key={name}>
                          <p className="font-semibold mb-2 text-sm">
                            <span className={getParticipantColor(name)}>{name}</span>
                            <span className="text-muted-foreground"> {locale === 'ru' ? 'неудовлетворенные потребности:' : 'unmet needs:'}</span>
                          </p>
                          <ul className="list-disc list-inside ml-3 space-y-1 text-sm leading-relaxed text-muted-foreground">
                            {needs.map((need, idx) => (
                              <li key={idx}>{need}</li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : analysis.frameworkDiagnosis.nvc.participantUnmetNeeds ? (
                      Object.entries(analysis.frameworkDiagnosis.nvc.participantUnmetNeeds).map(([participant, needs]) => (
                        <div key={participant}>
                          <p className="font-semibold mb-2 text-sm">
                            <span className={getParticipantColor(replaceParticipantIds(participant))}>
                              {replaceParticipantIds(participant)}
                            </span>
                            <span className="text-muted-foreground"> {locale === 'ru' ? 'неудовлетворенные потребности:' : 'unmet needs:'}</span>
                          </p>
                          <ul className="list-disc list-inside ml-3 space-y-1 text-sm leading-relaxed text-muted-foreground">
                            {needs.map((need, idx) => (
                              <li key={idx}>{need}</li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <>
                        {analysis.frameworkDiagnosis.nvc.participant1UnmetNeeds && (
                          <div>
                            <p className="font-medium text-sm text-muted-foreground mb-1">
                              {locale === 'ru' ? 'Участник 1 неудовлетворенные потребности:' : 'Participant 1 unmet needs:'}
                            </p>
                            <ul className="list-disc list-inside ml-2 text-sm text-muted-foreground">
                              {analysis.frameworkDiagnosis.nvc.participant1UnmetNeeds.map((need, idx) => (
                                <li key={idx}>{need}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.frameworkDiagnosis.nvc.participant2UnmetNeeds && (
                          <div>
                            <p className="font-medium text-sm text-muted-foreground mb-1">
                              {locale === 'ru' ? 'Участник 2 неудовлетворенные потребности:' : 'Participant 2 unmet needs:'}
                            </p>
                            <ul className="list-disc list-inside ml-2 text-sm text-muted-foreground">
                              {analysis.frameworkDiagnosis.nvc.participant2UnmetNeeds.map((need, idx) => (
                                <li key={idx}>{need}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{locale === 'ru' ? 'Потребности прямо озвучены:' : 'Needs directly stated:'} {analysis.frameworkDiagnosis.nvc.needsDirectlyStated ? (locale === 'ru' ? 'Да' : 'Yes') : (locale === 'ru' ? 'Нет' : 'No')}</span>
                      <span>{locale === 'ru' ? 'Могло быть разрешено:' : 'Could be resolved:'} {analysis.frameworkDiagnosis.nvc.couldBeResolved ? (locale === 'ru' ? 'Да' : 'Yes') : (locale === 'ru' ? 'Нет' : 'No')}</span>
                    </div>
                  </div>
                </div>
              )}
              {analysis.frameworkDiagnosis.cbt && (
                <div className="pt-4 border-t border-border/60">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 tracking-tight">
                    {locale === 'ru' ? 'КПТ (Когнитивно-поведенческая терапия)' :
                     locale === 'fr' ? 'TCC (Thérapie Cognitive et Comportementale)' :
                     locale === 'de' ? 'KVT (Kognitive Verhaltenstherapie)' :
                     locale === 'es' ? 'TCC (Terapia Cognitivo Conductual)' :
                     locale === 'pt' ? 'TCC (Terapia Cognitivo-Comportamental)' :
                     'CBT (Cognitive Behavioral Therapy)'}
                  </h3>
                  <div className="space-y-3 text-sm">
                    {normalizedCbtDistortions.length > 0 ? (
                      normalizedCbtDistortions.map(({ name, distortions }) => (
                        <div key={name}>
                          <p className="font-semibold mb-2 text-sm">
                            <span className={getParticipantColor(name)}>{name}</span>
                            <span className="text-muted-foreground"> {locale === 'ru' ? 'искажения:' : 'distortions:'}</span>
                          </p>
                          <ul className="space-y-1.5 ml-3 text-sm leading-relaxed text-muted-foreground">
                            {distortions.map((dist, idx) => (
                              <li key={idx}>
                                <span className="font-semibold text-foreground">🧠 {dist.type}:</span> <span className="italic">"{dist.example}"</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : analysis.frameworkDiagnosis.cbt.participantDistortions ? (
                      Object.entries(analysis.frameworkDiagnosis.cbt.participantDistortions).map(([participant, distortions]) => (
                        <div key={participant}>
                          <p className="font-semibold mb-2 text-sm">
                            <span className={getParticipantColor(replaceParticipantIds(participant))}>
                              {replaceParticipantIds(participant)}
                            </span>
                            <span className="text-muted-foreground"> {locale === 'ru' ? 'искажения:' : 'distortions:'}</span>
                          </p>
                          <ul className="space-y-1.5 ml-3 text-sm leading-relaxed text-muted-foreground">
                            {distortions.map((dist, idx) => (
                              <li key={idx}>
                                <span className="font-semibold text-foreground">🧠 {dist.type}:</span> <span className="italic">"{dist.example}"</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <>
                        {analysis.frameworkDiagnosis.cbt.participant1Distortions && analysis.frameworkDiagnosis.cbt.participant1Distortions.length > 0 && (
                          <div>
                            <p className="font-medium text-sm text-muted-foreground mb-1">
                              {locale === 'ru' ? 'Участник 1 искажения:' : 'Participant 1 distortions:'}
                            </p>
                            <ul className="space-y-1 ml-2 text-sm text-muted-foreground">
                              {analysis.frameworkDiagnosis.cbt.participant1Distortions.map((dist, idx) => (
                                <li key={idx}>
                                  <span className="font-medium text-foreground">🧠 {dist.type}:</span> "{dist.example}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.frameworkDiagnosis.cbt.participant2Distortions && analysis.frameworkDiagnosis.cbt.participant2Distortions.length > 0 && (
                          <div>
                            <p className="font-medium text-sm text-muted-foreground mb-1">
                              {locale === 'ru' ? 'Участник 2 искажения:' : 'Participant 2 distortions:'}
                            </p>
                            <ul className="space-y-1 ml-2 text-sm text-muted-foreground">
                              {analysis.frameworkDiagnosis.cbt.participant2Distortions.map((dist, idx) => (
                                <li key={idx}>
                                  <span className="font-medium text-foreground">🧠 {dist.type}:</span> "{dist.example}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {locale === 'ru' ? 'Чье мышление было более искаженным:' : 'Whose thinking was more distorted:'} {analysis.frameworkDiagnosis.cbt.whoseMoreDistorted}
                    </p>
                  </div>
                </div>
              )}
              {analysis.frameworkDiagnosis.attachment && (
                <div className="pt-4 border-t border-border/60">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 tracking-tight">{locale === 'ru' ? 'Теория привязанности' : 'Attachment Theory'}</h3>
                  <div className="space-y-2 text-sm">
                    {normalizedAttachmentStyles.length > 0 ? (
                      normalizedAttachmentStyles.map(({ name, style }) => (
                        <div key={name} className="flex items-center gap-3 py-1">
                          <span className={`font-semibold text-sm ${getParticipantColor(name)}`}>
                            {name}
                          </span>
                          <span className="text-muted-foreground text-sm">{locale === 'ru' ? 'стиль:' : 'style:'}</span>
                          <span className="font-medium text-sm text-muted-foreground">{style}</span>
                        </div>
                      ))
                    ) : analysis.frameworkDiagnosis.attachment.participantStyles ? (
                      Object.entries(analysis.frameworkDiagnosis.attachment.participantStyles).map(([participant, style]) => (
                        <div key={participant} className="flex items-center gap-3 py-1">
                          <span className={`font-semibold text-sm ${getParticipantColor(replaceParticipantIds(participant))}`}>
                            {replaceParticipantIds(participant)}
                          </span>
                          <span className="text-muted-foreground text-sm">{locale === 'ru' ? 'стиль:' : 'style:'}</span>
                          <span className="font-medium text-sm text-muted-foreground">{style}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        {analysis.frameworkDiagnosis.attachment.participant1Style && (
                          <div className="flex gap-4 text-sm">
                            <span className="text-muted-foreground">
                              {locale === 'ru' ? 'Участник 1 стиль:' : 'Participant 1 style:'}
                            </span>
                            <span className="font-medium text-muted-foreground">{analysis.frameworkDiagnosis.attachment.participant1Style}</span>
                          </div>
                        )}
                        {analysis.frameworkDiagnosis.attachment.participant2Style && (
                          <div className="flex gap-4 text-sm">
                            <span className="text-muted-foreground">
                              {locale === 'ru' ? 'Участник 2 стиль:' : 'Participant 2 style:'}
                            </span>
                            <span className="font-medium text-muted-foreground">{analysis.frameworkDiagnosis.attachment.participant2Style}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div>
                      <p className="font-medium text-sm text-muted-foreground mb-1">{locale === 'ru' ? 'Паттерн взаимодействия:' : 'Dance pattern:'}</p>
                      <p className="text-sm text-muted-foreground">{analysis.frameworkDiagnosis.attachment.dancePattern}</p>
                    </div>
                  </div>
                </div>
              )}
              {analysis.frameworkDiagnosis.transactional && (
                <div className="pt-4 border-t border-border/60">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 tracking-tight">{locale === 'ru' ? 'Транзакционный анализ' : 'Transactional Analysis'}</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium text-sm text-muted-foreground mb-1">{locale === 'ru' ? 'Доминирующая транзакция:' : 'Dominant transaction:'}</p>
                      <p className="text-sm text-muted-foreground">{analysis.frameworkDiagnosis.transactional.dominantTransaction}</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-muted-foreground mb-1">{locale === 'ru' ? 'Самые здоровые моменты:' : 'Healthiest moments:'}</p>
                      <p className="text-sm text-muted-foreground">{analysis.frameworkDiagnosis.transactional.healthiestMoments}</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-muted-foreground mb-1">{locale === 'ru' ? 'Самые токсичные моменты:' : 'Most toxic moments:'}</p>
                      <p className="text-sm text-muted-foreground">{analysis.frameworkDiagnosis.transactional.mostToxicMoments}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </CardBase>
            )}

            {/* PART 7: THE HARD TRUTH */}
            {analysis.hardTruth && (
          <CardBase className="p-3 sm:p-4 border-2 border-primary/30 bg-primary/5 dark:bg-primary/10">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3">
              {locale === 'ru' ? 'Жесткая правда' : 'The Hard Truth'}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  analysis.hardTruth.verdict === 'abusive' ? 'bg-red-500/20 text-red-700 dark:text-red-400' :
                  analysis.hardTruth.verdict === 'toxic' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400' :
                  analysis.hardTruth.verdict === 'problematic' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                  analysis.hardTruth.verdict === 'needs_work' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                  'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                }`}>
                  {analysis.hardTruth.verdict === 'abusive' ? (locale === 'ru' ? 'Абьюзивные' : 'Abusive') :
                   analysis.hardTruth.verdict === 'toxic' ? (locale === 'ru' ? 'Токсичные' : 'Toxic') :
                   analysis.hardTruth.verdict === 'problematic' ? (locale === 'ru' ? 'Проблемные' : 'Problematic') :
                   analysis.hardTruth.verdict === 'needs_work' ? (locale === 'ru' ? 'Требует работы' : 'Needs work') :
                   (locale === 'ru' ? 'Здоровые' : 'Healthy')}
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{replaceParticipantIds(analysis.hardTruth.message)}</p>
              {analysis.hardTruth.abusiveBehaviors && analysis.hardTruth.abusiveBehaviors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/60">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                    {locale === 'ru' ? 'Абьюзивное поведение:' : 'Abusive behaviors:'}
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-muted-foreground">
                    {analysis.hardTruth.abusiveBehaviors.map((behavior, idx) => (
                      <li key={idx}>{replaceParticipantIds(behavior)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            </CardBase>
            )}

            {/* PART 8: WHAT YOU SHOULD KNOW */}
            {analysis.whatYouShouldKnow && (
          <CardBase className="p-3 sm:p-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 tracking-tight">
              {locale === 'ru' ? 'Что вам нужно знать' : 'What You Should Know'}
            </h2>
            <div className="space-y-4">
              {analysis.whatYouShouldKnow.couldHaveDoneDifferently && analysis.whatYouShouldKnow.couldHaveDoneDifferently.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    {locale === 'ru' ? 'Что можно было сделать по-другому' : 'What could have been done differently'}
                  </h3>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-muted-foreground">
                    {analysis.whatYouShouldKnow.couldHaveDoneDifferently.map((item, idx) => (
                      <li key={idx}>{replaceParticipantIds(item)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.whatYouShouldKnow.communicationTools && analysis.whatYouShouldKnow.communicationTools.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    {locale === 'ru' ? 'Инструменты коммуникации' : 'Communication tools'}
                  </h3>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-muted-foreground">
                    {analysis.whatYouShouldKnow.communicationTools.map((tool, idx) => (
                      <li key={idx}>{replaceParticipantIds(tool)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.whatYouShouldKnow.couldHaveBeenSaved !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{locale === 'ru' ? 'Могло ли это быть спасено:' : 'Could this have been saved:'}</span>{' '}
                    {analysis.whatYouShouldKnow.couldHaveBeenSaved ? (locale === 'ru' ? 'Да' : 'Yes') : (locale === 'ru' ? 'Нет' : 'No')}
                  </p>
                </div>
              )}
              {analysis.whatYouShouldKnow.whyNotFault && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    {locale === 'ru' ? 'Почему это не ваша вина' : "Why it wasn't your fault"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{replaceParticipantIds(analysis.whatYouShouldKnow.whyNotFault)}</p>
                </div>
              )}
              {analysis.whatYouShouldKnow.whatMadeVulnerable && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    {locale === 'ru' ? 'Что сделало вас уязвимым' : 'What made you vulnerable'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{replaceParticipantIds(analysis.whatYouShouldKnow.whatMadeVulnerable)}</p>
                </div>
              )}
              {analysis.whatYouShouldKnow.patternsToWatch && analysis.whatYouShouldKnow.patternsToWatch.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    {locale === 'ru' ? 'Паттерны для наблюдения' : 'Patterns to watch for'}
                  </h3>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-muted-foreground">
                    {analysis.whatYouShouldKnow.patternsToWatch.map((pattern, idx) => (
                      <li key={idx}>{replaceParticipantIds(pattern)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.whatYouShouldKnow.resources && analysis.whatYouShouldKnow.resources.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    {locale === 'ru' ? 'Ресурсы' : 'Resources'}
                  </h3>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-muted-foreground">
                    {analysis.whatYouShouldKnow.resources.map((resource, idx) => (
                      <li key={idx}>{replaceParticipantIds(resource)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.whatYouShouldKnow.redFlagsForNextTime && analysis.whatYouShouldKnow.redFlagsForNextTime.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    {locale === 'ru' ? 'Красные флаги на будущее' : 'Red flags for next time'}
                  </h3>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-muted-foreground">
                    {analysis.whatYouShouldKnow.redFlagsForNextTime.map((flag, idx) => (
                      <li key={idx}>{replaceParticipantIds(flag)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            </CardBase>
            )}

            {/* PART 9: CLOSURE STATEMENTS */}
            {analysis.closure && (
          <CardBase className="p-3 sm:p-4 border-2 border-primary/20 bg-primary/5 dark:bg-primary/10">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 tracking-tight">
              {locale === 'ru' ? 'Замыкающие утверждения' : 'Closure Statements'}
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 mb-1">
                  {locale === 'ru' ? 'В чем были правы:' : 'What was right about:'}
                </p>
                <p className="text-sm text-muted-foreground">{replaceParticipantIds(analysis.closure.whatWasRightAbout)}</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">
                  {locale === 'ru' ? 'Участники заслуживали:' : 'Participants deserved:'}
                </p>
                <p className="text-sm text-muted-foreground">{replaceParticipantIds(analysis.closure.whatWasDeserved)}</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">
                  {locale === 'ru' ? 'Участники получили:' : 'Participants got:'}
                </p>
                <p className="text-sm text-muted-foreground">{replaceParticipantIds(analysis.closure.whatWasGot)}</p>
              </div>
              <div className="pt-2 border-t border-border/60">
                <p className="font-semibold text-sm text-foreground mb-1">
                  {locale === 'ru' ? 'Разрешение двигаться дальше:' : 'Permission to move on:'}
                </p>
                <p className="text-sm whitespace-pre-line text-muted-foreground">{replaceParticipantIds(analysis.closure.permissionToMoveOn)}</p>
              </div>
              <div className="pt-2 border-t border-border/60">
                <p className="font-semibold text-sm text-primary mb-1">
                  {locale === 'ru' ? 'Финальное утверждение:' : 'End statement:'}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">{replaceParticipantIds(analysis.closure.endStatement)}</p>
              </div>
            </div>
            </CardBase>
            )}

            {/* SAFETY CONCERN */}
            {analysis.safetyConcern && analysis.safetyConcern.isPresent && (
          <CardBase className="p-3 sm:p-4 border-2 border-red-500/50 bg-red-50/90 dark:bg-red-950/40">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-semibold text-red-900 dark:text-red-100">
                {locale === 'ru' ? '⚠️ ПРОБЛЕМА БЕЗОПАСНОСТИ' : '⚠️ SAFETY CONCERN'}
              </h2>
            </div>
            <p className="text-sm text-red-900 dark:text-red-100 mb-3">
              {locale === 'ru' ? 'То, что я вижу, выходит за рамки токсичного в опасное:' : "What I'm seeing goes beyond toxic into dangerous:"}
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-red-900 dark:text-red-100 mb-3">
              {analysis.safetyConcern.behaviors.map((behavior, idx) => (
                <li key={idx}>{replaceParticipantIds(behavior)}</li>
              ))}
            </ul>
            {analysis.safetyConcern.resources && analysis.safetyConcern.resources.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                  {locale === 'ru' ? 'Ресурсы:' : 'Resources:'}
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-red-900 dark:text-red-100">
                  {analysis.safetyConcern.resources.map((resource, idx) => (
                    <li key={idx}>{replaceParticipantIds(resource)}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-sm font-semibold text-red-900 dark:text-red-100 mt-3">
              {locale === 'ru' ? 'Пожалуйста, обратитесь к профессионалам. Ваша безопасность важнее понимания того, что произошло.' : 'Please reach out to professionals. Your safety > understanding what happened.'}
            </p>
            </CardBase>
            )}
          </TabsContent>
        </Tabs>

        {/* Beta banner / donations */}
        <CardBase className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 shadow-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary font-semibold text-xs">
            <span>β</span>
            <span>{t('donation_beta_label')}</span>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                {t('donation_title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('donation_text')}
              </p>
            </div>
            <div className="self-start sm:self-center px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
              {t('donation_crypto_only')}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs mt-4">
            {WALLET_ADDRESSES.map((wallet) => (
              <div
                key={wallet.id}
                className="p-3 rounded-lg border border-border/70 bg-background/80 shadow-sm hover:border-primary/60 hover:shadow-md transition-all duration-150"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-sm font-semibold text-foreground">{wallet.label}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => setSelectedWallet(wallet)}
                  >
                    {t('donation_show_qr')}
                  </Button>
                </div>
                <div className="text-xs font-mono text-foreground/80 break-all">{wallet.address}</div>
              </div>
            ))}
          </div>
        </CardBase>

        {selectedWallet && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedWallet(null)}
          >
            <Card className="w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between p-4 pb-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('donation_qr_for_wallet')}
                  </p>
                  <p className="text-base font-semibold text-foreground">{selectedWallet.label}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWallet(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={t('donation_close')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 pt-2 flex flex-col items-center gap-3">
                <div className="rounded-lg border border-border bg-background p-3">
                  <img
                    src={getQrImageUrl(selectedWallet.address)}
                    alt={`${selectedWallet.label} QR`}
                    className="h-64 w-64 object-contain"
                    loading="lazy"
                  />
                </div>
                <p className="text-xs font-mono text-muted-foreground break-all text-center">
                  {selectedWallet.address}
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedWallet(null)}>
                  {t('donation_close')}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Disclaimers about purpose and limitations */}
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <p>{t('report_disclaimer_main')}</p>
          <p>{t('report_disclaimer_safety')}</p>
        </div>
      </div>

      {/* Modal for date quotes */}
      {selectedDateQuotes && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedDateQuotes(null)}
        >
          <Card
            className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
                    {new Date(selectedDateQuotes.date.date).toLocaleDateString(
                      locale === 'ru' ? 'ru-RU' : 'en-US',
                      { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }
                    )}
                  </h2>
                  {selectedDateQuotes.date.reason && (
                    <p className="text-sm text-muted-foreground">
                      {selectedDateQuotes.date.reason}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDateQuotes(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={locale === 'ru' ? 'Закрыть' : 'Close'}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  {locale === 'ru' ? 'Важные цитаты этого дня' : 'Important quotes from this day'}
                </h3>
                {selectedDateQuotes.quotes.map((quote, idx) => {
                  const participantInfo = formatParticipantName(quote.excerpt);
                  
                  return (
                    <div
                      key={idx}
                      className="border-l-4 border-primary/50 pl-3 py-2"
                    >
                      <div className="mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {quote.sectionTitle}
                        </span>
                      </div>
                      {participantInfo ? (
                        <div className="mb-1.5">
                          <span className={`font-semibold not-italic ${getParticipantColor(participantInfo.name)} text-sm sm:text-base mr-2 tracking-tight`}>
                            {participantInfo.name}:
                          </span>
                          <span className="italic text-sm sm:text-base text-foreground/95 leading-relaxed">
                            &ldquo;{participantInfo.remainingText}&rdquo;
                          </span>
                        </div>
                      ) : (
                        <p className="italic text-sm sm:text-base text-foreground/95 leading-relaxed mb-1">
                          &ldquo;{quote.excerpt}&rdquo;
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {quote.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
