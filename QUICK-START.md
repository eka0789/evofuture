# 🚀 Quick Start Guide - Evolution Future

Get your Evolution Future SaaS platform up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (optional)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

The default `.env` is already configured for local development with SQLite.

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with demo data
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Your application will be available at: **http://localhost:3000**

## Default Login Credentials

### Admin Account
- Email: `admin@example.com`
- Password: `admin123`

### Demo User Account
- Email: `demo@example.com`
- Password: `demo123`

## Key Features to Explore

### 1. Dashboard (`/app/dashboard`)
- Overview of your account statistics
- Quick actions and recent activities
- Real-time metrics

### 2. Analytics (`/app/analytics`)
- Interactive charts with Recharts
- User growth tracking
- Revenue analytics
- Engagement metrics

### 3. Settings (`/app/settings`)
- Account information
- Password change
- Notification preferences
- Appearance settings

### 4. Search (`/app/search`)
- Search across activities and notifications
- Advanced filtering options
- Real-time results

### 5. Export (`/app/export`)
- Export data in JSON format
- Export activities as CSV
- Complete data backup

### 6. Admin Panel (`/app/admin`)
- User management (Admin only)
- System statistics
- Platform overview

## Project Structure

```
evolution-future/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── app/               # Protected app pages
│   ├── auth/              # Authentication pages
│   └── (public pages)     # Landing, pricing, etc.
├── components/            # React components
│   └── ui/               # Shadcn UI components
├── lib/                   # Utilities and configs
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── logger.ts         # Logging system
│   ├── rate-limit.ts     # Rate limiting
│   └── feature-flags.ts  # Feature flag system
├── prisma/               # Database schema and migrations
├── services/             # Business logic services
└── types/                # TypeScript type definitions
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open Prisma Studio (DB GUI)
npx prisma db push       # Push schema changes
npx prisma db seed       # Seed database
npx prisma generate      # Generate Prisma client

# Code Quality
npm run lint             # Run ESLint
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### User Management
- `GET /api/user/settings` - Get user settings
- `PATCH /api/user/settings` - Update settings
- `POST /api/user/password` - Change password
- `POST /api/user/avatar` - Upload avatar

### Data & Analytics
- `GET /api/activities` - Get activities
- `GET /api/notifications` - Get notifications
- `GET /api/analytics` - Get analytics data
- `GET /api/stats` - Get dashboard stats
- `GET /api/search` - Search data

### Export
- `POST /api/export` - Export user data

### System
- `GET /api/health` - Health check endpoint

## Feature Flags

Control feature availability in `.env`:

```env
NEXT_PUBLIC_ENABLE_REFERRAL=true
NEXT_PUBLIC_ENABLE_ONBOARDING=true
```

## Production Deployment

### Environment Variables for Production

Update these in your `.env` for production:

```env
# Database - Use PostgreSQL in production
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Auth - Generate secure secret
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters"
NEXTAUTH_URL="https://yourdomain.com"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Service (Optional)
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# Monitoring (Optional)
SENTRY_DSN="your-sentry-dsn"
```

### Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t evolution-future .

# Run container
docker run -p 3000:3000 evolution-future
```

## Troubleshooting

### Database Connection Issues

```bash
# Reset database
rm prisma/dev.db
npx prisma db push
npx prisma db seed
```

### Port Already in Use

Change the port in `package.json`:

```json
"dev": "next dev -p 3001"
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Next Steps

1. **Customize Branding**: Update colors, logo, and text in components
2. **Configure OAuth**: Add Google/GitHub authentication
3. **Set Up Email**: Integrate SendGrid or AWS SES
4. **Add Payment**: Integrate Stripe for subscriptions
5. **Deploy**: Deploy to Vercel, AWS, or your preferred platform

## Support & Documentation

- Full Documentation: See `INDEX-DOKUMENTASI.md`
- Business Overview: See `BUSINESS-OVERVIEW.md`
- Technical Deep Dive: See `TECHNICAL-DEEP-DIVE.md`
- Production Checklist: See `PRODUCTION-CHECKLIST.md`

## Security Notes

⚠️ **Important for Production:**

1. Change all default passwords
2. Generate a secure `NEXTAUTH_SECRET`
3. Use PostgreSQL instead of SQLite
4. Enable HTTPS
5. Set up proper CORS policies
6. Implement rate limiting
7. Regular security audits

---

**Ready to build something amazing? Let's go! 🚀**
