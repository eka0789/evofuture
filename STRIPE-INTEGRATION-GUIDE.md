# 💳 Stripe Payment Integration Guide

## Overview

Evolution Future now includes complete Stripe payment integration for subscription management.

## Features Implemented

✅ **Subscription Management**
- Multiple pricing tiers (Free, Pro, Enterprise)
- Automatic subscription creation
- Subscription upgrades/downgrades
- Subscription cancellation
- Billing portal access

✅ **Webhook Handling**
- Checkout session completed
- Subscription updated
- Subscription deleted
- Invoice payment succeeded/failed

✅ **Database Integration**
- Stripe customer ID storage
- Subscription ID tracking
- Current period end tracking
- Plan status management

## Setup Instructions

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for an account
3. Complete verification

### 2. Get API Keys

1. Go to Developers → API keys
2. Copy your **Publishable key** and **Secret key**
3. For testing, use test mode keys (starts with `pk_test_` and `sk_test_`)

### 3. Create Products & Prices

#### Pro Plan ($29/month)
```bash
# Create product
stripe products create \
  --name="Pro Plan" \
  --description="Professional features for growing teams"

# Create price
stripe prices create \
  --product=prod_xxx \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month
```

#### Enterprise Plan ($99/month)
```bash
# Create product
stripe products create \
  --name="Enterprise Plan" \
  --description="Advanced features for large organizations"

# Create price
stripe prices create \
  --product=prod_xxx \
  --unit-amount=9900 \
  --currency=usd \
  --recurring[interval]=month
```

### 4. Configure Environment Variables

Add to your `.env`:

```env
# Stripe Keys
STRIPE_PUBLIC_KEY="pk_test_your_publishable_key"
STRIPE_SECRET_KEY="sk_test_your_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Price IDs (from step 3)
STRIPE_PRO_PRICE_ID="price_xxx"
STRIPE_ENTERPRISE_PRICE_ID="price_xxx"
```

### 5. Set Up Webhooks

#### Local Development (using Stripe CLI)

```bash
# Install Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook secret starting with `whsec_`. Add it to your `.env`.

#### Production

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Enter your URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook secret to your environment variables

### 6. Test the Integration

```bash
# Start your development server
npm run dev

# In another terminal, start Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test a checkout
stripe trigger checkout.session.completed
```

## Usage

### For Users

1. **View Plans**: Navigate to `/app/billing`
2. **Subscribe**: Click "Upgrade" on desired plan
3. **Manage**: Click "Manage Subscription" to update payment methods
4. **Cancel**: Use billing portal to cancel subscription

### For Developers

#### Create Checkout Session

```typescript
const res = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    priceId: 'price_xxx' 
  }),
});

const { url } = await res.json();
window.location.href = url;
```

#### Access Billing Portal

```typescript
const res = await fetch('/api/stripe/portal', {
  method: 'POST',
});

const { url } = await res.json();
window.location.href = url;
```

#### Check Subscription Status

```typescript
const res = await fetch('/api/user/subscription');
const subscription = await res.json();

console.log(subscription.plan); // 'FREE', 'PRO', or 'ENTERPRISE'
console.log(subscription.stripeCurrentPeriodEnd); // Next billing date
```

## API Endpoints

### POST /api/stripe/checkout
Create a checkout session for subscription.

**Request:**
```json
{
  "priceId": "price_xxx"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/stripe/portal
Create a billing portal session.

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### GET /api/user/subscription
Get current user's subscription details.

**Response:**
```json
{
  "plan": "PRO",
  "stripeCustomerId": "cus_xxx",
  "stripeSubscriptionId": "sub_xxx",
  "stripePriceId": "price_xxx",
  "stripeCurrentPeriodEnd": "2024-12-31T23:59:59.000Z"
}
```

### POST /api/webhooks/stripe
Stripe webhook endpoint (handled automatically).

## Pricing Plans

### Free Plan
- **Price**: $0/month
- **Features**:
  - 5 team members
  - 10 GB storage
  - Basic analytics
  - Email support
  - Community access

### Pro Plan
- **Price**: $29/month
- **Features**:
  - 25 team members
  - 100 GB storage
  - Advanced analytics
  - Priority support
  - Custom integrations
  - API access
  - Advanced reporting

### Enterprise Plan
- **Price**: $99/month
- **Features**:
  - Unlimited team members
  - Unlimited storage
  - Advanced analytics
  - 24/7 support
  - Custom integrations
  - Unlimited API access
  - SLA guarantee
  - Dedicated account manager
  - Custom contracts
  - White-label options

## Database Schema

```prisma
model User {
  // ... other fields
  
  // Subscription & Billing
  stripeCustomerId       String?   @unique
  stripeSubscriptionId   String?   @unique
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?
  plan                   String    @default("FREE")
}
```

## Security Best Practices

1. **Verify Webhook Signatures**
   - Always verify Stripe webhook signatures
   - Use `stripe.webhooks.constructEvent()`

2. **Use Environment Variables**
   - Never commit API keys to git
   - Use different keys for test/production

3. **Handle Errors Gracefully**
   - Log all webhook errors
   - Implement retry logic for failed payments

4. **Validate Price IDs**
   - Always validate price IDs before creating checkout
   - Prevent unauthorized plan changes

## Testing

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

Use any future expiry date and any 3-digit CVC.

### Test Webhooks

```bash
# Trigger specific events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct
2. Verify webhook secret in `.env`
3. Check Stripe CLI is running (local dev)
4. Check webhook logs in Stripe Dashboard

### Payment Fails

1. Check test card numbers
2. Verify price IDs are correct
3. Check Stripe account is activated
4. Review error logs

### Subscription Not Updating

1. Check webhook is processing correctly
2. Verify database connection
3. Check user ID mapping
4. Review webhook event logs

## Going to Production

### Checklist

- [ ] Switch to live API keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment methods
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications
- [ ] Set up Stripe Radar for fraud prevention
- [ ] Enable 3D Secure
- [ ] Configure tax settings
- [ ] Set up invoicing
- [ ] Test subscription lifecycle

### Monitoring

Monitor these metrics:
- Successful subscriptions
- Failed payments
- Churn rate
- MRR (Monthly Recurring Revenue)
- Customer lifetime value

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

---

**Your payment system is ready! 💳**
