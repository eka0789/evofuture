# 🏢 Multi-Tenancy Implementation Guide

Complete guide for Multi-Tenancy Support in Evolution Future SaaS platform.

---

## Overview

Multi-tenancy enables multiple organizations (tenants) to use the same application instance while keeping their data completely isolated. Each organization has its own workspace, settings, and resource limits.

### Key Features

1. **Organization Management** - Create and manage organizations
2. **Data Isolation** - Complete separation of tenant data
3. **Member Management** - Invite and manage organization members
4. **Role-Based Access** - Owner, Admin, Member roles
5. **Resource Limits** - Per-organization quotas
6. **Custom Settings** - Organization-specific configuration
7. **Billing Integration** - Per-organization subscriptions

---

## Database Schema

### Organization Model

```prisma
model Organization {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String?
  logo        String?
  domain      String?  @unique
  
  // Settings
  settings    String?  // JSON for custom settings
  
  // Subscription & Billing
  plan                   String    @default("FREE")
  stripeCustomerId       String?   @unique
  stripeSubscriptionId   String?   @unique
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?
  
  // Resource Limits
  maxUsers      Int      @default(5)
  maxStorage    Int      @default(1000) // MB
  maxApiCalls   Int      @default(1000) // per month
  
  // Status
  status        String   @default("ACTIVE")
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  // Relations
  members       OrganizationMember[]
  invitations   OrganizationInvitation[]
  activities    Activity[]
  teams         Team[]
}
```

### Organization Member

```prisma
model OrganizationMember {
  id             String   @id @default(uuid())
  organizationId String
  userId         String
  role           String   @default("MEMBER") // OWNER, ADMIN, MEMBER
  joinedAt       DateTime @default(now())

  organization Organization @relation(...)
  user         User         @relation(...)
}
```

### Organization Invitation

```prisma
model OrganizationInvitation {
  id             String    @id @default(uuid())
  organizationId String
  email          String
  role           String    @default("MEMBER")
  token          String    @unique
  expiresAt      DateTime
  createdAt      DateTime  @default(now())
  acceptedAt     DateTime?

  organization Organization @relation(...)
}
```

---

## API Endpoints

### Organization Management

#### GET /api/organization
List user's organizations

**Response:**
```json
{
  "organizations": [
    {
      "id": "uuid",
      "name": "Acme Inc",
      "slug": "acme-inc",
      "plan": "PRO",
      "status": "ACTIVE",
      "maxUsers": 10,
      "maxStorage": 5000,
      "maxApiCalls": 10000,
      "_count": {
        "members": 5,
        "teams": 3
      }
    }
  ]
}
```

#### POST /api/organization
Create new organization

**Request:**
```json
{
  "name": "Acme Inc",
  "description": "Optional description",
  "domain": "acme.com"
}
```

**Response:**
```json
{
  "organization": {
    "id": "uuid",
    "name": "Acme Inc",
    "slug": "acme-inc",
    "status": "ACTIVE"
  }
}
```

#### GET /api/organization/:orgId
Get organization details

#### PATCH /api/organization/:orgId
Update organization (Owner/Admin only)

**Request:**
```json
{
  "name": "New Name",
  "description": "Updated description",
  "maxUsers": 20,
  "settings": "{\"theme\":\"dark\"}"
}
```

#### DELETE /api/organization/:orgId
Delete organization (Owner only)

### Member Management

#### GET /api/organization/:orgId/members
List organization members

#### PATCH /api/organization/:orgId/members
Update member role

**Request:**
```json
{
  "memberId": "uuid",
  "role": "ADMIN"
}
```

#### DELETE /api/organization/:orgId/members?memberId=uuid
Remove member

### Invitations

#### POST /api/organization/:orgId/invite
Send invitation

**Request:**
```json
{
  "email": "user@example.com",
  "role": "MEMBER"
}
```

#### GET /api/organization/:orgId/invite
List pending invitations

---

## Tenant Context

### Get Tenant Context

```typescript
import { getTenantContext } from '@/lib/tenant';

const context = await getTenantContext(userId, organizationId);

if (context) {
  console.log(context.organizationId);
  console.log(context.organization.name);
  console.log(context.userRole);
}
```

### Check Permissions

```typescript
import { hasOrganizationPermission } from '@/lib/tenant';

const canManage = await hasOrganizationPermission(
  userId,
  organizationId,
  ['OWNER', 'ADMIN']
);

if (!canManage) {
  return { error: 'Forbidden' };
}
```

