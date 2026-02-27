# 🎨 White-Label Implementation Guide

Complete guide for White-Label Capabilities in Evolution Future SaaS platform.

---

## Overview

White-label capabilities allow Enterprise customers to fully customize the platform's branding, appearance, and user experience to match their own brand identity.

### Key Features

1. **Custom Branding** - Logo, colors, fonts
2. **Theme Customization** - Complete visual customization
3. **Custom Domain Support** - Use your own domain
4. **Custom CSS/JS** - Advanced customization
5. **Email Branding** - Branded email templates
6. **Hide Platform Branding** - Remove "Powered by" text

---

## Plan Requirements

| Feature | FREE | PRO | ENTERPRISE |
|---------|------|-----|------------|
| Brand Name | ✅ | ✅ | ✅ |
| Brand Logo | ✅ | ✅ | ✅ |
| Primary/Secondary Colors | ✅ | ✅ | ✅ |
| Custom Font | ✅ | ✅ | ✅ |
| Custom Favicon | ❌ | ❌ | ✅ |
| Custom CSS | ❌ | ❌ | ✅ |
| Custom JavaScript | ❌ | ❌ | ✅ |
| Hide "Powered by" | ❌ | ❌ | ✅ |
| Custom Domain | ❌ | ❌ | ✅ |
| Email Branding | ❌ | ❌ | ✅ |

---

## Database Schema

### Organization Model (White-Label Fields)

```prisma
model Organization {
  // White-Label Branding
  brandName        String?
  brandLogo        String?
  brandFavicon     String?
  brandPrimaryColor String?  @default("#3b82f6")
  brandSecondaryColor String? @default("#8b5cf6")
  brandFont        String?  @default("Inter")
  customCss        String?
  customJs         String?
  hidePoweredBy    Boolean  @default(false)
  
  // Email Branding
  emailFromName    String?
  emailFromAddress String?
  emailLogo        String?
  emailFooter      String?
}
```

---

## API Endpoints

### Get Organization Branding

**GET** `/api/organization/:orgId/branding`

**Response:**
```json
{
  "branding": {
    "brandName": "Acme Inc",
    "brandLogo": "https://example.com/logo.png",
    "brandFavicon": "https://example.com/favicon.ico",
    "brandPrimaryColor": "#3b82f6",
    "brandSecondaryColor": "#8b5cf6",
    "brandFont": "Inter",
    "customCss": "/* custom styles */",
    "customJs": "// custom scripts",
    "hidePoweredBy": true,
    "emailFromName": "Acme Inc",
    "emailFromAddress": "noreply@acme.com",
    "emailLogo": "https://example.com/email-logo.png",
    "emailFooter": "© 2024 Acme Inc"
  }
}
```

### Update Organization Branding

**PATCH** `/api/organization/:orgId/branding`

**Request:**
```json
{
  "brandName": "Acme Inc",
  "brandLogo": "https://example.com/logo.png",
  "brandPrimaryColor": "#ff0000",
  "brandSecondaryColor": "#00ff00",
  "brandFont": "Roboto",
  "customCss": ".custom { color: red; }",
  "hidePoweredBy": true
}
```

**Validation:**
- Custom CSS/JS is validated for security
- Advanced features require ENTERPRISE plan
- Dangerous patterns are blocked

---

## White-Label Service

### Get Organization Branding

```typescript
import { getOrganizationBranding } from '@/lib/whitelabel';

const branding = await getOrganizationBranding(organizationId);

console.log(branding.brandName);
console.log(branding.brandPrimaryColor);
```

### Get Branding by Domain

```typescript
import { getOrganizationBrandingByDomain } from '@/lib/whitelabel';

const branding = await getOrganizationBrandingByDomain('acme.com');
```

### Update Branding

```typescript
import { updateOrganizationBranding } from '@/lib/whitelabel';

await updateOrganizationBranding(organizationId, {
  brandName: 'Acme Inc',
  brandPrimaryColor: '#ff0000',
  hidePoweredBy: true,
});
```

### Generate Theme CSS

```typescript
import { generateThemeCSS } from '@/lib/whitelabel';

const css = generateThemeCSS(branding);
// Returns CSS with custom colors, fonts, etc.
```

