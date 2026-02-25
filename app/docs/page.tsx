import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Code, Zap, Shield, Database, Plug } from 'lucide-react';

const docCategories = [
  {
    title: 'Getting Started',
    icon: Book,
    description: 'Learn the basics and set up your account',
    links: [
      { name: 'Quick Start Guide', href: '#' },
      { name: 'Installation', href: '#' },
      { name: 'Configuration', href: '#' },
    ],
  },
  {
    title: 'API Reference',
    icon: Code,
    description: 'Complete API documentation and examples',
    links: [
      { name: 'Authentication', href: '#' },
      { name: 'Endpoints', href: '#' },
      { name: 'Rate Limits', href: '#' },
    ],
  },
  {
    title: 'Features',
    icon: Zap,
    description: 'Explore all available features',
    links: [
      { name: 'Dashboard', href: '#' },
      { name: 'Analytics', href: '#' },
      { name: 'Team Management', href: '#' },
    ],
  },
  {
    title: 'Security',
    icon: Shield,
    description: 'Security best practices and guidelines',
    links: [
      { name: 'Authentication', href: '#' },
      { name: 'Authorization', href: '#' },
      { name: 'Data Protection', href: '#' },
    ],
  },
  {
    title: 'Database',
    icon: Database,
    description: 'Database schema and migrations',
    links: [
      { name: 'Schema Overview', href: '#' },
      { name: 'Migrations', href: '#' },
      { name: 'Seeding', href: '#' },
    ],
  },
  {
    title: 'Integrations',
    icon: Plug,
    description: 'Connect with third-party services',
    links: [
      { name: 'Stripe', href: '#' },
      { name: 'SendGrid', href: '#' },
      { name: 'Webhooks', href: '#' },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Evolution Future
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {docCategories.map((category) => (
            <Card key={category.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <category.icon className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>{category.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
