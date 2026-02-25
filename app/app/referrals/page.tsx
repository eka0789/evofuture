'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Users, Gift, TrendingUp } from 'lucide-react';

export default function ReferralsPage() {
  const { data: session } = useSession();
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralCode();
  }, []);

  const fetchReferralCode = async () => {
    try {
      const res = await fetch('/api/user/referral');
      const data = await res.json();
      setReferralCode(data.referralCode || '');
    } catch (error) {
      console.error('Failed to fetch referral code:', error);
    }
  };

  const generateReferralCode = async () => {
    try {
      const res = await fetch('/api/user/referral', { method: 'POST' });
      const data = await res.json();
      setReferralCode(data.referralCode);
    } catch (error) {
      console.error('Failed to generate referral code:', error);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/auth/signin?ref=${referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground mt-2">
          Invite friends and earn rewards together
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Referrals
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">People you've invited</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rewards Earned
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground mt-1">In referral credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground mt-1">Signup conversion</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode ? (
            <>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/auth/signin?ref=${referralCode}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this link with friends. When they sign up, you both get rewards!
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You don't have a referral code yet
              </p>
              <Button onClick={generateReferralCode}>Generate Referral Code</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold">
                1
              </span>
              <div>
                <p className="font-medium">Share your link</p>
                <p className="text-sm text-muted-foreground">
                  Send your unique referral link to friends
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold">
                2
              </span>
              <div>
                <p className="font-medium">They sign up</p>
                <p className="text-sm text-muted-foreground">
                  Your friend creates an account using your link
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold">
                3
              </span>
              <div>
                <p className="font-medium">You both get rewards</p>
                <p className="text-sm text-muted-foreground">
                  Earn $10 credit when they upgrade to a paid plan
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
