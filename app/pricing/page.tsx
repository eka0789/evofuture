import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for individuals and small teams',
    features: [
      'Up to 5 team members',
      '10GB storage',
      'Basic analytics',
      'Email support',
      'API access',
    ],
  },
  {
    name: 'Professional',
    price: '$99',
    description: 'For growing businesses',
    features: [
      'Up to 25 team members',
      '100GB storage',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Custom integrations',
      'Advanced security',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Unlimited team members',
      'Unlimited storage',
      'Enterprise analytics',
      '24/7 dedicated support',
      'API access',
      'Custom integrations',
      'Advanced security',
      'SLA guarantee',
      'White-label options',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 ${
                plan.popular ? 'border-blue-600 shadow-xl scale-105' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
              </div>
              <Button asChild className="w-full mb-6" variant={plan.popular ? 'default' : 'outline'}>
                <Link href="/auth/signin">Get Started</Link>
              </Button>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Need a custom solution? Contact our sales team.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
