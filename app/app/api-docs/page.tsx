'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

const apiEndpoints = [
  {
    category: 'Authentication',
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/signin',
        description: 'Sign in with credentials',
        body: { email: 'string', password: 'string' },
        response: { user: 'object', token: 'string' },
      },
    ],
  },
  {
    category: 'User',
    endpoints: [
      {
        method: 'GET',
        path: '/api/user/settings',
        description: 'Get user settings',
        auth: true,
        response: { user: 'object' },
      },
      {
        method: 'PATCH',
        path: '/api/user/settings',
        description: 'Update user settings',
        auth: true,
        body: { name: 'string?', notifyEmail: 'boolean?' },
        response: { user: 'object' },
      },
      {
        method: 'POST',
        path: '/api/user/password',
        description: 'Change password',
        auth: true,
        body: { currentPassword: 'string', newPassword: 'string', confirmPassword: 'string' },
        response: { success: 'boolean' },
      },
      {
        method: 'POST',
        path: '/api/user/avatar',
        description: 'Upload avatar image',
        auth: true,
        body: 'FormData with avatar file',
        response: { avatarUrl: 'string' },
      },
    ],
  },
  {
    category: 'Activities',
    endpoints: [
      {
        method: 'GET',
        path: '/api/activities',
        description: 'Get user activities',
        auth: true,
        query: { limit: 'number?', offset: 'number?' },
        response: { activities: 'array' },
      },
    ],
  },
  {
    category: 'Notifications',
    endpoints: [
      {
        method: 'GET',
        path: '/api/notifications',
        description: 'Get user notifications',
        auth: true,
        response: { notifications: 'array' },
      },
      {
        method: 'POST',
        path: '/api/notifications/mark-all-read',
        description: 'Mark all notifications as read',
        auth: true,
        response: { success: 'boolean' },
      },
    ],
  },
  {
    category: 'Analytics',
    endpoints: [
      {
        method: 'GET',
        path: '/api/analytics',
        description: 'Get analytics data',
        auth: true,
        query: { period: 'string?' },
        response: { data: 'object' },
      },
      {
        method: 'GET',
        path: '/api/stats',
        description: 'Get dashboard statistics',
        auth: true,
        response: { stats: 'object' },
      },
    ],
  },
];

export default function ApiDocsPage() {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'POST':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PATCH':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Complete reference for Evolution Future API endpoints
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Base URL</h3>
            <code className="bg-muted px-3 py-1 rounded">
              {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
            </code>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Most endpoints require authentication. Include your session cookie or JWT token in requests.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Rate Limiting</h3>
            <p className="text-sm text-muted-foreground">
              API requests are limited to 100 requests per minute per user.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={apiEndpoints[0].category} className="space-y-6">
        <TabsList>
          {apiEndpoints.map((category) => (
            <TabsTrigger key={category.category} value={category.category}>
              {category.category}
            </TabsTrigger>
          ))}
        </TabsList>

        {apiEndpoints.map((category) => (
          <TabsContent key={category.category} value={category.category} className="space-y-4">
            {category.endpoints.map((endpoint, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm">{endpoint.path}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.path)}
                      >
                        {copiedPath === endpoint.path ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {endpoint.auth && (
                      <Badge variant="outline">Requires Auth</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {endpoint.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {endpoint.query && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Query Parameters</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(endpoint.query, null, 2)}
                      </pre>
                    </div>
                  )}
                  {endpoint.body && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Request Body</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                        {typeof endpoint.body === 'string'
                          ? endpoint.body
                          : JSON.stringify(endpoint.body, null, 2)}
                      </pre>
                    </div>
                  )}
                  {endpoint.response && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Response</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(endpoint.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
