import { NextResponse } from 'next/server';

import { logError, logInfo } from '@/lib/telemetry';

export const runtime = 'nodejs';
export const maxDuration = 15;

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
    const defaultPriceId = process.env.PADDLE_PRICE_ID_REPORT;
    if (!apiKey) {
      logError('paddle_api_key_missing', {});
      return NextResponse.json({ error: 'PADDLE_API_KEY is not configured' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const priceId = (body?.priceId as string | undefined) || defaultPriceId;
    if (!priceId) {
      logError('paddle_price_missing', {});
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{ priceId, quantity: 1 }],
        customData: { feature: 'premium_report' },
        metadata: { source: 'textswithmyex' }
      })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      logError('paddle_transaction_create_failed', {
        status: response.status,
        body: data
      });
      return NextResponse.json(
        { error: 'Failed to create Paddle transaction', details: data },
        { status: 502 }
      );
    }

    const transactionId = data?.data?.id;
    if (!transactionId) {
      logError('paddle_transaction_id_missing', { body: data });
      return NextResponse.json(
        { error: 'Paddle did not return a transaction id' },
        { status: 502 }
      );
    }

    logInfo('paddle_transaction_created', {
      transactionId,
      priceId
    });

    return NextResponse.json({ transactionId, priceId });
  } catch (error) {
    logError('paddle_checkout_error', { error: (error as Error).message });
    return NextResponse.json(
      { error: 'Unable to start checkout' },
      { status: 500 }
    );
  }
}



