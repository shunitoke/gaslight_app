'use client';

import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useLanguage } from '../features/i18n';
import { Button } from './ui/Button';

export function PWAInstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const hasAutoPrompted = useRef(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);

       // Automatically call prompt once to avoid "banner not shown" warning.
       if (!hasAutoPrompted.current && (e as any)?.prompt) {
         hasAutoPrompted.current = true;
         (e as any)
           .prompt()
           .catch(() => {
             // ignore prompt rejection; user can still click the custom button
           });
       }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback: show instructions
      alert(
        `${t('install_app_instructions')}\n\n` +
        `${t('install_app_chrome')}\n\n` +
        `${t('install_app_safari')}\n\n` +
        `${t('install_app_firefox')}`
      );
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <Button
        onClick={handleInstallClick}
        className="flex items-center gap-2 shadow-lg"
        size="lg"
      >
        <Download className="h-4 w-4" />
        {t('install_app')}
      </Button>
    </div>
  );
}



