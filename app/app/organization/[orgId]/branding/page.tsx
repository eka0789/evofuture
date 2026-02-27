'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Image as ImageIcon, 
  Code, 
  Mail, 
  Save,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Branding {
  brandName?: string;
  brandLogo?: string;
  brandFavicon?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  brandFont?: string;
  customCss?: string;
  customJs?: string;
  hidePoweredBy?: boolean;
  emailFromName?: string;
  emailFromAddress?: string;
  emailLogo?: string;
  emailFooter?: string;
}

export default function BrandingPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const params = useParams();
  const orgId = params.orgId as string;

  const [branding, setBranding] = useState<Branding>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEnterprise, setIsEnterprise] = useState(false);

  useEffect(() => {
    fetchBranding();
  }, [orgId]);

  const fetchBranding = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/organization/${orgId}/branding`);
      if (res.ok) {
        const data = await res.json();
        setBranding(data.branding || {});
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBranding = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/organization/${orgId}/branding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });

      if (res.ok) {
        toast('Branding updated successfully', 'success');
      } else {
        const error = await res.json();
        toast(error.error || 'Failed to update branding', 'error');
      }
    } catch (error) {
      toast('Failed to update branding', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Palette className="h-8 w-8" />
            White-Label Branding
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your organization's branding and appearance
          </p>
        </div>
        <Button onClick={saveBranding} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {!isEnterprise && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Enterprise Plan Required</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Advanced white-label features (custom CSS/JS, hide branding, custom domain) require an Enterprise plan.
                  Basic branding customization is available on all plans.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <ImageIcon className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette className="mr-2 h-4 w-4" />
            Colors & Fonts
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Code className="mr-2 h-4 w-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={branding.brandName || ''}
                  onChange={(e) => setBranding({ ...branding, brandName: e.target.value })}
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <Label htmlFor="brandLogo">Logo URL</Label>
                <Input
                  id="brandLogo"
                  value={branding.brandLogo || ''}
                  onChange={(e) => setBranding({ ...branding, brandLogo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                {branding.brandLogo && (
                  <div className="mt-2">
                    <img 
                      src={branding.brandLogo} 
                      alt="Brand Logo" 
                      className="h-12 object-contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="brandFavicon">Favicon URL</Label>
                <Input
                  id="brandFavicon"
                  value={branding.brandFavicon || ''}
                  onChange={(e) => setBranding({ ...branding, brandFavicon: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                  disabled={!isEnterprise}
                />
                {!isEnterprise && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Enterprise plan required
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hidePoweredBy"
                  checked={branding.hidePoweredBy || false}
                  onChange={(e) => setBranding({ ...branding, hidePoweredBy: e.target.checked })}
                  disabled={!isEnterprise}
                  className="h-4 w-4"
                />
                <Label htmlFor="hidePoweredBy">
                  Hide "Powered by" branding
                  {!isEnterprise && (
                    <Badge variant="outline" className="ml-2">Enterprise</Badge>
                  )}
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors & Fonts Tab */}
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={branding.brandPrimaryColor || '#3b82f6'}
                      onChange={(e) => setBranding({ ...branding, brandPrimaryColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={branding.brandPrimaryColor || '#3b82f6'}
                      onChange={(e) => setBranding({ ...branding, brandPrimaryColor: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={branding.brandSecondaryColor || '#8b5cf6'}
                      onChange={(e) => setBranding({ ...branding, brandSecondaryColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={branding.brandSecondaryColor || '#8b5cf6'}
                      onChange={(e) => setBranding({ ...branding, brandSecondaryColor: e.target.value })}
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="brandFont">Font Family</Label>
                <select
                  id="brandFont"
                  value={branding.brandFont || 'Inter'}
                  onChange={(e) => setBranding({ ...branding, brandFont: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium mb-2">Preview</p>
                <div className="space-y-2">
                  <div 
                    className="h-12 rounded flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: branding.brandPrimaryColor || '#3b82f6' }}
                  >
                    Primary Color
                  </div>
                  <div 
                    className="h-12 rounded flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: branding.brandSecondaryColor || '#8b5cf6' }}
                  >
                    Secondary Color
                  </div>
                  <p style={{ fontFamily: branding.brandFont || 'Inter' }}>
                    Sample text in {branding.brandFont || 'Inter'} font
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customCss">Custom CSS</Label>
                <textarea
                  id="customCss"
                  value={branding.customCss || ''}
                  onChange={(e) => setBranding({ ...branding, customCss: e.target.value })}
                  placeholder="/* Your custom CSS here */"
                  disabled={!isEnterprise}
                  className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background font-mono text-sm"
                />
                {!isEnterprise && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Enterprise plan required
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customJs">Custom JavaScript</Label>
                <textarea
                  id="customJs"
                  value={branding.customJs || ''}
                  onChange={(e) => setBranding({ ...branding, customJs: e.target.value })}
                  placeholder="// Your custom JavaScript here"
                  disabled={!isEnterprise}
                  className="w-full h-32 px-3 py-2 rounded-md border border-input bg-background font-mono text-sm"
                />
                {!isEnterprise && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Enterprise plan required
                  </p>
                )}
              </div>

              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Security Note:</strong> Custom code is validated for security. 
                  Dangerous patterns (eval, innerHTML, etc.) are not allowed.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="emailFromName">From Name</Label>
                <Input
                  id="emailFromName"
                  value={branding.emailFromName || ''}
                  onChange={(e) => setBranding({ ...branding, emailFromName: e.target.value })}
                  placeholder="Your Company"
                  disabled={!isEnterprise}
                />
              </div>

              <div>
                <Label htmlFor="emailFromAddress">From Email Address</Label>
                <Input
                  id="emailFromAddress"
                  type="email"
                  value={branding.emailFromAddress || ''}
                  onChange={(e) => setBranding({ ...branding, emailFromAddress: e.target.value })}
                  placeholder="noreply@yourcompany.com"
                  disabled={!isEnterprise}
                />
              </div>

              <div>
                <Label htmlFor="emailLogo">Email Logo URL</Label>
                <Input
                  id="emailLogo"
                  value={branding.emailLogo || ''}
                  onChange={(e) => setBranding({ ...branding, emailLogo: e.target.value })}
                  placeholder="https://example.com/email-logo.png"
                  disabled={!isEnterprise}
                />
              </div>

              <div>
                <Label htmlFor="emailFooter">Email Footer</Label>
                <textarea
                  id="emailFooter"
                  value={branding.emailFooter || ''}
                  onChange={(e) => setBranding({ ...branding, emailFooter: e.target.value })}
                  placeholder="© 2024 Your Company. All rights reserved."
                  disabled={!isEnterprise}
                  className="w-full h-24 px-3 py-2 rounded-md border border-input bg-background"
                />
              </div>

              {!isEnterprise && (
                <p className="text-sm text-muted-foreground">
                  Email branding customization requires Enterprise plan
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
