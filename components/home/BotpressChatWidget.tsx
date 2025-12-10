'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    botpressWebChat?: {
      init?: (config: Record<string, unknown>) => void;
      destroy?: () => void;
      open?: () => void;
      on?: (event: string, handler: () => void) => (() => void) | void;
      sendEvent?: (event: { type: string; payload?: any }) => void;
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

    const tryOpen = (reason: string) => {
      const opened = window.botpressWebChat?.open?.();
      if (!opened) {
        // Fallback: click default FAB if present
        const fab = document.querySelector('.bpFab') as HTMLElement | null;
        fab?.click();
      }
      console.info('[Botpress] open attempted:', reason);
    };

    const initBotpress = () => {
      // Ensure widget opens once ready so the bubble appears even if auto-open is disabled in config.
      const maybeUnsub = window.botpressWebChat?.on?.('webchat:ready', () => {
        console.info('[Botpress] webchat:ready');
        // Delay a tick to let styles mount, then open and fire a pageview to wake the client
        requestAnimationFrame(() => {
          tryOpen('ready');
          window.botpressWebChat?.sendEvent?.({
            type: 'proactive-trigger',
            payload: { source: 'auto-ready' }
          });
        });
      });
      unsubscribeRef.current = typeof maybeUnsub === 'function' ? maybeUnsub : null;

      console.info('[Botpress] init with configUrl', CONFIG_URL);
      window.botpressWebChat?.init?.({
        configUrl: CONFIG_URL
      });

      // Fallback open attempts in case ready event doesn’t fire
      setTimeout(() => tryOpen('fallback-2s'), 2000);
      setTimeout(() => tryOpen('fallback-5s'), 5000);
      setTimeout(() => {
        window.botpressWebChat?.sendEvent?.({
          type: 'proactive-trigger',
          payload: { source: 'auto-5s' }
        });
      }, 5000);
    };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        initBotpress();
      } else {
        existingScript.addEventListener('load', initBotpress, { once: true });
        existingScript.addEventListener(
          'error',
          () => console.error('[Botpress] failed to load inject script'),
          { once: true }
        );
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
    script.onerror = () => {
      console.error('[Botpress] failed to load inject script');
    };
    document.body.appendChild(script);

    return () => {
      window.botpressWebChat?.destroy?.();
      unsubscribeRef.current?.();
    };
  }, []);

  return null;
}


