# Premium Subscription System (Anonymous)

This system enables premium features in a completely anonymous app without storing user data.

## Architecture

### Core Principles

1. **No User Identity Storage**: We never store names, emails, or any identifying information
2. **Ephemeral Tokens**: Premium tokens expire after 24-48 hours
3. **Client-Side Storage**: Tokens are stored in browser localStorage, not server-side
4. **Payment Validation**: Tokens are validated against payment provider webhooks
5. **Stateless Validation**: Token validation doesn't require database lookups

### Flow

```
User → Payment Provider → Webhook → Generate Token → Store Client-Side → Validate on Requests
```

1. **User Initiates Payment**
   - Frontend redirects to payment provider (Stripe Checkout, PayPal, etc.)
   - User completes payment anonymously
   - Payment provider processes payment

2. **Webhook Receives Payment Confirmation**
   - Payment provider sends webhook to `/api/payment/webhook`
   - We validate webhook signature (security critical!)
   - We extract payment transaction ID

3. **Token Generation**
   - Generate signed JWT token with:
     - Unique token ID (non-identifying)
     - Expiration timestamp (24-48 hours)
     - Payment transaction ID (for validation)
     - Feature flags enabled
   - Token is signed with server secret (prevents tampering)

4. **Token Delivery**
   - Token returned to user (via redirect URL or API response)
   - User stores token in localStorage
   - Token is sent with each API request

5. **Token Validation**
   - On each request, extract token from header
   - Verify signature and expiration
   - Check against payment provider (optional, for revocation)
   - Grant premium access if valid

### Token Format

```typescript
{
  id: "prem_1234567890_abc123",  // Unique, non-identifying
  exp: 1234567890,                // Expiration timestamp
  paymentId: "pay_xyz789",        // Payment provider transaction ID
  iat: 1234560000,                // Issued at timestamp
  features: ["zip_import", "media_analysis", "enhanced_analysis"]
}
```

### Security Considerations

1. **Webhook Signature Validation**: MUST validate all webhook signatures to prevent fake payments
2. **Token Signing**: Use proper JWT signing (not base64 encoding) with secret key
3. **Token Expiration**: Short expiration (24-48 hours) limits exposure if token is leaked
4. **HTTPS Only**: Tokens should only be transmitted over HTTPS
5. **Token Revocation**: Optional blacklist for revoked tokens (in-memory or Redis)

### Implementation Status

- ✅ Token generation and validation structure
- ✅ Request header extraction
- ✅ Webhook endpoint skeleton
- ⚠️ **TODO**: Implement proper JWT signing (currently using base64 - NOT SECURE)
- ⚠️ **TODO**: Implement webhook signature validation
- ⚠️ **TODO**: Integrate with payment provider SDKs (Stripe, PayPal)
- ⚠️ **TODO**: Add token blacklist for revocation
- ⚠️ **TODO**: Frontend payment flow integration

### Testing

For development/testing, you can use the `x-subscription-tier: premium` header.

For production testing, you'll need:
1. Payment provider test account
2. Webhook endpoint accessible from internet (ngrok for local dev)
3. Proper signature validation enabled

### Payment Provider Integration

#### Stripe
```typescript
// Webhook validation
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
```

#### PayPal
```typescript
// Webhook validation
import paypal from '@paypal/checkout-server-sdk';
// Use PayPal SDK to verify webhook signature
```

### Frontend Integration

```typescript
// After payment, store token
const response = await fetch('/api/payment/webhook', { ... });
const { token } = await response.json();
localStorage.setItem('premium_token', token);

// Include token in requests
fetch('/api/import', {
  headers: {
    'x-premium-token': localStorage.getItem('premium_token')
  }
});
```






