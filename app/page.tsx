'use client';

import { Upload, FileText, Shield, Sparkles, Brain, TrendingUp, HelpCircle, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
    sourcePlatform: 'telegram',
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{
    progress: number;
    status: 'starting' | 'parsing' | 'analyzing' | 'media' | 'chunking' | 'completed' | 'error';
    currentChunk?: number;
    totalChunks?: number;
    message?: string;
    isPremium?: boolean;
  } | null>(null);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState('');
  const [showExportHelp, setShowExportHelp] = useState(false);

  const handleFileSelect = async (file: File, platform: 'telegram' | 'whatsapp' | 'signal' | 'viber' | 'discord' | 'imessage' | 'messenger') => {
    setUploading(true);
    setError(null);
    let progressInterval: NodeJS.Timeout | null = null;

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
      const hasPremium = importData.subscriptionTier === 'premium' || 
                         importData.features?.canAnalyzeMedia === true;

      setAnalysisProgress({
        progress: 0,
        status: 'starting',
        message: 'Starting AI analysis...',
        isPremium: hasPremium
      });
      
      // Persist subscription info for the analysis page
      sessionStorage.setItem(
        'currentSubscriptionTier',
        importData.subscriptionTier || 'free'
      );
      sessionStorage.setItem(
        'currentFeatures',
        JSON.stringify(importData.features || {})
      );

      // Start a client-side simulated progress bar so that we don't depend on
      // server-side in-memory state (which is unreliable on serverless hosts).
      progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (!prev) return prev;
          if (prev.status === 'completed' || prev.status === 'error') {
            return prev;
          }

          const nextProgress = Math.min(prev.progress + 3, 90); // ease towards 90%
          let nextStatus = prev.status;

          if (nextProgress >= 5 && nextProgress < 20) {
            nextStatus = 'parsing';
          } else if (nextProgress >= 20 && nextProgress < 60) {
            nextStatus = 'analyzing';
          } else if (nextProgress >= 60) {
            nextStatus = 'chunking';
          }

          return {
            ...prev,
            progress: nextProgress,
            status: nextStatus
          };
        });
      }, 1000);

      const analyzeResponse = await fetch('/api/analyze', {
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

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      if (!analyzeResponse.ok) {
        // Check if response is JSON or HTML (error page)
        const contentType = analyzeResponse.headers.get('content-type');
        let errorData;
        
        if (contentType?.includes('application/json')) {
          errorData = await analyzeResponse.json();
        } else {
          // Response is HTML (error page), try to extract error message
          const text = await analyzeResponse.text();
          const statusText = analyzeResponse.statusText || 'Unknown error';
          throw new Error(`Analysis failed (${analyzeResponse.status} ${statusText}). The server returned an error page. Please try again or contact support.`);
        }
        
        if (errorData.requiresPremium) {
          throw new Error(`${errorData.error}\n\nFeature: ${errorData.feature}`);
        }
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analyzeData = await analyzeResponse.json();
      
      // Update progress: completed
      setAnalysisProgress({
        progress: 100,
        status: 'completed',
        message: 'Analysis complete!'
      });
      
      // Store in session for the analysis page
      sessionStorage.setItem('currentAnalysis', JSON.stringify(analyzeData.analysis));
      sessionStorage.setItem('currentConversation', JSON.stringify(analyzeData.conversation));
      sessionStorage.setItem('currentParticipants', JSON.stringify(importData.participants || []));

      // Redirect immediately without delay to avoid white flash
      window.location.replace('/analysis');
    } catch (err) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setError((err as Error).message || 'An error occurred');
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

      progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (!prev) return prev;
          if (prev.status === 'completed' || prev.status === 'error') {
            return prev;
          }

          const nextProgress = Math.min(prev.progress + 3, 90);
          let nextStatus = prev.status;

          if (nextProgress >= 5 && nextProgress < 20) {
            nextStatus = 'parsing';
          } else if (nextProgress >= 20 && nextProgress < 60) {
            nextStatus = 'analyzing';
          } else if (nextProgress >= 60) {
            nextStatus = 'chunking';
          }

          return {
            ...prev,
            progress: nextProgress,
            status: nextStatus
          };
        });
      }, 1000);

      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: manualConversation,
          messages,
          mediaArtifacts: [],
          enhancedAnalysis: false,
          participants,
          locale
        })
      });

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      if (!analyzeResponse.ok) {
        const contentType = analyzeResponse.headers.get('content-type');
        let errorData;

        if (contentType?.includes('application/json')) {
          errorData = await analyzeResponse.json();
        } else {
          const textBody = await analyzeResponse.text();
          const statusText = analyzeResponse.statusText || 'Unknown error';
          throw new Error(
            `Analysis failed (${analyzeResponse.status} ${statusText}). The server returned an error page. Please try again or contact support.`
          );
        }

        if (errorData.requiresPremium) {
          throw new Error(`${errorData.error}\n\nFeature: ${errorData.feature}`);
        }
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analyzeData = await analyzeResponse.json();

      setAnalysisProgress({
        progress: 100,
        status: 'completed',
        message: 'Analysis complete!',
        isPremium: false
      });

      sessionStorage.setItem('currentAnalysis', JSON.stringify(analyzeData.analysis));
      sessionStorage.setItem('currentConversation', JSON.stringify(analyzeData.conversation));
      sessionStorage.setItem('currentParticipants', JSON.stringify(participants));
      sessionStorage.setItem('currentSubscriptionTier', 'free');
      sessionStorage.setItem(
        'currentFeatures',
        JSON.stringify({ canAnalyzeMedia: false, canUseEnhancedAnalysis: false })
      );

      window.location.replace('/analysis');
    } catch (err) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setError((err as Error).message || 'An error occurred');
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
  const taglines = [
    t('hero_tagline'),
    t('hero_tagline_alt1'),
    t('hero_tagline_alt2')
  ].filter(Boolean);

  const currentTagline =
    taglines.length > 0 ? taglines[taglineIndex % taglines.length] : '';

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

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 md:gap-20 px-4 sm:px-6 py-12 sm:py-20">
      {/* Hero Section */}
      <div className="flex flex-col items-center gap-6 text-center w-full py-8 md:py-12">
        <Badge 
          variant="outline" 
          className="border-primary/30 text-primary px-3 sm:px-4 py-1.5 text-xs font-medium tracking-wider uppercase"
        >
          <Sparkles className="mr-2 h-3 w-3" />
          AI-Powered Gaslight Detection
        </Badge>
        
        <h1 
          key={taglineIndex}
          className={cn(
            "text-balance text-3xl sm:text-4xl md:text-5xl font-bold leading-tight max-w-[28ch] mx-auto text-foreground",
            isAnimating && "tagline-animate"
          )}
        >
          {currentTagline}
        </h1>
        
        <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          {t('hero_copy')}
        </p>
        <Button
          size="lg"
          onClick={() => {
            const uploadCard = document.querySelector('[data-upload-card]');
            if (uploadCard) {
              uploadCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="mt-2"
        >
          {t('hero_cta')}
        </Button>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-2xl shadow-xl border-border/30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg" data-upload-card>
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="rounded-lg bg-primary/10 p-2">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl sm:text-2xl">{t('uploadExport')}</CardTitle>
                  <button
                    type="button"
                    onClick={() => setShowExportHelp(!showExportHelp)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-background/60 hover:bg-background/80 hover:border-accent/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 flex-shrink-0"
                    aria-label={t('exportHelpTitle')}
                    aria-expanded={showExportHelp}
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-primary" />
                  </button>
                </div>
                {!analyzing && (
                  <CardDescription className="text-sm sm:text-base mt-1">
                    {t('uploadExportDescription')}
                  </CardDescription>
                )}
              </div>
            </div>
          </div>
          {showExportHelp && (
            <div className="mt-3 p-4 rounded-lg border border-primary/30 bg-primary/5 dark:bg-primary/10 backdrop-blur-md shadow-md animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  {t('exportHelpTitle')}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowExportHelp(false)}
                  className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground list-disc list-inside">
                <li>{t('exportHelpTelegram')}</li>
                <li>{t('exportHelpWhatsApp')}</li>
                <li>{t('exportHelpOther')}</li>
              </ul>
            </div>
          )}
        </CardHeader>

        <Separator className="mb-6" />

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-destructive/50">
              <Shield className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

           {analyzing ? (
             <>
               <div className="flex flex-col items-center justify-center py-12 space-y-6">
                 {analysisProgress ? (
                   <AnalysisProgress
                     progress={analysisProgress.progress}
                     status={analysisProgress.status}
                     currentChunk={analysisProgress.currentChunk}
                     totalChunks={analysisProgress.totalChunks}
                     message={analysisProgress.message}
                     isPremium={analysisProgress.isPremium}
                   />
                 ) : (
                   <>
                     <Spinner className="h-8 w-8 text-primary" />
                     <p className="text-lg font-medium text-foreground">{t('analyzing')}</p>
                     <p className="text-sm text-muted-foreground">AI is analyzing your conversation...</p>
                   </>
                 )}
               </div>
               <Alert className="border-primary/30 bg-primary/5 mt-2">
                 <Shield className="h-4 w-4 text-primary" />
                 <AlertDescription className="text-xs text-foreground">
                   {t('progress_disclaimer')}
                 </AlertDescription>
               </Alert>
             </>
           ) : (
            <>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="inline-flex items-center rounded-full border border-border bg-muted/50 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setInputMode('file')}
                      className={cn(
                        'px-3 py-1 rounded-full transition-colors',
                        inputMode === 'file'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {t('inputMode_upload')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('paste')}
                      className={cn(
                        'px-3 py-1 rounded-full transition-colors',
                        inputMode === 'paste'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {t('inputMode_paste')}
                    </button>
                  </div>
                </div>

                {inputMode === 'file' ? (
                  <>
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      disabled={uploading}
                    />
                    
                    {conversation && (
                      <Alert className="border-primary/30 bg-primary/5">
                        <FileText className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-primary">Import Successful</AlertTitle>
                        <AlertDescription>
                          {t('imported')}: <strong>{conversation.messageCount}</strong> {t('messages')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      {t('pasteLabel')}
                    </label>
                    <textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      maxLength={8000}
                      rows={8}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder={t('pastePlaceholder')}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {pastedText.length}/8000
                      </span>
                      <span>{t('pasteHelp')}</span>
                    </div>
                    <Button
                      type="button"
                      onClick={handlePasteAnalyze}
                      disabled={analyzing || !pastedText.trim()}
                      className="w-full"
                    >
                      {t('analyzePasted')}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* How it works section */}
      <section className="w-full max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
          {t('howItWorks')}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">1. {t('step1_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('step1_description')}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">2. {t('step2_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('step2_description')}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">3. {t('step3_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('step3_description')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Social proof / testimonials */}
      <TestimonialsSection />

      {/* Privacy / disclaimer - moved after testimonials */}
      <div className="text-center max-w-3xl">
        <p className="text-sm leading-relaxed text-muted-foreground">
          <Shield className="inline h-4 w-4 mr-1.5 mb-0.5" />
          {t('privacyNote')}
        </p>
      </div>
    </div>
  );
}
