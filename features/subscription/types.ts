/**
 * Subscription tier definitions for freemium model.
 */
export type SubscriptionTier = 'free' | 'premium';

export type SubscriptionFeatures = {
  canImportZip: boolean;
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
  const isDev = process.env.NODE_ENV === 'development';

  // In development we temporarily treat all users as premium
  // so that all advanced analysis features are available.
  // TODO: revert to token/header-based logic when we reintroduce free tier limits.
  if (isDev) {
    return 'premium';
  }

  if (!request) return 'free';

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

  // 2. Default to free
  return 'free';
}

/**
 * Get features available for a subscription tier.
 */
export function getSubscriptionFeatures(tier: SubscriptionTier): SubscriptionFeatures {
  if (tier === 'premium') {
    return {
      canImportZip: true,
      canAnalyzeMedia: true,
      canUseEnhancedAnalysis: true,
      maxMessagesPerAnalysis: 500000, // 500k messages
      maxMediaItemsPerAnalysis: 1000 // 1000 media items
    };
  }

  // Free tier
  return {
    canImportZip: false,
    canAnalyzeMedia: false,
    canUseEnhancedAnalysis: false,
    maxMessagesPerAnalysis: 50000, // 50k messages
    maxMediaItemsPerAnalysis: 0 // No media analysis
  };
}

