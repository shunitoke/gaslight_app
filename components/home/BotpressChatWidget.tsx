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

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initBotpress = () => {
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
    };
  }, []);

  return null;
}


