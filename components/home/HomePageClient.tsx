'use client';

import {
  Upload,
  FileText,
  Shield,
  Sparkles,
  Brain,
  TrendingUp,
  HelpCircle,
  X,
  AlertCircle
} from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';

import { useAnimation } from '@/contexts/AnimationContext';
import { AnalysisProgress } from '@/components/analysis/AnalysisProgress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import {
  CardBase as Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { FileUpload } from '@/components/ui/FileUpload';
import { MediaUpload } from '@/components/ui/MediaUpload';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Progress } from '@/components/ui/progress';
import type { Conversation, Message, Participant } from '@/features/analysis/types';
import { useLanguage } from '@/features/i18n';
import { Donations } from '@/components/home/Donations';
import { cn } from '@/lib/utils';

const TestimonialsSection = dynamic(
  () => import('@/components/layout/Testimonials').then((m) => ({ default: m.TestimonialsSection })),
  {
    ssr: false,
    loading: () => <div className="h-32 w-full max-w-4xl animate-pulse rounded-xl bg-muted/60" />
  }
);

type ParsedManualConversation = {
  conversation: Conversation;
  participants: Participant[];
  messages: Message[];
};

function detectLanguagesFromText(text: string): string[] {
  const detected: string[] = [];
  if (/[а-яё]/i.test(text)) detected.push('ru');
  if (/[àáâãäåæçèéêë]/i.test(text)) detected.push('fr');
  if (/[äöüß]/i.test(text)) detected.push('de');
  if (/[ñáéíóúü]/i.test(text)) detected.push('es');
  if (!detected.length) detected.push('en');
  return detected;
}

function parsePastedConversation(raw: string): ParsedManualConversation {
  const conversationId = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const participantsMap = new Map<string, Participant>();
  const messages: Message[] = [];
  let lastSenderId: string | null = null;

  const getParticipantId = (name: string): string => {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_а-яё-]/gi, '');
    const id = `participant_${slug || 'user'}`;
    if (!participantsMap.has(id)) {
      const role: 'user' | 'other' | 'groupMember' | 'unknown' =
        participantsMap.size === 0 ? 'user' : 'other';
      participantsMap.set(id, {
        id,
        displayName: name,
        role
      });
    }
    return id;
  };

  lines.forEach((line) => {
    const match = line.match(/^([^:]{1,40}):\s+(.+)$/);
    let senderId: string;
    let text: string;

    if (match) {
      const name = match[1].trim();
      text = match[2].trim();
      senderId = getParticipantId(name);
    } else {
      senderId = lastSenderId || getParticipantId('You');
      text = line;
    }

    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const sentAt = new Date().toISOString();

    messages.push({
      id,
      conversationId,
      senderId,
      sentAt,
      text,
      isSystem: false
    });

    lastSenderId = senderId;
  });

  const participants = Array.from(participantsMap.values());
  const languageCodes = detectLanguagesFromText(raw);

  const conversation: Conversation = {
    id: conversationId,
    sourcePlatform: 'generic',
    title: 'Pasted conversation',
    startedAt: messages[0]?.sentAt ?? null,
    endedAt: messages[messages.length - 1]?.sentAt ?? null,
    participantIds: participants.map((p) => p.id),
    languageCodes,
    messageCount: messages.length,
    status: 'imported'
  };

  return { conversation, participants, messages };
}

const getPremiumToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('premium_token');
};

const FORCE_PREMIUM =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_PREMIUM_EVERYONE === 'true';

