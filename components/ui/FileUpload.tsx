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
  const MAX_FILE_BYTES = 25 * 1024 * 1024;

  const pickLocalizedMessage = useCallback((messages: Record<string, string>): string => {
    const langs = typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : [];
    const preferred = (langs || []).map((l) => (l || '').toLowerCase());
    const localeOrder = [...preferred, 'ru', 'en', 'es', 'fr', 'de', 'pt'];
    for (const lang of localeOrder) {
      if (messages[lang]) return messages[lang];
      const short = lang.split('-')[0];
      if (messages[short]) return messages[short];
    }
    return messages.en || messages.ru || Object.values(messages)[0] || 'Upload blocked.';
  }, []);

  const validateBeforeUpload = useCallback(
    (file: File): boolean => {
      if (file.size > MAX_FILE_BYTES) {
        const message = pickLocalizedMessage({
          ru: 'Файлы больше 25 МБ временно блокируются. Загрузите файл до 25 МБ.',
          en: 'Files over 25MB are temporarily blocked. Please upload a file up to 25MB.',
          es: 'Los archivos de más de 25 MB están bloqueados temporalmente. Sube un archivo de hasta 25 MB.',
          fr: 'Les fichiers de plus de 25 Mo sont temporairement bloqués. Veuillez envoyer un fichier de moins de 25 Mo.',
          de: 'Dateien über 25 MB sind vorübergehend blockiert. Bitte laden Sie eine Datei bis 25 MB hoch.',
          pt: 'Arquivos acima de 25 MB estão temporariamente bloqueados. Envie um arquivo de até 25 MB.'
        });
        alert(message);
        return false;
      }

      const isZip =
        file.name.toLowerCase().endsWith('.zip') ||
        file.type === 'application/zip' ||
        file.type === 'application/x-zip-compressed';

      if (isZip && file.size > ZIP_MEDIA_MAX_BYTES) {
        const message = pickLocalizedMessage({
          ru: 'ZIP загрузки с медиа >25MB временно заблокированы. Анализ медиа будет доступен в следующей версии.',
          en: 'ZIP uploads with media over 25MB are temporarily blocked. Media analysis will be available in the next version.',
          es: 'Las subidas ZIP con medios de más de 25MB están bloqueadas temporalmente. El análisis de medios estará disponible en la próxima versión.',
          fr: 'Les chargements ZIP avec médias de plus de 25 Mo sont temporairement bloqués. L’analyse des médias sera disponible dans la prochaine version.',
          de: 'ZIP-Uploads mit Medien über 25MB sind vorübergehend blockiert. Medienanalyse wird in der nächsten Version verfügbar sein.',
          pt: 'Envios ZIP com mídia acima de 25MB estão temporariamente bloqueados. A análise de mídia estará disponível na próxima versão.'
        });
        alert(message);
        return false;
      }

      return true;
    },
    [ZIP_MEDIA_MAX_BYTES, pickLocalizedMessage]
  );

  const confirmBeforeUpload = useCallback(
    (file: File): boolean => {
      const localized = t('confirmImportPrompt');
      const message =
        localized && localized !== 'confirmImportPrompt'
          ? localized.replace('{file}', file.name)
          : pickLocalizedMessage({
              ru: `Импортировать файл «${file.name}»? Убедитесь, что в экспорте нет лишних данных.`,
              en: `Import “${file.name}”? Make sure the export only contains the conversation you want analyzed.`,
              es: `¿Importar “${file.name}”? Asegúrate de que la exportación solo contenga la conversación que quieres analizar.`,
              fr: `Importer « ${file.name} » ? Vérifie que l'export ne contient que la conversation à analyser.`,
              de: `„${file.name}“ jetzt importieren? Stelle sicher, dass der Export nur den gewünschten Chat enthält.`,
              pt: `Importar “${file.name}”? Confirme que a exportação contém apenas a conversa que deseja analisar.`
            });
      return window.confirm(message);
    },
    [pickLocalizedMessage, t]
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
      if (!confirmBeforeUpload(file)) {
        event.target.value = '';
        return;
      }
      setFileName(file.name);
      await onFileSelect(file, selectedPlatform);
    },
    [confirmBeforeUpload, disabled, onFileSelect, selectedPlatform, uploading, validateBeforeUpload],
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
        if (!confirmBeforeUpload(file)) {
          return;
        }
        setFileName(file.name);
        await onFileSelect(file, selectedPlatform);
      }
    },
    [confirmBeforeUpload, disabled, onFileSelect, selectedPlatform, uploading, validateBeforeUpload],
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
          'bg-card/60 hover:bg-card/80',
          disabled || importSuccessful
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5'
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
        {!importSuccessful && (
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {t('dragDropHint')}
          </p>
        )}
        {uploading && (
          <div className="mt-4 w-full max-w-md">
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}
        {!uploading && !importSuccessful && (
          <p className="mt-3 text-sm font-medium text-primary">
            {fileName ? fileName : t('clickToSelectFile')}
          </p>
        )}
        {importSuccessful && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {t('importSuccessful')}
              {messageCount ? ` · ${messageCount} ${t('messages')}` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

