import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Database, Mail, MessageSquare, Calendar, FileText } from 'lucide-react';

const integrations = [
  {
    name: 'Stripe',
    description: 'Accept payments and manage subscriptions',
    icon: Zap,
    status: 'available',
    category: 'Payment',
  },
  {
    name: 'PostgreSQL',
    description: 'Powerful relational database',
    icon: Database,
    status: 'connected',
    category: 'Database',
  },
  {
    name: 'SendGrid',
    description: 'Email delivery service',
    icon: Mail,
    status: 'available',
    category: 'Communication',
  },
  {
    name: 'Slack',
    description: 'Team communication platform',
    icon: MessageSquare,
    status: 'available',
    category: 'Communication',
  },
  {
    name: 'Google Calendar',
    description: 'Schedule and manage events',
    icon: Calendar,
    status: 'available',
    category: 'Productivity',
  },
  {
    name: 'Notion',
    description: 'All-in-one workspace',
    icon: FileText,
    status: 'coming-soon',
    category: 'Productivity',
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your favorite tools and services
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <integration.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {integration.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {integration.description}
              </p>
              {integration.status === 'connected' ? (
                <Button variant="outline" className="w-full" disabled>
                  Connected
                </Button>
              ) : integration.status === 'coming-soon' ? (
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              ) : (
                <Button className="w-full">Connect</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
