import { NextResponse } from 'next/server';

import { listRecentPurchases } from '@/features/subscription/purchases';
import { extractAdminSecret, validateAdminSecret, isAdminEnabled } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function GET(request: Request) {
  if (!isAdminEnabled()) {
    return NextResponse.json({ error: 'Admin disabled' }, { status: 403 });
  }

  const secret = extractAdminSecret(request);
  if (!validateAdminSecret(secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit') || 200), 1000);
  const purchases = await listRecentPurchases(Number.isNaN(limit) ? 200 : limit);

  return NextResponse.json({ purchases });
}




