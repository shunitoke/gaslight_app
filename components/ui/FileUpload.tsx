'use client';

import { MessageSquare, Upload as UploadIcon, FileText } from 'lucide-react';
import React, { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { useLanguage } from '../../features/i18n';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Badge } from './badge';
import { Button } from './Button';
import { CircularProgress } from './CircularProgress';
import { Input } from './Input';
import { Label } from './label';
import { RadioGroup, RadioGroupItem } from './radio-group';

type SupportedPlatform =
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
  onFileSelect: (file: File, platform: SupportedPlatform | 'auto') => void;
  disabled?: boolean;
  accept?: string;
  uploading?: boolean;
  uploadProgress?: number;
  importSuccessful?: boolean;
  messageCount?: number;
};

export function FileUpload({ onFileSelect, disabled, accept, uploading = false, uploadProgress = 0, importSuccessful = false, messageCount = 0 }: FileUploadProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [platform, setPlatform] = useState<SupportedPlatform | 'auto'>('auto');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Use 'auto' if platform is not explicitly selected
      onFileSelect(selectedFile, platform || 'auto');
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-lg flex flex-col items-center justify-center">
        {/* Show import success message after upload (on same place as progress), circular progress during upload, otherwise show platform selection */}
        {uploading ? (
          <div className="flex justify-center items-center animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center gap-3">
              <CircularProgress value={uploadProgress} size={120} strokeWidth={8} />
              <p className="text-sm text-muted-foreground animate-in fade-in duration-300">{t('uploadingFile') || 'Uploading file...'}</p>
            </div>
          </div>
        ) : importSuccessful ? (
          <div className="flex justify-center items-center animate-in fade-in zoom-in-95 duration-500">
            <Alert className="border-primary/30 bg-primary/5 w-full max-w-md">
              <FileText className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">{t('importSuccessful')}</AlertTitle>
              <AlertDescription>
                {t('imported')}: <strong>{messageCount}</strong> {t('messages')}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <RadioGroup
            value={platform}
            onValueChange={(value) => setPlatform(value as SupportedPlatform | 'auto')}
            disabled={disabled}
            className="flex flex-col space-y-3"
          >
            {/* Auto-detect option - centered above others */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-1.5 rounded-md border-2 border-primary dark:border-primary bg-primary/60 dark:bg-primary/50 px-2.5 py-1.5 shadow-lg hover:shadow-xl hover:border-primary hover:bg-primary/70 dark:hover:bg-primary/60 transition-all duration-200 ring-2 ring-primary/30">
                <RadioGroupItem value="auto" id="auto" className="border-primary" />
                <Label htmlFor="auto" className="cursor-pointer font-bold text-white dark:text-white text-sm flex items-center gap-1.5">
                  <span className="text-base">🔍</span>
                  <span>{t('platform_auto')}</span>
                </Label>
              </div>
            </div>

            {/* Other platforms in grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="telegram" id="telegram" />
              <Label htmlFor="telegram" className="cursor-pointer font-normal text-foreground text-sm">
                {t('platform_telegram')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="whatsapp" id="whatsapp" />
              <Label htmlFor="whatsapp" className="cursor-pointer font-normal text-foreground text-sm">
                {t('platform_whatsapp')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="signal" id="signal" />
              <Label htmlFor="signal" className="cursor-pointer font-normal text-foreground text-sm">
                {t('platform_signal')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="discord" id="discord" />
              <Label htmlFor="discord" className="cursor-pointer font-normal text-foreground text-sm">
                {t('platform_discord')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="messenger" id="messenger" />
              <Label htmlFor="messenger" className="cursor-pointer font-normal text-foreground text-sm">
                {t('platform_messenger')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="imessage" id="imessage" />
              <Label htmlFor="imessage" className="cursor-pointer font-normal text-foreground text-sm">
                {t('platform_imessage')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="viber" id="viber" />
              <Label htmlFor="viber" className="cursor-pointer font-normal text-foreground text-sm">
                {t('platform_viber')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="generic" id="generic" />
              <Label htmlFor="generic" className="cursor-pointer font-normal text-foreground text-sm">
                {t('platform_generic')}
              </Label>
            </div>
            </div>
          </RadioGroup>
        )}
      </div>

      {!uploading && !importSuccessful && (
        <div className="w-full space-y-4 mt-6 animate-in fade-in duration-500">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">{t('selectFile')}</Label>
            <div className="flex flex-col gap-3">
              <div
                onClick={handleFileClick}
                className={cn(
                  "flex items-center justify-center gap-2 sm:gap-3 rounded-lg border-2 border-dashed border-input bg-muted/50 p-4 sm:p-6 transition-all cursor-pointer hover:border-primary/50 hover:bg-muted",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <MessageSquare className="h-5 w-5 text-primary" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    {t('clickToSelectFile')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    .json, .txt (.zip available with premium)
                  </p>
                </div>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept={accept || '.json,.txt,.zip'}
                disabled={disabled}
                className="hidden"
                aria-label="Select chat export file"
                aria-describedby="file-upload-help"
              />
              
              {selectedFile && (
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary animate-pulse-glow" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {t('ready')}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={disabled || !selectedFile}
            className="w-full text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
            size="lg"
            aria-label="Upload selected file"
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            {t('uploadAndAnalyze')}
          </Button>

          <p id="file-upload-help" className="text-xs text-muted-foreground text-center">
            {t('fileUploadHelp')}
          </p>
        </div>
      )}
    </div>
  );
}

