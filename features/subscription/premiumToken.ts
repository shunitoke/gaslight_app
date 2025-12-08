/**
 * Premium token system for anonymous premium access.
 *
 * This system enables premium features without storing user data:
 * 1. User pays via payment provider (Stripe, PayPal, etc.)
 * 2. Payment provider sends webhook with payment confirmation
 * 3. We generate a time-limited, signed token (JWT‑like, HMAC‑protected)
 * 4. Token is returned to user and stored client-side (localStorage)
 * 5. Token is validated on each request without storing user identity
 * 6. Token expires after set duration (e.g., 24-48 hours)
 *
 * Benefits:
 * - No user accounts or persistent storage required
 * - Tokens can be validated server-side without database lookups
 * - Time-limited access maintains ephemeral nature
 * - Can be revoked if needed (blacklist in memory/Redis)
 */

import crypto from 'node:crypto';

import { logError, logInfo, logWarn } from '../../lib/telemetry';

export type PremiumTokenPayload = {
  /** Token ID (unique, non-identifying) */
  id: string;
  /** Expiration timestamp (Unix seconds) */
  exp: number;
  /** Payment provider transaction ID (for validation) */
  paymentId: string;
  /** Token creation timestamp */
  iat: number;
  /** Feature flags enabled by this token */
  features: string[];
};

/**
 * Generate a premium token after successful payment.
 * In production, this would be called from a payment webhook handler.
 * 
 * @param paymentId - Payment provider transaction ID
 * @param durationHours - How long the token should be valid (default: 24 hours)
 * @returns Signed token string (JWT or similar)
 */
export function generatePremiumToken(
  paymentId: string,
  durationHours: number = 24
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: PremiumTokenPayload = {
    id: `prem_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    exp: now + (durationHours * 3600),
    paymentId,
    iat: now,
    features: ['zip_import', 'media_analysis', 'enhanced_analysis']
  };

  const secret = process.env.PREMIUM_TOKEN_SECRET;

  if (!secret) {
    // Fallback for development so that flows keep working, but log loudly.
    logWarn('premium_token_secret_missing', {
      message:
        'PREMIUM_TOKEN_SECRET is not set. Using UNSIGNED dev tokens. Do NOT use this in production.'
    });
    const unsigned = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return unsigned;
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const headerPart = encode(header);
  const payloadPart = encode(payload);
  const data = `${headerPart}.${payloadPart}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');

  const token = `${data}.${signature}`;

  logInfo('premium_token_generated', {
    tokenId: payload.id, 
    paymentId,
    expiresAt: new Date(payload.exp * 1000).toISOString()
  });

  return token;
}

/**
 * Validate a premium token from a request.
 * Returns the token payload if valid, null otherwise.
 * 
 * @param token - Token string from request header or body
 * @returns Token payload if valid, null if invalid/expired
 */
export function validatePremiumToken(token: string): PremiumTokenPayload | null {
  try {
    const secret = process.env.PREMIUM_TOKEN_SECRET;

    if (!secret) {
      // Dev-mode fallback: accept unsigned base64 payload tokens.
      logWarn('premium_token_secret_missing_validation', {
        message:
          'PREMIUM_TOKEN_SECRET is not set. Validating UNSIGNED dev tokens. Do NOT use this in production.'
      });

      const decoded = JSON.parse(
        Buffer.from(token, 'base64url').toString('utf-8')
      ) as PremiumTokenPayload;

      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        logInfo('premium_token_expired', { tokenId: decoded.id });
        return null;
      }

      return decoded;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      logError('premium_token_invalid_format', { token });
      return null;
    }

    const [headerPart, payloadPart, signaturePart] = parts;
    const data = `${headerPart}.${payloadPart}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64url');

    const signaturesMatch =
      crypto.timingSafeEqual(
        Buffer.from(signaturePart),
        Buffer.from(expectedSignature)
      );

    if (!signaturesMatch) {
      logError('premium_token_signature_mismatch', {});
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(payloadPart, 'base64url').toString('utf-8')
    ) as PremiumTokenPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      logInfo('premium_token_expired', { tokenId: decoded.id });
      return null;
    }

    // TODO: Check token blacklist (for revoked tokens) if needed

    return decoded;
  } catch (error) {
    logError('premium_token_validation_error', { 
      error: (error as Error).message 
    });
    return null;
  }
}

/**
 * Extract premium token from request headers.
 * Looks for 'x-premium-token' or 'authorization' header.
 */
export function extractPremiumTokenFromRequest(request: Request): string | null {
  // Check custom header first
  const customHeader = request.headers.get('x-premium-token');
  if (customHeader) {
    return customHeader;
  }

  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Check if a token grants access to a specific feature.
 */
export function tokenHasFeature(
  token: PremiumTokenPayload | null,
  feature: string
): boolean {
  if (!token) return false;
  return token.features.includes(feature);
}

/**
 * Convenience helper to extract and validate a premium token from a request.
 */
export function getPremiumTokenPayload(request?: Request): PremiumTokenPayload | null {
  try {
    const token = request ? extractPremiumTokenFromRequest(request) : null;
    if (!token) return null;
    return validatePremiumToken(token);
  } catch {
    return null;
  }
}

