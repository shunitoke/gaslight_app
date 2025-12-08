import { NextResponse } from 'next/server';

import { getAdminSessionCookieName } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 5;

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(getAdminSessionCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0)
  });
  return res;
}


