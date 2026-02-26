'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, CreditCard } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/stripe';

export default function BillingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState('FREE');
  const [subscriptionEnd, setSubscriptionEnd] = useState<Date | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/user/subscription');
      if (res.ok) {
        const data = await res.json();
        setCurrentPlan(data.plan || 'FREE');
        if (data.stripeCurrentPeriodEnd) {
          setSubscriptionEnd(new Date(data.stripeCurrentPeriodEnd));
        }
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const handleSubscribe = async (priceId: string, planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading('portal');
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{currentPlan}</p>
              <p className="text-sm text-muted-foreground">
                {currentPlan === 'FREE' ? 'Free forever' : 
                 subscriptionEnd ? `Renews on ${subscriptionEnd.toLocaleDateString()}` : 
                 'Active subscription'}
              </p>
            </div>
            {currentPlan !== 'FREE' && (
              <Button
                onClick={handleManageSubscription}
                disabled={loading === 'portal'}
                variant="outline"
              >
                {loading === 'portal' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Subscription
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(PRICING_PLANS).map(([key, plan]) => {
          const isCurrentPlan = currentPlan === key;
          const priceId = plan.priceId;

          return (
            <Card
              key={key}
              className={`relative ${
                isCurrentPlan ? 'border-primary shadow-lg' : ''
              }`}
            >
              {isCurrentPlan && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Current Plan
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {!isCurrentPlan && priceId && (
                  <Button
                    onClick={() => handleSubscribe(priceId, key)}
                    disabled={loading === key}
                    className="w-full"
                  >
                    {loading === key ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Upgrade'
                    )}
                  </Button>
                )}
                {isCurrentPlan && key !== 'FREE' && (
                  <Button
                    onClick={handleManageSubscription}
                    disabled={loading === 'portal'}
                    variant="outline"
                    className="w-full"
                  >
                    Manage
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All payments are processed securely through Stripe. Your payment information
            is never stored on our servers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
