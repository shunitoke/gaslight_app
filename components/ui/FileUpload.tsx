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

const platformColors: Record<
  Platform,
  { bg: string; border: string; text: string; idleText?: string; hoverBg?: string }
> = {
  auto: {
    bg: 'linear-gradient(135deg, rgba(34,158,217,0.18), rgba(37,211,102,0.22))',
    border: 'hsla(var(--border), 0.9)',
    text: 'hsl(var(--foreground))',
    idleText: 'hsl(var(--foreground))',
    hoverBg: 'linear-gradient(135deg, rgba(34,158,217,0.22), rgba(37,211,102,0.26))'
  },
  telegram: { bg: '#229ED9', border: '#1f8fc4', text: '#ffffff', idleText: '#1f8fc4' },
  whatsapp: { bg: '#25D366', border: '#1eb85a', text: '#ffffff', idleText: '#1eb85a' },
  signal: { bg: '#3A76F0', border: '#3166ce', text: '#ffffff', idleText: '#3166ce' },
  viber: { bg: '#7360F2', border: '#6252cc', text: '#ffffff', idleText: '#6252cc' },
  discord: { bg: '#5865F2', border: '#4b56c9', text: '#ffffff', idleText: '#4b56c9' },
  imessage: { bg: '#34C759', border: '#2ca54c', text: '#ffffff', idleText: '#2ca54c' },
  messenger: { bg: '#0084FF', border: '#006fd6', text: '#ffffff', idleText: '#006fd6' },
  generic: { bg: '#6b7280', border: '#575e70', text: '#ffffff', idleText: '#4b5563' }
};

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
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-all shadow-sm',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                selectedPlatform === option.value ? '' : 'hover:opacity-90'
              )}
              style={
                selectedPlatform === option.value
                  ? {
                      background: platformColors[option.value].bg,
                      borderColor: platformColors[option.value].border,
                      color: platformColors[option.value].text,
                      boxShadow:
                        option.value === 'auto'
                          ? '0 0 24px rgba(34,158,217,0.25), 0 0 24px rgba(37,211,102,0.22)'
                          : '0 6px 16px rgba(0,0,0,0.18)'
                    }
                  : {
                      borderColor: platformColors[option.value].border,
                      color: platformColors[option.value].idleText ?? platformColors[option.value].border,
                      background: platformColors[option.value].hoverBg ?? 'transparent'
                    }
              }
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
          'group relative flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-all overflow-hidden',
          'bg-card/60 hover:bg-card/80',
          disabled || importSuccessful
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:border-[color:var(--card-border-strong,hsla(var(--border),0.12))] hover:shadow-lg hover:shadow-primary/5'
        )}
          style={{
            boxShadow:
              disabled || importSuccessful
                ? undefined
                : '0 12px 28px hsla(var(--foreground),0.08), 0 0 0 1px var(--card-border-soft, hsla(var(--border),0.08))'
          }}
      >
          {!importSuccessful && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  'radial-gradient(120% 80% at 50% 20%, hsla(var(--primary),0.12), transparent 50%), radial-gradient(90% 70% at 30% 80%, hsla(var(--accent),0.12), transparent 60%)',
                animation: 'pulse-glow 5s ease-in-out infinite'
              }}
            />
          )}
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
        <div
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/15 animate-[pulse-glow_3.5s_ease-in-out_infinite]"
          style={{
            boxShadow: '0 0 0 1px hsla(var(--primary),0.25), 0 0 24px hsla(var(--primary),0.28)',
            background:
              'radial-gradient(circle at 30% 30%, hsla(var(--primary),0.22), transparent 55%), radial-gradient(circle at 70% 70%, hsla(var(--accent),0.18), transparent 45%)'
          }}
        >
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