### Check White-Label Permission

```typescript
import { canUseWhiteLabel } from '@/lib/whitelabel';

const canUse = await canUseWhiteLabel(organizationId);

if (!canUse) {
  return { error: 'Enterprise plan required' };
}
```

---

## Theme Customization

### Colors

Organizations can customize:
- Primary color (buttons, links, highlights)
- Secondary color (accents, secondary elements)

### Fonts

Available fonts:
- Inter (default)
- Roboto
- Open Sans
- Lato
- Montserrat
- Poppins

### Custom CSS

Enterprise customers can add custom CSS:

```css
/* Example custom CSS */
.custom-header {
  background: linear-gradient(to right, #ff0000, #00ff00);
}

.custom-button {
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

### Custom JavaScript

Enterprise customers can add custom JavaScript:

```javascript
// Example custom JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('Custom branding loaded');
  
  // Add custom analytics
  // Add custom widgets
  // Customize behavior
});
```

---

## Security

### Code Validation

All custom CSS/JS is validated for security:

```typescript
import { validateCustomCode } from '@/lib/whitelabel';

const validation = validateCustomCode(customCss, 'css');

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### Blocked Patterns

**JavaScript:**
- `eval()`
- `Function()`
- `setTimeout()`
- `setInterval()`
- `<script>` tags
- `document.write()`
- `innerHTML`

**CSS:**
- `javascript:` URLs
- `expression()`
- `behavior:`
- `@import`

### Best Practices

1. **Sanitize Input** - Always validate user input
2. **Limit Scope** - Restrict what custom code can access
3. **Monitor Usage** - Track custom code execution
4. **Review Changes** - Audit custom code updates
5. **Sandbox Execution** - Run custom code in isolated context

---

## Custom Domain Setup

### DNS Configuration

1. **Add CNAME Record**
   ```
   Type: CNAME
   Name: app (or subdomain)
   Value: your-platform.com
   TTL: 3600
   ```

2. **Verify Domain**
   ```typescript
   // Verify domain ownership
   const verified = await verifyDomain(domain);
   ```

3. **SSL Certificate**
   - Automatic via Let's Encrypt
   - Or upload custom certificate

### Domain Routing

```typescript
// In middleware or API
const host = req.headers.get('host');

// Find organization by domain
const branding = await getOrganizationBrandingByDomain(host);

if (branding) {
  // Apply organization branding
  req.branding = branding;
}
```

---

## Email Branding

### Custom Email Templates

```typescript
import { getOrganizationBranding } from '@/lib/whitelabel';

const branding = await getOrganizationBranding(organizationId);

const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ${branding.brandFont || 'Inter'}, sans-serif; }
    .header { background-color: ${branding.brandPrimaryColor || '#3b82f6'}; }
  </style>
</head>
<body>
  <div class="header">
    <img src="${branding.emailLogo || branding.brandLogo}" alt="Logo" />
  </div>
  <div class="content">
    <!-- Email content -->
  </div>
  <div class="footer">
    ${branding.emailFooter || ''}
  </div>
</body>
</html>
`;
```

### Email Configuration

```typescript
// Send email with custom branding
await sendEmail({
  from: branding.emailFromAddress || 'noreply@platform.com',
  fromName: branding.emailFromName || 'Platform',
  to: user.email,
  subject: 'Welcome',
  html: emailHtml,
});
```

---

## UI Integration

### Apply Branding in Components

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getOrganizationBranding } from '@/lib/whitelabel';

export function BrandedComponent({ organizationId }) {
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    async function loadBranding() {
      const data = await getOrganizationBranding(organizationId);
      setBranding(data);
      
      // Apply theme
      if (data) {
        document.documentElement.style.setProperty(
          '--primary-color',
          data.brandPrimaryColor
        );
      }
    }
    
    loadBranding();
  }, [organizationId]);

  return (
    <div>
      {branding?.brandLogo && (
        <img src={branding.brandLogo} alt="Logo" />
      )}
      <h1>{branding?.brandName || 'Platform'}</h1>
    </div>
  );
}
```

### Dynamic Theme Loading

