import { NextResponse } from 'next/server';

import { generatePremiumToken } from '@/features/subscription/premiumToken';
import { recordPurchase } from '@/features/subscription/purchases';
import { logError, logInfo } from '@/lib/telemetry';

export const runtime = 'nodejs';
export const maxDuration = 20;

const getApiBase = () => {
  const env = process.env.PADDLE_ENV === 'sandbox' ? 'sandbox' : 'live';
  if (process.env.PADDLE_API_BASE) return process.env.PADDLE_API_BASE;
  return env === 'sandbox'
    ? 'https://sandbox-api.paddle.com'
    : 'https://api.paddle.com';
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey) {
      logError('paddle_api_key_missing_confirm', {});
      return NextResponse.json({ error: 'PADDLE_API_KEY is not configured' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const transactionId = (body?.transactionId as string | undefined) || (body?.id as string | undefined);
    if (!transactionId) {
      return NextResponse.json({ error: 'transactionId is required' }, { status: 400 });
    }

    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json'
      }
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      logError('paddle_transaction_fetch_failed', {
        transactionId,
        status: response.status,
        body: data
      });
      return NextResponse.json(
        { error: 'Failed to verify transaction', details: data },
        { status: 502 }
      );
    }

    const status = data?.data?.status as string | undefined;
    const priceId = data?.data?.items?.[0]?.priceId || data?.data?.items?.[0]?.price_id || null;
    const amount = data?.data?.items?.[0]?.price?.unit_amount ?? null;
    const currency = data?.data?.items?.[0]?.price?.currency_code ?? null;
    if (!status || (status !== 'completed' && status !== 'paid')) {
      return NextResponse.json(
        { error: 'Transaction not completed yet', status },
        { status: 409 }
      );
    }

    const token = generatePremiumToken(transactionId, 48);
    const now = Date.now();
    await recordPurchase({
      transactionId,
      tokenIssuedAt: now,
      expiresAt: now + 48 * 60 * 60 * 1000,
      priceId,
      amount: typeof amount === 'number' ? amount : null,
      currency: currency || null
    });
    logInfo('paddle_transaction_confirmed', {
      transactionId,
      status
    });

    return NextResponse.json({
      token,
      expiresIn: 48 * 60 * 60,
      tier: 'premium'
    });
  } catch (error) {
    logError('paddle_confirm_error', { error: (error as Error).message });
    return NextResponse.json(
      { error: 'Unable to confirm payment' },
      { status: 500 }
    );
  }
}


