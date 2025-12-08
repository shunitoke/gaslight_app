import { NextResponse, type NextRequest } from 'next/server';

import {
  extractAdminSecret,
  extractAdminSessionToken,
  validateAdminSecret,
  validateAdminSessionToken,
  isAdminEnabled
} from './lib/admin-auth-edge';
import { checkRateLimitEdge } from './lib/rateLimitEdge';

const ADMIN_RATE_LIMIT_MAX = 60; // per minute per IP
const ADMIN_RATE_LIMIT_WINDOW_MS = 60 * 1000;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminApi = pathname.startsWith('/api/admin');
  const isAdminPage = pathname.startsWith('/admin');

  if (!isAdminApi && !isAdminPage) {
    return NextResponse.next();
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const allowed = await checkRateLimitEdge(
    `admin:${ip}`,
    ADMIN_RATE_LIMIT_MAX,
    ADMIN_RATE_LIMIT_WINDOW_MS
  );
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  if (isAdminApi && pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  if (!isAdminEnabled()) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Admin disabled' }, { status: 503 });
    }
    return NextResponse.next();
  }

  if (isAdminApi) {
    const secret = extractAdminSecret(request);
    const session = extractAdminSessionToken(request);
    const authorized =
      validateAdminSecret(secret) || (await validateAdminSessionToken(session));
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}
export default proxy;
