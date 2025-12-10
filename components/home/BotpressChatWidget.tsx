'use client';

import React, { useEffect, useRef, useState } from 'react';

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
  const fallbackRef = useRef<HTMLIFrameElement | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);

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

      // If nothing appears after a few seconds, render iframe fallback
      setTimeout(() => {
        const hasWidget =
          document.querySelector('.bpFab') ||
          document.querySelector('.bpWebchat') ||
          document.querySelector('iframe[src*="botpress.cloud"]');
        if (!hasWidget) {
          console.info('[Botpress] enabling iframe fallback');
          setShowFallback(true);
        }
      }, 6000);
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

  return showFallback ? (
    <>
      {fallbackOpen && (
        <iframe
          ref={fallbackRef}
          title="Botpress Chat"
          src={`https://cdn.botpress.cloud/webchat/v3.5/shareable.html?configUrl=${encodeURIComponent(
            CONFIG_URL
          )}`}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '16px',
            width: '360px',
            maxWidth: '90vw',
            height: '520px',
            maxHeight: '80vh',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            zIndex: 2147483646,
            background: 'transparent'
          }}
          allow="clipboard-read; clipboard-write; microphone; camera"
        />
      )}
      <button
        type="button"
        aria-label="Open chat"
        onClick={() => setFallbackOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          background: '#ef3b53',
          boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
          color: '#fff',
          cursor: 'pointer',
          zIndex: 2147483647,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {fallbackOpen ? '×' : '💬'}
      </button>
    </>
  ) : null;
}