```typescript
// Load theme CSS dynamically
function loadThemeCSS(branding) {
  const css = generateThemeCSS(branding);
  
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  
  // Load custom CSS
  if (branding.customCss) {
    const customStyle = document.createElement('style');
    customStyle.textContent = branding.customCss;
    document.head.appendChild(customStyle);
  }
}
```

---

## Testing

### Test Branding Application

```typescript
// Test branding is applied correctly
const branding = await getOrganizationBranding(orgId);

expect(branding.brandName).toBe('Acme Inc');
expect(branding.brandPrimaryColor).toBe('#ff0000');
expect(branding.hidePoweredBy).toBe(true);
```

### Test Security Validation

```typescript
// Test dangerous code is blocked
const validation = validateCustomCode('eval("alert(1)")', 'js');

expect(validation.valid).toBe(false);
expect(validation.errors.length).toBeGreaterThan(0);
```

### Test Plan Restrictions

```typescript
// Test non-enterprise can't use advanced features
const canUse = await canUseWhiteLabel(freeOrgId);

expect(canUse).toBe(false);
```

---

## Migration Guide

### Enable White-Label for Existing Organizations

```typescript
// Upgrade organization to Enterprise
await prisma.organization.update({
  where: { id: organizationId },
  data: {
    plan: 'ENTERPRISE',
    brandName: 'Acme Inc',
    brandPrimaryColor: '#ff0000',
    hidePoweredBy: true,
  },
});
```

### Migrate Existing Branding

```typescript
// Migrate from old branding system
const oldBranding = await getOldBranding(organizationId);

await updateOrganizationBranding(organizationId, {
  brandName: oldBranding.name,
  brandLogo: oldBranding.logo,
  brandPrimaryColor: oldBranding.color,
});
```

---

## Monitoring

### Track Branding Usage

```typescript
// Track branding updates
await prisma.activity.create({
  data: {
    userId: session.user.id,
    organizationId,
    action: 'branding_updated',
    description: 'Updated organization branding',
    metadata: JSON.stringify({
      changes: ['brandName', 'brandPrimaryColor'],
    }),
  },
});
```

### Monitor Custom Code

```typescript
// Log custom code execution
console.log('Custom CSS loaded:', branding.customCss?.length);
console.log('Custom JS loaded:', branding.customJs?.length);
```

---

## Troubleshooting

### Branding Not Applied

**Problem:** Custom branding not showing

**Solutions:**
1. Check organization has ENTERPRISE plan
2. Verify branding is saved in database
3. Clear browser cache
4. Check CSS specificity

### Custom Domain Not Working

**Problem:** Custom domain not routing correctly

**Solutions:**
1. Verify DNS CNAME record
2. Check SSL certificate
3. Verify domain in organization settings
4. Check domain routing middleware

### Custom Code Not Loading

**Problem:** Custom CSS/JS not executing

**Solutions:**
1. Check validation errors
2. Verify ENTERPRISE plan
3. Check browser console for errors
4. Review security restrictions

---

## Best Practices

### 1. Performance

- Minimize custom CSS/JS size
- Use CSS variables for theming
- Cache branding configuration
- Optimize images (logo, favicon)

### 2. Accessibility

- Ensure sufficient color contrast
- Test with screen readers
- Maintain keyboard navigation
- Follow WCAG guidelines

### 3. Branding Guidelines

- Provide branding templates
- Document color usage
- Show preview before saving
- Validate logo dimensions

### 4. Security

- Validate all custom code
- Sanitize user input
- Monitor code execution
- Regular security audits

---

## Future Enhancements

### Planned Features

1. **Theme Marketplace** - Pre-built themes
2. **Visual Theme Builder** - Drag-and-drop customization
3. **A/B Testing** - Test different brandings
4. **Brand Guidelines** - Automated brand consistency
5. **Multi-Brand Support** - Multiple brands per organization
6. **Advanced Analytics** - Track branding impact
7. **White-Label API** - Programmatic branding
8. **Mobile App Branding** - Extend to mobile apps

---

## Resources

- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Web Fonts](https://fonts.google.com/)
- [Color Accessibility](https://webaim.org/resources/contrastchecker/)
- [Custom Domain Setup](https://docs.vercel.com/concepts/projects/custom-domains)

---

**Last Updated:** Today  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
