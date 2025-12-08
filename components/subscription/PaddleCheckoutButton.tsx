'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Loader2 } from 'lucide-react';

import { Button } from '../ui/Button';
import { useLanguage } from '@/features/i18n';

type Props = {
  label?: string;
  className?: string;
  onSuccess?: (token: string) => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

declare global {
  interface Window {
    Paddle?: any;
  }
}

let paddlePromise: Promise<any> | null = null;
const loadPaddle = async () => {
  if (paddlePromise) return paddlePromise;
  paddlePromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve(null);
    if (window.Paddle) return resolve(window.Paddle);

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => resolve(window.Paddle);
    script.onerror = () => reject(new Error('Failed to load Paddle'));
    document.body.appendChild(script);
  });
  return paddlePromise;
};

export function PaddleCheckoutButton({
  label,
  variant = 'primary',
  size = 'lg',
  className,
  onSuccess
}: Props) {
  const { t, locale } = useLanguage();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const paddleRef = useRef<any>(null);
  const pendingTransactionId = useRef<string | null>(null);
  const redeemingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const paddle = await loadPaddle();
        if (!paddle || cancelled) return;

        const env = process.env.NEXT_PUBLIC_PADDLE_ENV === 'sandbox' ? 'sandbox' : 'live';
        if (paddle.Environment?.set) {
          paddle.Environment.set(env);
        }

        const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        if (!token) {
          setError(t('paddle_error_missing_token') || 'Paddle client token is missing');
          return;
        }

        paddle.Initialize({
          token,
          eventCallback: async (event: any) => {
            if (event?.name === 'checkout.completed') {
              const transactionId =
                event?.data?.transactionId ||
                event?.data?.id ||
                pendingTransactionId.current;
              if (transactionId && !redeemingRef.current) {
                await redeemTransaction(transactionId);
              }
            }
          }
        });

        paddleRef.current = paddle;
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message || 'Unable to load Paddle');
        }
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const redeemTransaction = useCallback(
    async (transactionId: string) => {
      redeemingRef.current = true;
      try {
        setStatus(t('paddle_status_verifying') || 'Verifying payment…');
        const res = await fetch('/api/payment/paddle/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId })
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Verification failed');
        }

        const data = await res.json();
        const token = data.token as string | undefined;
        if (token) {
          localStorage.setItem('premium_token', token);
          sessionStorage.setItem('currentSubscriptionTier', 'premium');
          sessionStorage.setItem(
            'currentFeatures',
            JSON.stringify({
              canAnalyzeMedia: true,
              canUseEnhancedAnalysis: true
            })
          );
          setStatus(t('paddle_status_unlocked') || 'Premium unlocked!');
          setError(null);
          onSuccess?.(token);
        } else {
          throw new Error(t('paddle_error_token_missing') || 'Token missing from response');
        }
      } catch (err) {
        setError((err as Error).message || t('paddle_error_unlock') || 'Unable to unlock premium');
        setStatus(null);
      } finally {
        redeemingRef.current = false;
        setLoading(false);
      }
    },
    [onSuccess]
  );

  const startCheckout = useCallback(async () => {
    setError(null);
    setStatus(null);
    setLoading(true);
    try {
      const paddle = paddleRef.current;
      if (!paddle) {
        throw new Error(t('paddle_error_not_ready') || 'Paddle not ready yet');
      }

      const res = await fetch('/api/payment/paddle/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t('paddle_error_start') || 'Failed to start checkout');
      }
      const data = await res.json();
      const transactionId = data.transactionId as string | undefined;
      if (!transactionId) {
        throw new Error(t('paddle_error_txn_missing') || 'Transaction id missing');
      }

      pendingTransactionId.current = transactionId;
      setStatus(t('paddle_status_opening') || 'Opening secure checkout…');
      paddle.Checkout.open({
        transactionId
      });
    } catch (err) {
      setError((err as Error).message || t('paddle_error_start') || 'Unable to start payment');
      setLoading(false);
      setStatus(null);
    }
  }, []);

  const isDisabled = !ready || loading;

  return (
    <div className={className}>
      <Button onClick={startCheckout} variant={variant} size={size} disabled={isDisabled}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
        {ready ? (label || t('paddle_buy_label')) : (t('paddle_status_loading') || 'Loading checkout…')}
      </Button>
      {status && (
        <p className="mt-2 text-xs text-muted-foreground">
          {status}
        </p>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}


