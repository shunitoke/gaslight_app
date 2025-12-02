import crypto from 'node:crypto';

import { logError, logInfo, logWarn } from '../../lib/telemetry';

export type UploadTokenPayload = {
  /** Token ID (unique, non-identifying) */
  id: string;
  /** Upload session ID */
  uploadId: string;
  /** Expiration timestamp (Unix seconds) */
  exp: number;
  /** Token creation timestamp */
  iat: number;
  /** Token scope (for clarity/auditing) */
  scope: 'upload';
};

const getSecret = (): string | null => {
  const secret = process.env.UPLOAD_TOKEN_SECRET || process.env.PREMIUM_TOKEN_SECRET;
  if (!secret) {
    return null;
  }
  return secret;
};

export function generateUploadToken(
  uploadId: string,
  durationMinutes: number = 60
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: UploadTokenPayload = {
    id: `upl_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    uploadId,
    exp: now + durationMinutes * 60,
    iat: now,
    scope: 'upload'
  };

  const secret = getSecret();

  if (!secret) {
    logWarn('upload_token_secret_missing', {
      message:
        'UPLOAD_TOKEN_SECRET (or PREMIUM_TOKEN_SECRET) is not set. Using UNSIGNED dev upload tokens. Do NOT use this in production.'
    });
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
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

  logInfo('upload_token_generated', {
    tokenId: payload.id,
    uploadId,
    expiresAt: new Date(payload.exp * 1000).toISOString()
  });

  return token;
}

export function validateUploadToken(token: string): UploadTokenPayload | null {
  try {
    const secret = getSecret();

    if (!secret) {
      logWarn('upload_token_secret_missing_validation', {
        message:
          'UPLOAD_TOKEN_SECRET (or PREMIUM_TOKEN_SECRET) is not set. Validating UNSIGNED dev upload tokens. Do NOT use this in production.'
      });

      const decoded = JSON.parse(
        Buffer.from(token, 'base64url').toString('utf-8')
      ) as UploadTokenPayload;

      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        logInfo('upload_token_expired', { tokenId: decoded.id, uploadId: decoded.uploadId });
        return null;
      }

      return decoded;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      logError('upload_token_invalid_format', { token });
      return null;
    }

    const [headerPart, payloadPart, signaturePart] = parts;
    const data = `${headerPart}.${payloadPart}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64url');

    const signaturesMatch = crypto.timingSafeEqual(
      Buffer.from(signaturePart),
      Buffer.from(expectedSignature)
    );

    if (!signaturesMatch) {
      logError('upload_token_signature_mismatch', {});
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(payloadPart, 'base64url').toString('utf-8')
    ) as UploadTokenPayload;

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      logInfo('upload_token_expired', { tokenId: decoded.id, uploadId: decoded.uploadId });
      return null;
    }

    return decoded;
  } catch (error) {
    logError('upload_token_validation_error', {
      error: (error as Error).message
    });
    return null;
  }
}







