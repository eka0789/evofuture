import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Pricing plans configuration
export const PRICING_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '5 team members',
      '10 GB storage',
      'Basic analytics',
      'Email support',
      'Community access',
    ],
    limits: {
      teamMembers: 5,
      storage: 10 * 1024 * 1024 * 1024, // 10GB in bytes
      apiCalls: 1000,
    },
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      '25 team members',
      '100 GB storage',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'API access',
      'Advanced reporting',
    ],
    limits: {
      teamMembers: 25,
      storage: 100 * 1024 * 1024 * 1024, // 100GB
      apiCalls: 10000,
    },
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Unlimited team members',
      'Unlimited storage',
      'Advanced analytics',
      '24/7 support',
      'Custom integrations',
      'Unlimited API access',
      'SLA guarantee',
      'Dedicated account manager',
      'Custom contracts',
      'White-label options',
    ],
    limits: {
      teamMembers: -1, // unlimited
      storage: -1, // unlimited
      apiCalls: -1, // unlimited
    },
  },
} as const;

export type PlanId = keyof typeof PRICING_PLANS;

// Helper functions
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  return await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    metadata: {
      userId,
    },
  });
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function updateSubscription(
  subscriptionId: string,
  priceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
  });
}
