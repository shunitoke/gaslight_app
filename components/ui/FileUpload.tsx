 'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Upload, CheckCircle2, Loader2 } from 'lucide-react';

import { useLanguage } from '@/features/i18n';
import { cn } from '@/lib/utils';
import { Badge } from './badge';
import { Button } from './Button';
import { Progress } from './progress';

type Platform =
  | 'telegram'
  | 'whatsapp'
  | 'signal'
  | 'viber'
  | 'discord'
  | 'imessage'
  | 'messenger'
  | 'generic'
  | 'auto';

type FileUploadProps = {
  onFileSelect: (file: File, platform: Platform) => void | Promise<void>;
  disabled?: boolean;
  uploading?: boolean;
  uploadProgress?: number;
  importSuccessful?: boolean;
  messageCount?: number;
};

const platformOptions: { value: Platform; labelKey: string; hint?: 'recommended' }[] = [
  { value: 'auto', labelKey: 'platform_auto', hint: 'recommended' },
  { value: 'telegram', labelKey: 'platform_telegram' },
  { value: 'whatsapp', labelKey: 'platform_whatsapp' },
  { value: 'signal', labelKey: 'platform_signal' },
  { value: 'discord', labelKey: 'platform_discord' },
  { value: 'messenger', labelKey: 'platform_messenger' },
  { value: 'imessage', labelKey: 'platform_imessage' },
  { value: 'viber', labelKey: 'platform_viber' },
  { value: 'generic', labelKey: 'platform_generic' },
];

export function FileUpload({
  onFileSelect,
  disabled,
  uploading,
  uploadProgress = 0,
  importSuccessful,
  messageCount,
}: FileUploadProps) {
  const { t } = useLanguage();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('auto');
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ZIP_MEDIA_MAX_BYTES = 25 * 1024 * 1024;

  const validateBeforeUpload = useCallback(
    (file: File): boolean => {
      const isZip =
        file.name.toLowerCase().endsWith('.zip') ||
        file.type === 'application/zip' ||
        file.type === 'application/x-zip-compressed';

      if (isZip && file.size > ZIP_MEDIA_MAX_BYTES) {
        // Multilingual inline message to match server-side blocking
        alert(
          [
            'ZIP загрузки с медиа >25MB временно заблокированы. Анализ медиа будет доступен в следующей версии.',
            'ZIP uploads with media over 25MB are temporarily blocked. Media analysis will be available in the next version.',
            'Las subidas ZIP con medios de más de 25MB están bloqueadas temporalmente. El análisis de medios estará disponible en la próxima versión.',
            'Les chargements ZIP avec médias de plus de 25 Mo sont temporairement bloqués. L’analyse des médias sera disponible dans la prochaine version.',
            'ZIP-Uploads mit Medien über 25MB sind vorübergehend blockiert. Medienanalyse wird in der nächsten Version verfügbar sein.',
            'Envios ZIP com mídia acima de 25MB estão temporariamente bloqueados. A análise de mídia estará disponível na próxima versão.'
          ].join(' ')
        );
        return false;
      }

      return true;
    },
    [ZIP_MEDIA_MAX_BYTES]
  );

  // Hide filename after successful import
  useEffect(() => {
    if (importSuccessful) {
      setFileName(null);
    }
  }, [importSuccessful]);

  const handleOpenPicker = useCallback(() => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  }, [disabled, uploading]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || disabled || uploading) return;
      if (!validateBeforeUpload(file)) {
        event.target.value = '';
        return;
      }
      setFileName(file.name);
      await onFileSelect(file, selectedPlatform);
    },
    [disabled, onFileSelect, selectedPlatform, uploading, validateBeforeUpload],
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (disabled || uploading) return;
      const file = event.dataTransfer.files?.[0];
      if (file) {
        if (!validateBeforeUpload(file)) {
          return;
        }
        setFileName(file.name);
        await onFileSelect(file, selectedPlatform);
      }
    },
    [disabled, onFileSelect, selectedPlatform, uploading, validateBeforeUpload],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t('selectPlatform')}</p>
        <div className="flex flex-wrap gap-2">
          {platformOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedPlatform(option.value)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-all',
                selectedPlatform === option.value
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              <span>{t(option.labelKey as any)}</span>
              {option.hint === 'recommended' && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0.5">
                  {t('recommended')}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        onClick={importSuccessful ? undefined : handleOpenPicker}
        onDrop={importSuccessful ? undefined : handleDrop}
        onDragOver={importSuccessful ? undefined : ((e) => e.preventDefault())}
        className={cn(
          'group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all',
          'bg-card/50 hover:bg-card',
          disabled || importSuccessful
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5',
        )}
      >
        {!importSuccessful && (
          <input
            ref={inputRef}
            type="file"
            accept=".json,.txt,.zip"
            onChange={handleFileChange}
            className="hidden"
            aria-label={t('selectFile')}
          />
        )}
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/15">
          {importSuccessful ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
        </div>
        <p className="text-base font-semibold text-foreground">
          {uploading ? t('uploadingFile') : t('uploadExport')}
        </p>
        <p className="mt-1 text-sm text-muted-foreground max-w-md">
          {t('fileUploadHelp')}
        </p>
        <div className="mt-4 space-y-2 w-full max-w-md">
          {uploading ? (
            <Progress value={uploadProgress} className="w-full" />
          ) : !importSuccessful ? (
            <button
              type="button"
              disabled={disabled}
              className={cn(
                'inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-all duration-200',
                disabled
                  ? 'cursor-not-allowed border-border text-muted-foreground opacity-60'
                  : 'border-border bg-background hover:border-primary/50 hover:text-primary',
              )}
            >
              {fileName ? fileName : t('clickToSelectFile')}
            </button>
          ) : null}
          {importSuccessful && (
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {t('importSuccessful')}
                {messageCount ? ` · ${messageCount} ${t('messages')}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

