import crypto from 'node:crypto';

import { NextResponse } from 'next/server';

import { generatePremiumToken } from '@/features/subscription/premiumToken';
import { recordPurchase } from '@/features/subscription/purchases';
import { logError, logInfo } from '@/lib/telemetry';

export const runtime = 'nodejs';
export const maxDuration = 30;

type PaddleWebhook = {
  event_type?: string;
  eventType?: string;
  data?: {
    id?: string;
    transaction_id?: string;
    transactionId?: string;
    items?: Array<{ price_id?: string; priceId?: string; quantity?: number }>;
  };
};

const parseSignatureHeader = (header: string) => {
  const parts = header.split(';').map((p) => p.trim());
  const tsPart = parts.find((p) => p.startsWith('ts='));
  const h1Part = parts.find((p) => p.startsWith('h1='));
  return {
    ts: tsPart?.split('=')[1],
    h1: h1Part?.split('=')[1]
  };
};

const verifyPaddleSignature = (signature: string, rawBody: string, secret: string): boolean => {
  const { ts, h1 } = parseSignatureHeader(signature);
  if (!ts || !h1) return false;
  const computed = crypto.createHmac('sha256', secret).update(`${ts}:${rawBody}`).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(h1));
  } catch {
    return false;
  }
};

export async function POST(request: Request) {
  try {
    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!secret) {
      logError('paddle_webhook_secret_missing', {});
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const signature = request.headers.get('paddle-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing paddle-signature header' }, { status: 401 });
    }

    const rawBody = await request.text();
    const isValid = verifyPaddleSignature(signature, rawBody, secret);
    if (!isValid) {
      logError('paddle_webhook_signature_invalid', {});
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as PaddleWebhook;
    const eventType = payload.event_type || payload.eventType || 'unknown';

    if (eventType === 'transaction.completed') {
      const transactionId =
        payload.data?.transactionId ||
        payload.data?.transaction_id ||
        payload.data?.id ||
        null;
      if (transactionId) {
        const token = generatePremiumToken(transactionId, 48);
        const now = Date.now();
        await recordPurchase({
          transactionId,
          tokenIssuedAt: now,
          expiresAt: now + 48 * 60 * 60 * 1000,
          priceId: payload.data?.items?.[0]?.price_id || payload.data?.items?.[0]?.priceId || null,
          amount: null,
          currency: null
        });
        logInfo('paddle_webhook_transaction_completed', {
          transactionId,
          items: payload.data?.items?.length
        });
        return NextResponse.json({
          ok: true,
          token,
          expiresIn: 48 * 60 * 60
        });
      }
    }

    logInfo('paddle_webhook_received', { eventType });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logError('payment_webhook_error', { error: (error as Error).message });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

