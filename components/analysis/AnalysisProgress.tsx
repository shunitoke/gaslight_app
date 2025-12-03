'use client';

import { Brain, FileText, Image, Loader2, CheckCircle2 } from 'lucide-react';
import React from 'react';

import { useLanguage } from '../../features/i18n';
import { Progress } from '../ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

type AnalysisProgressProps = {
  progress: number; // 0-100
  status: 'starting' | 'parsing' | 'analyzing' | 'media' | 'chunking' | 'finalizing' | 'completed' | 'error';
  currentChunk?: number;
  totalChunks?: number;
  message?: string;
  isPremium?: boolean;
};

type StepId = Exclude<AnalysisProgressProps['status'], 'completed' | 'error'>;

export function AnalysisProgress({
  progress,
  status,
  currentChunk,
  totalChunks,
  message,
  isPremium,
}: AnalysisProgressProps) {
  const { t } = useLanguage();

  const statusMessages: Record<AnalysisProgressProps['status'], string> = {
    starting: t('progress_starting'),
    parsing: t('progress_parsing'),
    analyzing: t('progress_analyzing'),
    media: t('progress_media'),
    chunking: t('progress_chunking'),
    finalizing: t('progress_finalizing'),
    completed: t('progress_completed'),
    error: t('progress_error'),
  };

  const statusIcons: Record<AnalysisProgressProps['status'], React.ReactNode> = {
    starting: (
      <div className="relative">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow" />
      </div>
    ),
    parsing: (
      <div className="relative">
        <FileText className="h-6 w-6 text-primary animate-pulse-glow" />
        <div
          className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
          style={{ animationDuration: '2s' }}
        />
      </div>
    ),
    analyzing: (
      <div className="relative">
        <Brain className="h-6 w-6 text-primary animate-pulse-glow" />
        <div
          className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
          style={{ animationDuration: '2s' }}
        />
      </div>
    ),
    media: (
      <div className="relative">
        <Image className="h-6 w-6 text-primary animate-pulse-glow" />
        <div
          className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
          style={{ animationDuration: '2s' }}
        />
      </div>
    ),
    chunking: (
      <div className="relative">
        <Brain className="h-6 w-6 text-primary animate-pulse-glow" />
        <div
          className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
          style={{ animationDuration: '2s' }}
        />
      </div>
    ),
    finalizing: (
      <div className="relative">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow" />
      </div>
    ),
    completed: (
      <div className="relative">
        <CheckCircle2 className="h-6 w-6 text-primary" />
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      </div>
    ),
    error: (
      <div className="relative">
        <Loader2 className="h-6 w-6 animate-spin text-destructive" />
        <div className="absolute inset-0 rounded-full bg-destructive/20 animate-pulse" />
      </div>
    ),
  };

  const steps: { id: StepId; label: string }[] = [
    { id: 'starting', label: statusMessages.starting },
    { id: 'parsing', label: statusMessages.parsing },
    { id: 'media', label: statusMessages.media },
    { id: 'chunking', label: statusMessages.chunking },
    { id: 'analyzing', label: statusMessages.analyzing },
    { id: 'finalizing', label: statusMessages.finalizing },
  ];

  const statusToStepIndex: Record<AnalysisProgressProps['status'], number> = {
    starting: 0,
    parsing: 1,
    media: 2,
    chunking: 3,
    analyzing: 4,
    finalizing: 5,
    completed: steps.length,
    error: Math.min(4, steps.length - 1),
  };

  // Prevent visual step regressions when status jumps backward
  const [visualStatus, setVisualStatus] =
    React.useState<AnalysisProgressProps['status']>(status);

  React.useEffect(() => {
    setVisualStatus((prev) => {
      // Always allow terminal states to override
      if (status === 'completed' || status === 'error') {
        return status;
      }

      const prevIndex = statusToStepIndex[prev] ?? 0;
      const nextIndex = statusToStepIndex[status] ?? 0;

      // Only move forward in the step sequence
      if (nextIndex >= prevIndex) {
        return status;
      }

      return prev;
    });
  }, [status]);

  // Always use translated status messages, ignore raw API messages for consistency
  const statusMessage = statusMessages[visualStatus];
  const icon = statusIcons[visualStatus];

  const currentStepIndex = statusToStepIndex[visualStatus];

  const stepsWithState = steps.map((step, index) => {
    let state: 'done' | 'current' | 'upcoming';

    if (visualStatus === 'completed') {
      state = 'done';
    } else if (index < currentStepIndex) {
      state = 'done';
    } else if (index === currentStepIndex) {
      state = 'current';
    } else {
      state = 'upcoming';
    }

    return { ...step, state };
  });

  // Accordion: collapsed by default; auto-open only for errors.
  const [accordionValue, setAccordionValue] =
    React.useState<string | undefined>(visualStatus === 'error' ? 'details' : undefined);

  // Build detailed message
  let detailedMessage = statusMessage;
  if (
    currentChunk !== undefined &&
    totalChunks !== undefined &&
    totalChunks > 1
  ) {
    const chunkLabel = t('progress_chunk_label')
      .replace('{current}', currentChunk.toString())
      .replace('{total}', totalChunks.toString());
    detailedMessage = `${statusMessage} (${chunkLabel})`;
  }

  return (
    <div className="w-full space-y-4 sm:space-y-5 p-4 sm:p-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-background via-primary/5 to-background shadow-lg backdrop-blur-sm">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground mb-1.5 tracking-tight">
            {detailedMessage}
          </p>

          <div className="mt-1.5 space-y-2.5">
            <div className="flex flex-col gap-1.5">
              {stepsWithState.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-2 text-xs leading-snug"
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full border transition-all ${
                      step.state === 'done'
                        ? 'border-primary bg-primary'
                        : step.state === 'current'
                        ? 'border-primary bg-primary/40 animate-pulse'
                        : 'border-muted-foreground/40 bg-muted/40'
                    }`}
                  />
                  <span
                    className={`truncate ${
                      step.state === 'upcoming'
                        ? 'text-muted-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border/60">
              <Accordion
                type="single"
                collapsible
                value={accordionValue}
                onValueChange={setAccordionValue}
                className="w-full"
              >
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="text-[11px] font-medium text-muted-foreground hover:text-foreground py-1 hover:no-underline">
                    {accordionValue === 'details' ? t('hideDetails') : t('showDetails')}
                  </AccordionTrigger>
                  <AccordionContent className="pt-1.5 pb-0">
                    <div className="min-h-[72px] sm:min-h-[84px] flex flex-col justify-start">
                      <div className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
                      {visualStatus === 'analyzing' && totalChunks && (
                        <p>{t('progress_analyzing_hint')}</p>
                      )}
                      {visualStatus === 'media' && (
                        <p>{t('progress_media_hint')}</p>
                      )}
                      {visualStatus === 'finalizing' && (
                        <p>{t('progress_finalizing_hint')}</p>
                      )}
                      {currentChunk !== undefined &&
                        totalChunks !== undefined &&
                        totalChunks > 1 && (
                        <p className="font-medium text-foreground/90">
                          {t('progress_chunk_label')
                            .replace('{current}', currentChunk.toString())
                            .replace('{total}', totalChunks.toString())}
                        </p>
                      )}
                      {visualStatus === 'error' && message && (
                        <p className="text-destructive/80">{message}</p>
                      )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-3 shadow-inner" />

        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground/90">
            {Math.round(progress)}%
          </span>
          {currentChunk !== undefined &&
            totalChunks !== undefined &&
            totalChunks > 1 && (
            <span className="text-muted-foreground font-medium">
              {t('progress_chunk_label')
                .replace('{current}', currentChunk.toString())
                .replace('{total}', totalChunks.toString())}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


