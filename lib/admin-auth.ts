/**
 * Admin authentication for secure dashboard access
 * Uses secret key from environment variable
 */

import crypto from 'node:crypto';
import { logError, logWarn } from './telemetry';

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.ADMIN_DASHBOARD_SECRET;

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

