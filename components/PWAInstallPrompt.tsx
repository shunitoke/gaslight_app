'use client';

import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from './ui/Button';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
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
        'To install this app:\n\n' +
        'Chrome/Edge: Click the install icon in the address bar, or go to Menu → Install app\n\n' +
        'Safari (iOS): Tap Share → Add to Home Screen\n\n' +
        'Firefox: Not supported yet'
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
        Install App
      </Button>
    </div>
  );
}



