/**
 * Edge-safe admin auth utilities (no node:crypto)
 */

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.ADMIN_DASHBOARD_SECRET;
const ADMIN_SESSION_COOKIE = 'admin_session';

const encoder = new TextEncoder();

const base64urlEncode = (buffer: ArrayBuffer) => {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const base64urlDecodeToUint8 = (input: string) => {
  // Pad base64 string
  const padLength = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
  return Uint8Array.from(Buffer.from(padded, 'base64'));
};

export function extractAdminSecret(request: Request): string | null {
  const customHeader = request.headers.get('x-admin-secret');
  if (customHeader) return customHeader;
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function extractAdminSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const cookie = cookies.find((c) => c.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  if (!cookie) return null;
  return decodeURIComponent(cookie.split('=')[1]);
}

export function isAdminEnabled(): boolean {
  return !!ADMIN_SECRET;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function validateAdminSecret(secret: string | null): boolean {
  if (!ADMIN_SECRET) return false;
  if (!secret) return false;
  return constantTimeEqual(secret, ADMIN_SECRET);
}

export async function validateAdminSessionToken(token: string | null): Promise<boolean> {
  if (!ADMIN_SECRET || !token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, signature] = parts;
  try {
    const payloadBytes = base64urlDecodeToUint8(payloadB64);
    const payloadStr = new TextDecoder().decode(payloadBytes);
    const payload = JSON.parse(payloadStr) as { exp: number };
    if (!payload.exp || payload.exp < Date.now()) return false;

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(ADMIN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const expectedSigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadStr));
    const expectedSig = base64urlEncode(expectedSigBuffer);

    return constantTimeEqual(signature, expectedSig);
  } catch {
    return false;
  }
}

export function getAdminSessionCookieName() {
  return ADMIN_SESSION_COOKIE;
}

