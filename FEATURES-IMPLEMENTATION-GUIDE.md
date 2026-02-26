# 🎯 Features Implementation Guide

Complete guide for all implemented features in Evolution Future SaaS platform.

---

## Table of Contents

1. [Payment Integration (Stripe)](#payment-integration-stripe)
2. [WebSocket Real-Time Features](#websocket-real-time-features)
3. [Advanced Analytics](#advanced-analytics)
4. [Team Collaboration](#team-collaboration)
5. [API Documentation](#api-documentation)

---

## Payment Integration (Stripe)

### Overview
Full-featured Stripe integration with subscription management, billing portal, and webhook handling.

### Features
- Multiple pricing tiers (Free, Pro, Enterprise)
- Subscription creation and management
- Billing portal access
- Webhook handling for all events
- Automatic plan updates
- Payment failure handling

### Usage

#### Create Checkout Session
```typescript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ priceId: 'price_xxx' }),
});

const { url } = await response.json();
window.location.href = url; // Redirect to Stripe checkout
```

#### Access Billing Portal
```typescript
const response = await fetch('/api/stripe/portal', {
  method: 'POST',
});

const { url } = await response.json();
window.location.href = url; // Redirect to billing portal
```

### Configuration
Set these environment variables:
```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_ENTERPRISE=price_xxx
```

### Documentation
See [STRIPE-INTEGRATION-GUIDE.md](./STRIPE-INTEGRATION-GUIDE.md) for complete details.

---

## WebSocket Real-Time Features

### Overview
Socket.IO integration for real-time notifications, presence tracking, and live updates.

### Features
- Real-time notifications
- User presence tracking
- Typing indicators
- Live activity updates
- Team collaboration support
- Automatic reconnection
- Room-based messaging

### Usage

#### Real-Time Notifications
```typescript
import { useNotifications } from '@/hooks/use-socket';

function MyComponent() {
  useNotifications((notification) => {
    toast({ title: notification.title });
  });
}
```

#### User Presence
```typescript
import { useUserPresence } from '@/hooks/use-socket';

function MyComponent() {
  useUserPresence((presence) => {
    console.log('User online:', presence.userId);
  });
}
```

#### Emit Events
```typescript
import { useSocket } from '@/hooks/use-socket';

function MyComponent() {
  const socket = useSocket();
  
  socket?.emit('user-typing', { userId: 'xxx', isTyping: true });
}
```

### Server Setup
The custom Next.js server with Socket.IO is configured in `server.ts`. Run with:
```bash
npm run dev  # Development
npm run build && npm start  # Production
```

### Documentation
See [WEBSOCKET-REALTIME-GUIDE.md](./WEBSOCKET-REALTIME-GUIDE.md) for complete details.

---

## Advanced Analytics

### Overview
Comprehensive analytics dashboard with revenue metrics, user engagement, and data export.

### Features
- User growth tracking with charts
- Activity trend analysis
- Revenue metrics (MRR, ARR, LTV, Churn)
- User engagement (DAU, WAU, MAU)
- Conversion funnel visualization
- Top user actions tracking
- Export to CSV/JSON
- Date range filtering
- Admin-only access

### Metrics

#### Revenue Metrics
- **MRR** (Monthly Recurring Revenue): Sum of all active subscriptions
- **ARR** (Annual Recurring Revenue): MRR × 12
- **Churn Rate**: Percentage of customers who cancelled
- **LTV** (Lifetime Value): Average revenue per customer

#### User Engagement
- **DAU** (Daily Active Users): Users active in last 24 hours
- **WAU** (Weekly Active Users): Users active in last 7 days
- **MAU** (Monthly Active Users): Users active in last 30 days

#### Conversion Funnel
1. Signups: Total registered users
2. Onboarded: Users who completed onboarding
3. Active: Users active in last 30 days
4. Paid: Users with active subscriptions

### Usage

#### Fetch Analytics
```typescript
const response = await fetch('/api/analytics/advanced?days=30');
const data = await response.json();

console.log(data.revenueMetrics.mrr);
console.log(data.userEngagement.daily);
console.log(data.conversionFunnel);
```

#### Export Data
```typescript
// Export as CSV
const response = await fetch('/api/analytics/advanced?format=csv');
const blob = await response.blob();
// Download file...

// Export as JSON
const response = await fetch('/api/analytics/advanced?format=json');
const data = await response.json();
```

### Access Control
Only users with `role: 'ADMIN'` can access advanced analytics.

---

## Team Collaboration

### Overview
Complete team management system with invitations, role-based permissions, and member management.

### Features
- Team creation with unique slugs
- Member invitations via email
- Role management (Owner, Admin, Member)
- Team settings and updates
- Member removal
- Invitation expiry (7 days)
- Permission-based access control
- Real-time team updates

### Roles

#### Owner
- Full control over team
- Can delete team
- Can manage all members
- Can change any settings

#### Admin
- Can invite members
- Can manage settings
- Can remove members (except owner)
- Cannot delete team

#### Member
- Basic team access
- Can view team information
- Cannot manage team or members

### Usage

#### Create Team
```typescript
const response = await fetch('/api/team', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Team',
    description: 'Optional description',
  }),
});

const { team } = await response.json();
```

#### Invite Member
```typescript
const response = await fetch(`/api/team/${teamId}/invite`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'colleague@example.com',
    role: 'MEMBER', // or 'ADMIN'
  }),
});

const { invitation } = await response.json();
// Send invitation.token to user via email
```

#### Accept Invitation
```typescript
const response = await fetch(`/api/team/invite/${token}`, {
  method: 'POST',
});

const { success } = await response.json();
```

#### Update Member Role
```typescript
const response = await fetch(`/api/team/${teamId}/members`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    memberId: 'member-uuid',
    role: 'ADMIN',
  }),
});
```

#### Remove Member
```typescript
const response = await fetch(
  `/api/team/${teamId}/members?memberId=${memberId}`,
  { method: 'DELETE' }
);
```

### Database Schema

```prisma
model Team {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  members     TeamMember[]
  invitations TeamInvitation[]
}

model TeamMember {
  id       String   @id @default(uuid())
  teamId   String
  userId   String
  role     String   @default("MEMBER")
  joinedAt DateTime @default(now())
  team     Team     @relation(...)
}

model TeamInvitation {
  id         String    @id @default(uuid())
  teamId     String
  email      String
  role       String    @default("MEMBER")
  token      String    @unique
  expiresAt  DateTime
  createdAt  DateTime  @default(now())
  acceptedAt DateTime?
  team       Team      @relation(...)
}
```

---

## API Documentation

### Overview
Complete API documentation with OpenAPI specification, code examples, and interactive explorer.

### Features
- OpenAPI 3.0 specification
- Complete endpoint reference
- Code examples (JavaScript, Python, cURL)
- Authentication guide
- Rate limiting documentation
- Error code reference
- Request/response schemas
- Copy-to-clipboard functionality
- Organized by categories

### Categories

1. **User** - Profile, settings, password management
2. **Team** - Team CRUD, invitations, member management
3. **Activity** - Activity tracking and history
4. **Analytics** - Advanced analytics and reporting
5. **Billing** - Stripe checkout and billing portal

### Authentication

#### Session Cookie (Recommended)
Automatically included when using the web app. For external requests:
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -b "next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Bearer Token
For API clients and integrations:
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Rate Limiting

- **Free Plan**: 100 requests/hour
- **Pro Plan**: 1,000 requests/hour
- **Enterprise Plan**: 10,000 requests/hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

### Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Example Endpoints

#### GET /api/user/profile
Get authenticated user's profile.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "plan": "PRO",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### POST /api/team
Create a new team.

**Request:**
```json
{
  "name": "My Team",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "team": {
    "id": "uuid",
    "name": "My Team",
    "slug": "my-team",
    "description": "Optional description",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Code Examples

The API documentation page includes copy-paste ready code examples in:
- JavaScript (fetch API)
- Python (requests library)
- cURL (command line)

Access at: `/app/api-docs`

---

## Testing

### Run Tests
```bash
npm run test
```

### Test Coverage
- Unit tests for utilities
- Integration tests for APIs
- E2E tests for critical flows

---

## Deployment

### Environment Variables
Ensure all required environment variables are set:
```env
# Database
DATABASE_URL=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO=
STRIPE_PRICE_ENTERPRISE=

# Email (optional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

### Production Checklist
- [ ] Set up PostgreSQL database
- [ ] Configure Stripe webhooks
- [ ] Set up email service
- [ ] Configure monitoring (Sentry)
- [ ] Set up CI/CD pipeline
- [ ] Run database migrations
- [ ] Test all features
- [ ] Set up backups

See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) for complete deployment instructions.

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/eka0789/evofuture/issues
- Email: support@evofuture.com

---

**Last Updated:** Today  
**Version:** 1.0.0
