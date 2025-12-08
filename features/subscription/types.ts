/**
 * Subscription tier definitions for freemium model.
 */
export type SubscriptionTier = 'free' | 'premium';

export type SubscriptionFeatures = {
  canAnalyzeMedia: boolean;
  canUseEnhancedAnalysis: boolean;
  maxMessagesPerAnalysis: number;
  maxMediaItemsPerAnalysis: number;
};

/**
 * Check if a user has a premium subscription.
 * 
 * Priority:
 * 1. Valid premium token (from payment)
 * 2. Development/testing header (x-subscription-tier)
 * 3. Default to free
 * 
 * This maintains anonymity by:
 * - Validating tokens without storing user identity
 * - Using time-limited tokens (24-48 hours)
 * - Tokens are stored client-side only
 */
export async function getSubscriptionTier(request?: Request): Promise<SubscriptionTier> {
  // Dev override to keep existing behavior when explicitly requested
  if (process.env.PREMIUM_EVERYONE === 'true') {
  return 'premium';
  }

  // 1. Check for valid premium token (production method)
  try {
    // Dynamic import to avoid circular dependencies
    const premiumTokenModule = await import('./premiumToken');
    const token = premiumTokenModule.extractPremiumTokenFromRequest(request);
    if (token) {
      const payload = premiumTokenModule.validatePremiumToken(token);
      if (payload) {
        return 'premium';
      }
    }
  } catch {
    // If premium token module fails, fall through to other checks
  }

  // 2. Allow explicit header override for testing
  const tierOverride = request?.headers.get('x-subscription-tier');
  if (tierOverride === 'premium') {
    return 'premium';
  }

  // 3. Default to free
  return 'free';
}

/**
 * Get features available for a subscription tier.
 */
export function getSubscriptionFeatures(tier: SubscriptionTier): SubscriptionFeatures {
  if (tier === 'premium') {
    return {
      canAnalyzeMedia: true,
      canUseEnhancedAnalysis: true,
      maxMessagesPerAnalysis: 500000, // 500k messages
      maxMediaItemsPerAnalysis: 1000 // 1000 media items
    };
  }

  // Free tier (kept permissive to avoid blocking existing flows; premium is required for full report/export)
  return {
    canAnalyzeMedia: true,
    canUseEnhancedAnalysis: true,
    maxMessagesPerAnalysis: 500000,
    maxMediaItemsPerAnalysis: 1000
  };
}