### Check Resource Limits

```typescript
import { checkResourceLimits } from '@/lib/tenant';

const limits = await checkResourceLimits(organizationId);

if (!limits.canAddUser) {
  return { error: 'User limit reached' };
}

if (!limits.canMakeApiCall) {
  return { error: 'API call limit reached' };
}
```

### Organization Settings

```typescript
import { 
  getOrganizationSettings, 
  updateOrganizationSettings 
} from '@/lib/tenant';

// Get settings
const settings = await getOrganizationSettings(organizationId);
console.log(settings.theme);

// Update settings
await updateOrganizationSettings(organizationId, {
  theme: 'dark',
  notifications: true,
});
```

---

## Data Isolation

### Automatic Isolation

All queries should include `organizationId` filter:

```typescript
// Get organization-specific data
const activities = await prisma.activity.findMany({
  where: {
    organizationId: context.organizationId,
  },
});

// Create organization-scoped data
await prisma.activity.create({
  data: {
    userId: session.user.id,
    organizationId: context.organizationId,
    action: 'user_action',
  },
});
```

### Middleware Pattern

```typescript
// In API routes
const context = await getTenantContext(session.user.id);

if (!context) {
  return NextResponse.json({ error: 'No organization' }, { status: 403 });
}

// Use context.organizationId in all queries
const data = await prisma.someModel.findMany({
  where: {
    organizationId: context.organizationId,
  },
});
```

---

## Roles & Permissions

### Role Hierarchy

1. **OWNER**
   - Full control over organization
   - Can delete organization
   - Can manage all members
   - Can change billing
   - Can update all settings

2. **ADMIN**
   - Can invite members
   - Can manage settings
   - Can remove members (except owner)
   - Cannot delete organization
   - Cannot change owner role

3. **MEMBER**
   - Basic organization access
   - Can view organization data
   - Cannot manage organization
   - Cannot manage members

### Permission Checks

```typescript
// Check if user is owner or admin
const member = await prisma.organizationMember.findFirst({
  where: {
    organizationId,
    userId: session.user.id,
    role: { in: ['OWNER', 'ADMIN'] },
  },
});

if (!member) {
  return { error: 'Forbidden' };
}

// Check specific role
if (member.role !== 'OWNER') {
  return { error: 'Owner only' };
}
```

---

## Resource Limits

### Default Limits

| Plan | Max Users | Max Storage | Max API Calls |
|------|-----------|-------------|---------------|
| FREE | 5 | 1 GB | 1,000/month |
| PRO | 20 | 10 GB | 10,000/month |
| ENTERPRISE | Unlimited | 100 GB | 100,000/month |

### Enforcing Limits

```typescript
// Before adding user
const limits = await checkResourceLimits(organizationId);

if (!limits.canAddUser) {
  return {
    error: `User limit reached (${limits.currentUsers}/${organization.maxUsers})`,
  };
}

// Before API call
if (!limits.canMakeApiCall) {
  return {
    error: `API limit reached (${limits.currentApiCalls}/${organization.maxApiCalls})`,
  };
}
```

### Tracking Usage

```typescript
// Track API calls
await prisma.activity.create({
  data: {
    userId: session.user.id,
    organizationId: context.organizationId,
    action: 'api_call',
    metadata: JSON.stringify({ endpoint: '/api/data' }),
  },
});

// Get current usage
const apiCalls = await prisma.activity.count({
  where: {
    organizationId,
    action: { startsWith: 'api_' },
    createdAt: { gte: startOfMonth },
  },
});
```

---

## Custom Domains

### Setup

1. Organization sets custom domain in settings
2. DNS configuration required (CNAME record)
3. SSL certificate provisioning
4. Domain verification

### Domain Routing

```typescript
// In middleware or API
const host = req.headers.get('host');

// Find organization by domain
const organization = await prisma.organization.findUnique({
  where: { domain: host },
});

if (organization) {
  // Set organization context
  req.organizationId = organization.id;
}
```

---

## Billing Integration

### Organization Subscriptions

Each organization has its own subscription:

```typescript
// Create checkout for organization
const session = await stripe.checkout.sessions.create({
  customer: organization.stripeCustomerId,
  metadata: {
    organizationId: organization.id,
  },
  // ... other options
});

// Handle webhook
if (event.type === 'customer.subscription.updated') {
  const subscription = event.data.object;
  
  await prisma.organization.update({
    where: { stripeCustomerId: subscription.customer },
    data: {
      plan: getPlanFromPriceId(subscription.items.data[0].price.id),
      stripeSubscriptionId: subscription.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}
```

