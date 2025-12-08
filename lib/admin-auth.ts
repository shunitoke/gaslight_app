/**
 * Admin authentication for secure dashboard access
 * Uses secret key from environment variable
 */

import crypto from 'node:crypto';
import { logError, logWarn } from './telemetry';

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.ADMIN_DASHBOARD_SECRET;
const ADMIN_SESSION_COOKIE = 'admin_session';
const ADMIN_SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

const base64url = (input: string | Buffer) =>
  Buffer.from(input).toString('base64url');

type AdminSessionPayload = {
  exp: number;
  n: string;
};

/**
 * Validate admin secret from request
 */
export function validateAdminSecret(secret: string | null): boolean {
  if (!ADMIN_SECRET) {
    logWarn('admin_secret_not_configured', {
      message: 'ADMIN_SECRET is not set. Admin dashboard is disabled.'
    });
    return false;
  }

  if (!secret) {
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(secret),
      Buffer.from(ADMIN_SECRET)
    );
  } catch (error) {
    logError('admin_secret_validation_error', {
      error: (error as Error).message
    });
    return false;
  }
}

/**
 * Extract admin secret from request headers
 * Looks for 'x-admin-secret' or 'authorization' header (Bearer token)
 */
export function extractAdminSecret(request: Request): string | null {
  // Try custom header first
  const customHeader = request.headers.get('x-admin-secret');
  if (customHeader) {
    return customHeader;
  }

  // Try Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Check if admin dashboard is enabled
 */
export function isAdminEnabled(): boolean {
  return !!ADMIN_SECRET;
}

/**
 * Create a signed session token for admin authentication.
 */
export function createAdminSessionToken(): string | null {
  if (!ADMIN_SECRET) return null;
  const payload: AdminSessionPayload = {
    exp: Date.now() + ADMIN_SESSION_TTL_MS,
    n: Math.random().toString(36).slice(2)
  };
  const payloadStr = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payloadStr)
    .digest('base64url');
  return `${base64url(payloadStr)}.${signature}`;
}

/**
 * Extract admin session token from cookies.
 */
export function extractAdminSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const cookie = cookies.find((c) => c.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  if (!cookie) return null;
  return decodeURIComponent(cookie.split('=')[1]);
}

/**
 * Validate admin session token (HMAC signed, exp checked).
 */
export function validateAdminSessionToken(token: string | null): boolean {
  if (!token || !ADMIN_SECRET) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, signature] = parts;
  try {
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const expectedSig = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(payloadStr)
      .digest('base64url');
    const sigMatches = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSig)
    );
    if (!sigMatches) return false;
    const payload = JSON.parse(payloadStr) as AdminSessionPayload;
    if (payload.exp < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function getAdminSessionCookieName() {
  return ADMIN_SESSION_COOKIE;
}

