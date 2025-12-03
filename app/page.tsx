'use client';

import { Upload, FileText, Shield, Sparkles, Brain, TrendingUp, HelpCircle, X } from 'lucide-react';

import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { AnalysisProgress } from '../components/analysis/AnalysisProgress';
import { TestimonialsSection } from '../components/layout/Testimonials';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/Button';
import {
  CardBase as Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { FileUpload } from '../components/ui/FileUpload';
import { Separator } from '../components/ui/separator';
import { Spinner } from '../components/ui/spinner';
import type { Conversation, Message, Participant } from '../features/analysis/types';
import { useLanguage } from '../features/i18n';

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
    // For manual/pasted conversations we treat the source as generic;
    // the platform value is mostly informational in the current version.
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

export default function HomePage() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{
    progress: number;
    status: 'starting' | 'parsing' | 'analyzing' | 'media' | 'chunking' | 'finalizing' | 'completed' | 'error';
    currentChunk?: number;
    totalChunks?: number;
    message?: string;
    isPremium?: boolean;
  } | null>(null);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState('');
  const [showExportHelp, setShowExportHelp] = useState(false);

  // Prefetch analysis route so navigation feels as seamless as static pages
  useEffect(() => {
    router.prefetch('/analysis');
  }, [router]);

  // Memoize handlers to prevent unnecessary re-renders
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

  const handleFileSelect = async (
    file: File,
    platform: 'telegram' | 'whatsapp' | 'signal' | 'viber' | 'discord' | 'imessage' | 'messenger' | 'generic'
  ) => {
    setUploading(true);
    setError(null);
    let progressInterval: NodeJS.Timeout | null = null;
    let progressPollInterval: NodeJS.Timeout | null = null;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('platform', platform);

      const importResponse = await fetch('/api/import', {
        method: 'POST',
        body: formData
      });

      if (!importResponse.ok) {
        // Special handling for payload too large (413) which often comes
        // from the hosting platform before our API code runs.
        if (importResponse.status === 413) {
          throw new Error(
            'Import failed: file is too large for the server.\n\n' +
              'Try a smaller export (shorter date range or fewer chats), or split the export into parts.'
          );
        }

        // Check if response is JSON or HTML (error page)
        const contentType = importResponse.headers.get('content-type');
        let errorData;
        
        if (contentType?.includes('application/json')) {
          errorData = await importResponse.json();
        } else {
          // Response is HTML (error page), try to extract error message
          const text = await importResponse.text();
          const statusText = importResponse.statusText || 'Unknown error';
          throw new Error(`Import failed (${importResponse.status} ${statusText}). The server returned an error page. Please try again or contact support.`);
        }
        
        if (errorData.requiresPremium) {
          throw new Error(`${errorData.error}\n\nFeature: ${errorData.feature}`);
        }
        throw new Error(errorData.error || 'Import failed');
      }

      // Verify response is JSON before parsing
      const contentType = importResponse.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await importResponse.text();
        throw new Error(`Invalid response format. Expected JSON but received ${contentType}. Please try again.`);
      }

      const importData = await importResponse.json();
      setConversation(importData.conversation);

      // Automatically start analysis
      setAnalyzing(true);
      // Check if user has premium features
      // In development we temporarily treat all analyses as premium
      // so that all advanced features are available.
      const hasPremium = true;

      setAnalysisProgress({
        progress: 0,
        status: 'starting',
        message: 'Starting AI analysis...',
        isPremium: hasPremium
      });
      
      // Persist subscription info for the analysis page
      sessionStorage.setItem(
        'currentSubscriptionTier',
        'premium'
      );
      sessionStorage.setItem(
        'currentFeatures',
        JSON.stringify({ canAnalyzeMedia: true, canUseEnhancedAnalysis: true })
      );

      // Get conversation ID for progress polling
      const conversationId = importData.conversation.id;
      
      // Store jobId for later use in progress polling
      let jobIdForPolling: string | null = null;

      // Start real progress polling from server (every 2 seconds)
      progressPollInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch(`/api/analyze/progress?conversationId=${encodeURIComponent(conversationId)}`);
          if (progressResponse.ok) {
            const realProgress = await progressResponse.json();
            
            // Debug: log progress response structure when completed
            if (realProgress.status === 'completed' || realProgress.progress === 100) {
              console.log('[Client] Progress response (file upload):', {
                status: realProgress.status,
                progress: realProgress.progress,
                hasResult: !!realProgress.result,
                hasAnalysis: !!realProgress.result?.analysis,
                resultType: typeof realProgress.result,
                resultKeys: realProgress.result ? Object.keys(realProgress.result) : [],
                sectionsCount: realProgress.result?.analysis?.sections?.length || 0
              });
            }

            // Check if analysis is completed
            if (realProgress.status === 'completed' && realProgress.progress === 100) {
              // Don't stop polling immediately - continue for a few more attempts to get result
              // This handles worker isolation issue where GET might hit different worker
              
              // Check if data is already in sessionStorage
              const storedAnalysis = sessionStorage.getItem('currentAnalysis');
              if (storedAnalysis) {
                console.log('[Client] Found data in sessionStorage, navigating');
                // Stop polling
                if (progressPollInterval) {
                  clearInterval(progressPollInterval);
                  progressPollInterval = null;
                }
                // Data is ready, navigate to analysis page
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
              
              // Try to get result from progress response first
              if (realProgress.result && realProgress.result.analysis) {
                console.log('[Client] Found result in progress response, saving to sessionStorage');
                // Stop polling
                if (progressPollInterval) {
                  clearInterval(progressPollInterval);
                  progressPollInterval = null;
                }
                const resultData = realProgress.result;
                // Save to sessionStorage
                sessionStorage.setItem('currentAnalysis', JSON.stringify(resultData.analysis));
                if (resultData.conversation) {
                  sessionStorage.setItem('currentConversation', JSON.stringify(resultData.conversation));
                }
                if (resultData.activityByDay) {
                  sessionStorage.setItem('currentActivityByDay', JSON.stringify(resultData.activityByDay));
                }
                sessionStorage.setItem('currentParticipants', JSON.stringify(importData.participants || []));
                sessionStorage.setItem('currentSubscriptionTier', hasPremium ? 'premium' : 'free');
                sessionStorage.setItem('currentFeatures', JSON.stringify({
                  canAnalyzeMedia: hasPremium && importData.features?.canAnalyzeMedia,
                  canUseEnhancedAnalysis: hasPremium && importData.features?.canUseEnhancedAnalysis
                }));
                
                // Navigate to analysis page
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
              
              // Result not in progress response (worker isolation) - try result endpoint
              // Use a counter to limit retries, but continue polling for a while
              if (!(window as any).__resultFetchAttempts) {
                (window as any).__resultFetchAttempts = 0;
              }
              (window as any).__resultFetchAttempts++;
              
              // Try result-by-conversation endpoint (more reliable)
              // Continue trying for up to 20 attempts (40 seconds with 2s polling)
              if ((window as any).__resultFetchAttempts <= 20) {
                try {
                  // Add small delay to allow result to be saved
                  await new Promise(resolve => setTimeout(resolve, 100));
                  
                  const resultResponse = await fetch(`/api/analyze/result-by-conversation?conversationId=${encodeURIComponent(conversationId)}`);
                  if (resultResponse.ok) {
                    const resultData = await resultResponse.json();
                    if (resultData.analysis) {
                      console.log(`[Client] Got result from endpoint (attempt ${(window as any).__resultFetchAttempts})`);
                      // Stop polling
                      if (progressPollInterval) {
                        clearInterval(progressPollInterval);
                        progressPollInterval = null;
                      }
                      // Save to sessionStorage
                      sessionStorage.setItem('currentAnalysis', JSON.stringify(resultData.analysis));
                      if (resultData.conversation) {
                        sessionStorage.setItem('currentConversation', JSON.stringify(resultData.conversation));
                      }
                      if (resultData.activityByDay) {
                        sessionStorage.setItem('currentActivityByDay', JSON.stringify(resultData.activityByDay));
                      }
                      sessionStorage.setItem('currentParticipants', JSON.stringify(importData.participants || []));
                      sessionStorage.setItem('currentSubscriptionTier', hasPremium ? 'premium' : 'free');
                      sessionStorage.setItem('currentFeatures', JSON.stringify({
                        canAnalyzeMedia: hasPremium && importData.features?.canAnalyzeMedia,
                        canUseEnhancedAnalysis: hasPremium && importData.features?.canUseEnhancedAnalysis
                      }));
                      
                      // Navigate to analysis page
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
                      (window as any).__resultFetchAttempts = 0; // Reset counter
                      return;
                    }
                  } else {
                    console.log(`[Client] Result endpoint returned ${resultResponse.status} (attempt ${(window as any).__resultFetchAttempts})`);
                  }
                } catch (resultError) {
                  console.debug(`[Client] Failed to fetch result (attempt ${(window as any).__resultFetchAttempts}):`, resultError);
                }
              } else {
                // Max attempts reached, stop polling
                console.warn('[Client] Max result fetch attempts reached, stopping polling');
                if (progressPollInterval) {
                  clearInterval(progressPollInterval);
                  progressPollInterval = null;
                }
                (window as any).__resultFetchAttempts = 0; // Reset counter
              }
            }

            // Only update if we got real progress data
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
        } catch (error) {
          // Ignore polling errors, keep last known progress
          console.debug('Progress polling failed:', error);
        }
      }, 2000);

      // Start background analysis job
      const startResponse = await fetch('/api/analyze/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: importData.conversation,
          messages: importData.messages || [],
          mediaArtifacts: hasPremium ? (importData.media || []) : [],
          enhancedAnalysis: hasPremium && importData.features?.canUseEnhancedAnalysis,
          participants: importData.participants || [],
          locale: locale // Pass current locale for prompt translation
        })
      });

      if (!startResponse.ok) {
        const contentTypeStart = startResponse.headers.get('content-type');
        let errorDataStart;

        if (contentTypeStart?.includes('application/json')) {
          errorDataStart = await startResponse.json();
        } else {
          const text = await startResponse.text();
          const statusText = startResponse.statusText || 'Unknown error';
          throw new Error(`Analysis start failed (${startResponse.status} ${statusText}). The server returned an error page. Please try again or contact support.`);
        }

        throw new Error(errorDataStart.error || 'Failed to start analysis');
      }

      const { jobId } = await startResponse.json();
      if (!jobId) {
        throw new Error('Failed to start analysis: jobId is missing in response.');
      }
      
      // Store jobId for progress polling
      jobIdForPolling = jobId;

      // Poll for job result
      let analyzeData: any = null;
      const maxPollAttempts = 600; // allow long-running analyses (~10 minutes with 1s interval)
      let attempts = 0;

      while (attempts < maxPollAttempts) {
        attempts += 1;

        // Check progress first - if completed, check sessionStorage and exit
        try {
          const progressCheck = await fetch(`/api/analyze/progress?conversationId=${encodeURIComponent(conversationId)}`);
          if (progressCheck.ok) {
            const progressData = await progressCheck.json();
            if (progressData.status === 'completed' && progressData.progress === 100) {
              // Analysis is complete, check sessionStorage
              const storedAnalysis = sessionStorage.getItem('currentAnalysis');
              if (storedAnalysis) {
                // Data is ready, break out of loop
                analyzeData = { analysis: JSON.parse(storedAnalysis) };
                const storedConv = sessionStorage.getItem('currentConversation');
                if (storedConv) {
                  analyzeData.conversation = JSON.parse(storedConv);
                }
                const storedActivity = sessionStorage.getItem('currentActivityByDay');
                if (storedActivity) {
                  analyzeData.activityByDay = JSON.parse(storedActivity);
                }
                break;
              }
            }
          }
        } catch {
          // Ignore progress check errors
        }

        const resultResponse = await fetch(`/api/analyze/result?jobId=${encodeURIComponent(jobId)}`, {
          method: 'GET'
        });

        if (resultResponse.status === 404) {
          // Job not found - check if analysis is completed via progress
          // If not completed yet, wait and retry
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        const contentTypeResult = resultResponse.headers.get('content-type');
        const isJson = contentTypeResult?.includes('application/json');
        const payload = isJson ? await resultResponse.json() : null;

        if (resultResponse.status === 202) {
          // Job still running or queued – update simulated progress lightly if needed
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        if (!resultResponse.ok) {
          const message =
            payload?.error ||
            (resultResponse.status === 500
              ? locale === 'ru'
                ? 'Анализ завершился с ошибкой на сервере. Попробуйте ещё раз позже.'
                : 'Analysis failed on the server. Please try again later.'
              : `Analysis failed (${resultResponse.status}).`);
          throw new Error(message);
        }

        // 200 OK with result
        analyzeData = payload;
        break;
      }

      if (!analyzeData) {
        throw new Error(
          locale === 'ru'
            ? 'Анализ занял слишком много времени. Попробуйте разделить переписку на части и проанализировать по очереди.'
            : 'Analysis took too long. Please try splitting the conversation into parts and analyzing them separately.'
        );
      }

      // Clear both progress intervals
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      if (progressPollInterval) {
        clearInterval(progressPollInterval);
        progressPollInterval = null;
      }
      
      // Update progress: completed
      setAnalysisProgress({
        progress: 100,
        status: 'completed',
        message: 'Analysis complete!'
      });
      
      // Store in session for the analysis page
      sessionStorage.setItem('currentAnalysis', JSON.stringify(analyzeData.analysis));
      sessionStorage.setItem('currentConversation', JSON.stringify(analyzeData.conversation));
      if (analyzeData.activityByDay) {
        sessionStorage.setItem('currentActivityByDay', JSON.stringify(analyzeData.activityByDay));
      }
      sessionStorage.setItem('currentParticipants', JSON.stringify(importData.participants || []));
      sessionStorage.setItem('currentSubscriptionTier', hasPremium ? 'premium' : 'free');
      sessionStorage.setItem('currentFeatures', JSON.stringify({
        canAnalyzeMedia: hasPremium && importData.features?.canAnalyzeMedia,
        canUseEnhancedAnalysis: hasPremium && importData.features?.canUseEnhancedAnalysis
      }));
      
      // Prefetch and navigate to analysis page - data is already in sessionStorage
      router.prefetch('/analysis');
      // Small delay to ensure sessionStorage is written
      requestAnimationFrame(() => {
        router.push('/analysis');
      });
    } catch (err) {
      // Clear both progress intervals
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      if (progressPollInterval) {
        clearInterval(progressPollInterval);
        progressPollInterval = null;
      }
      const message = (err as Error).message || 'An error occurred';
      // Normalize generic network error into a more helpful message
      const normalized =
        message === 'Failed to fetch'
          ? locale === 'ru'
            ? 'Сервер не ответил вовремя или соединение было прервано. Попробуйте ещё раз чуть позже.'
            : 'The server did not respond in time or the connection was interrupted. Please try again in a moment.'
          : message;
      setError(normalized);
      setUploading(false);
      setAnalyzing(false);
      setAnalysisProgress({
        progress: 0,
        status: 'error',
        message: (err as Error).message || 'Analysis failed'
      });
    }
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

    setError(null);
    setConversation(null);
    let progressInterval: NodeJS.Timeout | null = null;
    let progressPollInterval: NodeJS.Timeout | null = null;

    try {
      const { conversation: manualConversation, participants, messages } =
        parsePastedConversation(text);

      setAnalyzing(true);
      setAnalysisProgress({
        progress: 0,
        status: 'starting',
        message: 'Starting AI analysis...',
        isPremium: false
      });

      // Get conversation ID for progress polling
      const conversationId = manualConversation.id;

      // Start real progress polling from server (every 2 seconds)
      progressPollInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch(`/api/analyze/progress?conversationId=${encodeURIComponent(conversationId)}`);
          if (progressResponse.ok) {
            const realProgress = await progressResponse.json();
            
            // Debug: log progress response structure when completed
            if (realProgress.status === 'completed' || realProgress.progress === 100) {
              console.log('[Client] Progress response (paste text):', {
                status: realProgress.status,
                progress: realProgress.progress,
                hasResult: !!realProgress.result,
                hasAnalysis: !!realProgress.result?.analysis,
                resultType: typeof realProgress.result,
                resultKeys: realProgress.result ? Object.keys(realProgress.result) : [],
                sectionsCount: realProgress.result?.analysis?.sections?.length || 0
              });
            }

            // Check if analysis is completed
            if (realProgress.status === 'completed' && realProgress.progress === 100) {
              // Stop polling
              if (progressPollInterval) {
                clearInterval(progressPollInterval);
                progressPollInterval = null;
              }
              
              // Check if data is already in sessionStorage
              const storedAnalysis = sessionStorage.getItem('currentAnalysis');
              if (storedAnalysis) {
                console.log('[Client] Found data in sessionStorage (paste), navigating');
                // Data is ready, navigate to analysis page
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
              
              // Try to get result from progress response
              if (realProgress.result && realProgress.result.analysis) {
                console.log('[Client] Found result in progress response (paste), saving to sessionStorage');
                // Stop polling
                if (progressPollInterval) {
                  clearInterval(progressPollInterval);
                  progressPollInterval = null;
                }
                const resultData = realProgress.result;
                // Save to sessionStorage
                sessionStorage.setItem('currentAnalysis', JSON.stringify(resultData.analysis));
                if (resultData.conversation) {
                  sessionStorage.setItem('currentConversation', JSON.stringify(resultData.conversation));
                }
                if (resultData.activityByDay) {
                  sessionStorage.setItem('currentActivityByDay', JSON.stringify(resultData.activityByDay));
                }
                sessionStorage.setItem('currentParticipants', JSON.stringify(participants || []));
                sessionStorage.setItem('currentSubscriptionTier', 'premium');
                sessionStorage.setItem('currentFeatures', JSON.stringify({
                  canAnalyzeMedia: true,
                  canUseEnhancedAnalysis: true
                }));
                
                // Navigate to analysis page
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
              
              // Result not in progress response (worker isolation) - try result endpoint
              // Use a counter to limit retries
              if (!(window as any).__resultFetchAttemptsPaste) {
                (window as any).__resultFetchAttemptsPaste = 0;
              }
              (window as any).__resultFetchAttemptsPaste++;
              
              // Try result-by-conversation endpoint (more reliable)
              if ((window as any).__resultFetchAttemptsPaste <= 10) {
                try {
                  const resultResponse = await fetch(`/api/analyze/result-by-conversation?conversationId=${encodeURIComponent(conversationId)}`);
                  if (resultResponse.ok) {
                    const resultData = await resultResponse.json();
                    if (resultData.analysis) {
                      console.log(`[Client] Got result from endpoint (paste, attempt ${(window as any).__resultFetchAttemptsPaste})`);
                      // Stop polling
                      if (progressPollInterval) {
                        clearInterval(progressPollInterval);
                        progressPollInterval = null;
                      }
                      // Save to sessionStorage
                      sessionStorage.setItem('currentAnalysis', JSON.stringify(resultData.analysis));
                      if (resultData.conversation) {
                        sessionStorage.setItem('currentConversation', JSON.stringify(resultData.conversation));
                      }
                      if (resultData.activityByDay) {
                        sessionStorage.setItem('currentActivityByDay', JSON.stringify(resultData.activityByDay));
                      }
                      sessionStorage.setItem('currentParticipants', JSON.stringify(participants || []));
                      sessionStorage.setItem('currentSubscriptionTier', 'premium');
                      sessionStorage.setItem('currentFeatures', JSON.stringify({
                        canAnalyzeMedia: true,
                        canUseEnhancedAnalysis: true
                      }));
                      
                      // Navigate to analysis page
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
                      (window as any).__resultFetchAttemptsPaste = 0; // Reset counter
                      return;
                    }
                  }
                } catch (resultError) {
                  console.debug(`[Client] Failed to fetch result (paste, attempt ${(window as any).__resultFetchAttemptsPaste}):`, resultError);
                }
              } else {
                // Max attempts reached, stop polling
                console.warn('[Client] Max result fetch attempts reached (paste), stopping polling');
                if (progressPollInterval) {
                  clearInterval(progressPollInterval);
                  progressPollInterval = null;
                }
                (window as any).__resultFetchAttemptsPaste = 0; // Reset counter
              }
            }

            // Only update if we got real progress data
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
        } catch (error) {
          // Ignore polling errors, keep last known progress
          console.debug('Progress polling failed:', error);
        }
      }, 2000);

      // Start background analysis job for pasted conversation
      const startResponse = await fetch('/api/analyze/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: manualConversation,
          messages,
          mediaArtifacts: [],
          // In development we always request enhanced analysis
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

      const { jobId } = await startResponse.json();
      if (!jobId) {
        throw new Error('Failed to start analysis: jobId is missing in response.');
      }

      let analyzeData: any = null;
      const maxPollAttempts = 600;
      let attempts = 0;

      while (attempts < maxPollAttempts) {
        attempts += 1;

        // Check progress first - if completed, check sessionStorage and exit
        try {
          const progressCheck = await fetch(`/api/analyze/progress?conversationId=${encodeURIComponent(conversationId)}`);
          if (progressCheck.ok) {
            const progressData = await progressCheck.json();
            if (progressData.status === 'completed' && progressData.progress === 100) {
              // Analysis is complete, check sessionStorage
              const storedAnalysis = sessionStorage.getItem('currentAnalysis');
              if (storedAnalysis) {
                // Data is ready, break out of loop
                analyzeData = { analysis: JSON.parse(storedAnalysis) };
                const storedConv = sessionStorage.getItem('currentConversation');
                if (storedConv) {
                  analyzeData.conversation = JSON.parse(storedConv);
                }
                const storedActivity = sessionStorage.getItem('currentActivityByDay');
                if (storedActivity) {
                  analyzeData.activityByDay = JSON.parse(storedActivity);
                }
                break;
              }
            }
          }
        } catch {
          // Ignore progress check errors
        }

        const resultResponse = await fetch(
          `/api/analyze/result?jobId=${encodeURIComponent(jobId)}`,
          {
            method: 'GET'
          }
        );

        if (resultResponse.status === 404) {
          // Job not found - check if analysis is completed via progress
          // If not completed yet, wait and retry
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        const contentTypeResult = resultResponse.headers.get('content-type');
        const isJson = contentTypeResult?.includes('application/json');
        const payload = isJson ? await resultResponse.json() : null;

        if (resultResponse.status === 202) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        if (!resultResponse.ok) {
          const message =
            payload?.error ||
            (resultResponse.status === 500
              ? locale === 'ru'
                ? 'Анализ завершился с ошибкой на сервере. Попробуйте ещё раз позже.'
                : 'Analysis failed on the server. Please try again later.'
              : `Analysis failed (${resultResponse.status}).`);
          throw new Error(message);
        }

        analyzeData = payload;
        break;
      }

      if (!analyzeData) {
        throw new Error(
          locale === 'ru'
            ? 'Анализ занял слишком много времени. Попробуйте разделить переписку на части и проанализировать по очереди.'
            : 'Analysis took too long. Please try splitting the conversation into parts and analyzing them separately.'
        );
      }

      // Clear both progress intervals
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      if (progressPollInterval) {
        clearInterval(progressPollInterval);
        progressPollInterval = null;
      }

      setAnalysisProgress({
        progress: 100,
        status: 'completed',
        message: 'Analysis complete!',
        isPremium: true
      });

      sessionStorage.setItem('currentAnalysis', JSON.stringify(analyzeData.analysis));
      sessionStorage.setItem('currentConversation', JSON.stringify(analyzeData.conversation));
      if (analyzeData.activityByDay) {
        sessionStorage.setItem('currentActivityByDay', JSON.stringify(analyzeData.activityByDay));
      }
      sessionStorage.setItem('currentParticipants', JSON.stringify(participants));
      sessionStorage.setItem('currentSubscriptionTier', 'premium');
      sessionStorage.setItem(
        'currentFeatures',
        JSON.stringify({ canAnalyzeMedia: true, canUseEnhancedAnalysis: true })
      );
      
      // Prefetch and navigate to analysis page - data is already in sessionStorage
      router.prefetch('/analysis');
      // Small delay to ensure sessionStorage is written
      requestAnimationFrame(() => {
        router.push('/analysis');
      });
    } catch (err) {
      // Clear both progress intervals
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      if (progressPollInterval) {
        clearInterval(progressPollInterval);
        progressPollInterval = null;
      }
      const message = (err as Error).message || 'An error occurred';
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
        message: (err as Error).message || 'Analysis failed',
        isPremium: false
      });
    }
  };

  // Rotating hero tagline (every 5 seconds), highlighting science under the hood.
  // Memoize taglines to prevent re-computation on every render
  const taglines = useMemo(() => [
    t('hero_tagline'),
    t('hero_tagline_alt1'),
    t('hero_tagline_alt2')
  ].filter(Boolean), [t]);

  const currentTagline = useMemo(
    () => taglines.length > 0 ? taglines[taglineIndex % taglines.length] : '',
    [taglines, taglineIndex]
  );

  useEffect(() => {
    if (taglines.length <= 1) return;

    const id = window.setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 5000);

    return () => window.clearInterval(id);
  }, [taglines.length]);
  
  // Reset animation when tagline changes
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [taglineIndex]);

  // Rotating preview chat messages to feel like a live conversation
  // Order: more vulnerable side (right) writes first, more dismissive/invalidating side (left) responds
  // Logical flow: one side expresses concern → the other dismisses → first tries to clarify → second deflects → escalation
  const previewScript = React.useMemo(() => [
    { id: 'm1', side: 'right' as const, text: t('hero_preview_msg1_right') }, // victim: "I remember it differently"
    { id: 'm2', side: 'left' as const, text: t('hero_preview_msg1_left') }, // abuser: "You're overreacting"
    { id: 'm3', side: 'right' as const, text: t('hero_preview_msg2_right') }, // victim: "I just want to talk honestly"
    { id: 'm4', side: 'left' as const, text: t('hero_preview_msg2_left') }, // abuser: "If you loved me..."
    { id: 'm5', side: 'right' as const, text: t('hero_preview_msg3_right') }, // victim: "I have messages saved"
    { id: 'm6', side: 'left' as const, text: t('hero_preview_msg3_left') }, // abuser: "I never said that"
    { id: 'm7', side: 'right' as const, text: t('hero_preview_msg4_right') }, // victim: "It's about what you said"
    { id: 'm8', side: 'left' as const, text: t('hero_preview_msg4_left') }, // abuser: "You're too sensitive"
    { id: 'm9', side: 'right' as const, text: t('hero_preview_msg5_right') }, // victim: "I just want to understand"
    { id: 'm10', side: 'left' as const, text: t('hero_preview_msg5_left') } // abuser: "Everyone else thinks I'm fine"
  ].filter((m) => m.text), [t, locale]);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<typeof previewScript>([]);
  const [messageKey, setMessageKey] = useState(0);

  // Initialize with first message when script changes
  useEffect(() => {
    if (previewScript.length === 0) return;
    setCurrentMessageIndex(0);
    setVisibleMessages([previewScript[0]]);
    setMessageKey((k) => k + 1);
  }, [locale, previewScript]);

  // Sequential message flow: add next message in order
  useEffect(() => {
    if (previewScript.length <= 1) return;
    if (currentMessageIndex >= previewScript.length) return;

    const timer = setTimeout(() => {
      const nextIndex = currentMessageIndex + 1;
      
      if (nextIndex < previewScript.length) {
        const nextMessage = previewScript[nextIndex];
        setVisibleMessages((prev) => {
          const updated = [...prev, nextMessage];
          // Keep last 3-4 messages visible for scrolling effect
          return updated.slice(-4);
        });
        setCurrentMessageIndex(nextIndex);
        setMessageKey((k) => k + 1);
      } else {
        // Reached end of script - restart from beginning after a pause
        setTimeout(() => {
          setCurrentMessageIndex(0);
          setVisibleMessages([previewScript[0]]);
          setMessageKey((k) => k + 1);
        }, 3000);
      }
    }, 3500); // Slightly faster for better flow

    return () => clearTimeout(timer);
  }, [currentMessageIndex, previewScript]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 md:gap-12 px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="w-full flex flex-col items-center gap-6 md:gap-10 py-6 sm:py-8 md:py-10">
        {/* Hero copy */}
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
              "text-balance text-3xl sm:text-4xl md:text-5xl font-bold leading-tight max-w-[28ch] text-foreground min-h-[9rem] sm:min-h-[10rem] md:min-h-[12rem] lg:min-h-[14rem] flex items-center",
              isAnimating && "tagline-animate"
            )}
          >
            {currentTagline}
          </h1>

          {/* Short, low-weight supporting text */}
          <p className="max-w-xl text-body-sm sm:text-body-md text-muted-foreground leading-relaxed">
            {t('hero_copy')}
          </p>

          {/* Badges - moved under description */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary dark:text-white border-primary/20 text-body-xs">
              <Brain className="mr-1.5 h-3.5 w-3.5" />
              {t('hero_badge_patterns')}
            </Badge>
            <Badge variant="secondary" className="!bg-emerald-500/15 text-primary dark:text-white !border-emerald-500/25 text-body-xs">
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              {t('hero_badge_boundaries')}
            </Badge>
            <Badge variant="secondary" className="bg-secondary/20 text-primary dark:text-white border-secondary/30 text-body-xs">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {t('hero_badge_multilang')}
            </Badge>
          </div>
        </div>

        {/* Visual conversation preview */}
        <div className="relative w-full max-w-md mx-auto">
          <Card className="phone-glass-card relative z-10 border-border/40 overflow-hidden transition-all duration-300 hover:shadow-primary/25">
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 phone-glass-content">
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white/95">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {t('hero_preview_title')}
                </CardTitle>
                <CardDescription className="text-xs text-white/70">
                  {t('hero_preview_subtitle')}
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-white/20 bg-white/10 text-[10px] uppercase tracking-wide text-white/90 backdrop-blur-sm">
                <Sparkles className="mr-1 h-3 w-3" />
                {t('hero_preview_live')}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 overflow-hidden phone-glass-content">
              <div className="flex flex-col gap-1.5 relative h-[200px] overflow-hidden">
                <div className="absolute inset-0 flex flex-col gap-1.5 justify-end pb-0">
                  {visibleMessages.map((msg, idx) => {
                    const isNew = idx === visibleMessages.length - 1;
                    const messageAge = visibleMessages.length - 1 - idx; // 0 = newest, higher = older
                    // Keep new and middle messages bright, only fade the oldest ones
                    const opacity = messageAge <= 1 ? 1 : Math.max(0.4, 1 - (messageAge - 1) * 0.4);
                    const scale = messageAge <= 1 ? 1 : Math.max(0.92, 1 - (messageAge - 1) * 0.03);
                    
                    return (
                      <div
                        key={`${msg.id}-${messageKey}-${idx}`}
                        className={cn(
                          'max-w-[85%] rounded-2xl px-3 py-2 text-left text-xs shadow-sm transition-all duration-500',
                          msg.side === 'right' && 'ml-auto',
                          isNew && 'animate-slide-in-from-bottom-enhanced',
                          // Force colors with important-like specificity
                          msg.side === 'left' 
                            ? '!bg-gray-200 dark:!bg-gray-700 !text-gray-900 dark:!text-gray-100'
                            : '!bg-blue-500 dark:!bg-blue-600 !text-white'
                        )}
                        style={{
                          animationFillMode: 'both',
                          opacity,
                          transform: `scale(${scale}) translate3d(0,0,0)`,
                          willChange: isNew ? 'transform, opacity' : 'opacity',
                          backfaceVisibility: 'hidden',
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
                  <span className="text-xs font-semibold text-emerald-400">
                    {t('hero_preview_score_low')}
                  </span>
                  <div className="flex h-1.5 w-16 overflow-hidden rounded-full bg-black/30 backdrop-blur-sm">
                    <span className="h-full w-2/5 bg-emerald-400" />
                    <span className="h-full w-1/5 bg-amber-400" />
                    <span className="h-full w-2/5 bg-red-500/70 opacity-70" />
                  </div>
                </div>
              </div>

              {/* Typing / live indicator */}
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
          
          {/* CTA and How It Works - moved under preview card */}
          <div className="flex flex-col items-center gap-3 mt-6 w-full">
            <Button
              size="lg"
              onClick={handleScrollToUpload}
              className="w-full sm:w-auto"
            >
              {t('hero_cta')}
            </Button>
            <p className="text-xs sm:text-[13px] text-muted-foreground max-w-xs text-center">
              <span className="font-medium text-foreground">{t('howItWorks')}</span>{' '}
              {t('step1_title')}, {t('step2_title').toLowerCase?.() ?? t('step2_title')},{' '}
              {t('step3_title').toLowerCase?.() ?? t('step3_title')}.
            </p>
          </div>
        </div>
      </div>

      {/* Main Card - Enhanced with better visual hierarchy and interactions */}
      <Card 
        className={cn(
          "w-full max-w-2xl shadow-xl border-border/30 backdrop-blur-md animate-fade-in group/upload-card",
          analyzing && "analyzing"
        )}
        style={{ 
          animationDelay: '0.3s', 
          animationFillMode: 'both', 
          backgroundColor: 'hsl(var(--card) / 0.85)', 
          willChange: 'background-color, opacity, backdrop-filter, transform', 
          backfaceVisibility: 'hidden', 
          '--card-bg': 'hsl(var(--card) / 0.85)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        } as React.CSSProperties} 
        data-upload-card
      >
        <CardHeader className="space-y-3 pb-4 text-center">
          <div className="flex flex-col items-center gap-3">
            {/* Enhanced icon with gradient background and pulse animation - centered */}
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
          className="space-y-4 flex flex-col items-center relative" 
          style={{ 
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            minHeight: '200px',
            willChange: 'height, min-height, padding'
          }}
        >
          {error && (
            <Alert variant="destructive" className="border-destructive/50 w-full max-w-lg animate-in fade-in slide-in-from-top-2">
              <Shield className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

           {analyzing ? (
             <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
               <div className="flex flex-col items-center justify-center py-8 space-y-4 w-full">
                 {analysisProgress ? (
                   <>
                     {typeof analysisProgress.isPremium === 'boolean' && (
                       <div className="mb-2 w-full max-w-lg text-center text-[11px] sm:text-xs text-muted-foreground">
                         {analysisProgress.isPremium
                           ? t('premium_progress_hint')
                           : t('free_progress_hint')}
                       </div>
                     )}
                     <AnalysisProgress
                       progress={analysisProgress.progress}
                       status={analysisProgress.status}
                       currentChunk={analysisProgress.currentChunk}
                       totalChunks={analysisProgress.totalChunks}
                       message={analysisProgress.message}
                       isPremium={analysisProgress.isPremium}
                     />
                   </>
                 ) : (
                   <>
                     <Spinner className="h-8 w-8 text-primary" />
                     <p className="text-lg font-medium text-foreground">{t('analyzing')}</p>
                     <p className="text-sm text-muted-foreground">AI is analyzing your conversation...</p>
                   </>
                 )}
               </div>
              <div
                role="alert"
                className="border-primary/30 bg-primary/5 mt-2 w-full max-w-lg rounded-lg border px-4 py-3 text-xs text-foreground flex items-center gap-2"
              >
                <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="leading-relaxed">
                  {t('progress_disclaimer')}
                </span>
              </div>
             </div>
           ) : (
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="flex justify-center w-full">
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
                </div>
              </div>

              <div 
                className="w-full max-w-lg relative" 
                style={{ 
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  minHeight: '420px',
                  willChange: 'height, min-height'
                }}
              >
                {inputMode === 'file' ? (
                  <div 
                    className="w-full flex flex-col items-center h-full" 
                    style={{
                      animation: 'fadeInSlideRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      transition: 'opacity 0.3s ease-in-out, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      minHeight: '420px'
                    }}
                  >
                    <div className="w-full space-y-6 flex flex-col h-full">
                      <FileUpload
                        onFileSelect={handleFileSelect}
                        disabled={uploading}
                      />
                      
                      {conversation && (
                        <Alert className="border-primary/30 bg-primary/5 w-full mt-4 animate-in fade-in slide-in-from-bottom-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <AlertTitle className="text-primary">Import Successful</AlertTitle>
                          <AlertDescription>
                            {t('imported')}: <strong>{conversation.messageCount}</strong> {t('messages')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                ) : (
                  <div 
                    className="space-y-6 w-full h-full flex flex-col" 
                    style={{
                      animation: 'fadeInSlideLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      transition: 'opacity 0.3s ease-in-out, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      minHeight: '420px'
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
                        <span>
                          {pastedText.length}/8000
                        </span>
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
                    <p className="text-xs text-muted-foreground text-center">
                      {t('pasteHelp')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works section */}
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
              <p className="text-body-xs sm:text-body-sm text-muted-foreground leading-relaxed">
                {t('step1_description')}
              </p>
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
              <p className="text-body-xs sm:text-body-sm text-muted-foreground leading-relaxed">
                {t('step2_description')}
              </p>
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
              <p className="text-body-xs sm:text-body-sm text-muted-foreground leading-relaxed">
                {t('step3_description')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Social proof / testimonials */}
      <TestimonialsSection />

      {/* Privacy / disclaimer - moved after testimonials */}
      <div className="text-center max-w-3xl animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
        <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-background/60 px-4 py-2 border border-border/40 shadow-sm mb-3">
          <Badge variant="secondary" className="!bg-emerald-500/15 text-primary dark:text-white !border-emerald-500/25">
            <Shield className="mr-1.5 h-3.5 w-3.5" />
            {t('privacy_chip_no_sharing')}
          </Badge>
          <Badge variant="secondary" className="bg-primary/10 text-primary dark:text-white border-primary/20">
            {t('privacy_chip_local_session')}
          </Badge>
          <Badge variant="secondary" className="bg-secondary/20 text-primary dark:text-white border-secondary/30">
            {t('privacy_chip_control')}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <Shield className="inline h-3.5 w-3.5 mr-1.5 mb-0.5 opacity-80" />
          {t('privacyNote')}
        </p>
      </div>

    </div>
  );
}
