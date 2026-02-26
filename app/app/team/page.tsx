'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Mail, Settings, Trash2, Shield, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  members: any[];
  _count: { members: number };
}

export default function TeamPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam),
      });

      if (res.ok) {
        toast({ title: 'Team created successfully' });
        setShowCreateDialog(false);
        setNewTeam({ name: '', description: '' });
        fetchTeams();
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create team', variant: 'destructive' });
    }
  };

  const sendInvite = async () => {
    if (!selectedTeam) return;

    try {
      const res = await fetch(`/api/team/${selectedTeam}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (res.ok) {
        toast({ title: 'Invitation sent successfully' });
        setShowInviteDialog(false);
        setInviteEmail('');
        setInviteRole('MEMBER');
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send invitation', variant: 'destructive' });
    }
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

  const getRoleBadge = (role: string) => {
    const colors = {
      OWNER: 'bg-yellow-100 text-yellow-800',
      ADMIN: 'bg-blue-100 text-blue-800',
      MEMBER: 'bg-gray-100 text-gray-800',
    };
    return colors[role as keyof typeof colors] || colors.MEMBER;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
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
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your teams and collaborate with members
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first team to start collaborating
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {teams.map(team => {
            const userMember = team.members.find(m => m.userId === session?.user?.id);
            const isOwnerOrAdmin = userMember && ['OWNER', 'ADMIN'].includes(userMember.role);

            return (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {team.name}
                        {userMember && (
                          <Badge className={getRoleBadge(userMember.role)}>
                            {userMember.role}
                          </Badge>
                        )}
                      </CardTitle>
                      {team.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {team.description}
                        </p>
                      )}
                    </div>
                    {isOwnerOrAdmin && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTeam(team.id);
                            setShowInviteDialog(true);
                          }}
                        >
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{team._count.members} members</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Team Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="My Awesome Team"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="What's this team about?"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createTeam} disabled={!newTeam.name}>
                  Create Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invite Member Dialog */}
      {showInviteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Invite Team Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={sendInvite} disabled={!inviteEmail}>
                  Send Invitation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
