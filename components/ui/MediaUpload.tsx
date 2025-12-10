'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MicOff, Upload, Loader2 } from 'lucide-react';

import { useLanguage } from '@/features/i18n';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Progress } from './progress';

type MediaUploadProps = {
  onMediaSelect: (file: File) => void | Promise<void>;
  disabled?: boolean;
  uploading?: boolean;
  uploadProgress?: number;
  maxRecordMs?: number;
};

// Restrict to common static image and core audio types (voice still coming soon)
const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,audio/mpeg,audio/mp3,audio/wav,audio/webm';
const DEFAULT_MAX_RECORD_MS = 60_000; // 60s

export function MediaUpload({
  onMediaSelect,
  disabled,
  uploading,
  uploadProgress = 0,
  maxRecordMs = DEFAULT_MAX_RECORD_MS
}: MediaUploadProps) {
  const { t } = useLanguage();
  const voiceComingSoon = true;
  const translate = useMemo(
    () => (key: string, params?: Record<string, string | number>) => {
      let msg = t(key);
      if (!params || !msg) return msg;
      Object.entries(params).forEach(([k, v]) => {
        msg = msg.replace(`{{${k}}}`, String(v));
      });
      return msg;
    },
    [t]
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecordingInternal = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
  }, []);

  useEffect(() => {
    return () => {
      stopRecordingInternal();
    };
  }, [stopRecordingInternal]);

  const startRecording = useCallback(async () => {
    if (disabled || uploading || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        setRecordSeconds(0);
        stream.getTracks().forEach((t) => t.stop());
        if (!chunks.length) return;
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        await onMediaSelect(file);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((sec) => {
          const next = sec + 1;
          if (next * 1000 >= maxRecordMs) {
            stopRecordingInternal();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      alert(t('mic_permission_error'));
    }
  }, [disabled, isRecording, maxRecordMs, onMediaSelect, stopRecordingInternal, uploading]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    stopRecordingInternal();
  }, [isRecording, stopRecordingInternal]);

  const handleFilePick = useCallback(() => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  }, [disabled, uploading]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || disabled || uploading) return;
      await onMediaSelect(file);
      event.target.value = '';
    },
    [disabled, onMediaSelect, uploading]
  );

  return (
    <div className="space-y-6 w-full">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={cn('rounded-xl border border-[color:hsla(var(--border),0.06)] bg-card/60 p-4 space-y-3')}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Upload className="h-4 w-4" />
            {t('upload_media_title')}
          </div>
          <p className="text-xs text-muted-foreground">{t('upload_media_hint')}</p>
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={handleFileChange}
              aria-label="Select media file"
            />
            <Button type="button" variant="outline" disabled={disabled || uploading} onClick={handleFilePick}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('uploadingFile')}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('choose_file')}
                </>
              )}
            </Button>
            {uploading && <Progress value={uploadProgress} className="w-full" />}
          </div>
        </div>

        <div className={cn('rounded-xl border border-[color:hsla(var(--border),0.06)] bg-card/60 p-4 space-y-4')}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Mic className="h-4 w-4" />
            {t('record_voice_title')}
          </div>
          <p className="text-xs text-muted-foreground">
            {translate('record_voice_hint', { seconds: Math.round(maxRecordMs / 1000) })}
          </p>
          {voiceComingSoon && (
            <div className="text-xs text-amber-600 dark:text-amber-300 font-medium">
              {t('voice_coming_soon')}
            </div>
          )}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled || uploading || voiceComingSoon}
              className={cn(
                'relative flex items-center justify-center h-20 w-20 rounded-full border transition-all duration-200',
                'bg-primary/10 text-primary border-primary/50 shadow-sm',
                !disabled && !uploading && 'hover:scale-105 hover:shadow-md hover:bg-primary/15',
                (disabled || uploading) && 'opacity-60 cursor-not-allowed'
              )}
              aria-label={
                isRecording
                  ? translate('stop_recording', { seconds: recordSeconds })
                  : t('start_recording')
              }
            >
              {isRecording ? (
                <MicOff className="h-10 w-10 animate-pulse" />
              ) : (
                <Mic className="h-10 w-10" />
              )}
              {isRecording && (
                <span className="absolute -bottom-5 text-xs text-muted-foreground">
                  {t('recording')}
                </span>
              )}
            </button>
            {isRecording && (
              <div className="text-xs text-muted-foreground">{translate('stop_recording', { seconds: recordSeconds })}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

