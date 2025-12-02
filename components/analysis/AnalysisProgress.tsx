'use client';

import { Brain, FileText, Image, Loader2 } from 'lucide-react';
import React from 'react';

import { useLanguage } from '../../features/i18n';
import { Progress } from '../ui/progress';

type AnalysisProgressProps = {
  progress: number; // 0-100
  status: 'starting' | 'parsing' | 'analyzing' | 'media' | 'chunking' | 'completed' | 'error';
  currentChunk?: number;
  totalChunks?: number;
  message?: string;
  isPremium?: boolean;
};

const statusIcons: Record<AnalysisProgressProps['status'], React.ReactNode> = {
  starting: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
  parsing: <FileText className="h-5 w-5 text-primary" />,
  analyzing: <Brain className="h-5 w-5 text-primary" />,
  media: <Image className="h-5 w-5 text-primary" />,
  chunking: <Brain className="h-5 w-5 text-primary" />,
  completed: <Brain className="h-5 w-5 text-primary" />,
  error: <Loader2 className="h-5 w-5 text-destructive" />
};

export function AnalysisProgress({ progress, status, currentChunk, totalChunks, message, isPremium }: AnalysisProgressProps) {
  const { t } = useLanguage();
  
  const statusMessages: Record<AnalysisProgressProps['status'], string> = {
    starting: t('progress_starting'),
    parsing: t('progress_parsing'),
    analyzing: t('progress_analyzing'),
    media: t('progress_media'),
    chunking: t('progress_chunking'),
    completed: t('progress_completed'),
    error: t('progress_error')
  };
  
  const statusIcons: Record<AnalysisProgressProps['status'], React.ReactNode> = {
    starting: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
    parsing: <FileText className="h-5 w-5 text-primary" />,
    analyzing: <Brain className="h-5 w-5 text-primary" />,
    media: <Image className="h-5 w-5 text-primary" />,
    chunking: <Brain className="h-5 w-5 text-primary" />,
    completed: <Brain className="h-5 w-5 text-primary" />,
    error: <Loader2 className="h-5 w-5 text-destructive" />
  };
  
  // Always use translated status messages, ignore API messages for consistency
  const statusMessage = statusMessages[status];
  const icon = statusIcons[status];

  // Build detailed message
  let detailedMessage = statusMessage;
  if (currentChunk !== undefined && totalChunks !== undefined) {
    const chunkLabel = t('progress_chunk_label')
      .replace('{current}', currentChunk.toString())
      .replace('{total}', totalChunks.toString());
    detailedMessage = `${statusMessage} (${chunkLabel})`;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3">
        {icon}
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{detailedMessage}</p>
          {status === 'analyzing' && totalChunks && (
            <p className="text-xs text-muted-foreground mt-1">
              {t('progress_analyzing_hint')}
            </p>
          )}
          {status === 'media' && (
            <p className="text-xs text-muted-foreground mt-1">
              {t('progress_media_hint')}
            </p>
          )}
          {typeof isPremium === 'boolean' && (
            <p className="text-xs text-muted-foreground mt-1">
              {isPremium ? t('premium_progress_hint') : t('free_progress_hint')}
            </p>
          )}
        </div>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{Math.round(progress)}%</span>
        {currentChunk !== undefined && totalChunks !== undefined && (
          <span>{t('progress_chunk_label')
            .replace('{current}', currentChunk.toString())
            .replace('{total}', totalChunks.toString())}</span>
        )}
      </div>
    </div>
  );
}