---

## Migration Guide

### From Single-Tenant to Multi-Tenant

1. **Add Organization Models**
   ```bash
   # Update schema.prisma
   npx prisma db push
   ```

2. **Create Default Organization**
   ```typescript
   // For existing users
   const org = await prisma.organization.create({
    data: {
       name: 'Default Organization',
       slug: 'default',
       members: {
         create: existingUsers.map(user => ({
           userId: user.id,
           role: 'OWNER',
         })),
       },
     },
   });
   ```

3. **Update Existing Data**
   ```typescript
   // Link existing data to organization
   await prisma.activity.updateMany({
     where: { organizationId: null },
     data: { organizationId: defaultOrg.id },
   });
   ```

4. **Update API Routes**
   - Add tenant context to all routes
   - Add organizationId to all queries
   - Implement permission checks

---

## Security Best Practices

### 1. Always Verify Organization Access

```typescript
const member = await prisma.organizationMember.findFirst({
  where: {
    organizationId,
    userId: session.user.id,
  },
});

if (!member) {
  return { error: 'Forbidden' };
}
```

### 2. Filter All Queries by Organization

```typescript
// GOOD
const data = await prisma.model.findMany({
  where: {
    organizationId: context.organizationId,
  },
});

// BAD - No organization filter
const data = await prisma.model.findMany();
```

### 3. Validate Organization Ownership

```typescript
// Before updating organization data
const resource = await prisma.resource.findUnique({
  where: { id: resourceId },
});

if (resource.organizationId !== context.organizationId) {
  return { error: 'Forbidden' };
}
```

### 4. Implement Rate Limiting Per Organization

```typescript
const limits = await checkResourceLimits(organizationId);

if (!limits.canMakeApiCall) {
  return { error: 'Rate limit exceeded', status: 429 };
}
```

---

## Testing

### Test Organization Isolation

```typescript
// Create two organizations
const org1 = await createOrganization('Org 1');
const org2 = await createOrganization('Org 2');

// Create data in org1
const data1 = await createData(org1.id);

// Try to access from org2 (should fail)
const result = await getData(org2.id, data1.id);
expect(result).toBeNull();
```

### Test Permission Checks

```typescript
// Test member cannot delete organization
const member = await createMember(org.id, 'MEMBER');
const result = await deleteOrganization(org.id, member.id);
expect(result.error).toBe('Forbidden');

// Test owner can delete
const owner = await createMember(org.id, 'OWNER');
const result2 = await deleteOrganization(org.id, owner.id);
expect(result2.success).toBe(true);
```

---

## Troubleshooting

### Data Leakage

**Problem:** Users can see data from other organizations

**Solution:**
- Add `organizationId` filter to all queries
- Verify organization membership before queries
- Use tenant context middleware

### Permission Issues

**Problem:** Users can't access their organization

**Solution:**
- Check OrganizationMember record exists
- Verify organization status is ACTIVE
- Check role permissions

### Resource Limits Not Enforced

**Problem:** Users exceed limits

**Solution:**
- Implement `checkResourceLimits` before operations
- Track usage in Activity model
- Set up monitoring alerts

---

## Monitoring

### Track Organization Metrics

```typescript
// Active organizations
const activeOrgs = await prisma.organization.count({
  where: { status: 'ACTIVE' },
});

// Organizations by plan
const orgsByPlan = await prisma.organization.groupBy({
  by: ['plan'],
  _count: true,
});

// Average members per organization
const avgMembers = await prisma.organizationMember.groupBy({
  by: ['organizationId'],
  _count: true,
});
```

---

## Future Enhancements

### Planned Features

1. **Organization Templates** - Pre-configured setups
2. **Data Export** - Export organization data
3. **Organization Transfer** - Transfer ownership
4. **Audit Logs** - Detailed activity tracking
5. **SSO Integration** - SAML/OAuth for organizations
6. **Custom Branding** - Per-organization themes
7. **API Keys** - Organization-specific API access
8. **Webhooks** - Organization event notifications

---

## Resources

- [Prisma Multi-Tenancy](https://www.prisma.io/docs/guides/database/multi-tenancy)
- [SaaS Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)
- [Data Isolation Strategies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**Last Updated:** Today  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
