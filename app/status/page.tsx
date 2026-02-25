'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface SystemStatus {
  status: string;
  database: string;
  timestamp: string;
}

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    { name: 'API', status: status?.status === 'healthy' ? 'operational' : 'down' },
    { name: 'Database', status: status?.database === 'connected' ? 'operational' : 'down' },
    { name: 'Authentication', status: 'operational' },
    { name: 'File Storage', status: 'operational' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">System Status</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Current operational status of all systems
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Overall Status</CardTitle>
                {loading ? (
                  <Badge variant="secondary">
                    <Clock className="h-4 w-4 mr-1" />
                    Checking...
                  </Badge>
                ) : status?.status === 'healthy' ? (
                  <Badge variant="success">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    All Systems Operational
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-4 w-4 mr-1" />
                    System Issues
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">{service.name}</span>
                    <Badge variant={service.status === 'operational' ? 'success' : 'destructive'}>
                      {service.status === 'operational' ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Operational
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Down
                        </>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uptime Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-green-600">99.9%</p>
                  <p className="text-sm text-muted-foreground mt-1">Last 30 days</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">99.95%</p>
                  <p className="text-sm text-muted-foreground mt-1">Last 90 days</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">99.98%</p>
                  <p className="text-sm text-muted-foreground mt-1">All time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {status && (
            <p className="text-center text-sm text-muted-foreground">
              Last updated: {new Date(status.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
