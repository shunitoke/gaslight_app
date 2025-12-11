import { NextResponse } from 'next/server';

import {
  listRecentDeliveriesForPurchase
} from '@/features/subscription/purchases';
import {
  extractAdminSecret,
  extractAdminSessionToken,
  validateAdminSecret,
  validateAdminSessionToken,
  isAdminEnabled
} from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 15;

type RouteContext =
  | { params: { transactionId: string } }
  | { params: Promise<{ transactionId: string }> };

export async function GET(request: Request, context: RouteContext) {
  if (!isAdminEnabled()) {
    return NextResponse.json({ error: 'Admin disabled' }, { status: 403 });
  }

  const secret = extractAdminSecret(request);
  const session = extractAdminSessionToken(request);
  const authorized = validateAdminSecret(secret) || validateAdminSessionToken(session);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await Promise.resolve(context.params);
  const transactionId = resolvedParams.transactionId;
  if (!transactionId) {
    return NextResponse.json({ error: 'transactionId is required' }, { status: 400 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);
  const deliveries = await listRecentDeliveriesForPurchase(transactionId, Number.isNaN(limit) ? 50 : limit);

  return NextResponse.json({ deliveries });
}


