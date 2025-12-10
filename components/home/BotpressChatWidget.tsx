'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    botpressWebChat?: {
      init?: (config: Record<string, unknown>) => void;
      destroy?: () => void;
    };
  }
}

const CONFIG_URL =
  'https://files.bpcontent.cloud/2025/12/10/04/20251210041507-WDKHO6W3.json';
const SCRIPT_ID = 'botpress-webchat-script';
const SCRIPT_SRC = 'https://cdn.botpress.cloud/webchat/v3.5/inject.js';

export function BotpressChatWidget() {
  const initializedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initBotpress = () => {
      // Ensure widget opens once ready so the bubble appears even if auto-open is disabled in config.
      const maybeUnsub = window.botpressWebChat?.on?.('webchat:ready', () => {
        window.botpressWebChat?.open?.();
      });
      unsubscribeRef.current = typeof maybeUnsub === 'function' ? maybeUnsub : null;

      window.botpressWebChat?.init?.({
        configUrl: CONFIG_URL
      });
    };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        initBotpress();
      } else {
        existingScript.addEventListener('load', initBotpress, { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.dataset.loaded = 'false';
    script.onload = () => {
      script.dataset.loaded = 'true';
      initBotpress();
    };
    document.body.appendChild(script);

    return () => {
      window.botpressWebChat?.destroy?.();
      unsubscribeRef.current?.();
    };
  }, []);

  return null;
}


