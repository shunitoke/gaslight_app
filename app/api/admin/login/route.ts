import { NextResponse } from 'next/server';

import {
  createAdminSessionToken,
  validateAdminSecret,
  isAdminEnabled,
  getAdminSessionCookieName
} from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function POST(request: Request) {
  if (!isAdminEnabled()) {
    return NextResponse.json({ error: 'Admin disabled' }, { status: 503 });
  }

  const { secret } = (await request.json().catch(() => ({}))) as { secret?: string };
  if (!validateAdminSecret(secret || null)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = createAdminSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Session creation failed' }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(getAdminSessionCookieName(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 2 * 60 * 60 // 2 hours
  });
  return res;
}


