# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment

### Environment Setup
- [ ] Create production `.env` file
- [ ] Set strong `NEXTAUTH_SECRET` (use: `openssl rand -base64 32`)
- [ ] Configure production `DATABASE_URL` (PostgreSQL recommended)
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Configure OAuth providers (Google, GitHub, etc.)
- [ ] Set up email service (SendGrid, AWS SES)
- [ ] Configure file storage (AWS S3, Cloudinary)

### Database
- [ ] Migrate to PostgreSQL (from SQLite)
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed production data if needed
- [ ] Set up database backups (daily recommended)
- [ ] Configure connection pooling
- [ ] Set up read replicas (optional, for scale)

### Security
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure CORS properly
- [ ] Set secure cookie settings
- [ ] Enable rate limiting
- [ ] Set up WAF (Web Application Firewall)
- [ ] Configure CSP (Content Security Policy)
- [ ] Enable security headers
- [ ] Set up DDoS protection

### Performance
- [ ] Enable caching (Redis recommended)
- [ ] Configure CDN (Cloudflare, Vercel Edge)
- [ ] Optimize images (use CDN)
- [ ] Enable compression (gzip/brotli)
- [ ] Set up database indexes
- [ ] Configure connection pooling
- [ ] Enable HTTP/2

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging (Winston, Pino)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure analytics (Google Analytics, Plausible)
- [ ] Set up performance monitoring (Vercel Analytics)
- [ ] Configure alerts (email, Slack, PagerDuty)

### Testing
- [ ] Run all tests: `npm test`
- [ ] Test authentication flows
- [ ] Test payment integration (if applicable)
- [ ] Test email sending
- [ ] Load testing (k6, Artillery)
- [ ] Security audit (npm audit, Snyk)
- [ ] Accessibility testing (Lighthouse)
- [ ] Cross-browser testing

---

## 🔧 Configuration Files

### 1. Update `next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-cdn-domain.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Enable standalone output for Docker
  output: 'standalone',
};

export default nextConfig;
```

### 2. Production `.env`
```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# Auth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# Storage
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_S3_BUCKET="your-bucket-name"

# Monitoring
SENTRY_DSN="your-sentry-dsn"

# App
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### 3. Update `prisma/schema.prisma` for PostgreSQL
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 🚢 Deployment Options

### Option 1: Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

**Pros:**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Serverless functions
- Free tier available

**Setup:**
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Option 2: Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

**Pros:**
- Easy PostgreSQL setup
- Automatic deployments
- Good free tier
- Simple pricing

### Option 3: AWS (EC2 + RDS)
```bash
# Build
npm run build

# Start
npm start
```

**Setup:**
1. Launch EC2 instance
2. Set up RDS PostgreSQL
3. Configure security groups
4. Install Node.js
5. Clone repository
6. Set environment variables
7. Use PM2 for process management
8. Configure Nginx as reverse proxy

### Option 4: Docker + Any Cloud
```bash
# Build image
docker build -t evolution-future .

# Run container
docker run -p 3000:3000 evolution-future
```

**Deploy to:**
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

---

## 📊 Post-Deployment

### Immediate Actions
- [ ] Test all critical flows
- [ ] Verify SSL certificate
- [ ] Check error tracking
- [ ] Test email sending
- [ ] Verify database connection
- [ ] Test OAuth login
- [ ] Check analytics tracking
- [ ] Verify CDN caching

### First Week
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Monitor database performance
- [ ] Check uptime
- [ ] Review security logs
- [ ] Optimize slow queries

### Ongoing
- [ ] Weekly security updates
- [ ] Monthly dependency updates
- [ ] Quarterly security audits
- [ ] Regular backups verification
- [ ] Performance optimization
- [ ] User feedback implementation

---

## 🔐 Security Hardening

### Headers Configuration
Add to `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        },
      ],
    },
  ];
},
```

### Rate Limiting
Implement in middleware or API routes:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

---

## 📈 Performance Optimization

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_activities_user_created ON activities(user_id, created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
```

### Caching Strategy
```typescript
// Use React Query for client-side caching
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Use Redis for server-side caching
import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  alt="Hero"
  priority
  quality={85}
/>
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📱 Mobile App (Optional)

### React Native Setup
```bash
# Create React Native app
npx react-native init EvolutionFutureMobile

# Use same API endpoints
# Reuse business logic
# Share types/interfaces
```

### PWA Setup
Add to `next.config.mjs`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // your next config
});
```

---

## 🎯 Success Metrics

### Track These KPIs
- **Uptime:** Target 99.9%
- **Response Time:** < 200ms (p95)
- **Error Rate:** < 0.1%
- **User Satisfaction:** > 4.5/5
- **Conversion Rate:** Track & optimize
- **Churn Rate:** < 5% monthly

### Tools
- **Uptime:** UptimeRobot, Pingdom
- **Performance:** Vercel Analytics, Lighthouse
- **Errors:** Sentry, LogRocket
- **Analytics:** Google Analytics, Mixpanel
- **User Feedback:** Hotjar, UserVoice

---

## 🆘 Incident Response

### Runbook
1. **Detect:** Monitoring alerts
2. **Assess:** Check error logs
3. **Communicate:** Update status page
4. **Fix:** Deploy hotfix
5. **Verify:** Test in production
6. **Post-mortem:** Document & learn

### Emergency Contacts
- DevOps Lead: [contact]
- Database Admin: [contact]
- Security Team: [contact]

---

## ✅ Final Checklist

Before going live:
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Monitoring configured
- [ ] Backups automated
- [ ] Documentation updated
- [ ] Team trained
- [ ] Support ready
- [ ] Marketing materials ready
- [ ] Legal compliance verified

---

**🎉 Ready to Launch!**

Once all items are checked, you're ready for production deployment!

Remember: Launch is just the beginning. Continuous monitoring and improvement are key to success.

Good luck! 🚀
