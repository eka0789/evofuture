'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, Copy, Book, Zap, Shield, Check } from 'lucide-react';
import { apiDocumentation, codeExamples } from '@/lib/api-docs';
import { useToast } from '@/hooks/use-toast';

export default function ApiDocsPage() {
  const { toast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Copied to clipboard', 'success');
  };

  const getMethodColor = (method: string) => {
    const colors = {
      get: 'bg-blue-100 text-blue-800',
      post: 'bg-green-100 text-green-800',
      patch: 'bg-yellow-100 text-yellow-800',
      put: 'bg-orange-100 text-orange-800',
      delete: 'bg-red-100 text-red-800',
    };
    return colors[method.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Complete reference for Evolution Future SaaS API
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Base URL</h3>
            <code className="block bg-muted p-3 rounded-md">
              {apiDocumentation.servers[0].url}
            </code>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground mb-2">
              All API requests require authentication using session cookies or bearer tokens.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-1" />
                <div>
                  <p className="text-sm font-medium">Session Cookie (Recommended)</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically included when using the web app
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-1" />
                <div>
                  <p className="text-sm font-medium">Bearer Token</p>
                  <p className="text-xs text-muted-foreground">
                    For external integrations and API clients
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Tabs defaultValue="user" className="space-y-4">
        <TabsList>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* User Endpoints */}
        <TabsContent value="user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* GET /api/user/profile */}
              <div className="border-b pb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getMethodColor('get')}>GET</Badge>
                  <code className="text-sm">/api/user/profile</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the authenticated user's profile information
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Response</h4>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "plan": "PRO",
  "createdAt": "2024-01-01T00:00:00Z"
}`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Code Example</h4>
                    <div className="flex gap-2 mb-2">
                      {['javascript', 'python', 'curl'].map(lang => (
                        <Button
                          key={lang}
                          size="sm"
                          variant={selectedLanguage === lang ? 'default' : 'outline'}
                          onClick={() => setSelectedLanguage(lang)}
                        >
                          {lang}
                        </Button>
                      ))}
                    </div>
                    <div className="relative">
                      <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                        {codeExamples[selectedLanguage as keyof typeof codeExamples]?.getUserProfile}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(
                          codeExamples[selectedLanguage as keyof typeof codeExamples]?.getUserProfile
                        )}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PATCH /api/user/profile */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getMethodColor('patch')}>PATCH</Badge>
                  <code className="text-sm">/api/user/profile</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Update the authenticated user's profile
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Request Body</h4>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`{
  "name": "John Doe",
  "email": "newemail@example.com"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Endpoints */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* GET /api/team */}
              <div className="border-b pb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getMethodColor('get')}>GET</Badge>
                  <code className="text-sm">/api/team</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  List all teams the user is a member of
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Response</h4>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`{
  "teams": [
    {
      "id": "uuid",
      "name": "My Team",
      "slug": "my-team",
      "description": "Team description",
      "members": [...],
      "_count": { "members": 5 }
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* POST /api/team */}
              <div className="border-b pb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getMethodColor('post')}>POST</Badge>
                  <code className="text-sm">/api/team</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a new team
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Request Body</h4>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`{
  "name": "My Team",
  "description": "Optional description"
}`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Code Example</h4>
                    <div className="relative">
                      <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                        {codeExamples[selectedLanguage as keyof typeof codeExamples]?.createTeam}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(
                          codeExamples[selectedLanguage as keyof typeof codeExamples]?.createTeam
                        )}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* POST /api/team/{teamId}/invite */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getMethodColor('post')}>POST</Badge>
                  <code className="text-sm">/api/team/:teamId/invite</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Invite a member to the team (Admin/Owner only)
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Request Body</h4>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`{
  "email": "colleague@example.com",
  "role": "MEMBER" // or "ADMIN"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Endpoints */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getMethodColor('get')}>GET</Badge>
                <code className="text-sm">/api/activities</code>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get user activity history
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Query Parameters</h4>
                  <ul className="text-sm space-y-1">
                    <li><code>limit</code> - Number of activities to return (default: 50)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Endpoints */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getMethodColor('get')}>GET</Badge>
                <code className="text-sm">/api/analytics/advanced</code>
                <Badge variant="outline" className="ml-2">Admin Only</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get comprehensive analytics data
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Query Parameters</h4>
                  <ul className="text-sm space-y-1">
                    <li><code>days</code> - Number of days to analyze (default: 30)</li>
                    <li><code>format</code> - Response format: json or csv</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Endpoints */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-b pb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getMethodColor('post')}>POST</Badge>
                  <code className="text-sm">/api/stripe/checkout</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a Stripe checkout session
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Request Body</h4>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`{
  "priceId": "price_xxx" // Stripe price ID
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getMethodColor('post')}>POST</Badge>
                  <code className="text-sm">/api/stripe/portal</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a billing portal session
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rate Limiting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            API requests are rate limited to ensure fair usage:
          </p>
          <ul className="text-sm space-y-2">
            <li>• Free Plan: 100 requests per hour</li>
            <li>• Pro Plan: 1,000 requests per hour</li>
            <li>• Enterprise Plan: 10,000 requests per hour</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Rate limit headers are included in all responses:
          </p>
          <pre className="bg-muted p-3 rounded-md text-xs mt-2">
{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000`}
          </pre>
        </CardContent>
      </Card>

      {/* Error Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Error Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <code className="text-red-600">400</code>
              <span>Bad Request - Invalid input or parameters</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="text-red-600">401</code>
              <span>Unauthorized - Authentication required</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="text-red-600">403</code>
              <span>Forbidden - Insufficient permissions</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="text-red-600">404</code>
              <span>Not Found - Resource does not exist</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="text-red-600">429</code>
              <span>Too Many Requests - Rate limit exceeded</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="text-red-600">500</code>
              <span>Internal Server Error - Something went wrong</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
