'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Users, 
  Settings, 
  Crown,
  Shield,
  Mail,
  Trash2,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  plan: string;
  status: string;
  maxUsers: number;
  maxStorage: number;
  maxApiCalls: number;
  members: any[];
  _count: {
    members: number;
    teams: number;
  };
}

export default function OrganizationPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', description: '', domain: '' });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/organization');
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    try {
      const res = await fetch('/api/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrg),
      });

      if (res.ok) {
        toast('Organization created successfully', 'success');
        setShowCreateDialog(false);
        setNewOrg({ name: '', description: '', domain: '' });
        fetchOrganizations();
      } else {
        const error = await res.json();
        toast(error.error || 'Failed to create organization', 'error');
      }
    } catch (error) {
      toast('Failed to create organization', 'error');
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      FREE: 'bg-gray-100 text-gray-800',
      PRO: 'bg-blue-100 text-blue-800',
      ENTERPRISE: 'bg-purple-100 text-purple-800',
    };
    return colors[plan as keyof typeof colors] || colors.FREE;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Organizations
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your organizations and workspaces
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first organization to get started
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {organizations.map(org => {
            const userMember = org.members.find(m => m.userId === session?.user?.id);
            const isOwnerOrAdmin = userMember && ['OWNER', 'ADMIN'].includes(userMember.role);

            return (
              <Card key={org.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{org.name}</CardTitle>
                        <Badge className={getPlanBadge(org.plan)}>
                          {org.plan}
                        </Badge>
                        {userMember && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getRoleIcon(userMember.role)}
                            {userMember.role}
                          </Badge>
                        )}
                      </div>
                      {org.description && (
                        <p className="text-sm text-muted-foreground">
                          {org.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{org._count.members} / {org.maxUsers} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4" />
                          <span>{org.maxApiCalls} API calls/month</span>
                        </div>
                      </div>
                    </div>
                    {isOwnerOrAdmin && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Mail className="mr-2 h-4 w-4" />
                          Invite
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Storage</p>
                      <p className="font-medium">{org.maxStorage} MB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Teams</p>
                      <p className="font-medium">{org._count.teams}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Status</p>
                      <Badge variant={org.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {org.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Organization Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  placeholder="Acme Inc."
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={newOrg.description}
                  onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                  placeholder="What does your organization do?"
                />
              </div>
              <div>
                <Label htmlFor="domain">Custom Domain (optional)</Label>
                <Input
                  id="domain"
                  value={newOrg.domain}
                  onChange={(e) => setNewOrg({ ...newOrg, domain: e.target.value })}
                  placeholder="acme.com"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createOrganization} disabled={!newOrg.name}>
                  Create Organization
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