export default function HomePageClient() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const { setProcessing } = useAnimation();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{
    progress: number;
    status:
      | 'starting'
      | 'parsing'
      | 'analyzing'
      | 'media'
      | 'chunking'
      | 'finalizing'
      | 'completed'
      | 'error';
    currentChunk?: number;
    totalChunks?: number;
    message?: string;
    isPremium?: boolean;
    isVoiceRecording?: boolean;
  } | null>(null);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [inputMode, setInputMode] = useState<'file' | 'paste' | 'media'>('file');
  const [pastedText, setPastedText] = useState('');
  const [showExportHelp, setShowExportHelp] = useState(false);
  const [animationLocked, setAnimationLocked] = useState(false);
  const [donationsVisible, setDonationsVisible] = useState(false);
  const [testimonialsVisible, setTestimonialsVisible] = useState(false);
  const donationsRef = React.useRef<HTMLDivElement | null>(null);
  const testimonialsRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    router.prefetch('/analysis');
  }, [router]);

  useEffect(() => {
    setProcessing(uploading || analyzing || animationLocked);
  }, [uploading, analyzing, animationLocked, setProcessing]);

  // Defer donations render until in viewport to avoid early pop-in and keep layout stable
  useEffect(() => {
    if (!donationsRef.current) return;
    const el = donationsRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setDonationsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '120px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Lazy mount testimonials when near viewport
  useEffect(() => {
    if (!testimonialsRef.current) return;
    const el = testimonialsRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTestimonialsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '120px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScrollToUpload = useCallback(() => {
    const uploadCard = document.querySelector('[data-upload-card]');
    if (uploadCard) {
      uploadCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const toggleExportHelp = useCallback(() => {
    setShowExportHelp((prev) => !prev);
  }, []);

  const startAnalysisWithImport = useCallback(
    async (importData: {
      conversation: Conversation;
      messages: Message[];
      media?: any[];
      participants?: Participant[];
      features?: { canAnalyzeMedia?: boolean; canUseEnhancedAnalysis?: boolean };
      isVoiceRecording?: boolean;
    }) => {
      const premiumToken = getPremiumToken();
      const hasPremium = FORCE_PREMIUM || Boolean(premiumToken);
      const featuresToStore = {
        canAnalyzeMedia: importData.features?.canAnalyzeMedia === true,
        canUseEnhancedAnalysis: importData.features?.canUseEnhancedAnalysis === true
      };

      setConversation(importData.conversation);
      setAnalyzing(true);

      setAnalysisProgress({
        progress: 0,
        status: 'starting',
        message: 'Starting AI analysis...',
        isPremium: hasPremium,
        isVoiceRecording: importData.isVoiceRecording
      });

      sessionStorage.setItem('currentSubscriptionTier', hasPremium ? 'premium' : 'free');
      sessionStorage.setItem(
        'currentFeatures',
        JSON.stringify(featuresToStore)
      );

      const conversationId = importData.conversation.id;
      let progressPollInterval: NodeJS.Timeout | null = null;

      progressPollInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch(
            `/api/analyze/progress?conversationId=${encodeURIComponent(conversationId)}`
          );
          if (progressResponse.ok) {
            const realProgress = await progressResponse.json();

            if (realProgress.status === 'error' || realProgress.error) {
              if (progressPollInterval) {
                clearInterval(progressPollInterval);
                progressPollInterval = null;
              }

              let errorMessage = realProgress.error || t('analysisFailed');

              if (realProgress.result?.analysis?.overviewSummary) {
                const overview = realProgress.result.analysis.overviewSummary;
                const isError =
                  overview.includes('Лимит запросов') ||
                  overview.includes('rate limit') ||
                  overview.includes('token limit') ||
                  overview.includes('Ошибка анализа') ||
                  overview.includes('Analysis error') ||
                  overview.includes('Код ошибки') ||
                  overview.includes('Error code');
                if (isError) {
                  errorMessage = overview;
                }
              }

              setError(errorMessage);
              setAnalyzing(false);
              setAnalysisProgress({
                progress: 0,
                status: 'error',
                message: errorMessage
              });
              return;
            }

            if (realProgress.status === 'completed' && realProgress.progress === 100) {
              if (realProgress.result?.analysis?.overviewSummary) {
                const overview = realProgress.result.analysis.overviewSummary;
                const isError =
                  overview.includes('Лимит запросов') ||
                  overview.includes('rate limit') ||
                  overview.includes('token limit') ||
                  overview.includes('Ошибка анализа') ||
                  overview.includes('Analysis error') ||
                  overview.includes('Код ошибки') ||
                  overview.includes('Error code') ||
                  (realProgress.result.analysis.sections?.length === 0 &&
                    (overview.includes('(Код ошибки') || overview.includes('(Error code')));

                if (isError) {
                  if (progressPollInterval) {
                    clearInterval(progressPollInterval);
                    progressPollInterval = null;
                  }
                  setError(overview);
                  setAnalyzing(false);
                  setAnalysisProgress({
                    progress: 0,
                    status: 'error',
                    message: overview
                  });
                  return;
                }
              }

              const storedAnalysis = sessionStorage.getItem('currentAnalysis');
              if (storedAnalysis) {
                if (progressPollInterval) {
                  clearInterval(progressPollInterval);
                  progressPollInterval = null;
                }
                setAnalysisProgress({
                  progress: 100,
                  status: 'completed',
                  message: 'Analysis complete!',
                  isPremium: hasPremium
                });
                router.prefetch('/analysis');
                requestAnimationFrame(() => {
                  router.push('/analysis');
                });
                return;
              }

              if (realProgress.result && realProgress.result.analysis) {
                if (progressPollInterval) {
                  clearInterval(progressPollInterval);
                  progressPollInterval = null;
                }
                const resultData = realProgress.result;
                sessionStorage.setItem('currentAnalysis', JSON.stringify(resultData.analysis));
                if (resultData.conversation) {
                  sessionStorage.setItem('currentConversation', JSON.stringify(resultData.conversation));
                }
                if (resultData.activityByDay) {
                  sessionStorage.setItem('currentActivityByDay', JSON.stringify(resultData.activityByDay));
                }
                sessionStorage.setItem(
                  'currentParticipants',
                  JSON.stringify(importData.participants || [])
                );
                sessionStorage.setItem('currentConversationId', conversationId);
                sessionStorage.setItem('currentSubscriptionTier', hasPremium ? 'premium' : 'free');
                sessionStorage.setItem(
                  'currentFeatures',
                  JSON.stringify(featuresToStore)
                );

                setAnalysisProgress({
                  progress: 100,
                  status: 'completed',
                  message: 'Analysis complete!',
                  isPremium: hasPremium
                });
                router.prefetch('/analysis');
                requestAnimationFrame(() => {
                  router.push('/analysis');
                });
                return;
              }
            }

            if (realProgress.progress > 0 && realProgress.status !== 'starting') {
              setAnalysisProgress((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  progress: realProgress.progress,
                  status: realProgress.status,
                  message: realProgress.message || prev.message,
                  currentChunk: realProgress.currentChunk,
                  totalChunks: realProgress.totalChunks
                };
              });
            }
          }
        } catch (pollError) {
          console.debug('Progress polling failed:', pollError);
        }
      }, 3000);

      try {
        const startResponse = await fetch('/api/analyze/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(premiumToken ? { 'x-premium-token': premiumToken } : {})
          },
          body: JSON.stringify({
            conversation: importData.conversation,
            messages: importData.messages || [],
            mediaArtifacts: importData.media || [],
            enhancedAnalysis: importData.features?.canUseEnhancedAnalysis,
            participants: importData.participants || [],
            locale: locale
          })
        });

        if (!startResponse.ok) {
          const errorDataStart = await startResponse.json().catch(() => ({ error: t('failedToStartAnalysis') }));
          throw new Error(errorDataStart.error || t('failedToStartAnalysis'));
        }

        await startResponse.json();
        setUploading(false);
        setUploadProgress(0);
      } catch (err) {
        if (progressPollInterval) {
          clearInterval(progressPollInterval);
          progressPollInterval = null;
        }
        const message = (err as Error).message || t('errorOccurred');
        setError(message);
        setAnalyzing(false);
        setAnalysisProgress({
          progress: 0,
          status: 'error',
          message
        });
      }
    },
    [locale, router, t]
  );

  const handleFileSelect = async (
    file: File,
    platform:
      | 'telegram'
      | 'whatsapp'
      | 'signal'
      | 'viber'
      | 'discord'
      | 'imessage'
      | 'messenger'
      | 'generic'
      | 'auto'
  ) => {
    sessionStorage.removeItem('currentAnalysis');
    sessionStorage.removeItem('currentConversation');
    sessionStorage.removeItem('currentActivityByDay');
    sessionStorage.removeItem('currentParticipants');
    sessionStorage.removeItem('currentConversationId');

    setUploading(true);
    setAnimationLocked(true);
    setUploadProgress(0);
    setError(null);
    let progressPollInterval: NodeJS.Timeout | null = null;

    try {
      try {
        const premiumToken = getPremiumToken();
        const blob = await upload(`import-${Date.now()}-${file.name}`, file, {
          access: 'public',
          handleUploadUrl: '/api/upload-to-blob',
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.percentage || 0;
            setUploadProgress(Math.round(progress));
          }
        });

        const blobUrl = blob.url;
        setUploadProgress(100);

        const importResponse = await fetch('/api/import/blob', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(premiumToken ? { 'x-premium-token': premiumToken } : {})
          },
          body: JSON.stringify({
            blobUrl: blobUrl,
            platform,
            fileName: file.name,
            contentType: file.type
          })
        });

        if (!importResponse.ok) {
          const errorData = await importResponse.json().catch(() => ({ error: t('importFailed') }));
          throw new Error(errorData.error || t('importFailed'));
        }

        const importData = await importResponse.json();

        // Immediately transition into analysis view without flicker
        setAnalyzing(true);
        setAnalysisProgress({
          progress: 0,
          status: 'starting',
          message: 'Starting AI analysis...'
        });
        setUploading(false);

        await startAnalysisWithImport(importData);
        return;
      } catch (blobError) {
        const errorMessage = (blobError as Error).message || '';
        if (errorMessage.includes('INVALID_FORMAT') || errorMessage.includes('Failed to parse')) {
          throw new Error('INVALID_FORMAT');
        }
        throw new Error(
          `${t('failedToUploadFile')}: ${errorMessage}\n\n` +
            (locale === 'ru'
              ? 'Пожалуйста, проверьте соединение и попробуйте снова.'
              : 'Please check your connection and try again.')
        );
      }
    } catch (err) {
      if (progressPollInterval) {
        clearInterval(progressPollInterval);
        progressPollInterval = null;
      }
      const message = (err as Error).message || t('errorOccurred');
      const normalized =
        message === 'Failed to fetch'
          ? locale === 'ru'
            ? 'Сервер не ответил вовремя или соединение было прервано. Попробуйте ещё раз чуть позже.'
            : 'The server did not respond in time or the connection was interrupted. Please try again in a moment.'
          : message === 'INVALID_FORMAT' ||
            message.includes('INVALID_FORMAT') ||
            message.includes('Failed to parse')
          ? t('error_invalid_format')
          : message;
      setError(normalized);
      setUploading(false);
      setAnalyzing(false);
      setAnalysisProgress({
        progress: 0,
        status: 'error',
        message: (err as Error).message || t('analysisFailed')
      });
    }
  };

  const handleMediaFileUpload = async (file: File) => {
    sessionStorage.removeItem('currentAnalysis');
    sessionStorage.removeItem('currentConversation');
    sessionStorage.removeItem('currentActivityByDay');
    sessionStorage.removeItem('currentParticipants');
    sessionStorage.removeItem('currentConversationId');

    setUploading(true);
    setAnimationLocked(true);
    setUploadProgress(0);
    setError(null);

    try {
      const premiumToken = getPremiumToken();
      const blob = await upload(`media-${Date.now()}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-to-blob',
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.percentage || 0;
          setUploadProgress(Math.round(progress));
        }
      });

      const blobUrl = blob.url;
      setUploadProgress(100);

      const isAudio =
        file.type.startsWith('audio') ||
        file.type === 'video/webm' || // some browsers label mic capture as video/webm
        Boolean(file.name.match(/\.(mp3|wav|ogg|opus|m4a|webm)$/i));

      let transcript: string | undefined;

      if (isAudio) {
        const transcribeResponse = await fetch('/api/transcribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(premiumToken ? { 'x-premium-token': premiumToken } : {})
          },
          body: JSON.stringify({
            blobUrl,
            fileName: file.name,
            contentType: file.type
          })
        });

        if (transcribeResponse.ok) {
          const data = await transcribeResponse.json();
          transcript = data.transcript;
        } else {
          const errData = await transcribeResponse.json().catch(() => ({}));
          console.warn('Transcription failed, continuing without text', errData);
        }
      }

      const importResponse = await fetch('/api/import/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(premiumToken ? { 'x-premium-token': premiumToken } : {})
        },
        body: JSON.stringify({
          blobUrl,
          fileName: file.name,
          contentType: file.type,
          transcript
        })
      });

      if (!importResponse.ok) {
        const errorData = await importResponse.json().catch(() => ({ error: t('importFailed') }));
        throw new Error(errorData.error || t('importFailed'));
      }

      const importData = await importResponse.json();

      // Immediately transition into analysis view without flicker
      setAnalyzing(true);
      setAnalysisProgress({
        progress: 0,
        status: 'starting',
        message: 'Starting AI analysis...',
        isVoiceRecording: isAudio
      });
      setUploading(false);

      await startAnalysisWithImport({
        ...importData,
        isVoiceRecording: isAudio
      });
    } catch (err) {
      const message = (err as Error).message || t('errorOccurred');
      setError(message);
      setUploading(false);
      setAnalyzing(false);
      setAnalysisProgress({
        progress: 0,
        status: 'error',
        message
      });
    }
  };

  const looksLikeConversationExcerpt = (text: string): boolean => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (normalized.length < 30) return false;

    const alphaMatches = normalized.match(/[A-Za-zА-Яа-яЁё]{2,}/g) || [];
    if (alphaMatches.join('').length < 10) return false;

    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const speakerLike = new Set(
      lines
        .slice(0, 20)
        .map((l) => l.trim())
        .filter((l) => l.includes(':') || l.includes('—') || l.includes('- '))
    );
    if (speakerLike.size >= 1) return true;

    const wordCount = normalized.split(' ').filter((w) => w.length > 1).length;
    return wordCount >= 6;
  };

  const handlePasteAnalyze = async () => {
    const text = pastedText.trim();
    if (!text) {
      setError(t('paste_error_empty') ?? 'Please paste some conversation text first.');
      return;
    }
    if (text.length > 8000) {
      setError(
        t('paste_error_too_long') ??
          'Pasted text is too long. Please use a smaller excerpt (up to 8000 characters).'
      );
      return;
    }
    if (!looksLikeConversationExcerpt(text)) {
      setError(
        t('paste_error_not_conversation') ??
          'This text does not look like a conversation excerpt. Please paste a real chat fragment.'
      );
      return;
    }

    sessionStorage.removeItem('currentAnalysis');
    sessionStorage.removeItem('currentConversation');
    sessionStorage.removeItem('currentActivityByDay');
    sessionStorage.removeItem('currentParticipants');

    setError(null);
    setConversation(null);
    let progressPollInterval: NodeJS.Timeout | null = null;

    try {
      const { conversation: manualConversation, participants, messages } = parsePastedConversation(text);

      setAnalyzing(true);
      setAnalysisProgress({
        progress: 0,
        status: 'starting',
        message: 'Starting AI analysis...',
        isPremium: false
      });

      const conversationId = manualConversation.id;

      progressPollInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch(
            `/api/analyze/progress?conversationId=${encodeURIComponent(conversationId)}`
          );
          if (progressResponse.ok) {
            const realProgress = await progressResponse.json();

            if (realProgress.status === 'error' || realProgress.error) {
              if (progressPollInterval) {
                clearInterval(progressPollInterval);
                progressPollInterval = null;
              }

              let errorMessage = realProgress.error || 'Analysis failed';

              if (realProgress.result?.analysis?.overviewSummary) {
                const overview = realProgress.result.analysis.overviewSummary;
                const isError =
                  overview.includes('Лимит запросов') ||
                  overview.includes('rate limit') ||
                  overview.includes('token limit') ||
                  overview.includes('Ошибка анализа') ||
                  overview.includes('Analysis error') ||
                  overview.includes('Код ошибки') ||
                  overview.includes('Error code');
                if (isError) {
                  errorMessage = overview;
                }
              }

              setError(errorMessage);
              setAnalyzing(false);
              setAnalysisProgress({
                progress: 0,
                status: 'error',
                message: errorMessage
              });
              return;
            }

            if (realProgress.status === 'completed' && realProgress.progress === 100) {
              if (progressPollInterval) {
                clearInterval(progressPollInterval);
                progressPollInterval = null;
              }

              if (realProgress.result?.analysis?.overviewSummary) {
                const overview = realProgress.result.analysis.overviewSummary;
                const isError =
                  overview.includes('Лимит запросов') ||
                  overview.includes('rate limit') ||
                  overview.includes('token limit') ||
                  overview.includes('Ошибка анализа') ||
                  overview.includes('Analysis error') ||
                  overview.includes('Код ошибки') ||
                  overview.includes('Error code') ||
                  (realProgress.result.analysis.sections?.length === 0 &&
                    (overview.includes('(Код ошибки') || overview.includes('(Error code')));

                if (isError) {
                  setError(overview);
                  setAnalyzing(false);
                  setAnalysisProgress({
                    progress: 0,
                    status: 'error',
                    message: overview
                  });
                  return;
                }
              }

              const storedAnalysis = sessionStorage.getItem('currentAnalysis');
              if (storedAnalysis) {
                setAnalysisProgress({
                  progress: 100,
                  status: 'completed',
                  message: 'Analysis complete!',
                  isPremium: true
                });
                router.prefetch('/analysis');
                requestAnimationFrame(() => {
                  router.push('/analysis');
                });
                return;
              }

              if (realProgress.result && realProgress.result.analysis) {
                if (progressPollInterval) {
                  clearInterval(progressPollInterval);
                  progressPollInterval = null;
                }
                const resultData = realProgress.result;
                sessionStorage.setItem('currentAnalysis', JSON.stringify(resultData.analysis));
                if (resultData.conversation) {
                  sessionStorage.setItem('currentConversation', JSON.stringify(resultData.conversation));
                }
                if (resultData.activityByDay) {
                  sessionStorage.setItem('currentActivityByDay', JSON.stringify(resultData.activityByDay));
                }
                sessionStorage.setItem('currentParticipants', JSON.stringify(participants || []));
                sessionStorage.setItem('currentConversationId', conversationId);
                sessionStorage.setItem('currentSubscriptionTier', 'premium');
                sessionStorage.setItem(
                  'currentFeatures',
                  JSON.stringify({
                    canAnalyzeMedia: true,
                    canUseEnhancedAnalysis: true
                  })
                );

                setAnalysisProgress({
                  progress: 100,
                  status: 'completed',
                  message: 'Analysis complete!',
                  isPremium: true
                });
                router.prefetch('/analysis');
                requestAnimationFrame(() => {
                  router.push('/analysis');
                });
                return;
              }

              if (!(window as any).__resultFetchAttemptsPaste) {
                (window as any).__resultFetchAttemptsPaste = 0;
              }
              (window as any).__resultFetchAttemptsPaste++;

              if ((window as any).__resultFetchAttemptsPaste <= 10) {
                try {
                  const resultResponse = await fetch(
                    `/api/analyze/result-by-conversation?conversationId=${encodeURIComponent(conversationId)}`
                  );
                  if (resultResponse.ok) {
                    const resultData = await resultResponse.json();
                    if (resultData.analysis) {
                      if (resultData.analysis.overviewSummary) {
                        const overview = resultData.analysis.overviewSummary;
                        const isError =
                          overview.includes('Лимит запросов') ||
                          overview.includes('rate limit') ||
                          overview.includes('token limit') ||
                          overview.includes('Ошибка анализа') ||
                          overview.includes('Analysis error') ||
                          overview.includes('Код ошибки') ||
                          overview.includes('Error code') ||
                          (resultData.analysis.sections?.length === 0 &&
                            (overview.includes('(Код ошибки') || overview.includes('(Error code')));

                        if (isError) {
                          if (progressPollInterval) {
                            clearInterval(progressPollInterval);
                            progressPollInterval = null;
                          }
                          setError(overview);
                          setAnalyzing(false);
                          setAnalysisProgress({
                            progress: 0,
                            status: 'error',
                            message: overview
                          });
                          (window as any).__resultFetchAttemptsPaste = 0;
                          return;
                        }
                      }

                      if (progressPollInterval) {
                        clearInterval(progressPollInterval);
                        progressPollInterval = null;
                      }
                      sessionStorage.setItem('currentAnalysis', JSON.stringify(resultData.analysis));
                      if (resultData.conversation) {
                        sessionStorage.setItem('currentConversation', JSON.stringify(resultData.conversation));
                      }
                      if (resultData.activityByDay) {
                        sessionStorage.setItem('currentActivityByDay', JSON.stringify(resultData.activityByDay));
                      }
                      sessionStorage.setItem('currentParticipants', JSON.stringify(participants || []));
                      sessionStorage.setItem('currentConversationId', conversationId);
                      sessionStorage.setItem('currentSubscriptionTier', 'premium');
                      sessionStorage.setItem(
                        'currentFeatures',
                        JSON.stringify({
                          canAnalyzeMedia: true,
                          canUseEnhancedAnalysis: true
                        })
                      );

                      setAnalysisProgress({
                        progress: 100,
                        status: 'completed',
                        message: 'Analysis complete!',
                        isPremium: true
                      });
                      router.prefetch('/analysis');
                      requestAnimationFrame(() => {
                        router.push('/analysis');
                      });
                      (window as any).__resultFetchAttemptsPaste = 0;
                      return;
                    }
                  }
                } catch (resultError) {
                  console.debug(
                    `[Client] Failed to fetch result (paste, attempt ${
                      (window as any).__resultFetchAttemptsPaste
                    }):`,
                    resultError
                  );
                }
              } else {
                if (progressPollInterval) {
                  clearInterval(progressPollInterval);
                  progressPollInterval = null;
                }
                (window as any).__resultFetchAttemptsPaste = 0;
              }
            }

            if (realProgress.progress > 0 && realProgress.status !== 'starting') {
              setAnalysisProgress((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  progress: realProgress.progress,
                  status: realProgress.status,
                  message: realProgress.message || prev.message,
                  currentChunk: realProgress.currentChunk,
                  totalChunks: realProgress.totalChunks
                };
              });
            }
          }
        } catch (pollError) {
          console.debug('Progress polling failed:', pollError);
        }
      }, 3000);

      const startResponse = await fetch('/api/analyze/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: manualConversation,
          messages,
          mediaArtifacts: [],
          enhancedAnalysis: true,
          participants,
          locale
        })
      });

      if (!startResponse.ok) {
        const contentTypeStart = startResponse.headers.get('content-type');
        let errorDataStart;

        if (contentTypeStart?.includes('application/json')) {
          errorDataStart = await startResponse.json();
        } else {
          const textBody = await startResponse.text();
          const statusText = startResponse.statusText || 'Unknown error';
          throw new Error(
            `Analysis start failed (${startResponse.status} ${statusText}). The server returned an error page. Please try again or contact support.`
          );
        }

        throw new Error(errorDataStart.error || 'Failed to start analysis');
      }

      await startResponse.json();
    } catch (err) {
      if (progressPollInterval) {
        clearInterval(progressPollInterval);
        progressPollInterval = null;
      }
      const message = (err as Error).message || t('errorOccurred');
      const normalized =
        message === 'Failed to fetch'
          ? locale === 'ru'
            ? 'Сервер не ответил вовремя или соединение было прервано. Попробуйте ещё раз чуть позже.'
            : 'The server did not respond in time or the connection was interrupted. Please try again in a moment.'
          : message;
      setError(normalized);
      setAnalyzing(false);
      setAnalysisProgress({
        progress: 0,
        status: 'error',
        message: (err as Error).message || t('analysisFailed'),
        isPremium: false
      });
    }
  };

  const taglines = useMemo(
    () =>
      [t('hero_tagline'), t('hero_tagline_alt1'), t('hero_tagline_alt2'), t('hero_tagline_alt3')].filter(
        Boolean
      ),
    [t]
  );

  const currentTagline = useMemo(
    () => (taglines.length > 0 ? taglines[taglineIndex % taglines.length] : ''),
    [taglines, taglineIndex]
  );

  useEffect(() => {
    if (taglines.length <= 1) return;

    const id = window.setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 5000);

    return () => window.clearInterval(id);
  }, [taglines.length]);

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [taglineIndex]);

  const previewScript = React.useMemo(
    () =>
      [
        { id: 'm1', side: 'right' as const, text: t('hero_preview_msg1_right') },
        { id: 'm2', side: 'left' as const, text: t('hero_preview_msg1_left') },
        { id: 'm3', side: 'right' as const, text: t('hero_preview_msg2_right') },
        { id: 'm4', side: 'left' as const, text: t('hero_preview_msg2_left') },
        { id: 'm5', side: 'right' as const, text: t('hero_preview_msg3_right') },
        { id: 'm6', side: 'left' as const, text: t('hero_preview_msg3_left') },
        { id: 'm7', side: 'right' as const, text: t('hero_preview_msg4_right') },
        { id: 'm8', side: 'left' as const, text: t('hero_preview_msg4_left') },
        { id: 'm9', side: 'right' as const, text: t('hero_preview_msg5_right') },
        { id: 'm10', side: 'left' as const, text: t('hero_preview_msg5_left') }
      ].filter((m) => m.text),
    [t, locale]
  );

  const previewSignature = React.useMemo(
    () => previewScript.map((m) => `${m.id}:${m.text}`).join('|'),
    [previewScript]
  );

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<typeof previewScript>([]);
  const [messageKey, setMessageKey] = useState(0);

  useEffect(() => {
    if (previewScript.length === 0) return;
    setCurrentMessageIndex(0);
    setVisibleMessages([previewScript[0]]);
    setMessageKey((k) => k + 1);
  }, [previewSignature]);

  useEffect(() => {
    if (previewScript.length <= 1) return;
    if (currentMessageIndex >= previewScript.length) return;

    const timer = setTimeout(() => {
      const nextIndex = currentMessageIndex + 1;

      if (nextIndex < previewScript.length) {
        const nextMessage = previewScript[nextIndex];
        setVisibleMessages((prev) => {
          const updated = [...prev, nextMessage];
          return updated.slice(-3);
        });
        setCurrentMessageIndex(nextIndex);
        setMessageKey((k) => k + 1);
      } else {
        setTimeout(() => {
          setCurrentMessageIndex(0);
          setVisibleMessages([previewScript[0]]);
          setMessageKey((k) => k + 1);
        }, 3000);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [currentMessageIndex, previewScript]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 md:gap-12 px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full flex flex-col items-center gap-6 md:gap-10 py-6 sm:py-8 md:py-10">
        <div className="flex flex-col items-center text-center gap-4 sm:gap-5 w-full">
          <Badge
            variant="outline"
            className="border-primary/30 text-primary px-3 sm:px-4 py-1.5 text-label font-medium tracking-wider uppercase"
          >
            <Sparkles className="mr-2 h-3 w-3" />
            AI-Powered Gaslight Detection
          </Badge>

          <h1
            key={taglineIndex}
            className={cn(
              'text-balance text-3xl sm:text-4xl md:text-5xl font-bold leading-tight max-w-[28ch] text-foreground min-h-[7rem] sm:min-h-[8rem] md:min-h-[9rem] lg:min-h-[10rem] flex items-center',
              isAnimating && 'tagline-animate'
            )}
          >
            {currentTagline}
          </h1>

          <p className="max-w-xl text-body-sm sm:text-body-md text-muted-foreground leading-relaxed">
            {t('hero_copy')}
          </p>
        </div>

        <div className="relative w-full max-w-md mx-auto">
          <Card className="phone-glass-card relative z-10 border-border/40 overflow-hidden transition-all duration-300 hover:shadow-primary/25">
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 phone-glass-content">
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white/95">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {t('hero_preview_title')}
                </CardTitle>
                <CardDescription className="text-xs text-white/70">{t('hero_preview_subtitle')}</CardDescription>
              </div>
              <Badge
                variant="outline"
                className="border-white/20 bg-white/10 text-[10px] uppercase tracking-wide text-black dark:text-white/90 backdrop-blur-sm"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                {t('hero_preview_live')}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 overflow-hidden phone-glass-content">
              <div className="flex flex-col gap-1.5 relative h-[200px] overflow-hidden">
                <div className="absolute inset-0 flex flex-col gap-1.5 justify-end pb-0">
                  {visibleMessages.map((msg, idx) => {
                    const isNew = idx === visibleMessages.length - 1;
                    const messageAge = visibleMessages.length - 1 - idx;
                    const opacity = messageAge <= 1 ? 1 : Math.max(0.4, 1 - (messageAge - 1) * 0.4);
                    const scale = messageAge <= 1 ? 1 : Math.max(0.94, 1 - (messageAge - 1) * 0.03);

                    return (
                      <div
                        key={`${msg.id}-${messageKey}-${idx}`}
                        className={cn(
                          'max-w-[85%] rounded-2xl px-3 py-2 text-left text-xs shadow-sm transition-all duration-500',
                          msg.side === 'right' && 'ml-auto',
                          isNew && 'animate-slide-in-from-bottom-enhanced',
                          msg.side === 'left'
                            ? '!bg-gray-200 dark:!bg-gray-700 !text-gray-900 dark:!text-gray-100'
                            : '!bg-blue-500 dark:!bg-blue-600 !text-white'
                        )}
                        style={{
                          animationFillMode: 'both',
                          opacity,
                          transform: `scale(${scale}) translate3d(0,0,0)`,
                          willChange: isNew ? 'transform, opacity' : 'opacity',
                          backfaceVisibility: 'hidden'
                        }}
                      >
                        {msg.text}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-[11px] text-white/70">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{t('hero_preview_score_label')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-emerald-400">{t('hero_preview_score_low')}</span>
                  <div className="flex h-1.5 w-16 overflow-hidden rounded-full bg-black/30 backdrop-blur-sm">
                    <span className="h-full w-2/5 bg-emerald-400" />
                    <span className="h-full w-1/5 bg-amber-400" />
                    <span className="h-full w-2/5 bg-red-500/70 opacity-70" />
                  </div>
                </div>
              </div>

              <div className="mt-1 flex items-center justify-between text-[10px] text-white/60">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-4 items-center justify-between">
                    <span className="h-1 w-1 rounded-full bg-white/60 animate-pulse" />
                    <span className="h-1 w-1 rounded-full bg-white/60 animate-pulse [animation-delay:120ms]" />
                    <span className="h-1 w-1 rounded-full bg-white/60 animate-pulse [animation-delay:240ms]" />
                  </span>
                  <span>{t('hero_preview_typing')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-3 mt-6 w-full">
            <Button size="lg" onClick={handleScrollToUpload} className="w-full sm:w-auto">
              {t('hero_cta')}
            </Button>
            <p className="text-xs sm:text-[13px] text-muted-foreground max-w-xs text-center">
              <span className="font-medium text-foreground">{t('howItWorks')}</span> {t('step1_title')},{' '}
              {t('step2_title').toLowerCase?.() ?? t('step2_title')},{' '}
              {t('step3_title').toLowerCase?.() ?? t('step3_title')}.
            </p>
          </div>
        </div>
      </div>

      <Card
        className={cn(
          'w-full max-w-2xl shadow-xl border-border/30 backdrop-blur-md animate-fade-in group/upload-card',
          analyzing && 'analyzing'
        )}
        style={{
          animationDelay: '0.3s',
          animationFillMode: 'both',
          backgroundColor: 'hsl(var(--card) / 0.85)',
          willChange: 'background-color, opacity, backdrop-filter, transform',
          backfaceVisibility: 'hidden',
          '--card-bg': 'hsl(var(--card) / 0.85)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'translate3d(0px, 0px, 0px)'
        } as React.CSSProperties}
        data-upload-card
      >
        <CardHeader className="space-y-3 pb-4 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-3 transition-all duration-300 group-hover/upload-card:scale-110 group-hover/upload-card:shadow-lg group-hover/upload-card:shadow-primary/20 ring-2 ring-primary/10 group-hover/upload-card:ring-primary/30">
              <Upload className="h-5 w-5 text-primary transition-transform duration-300 group-hover/upload-card:scale-110" />
              <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover/upload-card:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <CardTitle className="text-heading-lg sm:text-heading-xl text-foreground group-hover/upload-card:text-primary transition-colors duration-300 text-center">
                  {t('uploadExport')}
                </CardTitle>
                <button
                  type="button"
                  onClick={toggleExportHelp}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-background/60 hover:bg-primary/10 hover:border-primary/50 hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 flex-shrink-0"
                  aria-label={t('exportHelpTitle')}
                  aria-expanded={showExportHelp}
                >
                  <HelpCircle className="h-3.5 w-3.5 text-primary transition-transform duration-200 group-hover/upload-card:rotate-12" />
                </button>
              </div>
              {!analyzing && (
                <CardDescription className="text-body-sm sm:text-body-md mt-1.5 text-muted-foreground text-center max-w-lg">
                  {t('uploadExportDescription')}
                </CardDescription>
              )}
            </div>
          </div>
          {showExportHelp && (
            <div className="mt-3 p-4 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-2 ring-1 ring-primary/10">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <div className="rounded-lg bg-primary/20 p-1.5">
                    <Upload className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {t('exportHelpTitle')}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowExportHelp(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-primary/10 hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t('exportHelpTelegram')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t('exportHelpWhatsApp')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t('exportHelpOther')}</span>
                </li>
              </ul>
            </div>
          )}
        </CardHeader>

        <Separator className="mb-4" />

        <CardContent
          className="flex flex-col items-center justify-center relative animate-in fade-in zoom-in-95 duration-500"
          style={{
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            height: 'auto',
            minHeight: '560px',
            willChange: 'opacity, transform',
            overflow: 'visible'
          }}
        >
          {error ? (
            <Alert className="border-red-500/60 dark:border-red-400/60 bg-red-50/90 dark:bg-red-950/40 w-full max-w-lg animate-in fade-in zoom-in-95 duration-500 shadow-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-semibold">{locale === 'ru' ? 'Ошибка анализа' : 'Analysis Error'}</AlertTitle>
              <AlertDescription className="text-sm leading-relaxed mt-1">{error}</AlertDescription>
            </Alert>
          ) : analyzing ? (
            <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-600">
              <div className="flex flex-col items-center justify-center space-y-4 w-full max-w-lg">
                {analysisProgress ? (
                  <>
                    {typeof analysisProgress.isPremium === 'boolean' && (
                      <div className="mb-2 w-full text-center text-[11px] sm:text-xs text-muted-foreground animate-in fade-in duration-300">
                        {analysisProgress.isPremium ? t('premium_progress_hint') : t('free_progress_hint')}
                      </div>
                    )}
                    <div className="w-full animate-in fade-in zoom-in-95 duration-500">
                      <AnalysisProgress
                        progress={analysisProgress.progress}
                        status={analysisProgress.status}
                        currentChunk={analysisProgress.currentChunk}
                        totalChunks={analysisProgress.totalChunks}
                        message={analysisProgress.message}
                        isPremium={analysisProgress.isPremium}
                        isVoiceRecording={analysisProgress.isVoiceRecording}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500">
                    <Spinner className="h-8 w-8 text-primary" />
                    <p className="text-lg font-medium text-foreground">{t('analyzing')}</p>
                    <p className="text-sm text-muted-foreground">AI is analyzing your conversation...</p>
                  </div>
                )}
              </div>
              <div
                role="alert"
                className="border-amber-500 dark:border-amber-400 bg-amber-100/95 dark:bg-amber-900/60 mt-4 w-full max-w-lg rounded-lg border-2 px-4 py-3 text-sm font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2.5 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <Shield className="h-5 w-5 text-amber-700 dark:text-amber-300 flex-shrink-0 animate-pulse" />
                <span className="leading-relaxed">{t('progress_disclaimer')}</span>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center">
              {!uploading && !analyzing && !error && !conversation && (
                <div className="flex justify-center w-full mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="inline-flex items-center rounded-full border border-border bg-muted/50 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setInputMode('file')}
                      className={cn(
                        'px-3 py-1 rounded-full transition-all duration-300',
                        inputMode === 'file'
                          ? 'bg-background text-foreground shadow-sm scale-105'
                          : 'text-muted-foreground hover:text-foreground hover:scale-105'
                      )}
                    >
                      {t('inputMode_upload')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('paste')}
                      className={cn(
                        'px-3 py-1 rounded-full transition-all duration-300',
                        inputMode === 'paste'
                          ? 'bg-background text-foreground shadow-sm scale-105'
                          : 'text-muted-foreground hover:text-foreground hover:scale-105'
                      )}
                    >
                      {t('inputMode_paste')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('media')}
                      className={cn(
                        'px-3 py-1 rounded-full transition-all duration-300',
                        inputMode === 'media'
                          ? 'bg-background text-foreground shadow-sm scale-105'
                          : 'text-muted-foreground hover:text-foreground hover:scale-105'
                      )}
                    >
                      {t('inputMode_media')}
                    </button>
                  </div>
                </div>
              )}

              {!error && (
                <div
                  className="relative w-full max-w-lg flex items-center justify-center overflow-visible"
                  style={{
                    transition:
                      'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'opacity, transform',
                    minHeight: '420px'
                  }}
                >
                  <div
                    className={cn(
                      'absolute inset-0 flex flex-col items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]',
                      inputMode === 'file'
                        ? 'opacity-100 translate-x-0 pointer-events-auto'
                        : 'opacity-0 -translate-x-6 pointer-events-none'
                    )}
                  >
                    <div className="w-full flex flex-col h-full justify-center animate-in fade-in slide-in-from-left-3 duration-500">
                      <FileUpload
                        onFileSelect={handleFileSelect}
                        disabled={uploading}
                        uploading={uploading}
                        uploadProgress={uploadProgress}
                        importSuccessful={!!conversation && !analyzing && !error}
                        messageCount={conversation?.messageCount || 0}
                      />
                    </div>
                  </div>

                  <div
                    className={cn(
                      'absolute inset-0 flex flex-col justify-center transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]',
                      inputMode === 'paste'
                        ? 'opacity-100 translate-x-0 pointer-events-auto'
                        : 'opacity-0 translate-x-6 pointer-events-none'
                    )}
                  >
                    <div
                      className="space-y-6 w-full h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-3 duration-500"
                      style={{
                        transition:
                          'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground text-center block">
                          {t('pasteLabel')}
                        </label>
                        <textarea
                          value={pastedText}
                          onChange={(e) => setPastedText(e.target.value)}
                          maxLength={8000}
                          rows={9}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-300 resize-none"
                          placeholder={t('pastePlaceholder')}
                          style={{ height: '200px' }}
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{pastedText.length}/8000</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handlePasteAnalyze}
                        disabled={analyzing || !pastedText.trim()}
                        className="w-full text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                        size="lg"
                      >
                        {t('analyzePasted')}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">{t('pasteHelp')}</p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'absolute inset-0 flex flex-col justify-center transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]',
                      inputMode === 'media'
                        ? 'opacity-100 translate-x-0 pointer-events-auto'
                        : 'opacity-0 translate-x-6 pointer-events-none'
                    )}
                  >
                    <div
                      className="space-y-6 w-full h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-3 duration-500"
                      style={{
                        transition:
                          'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <MediaUpload
                        onMediaSelect={handleMediaFileUpload}
                        disabled={uploading}
                        uploading={uploading}
                        uploadProgress={uploadProgress}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <section className="w-full max-w-4xl animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
        <h2 className="text-heading-lg sm:text-heading-xl md:text-display-sm font-bold text-center mb-4 text-foreground">
          {t('howItWorks')}
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-center text-body-sm sm:text-body-md text-muted-foreground">
          {t('howItWorks_subtitle')}
        </p>
        <div className="relative grid md:grid-cols-3 gap-4 sm:gap-5">
          <div className="pointer-events-none absolute inset-x-6 top-7 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />

          <Card className="group border-border/50 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/20" style={{ backgroundColor: 'hsl(var(--card) / 0.85)', willChange: 'background-color, transform', backfaceVisibility: 'hidden' }}>
            <CardHeader className="pb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <CardTitle className="text-heading-sm sm:text-heading-md">1. {t('step1_title')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-body-xs sm:text-body-sm text-muted-foreground leading-relaxed">{t('step1_description')}</p>
            </CardContent>
          </Card>
          <Card className="group border-border/50 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/20" style={{ backgroundColor: 'hsl(var(--card) / 0.85)', willChange: 'background-color, transform', backfaceVisibility: 'hidden' }}>
            <CardHeader className="pb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <CardTitle className="text-heading-sm sm:text-heading-md">2. {t('step2_title')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-body-xs sm:text-body-sm text-muted-foreground leading-relaxed">{t('step2_description')}</p>
            </CardContent>
          </Card>
          <Card className="group border-border/50 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/20" style={{ backgroundColor: 'hsl(var(--card) / 0.85)', willChange: 'background-color, transform', backfaceVisibility: 'hidden' }}>
            <CardHeader className="pb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <CardTitle className="text-heading-sm sm:text-heading-md">3. {t('step3_title')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-body-xs sm:text-body-sm text-muted-foreground leading-relaxed">{t('step3_description')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div ref={testimonialsRef} className="w-full flex justify-center">
        {testimonialsVisible ? (
          <TestimonialsSection />
        ) : (
          <div className="h-40 w-full max-w-4xl animate-pulse rounded-xl bg-muted/50" />
        )}
      </div>

      <div ref={donationsRef} className="w-full">
        {donationsVisible ? (
          <Donations />
        ) : (
          <div className="w-full max-w-4xl mx-auto h-[320px] sm:h-[360px] rounded-2xl border border-border/50 bg-muted/30 animate-pulse" />
        )}
      </div>

      <div className="text-center max-w-3xl animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <Shield className="inline h-3.5 w-3.5 mr-1.5 mb-0.5 opacity-80" />
          {t('privacyNote')}
        </p>
      </div>
    </div>
  );
}


