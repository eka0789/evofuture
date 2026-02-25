# 🚀 Complete Deployment Guide

Deploy your Evolution Future SaaS platform to production in minutes!

## Pre-Deployment Checklist

- [ ] PostgreSQL database set up
- [ ] Environment variables configured
- [ ] Sentry account created (optional)
- [ ] Domain name ready (optional)
- [ ] Email service configured (optional)
- [ ] Payment provider set up (optional)

## Deployment Options

### Option 1: Vercel (Recommended) ⭐

#### Why Vercel?
- ✅ Zero configuration
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless functions
- ✅ Built-in analytics
- ✅ Free tier available

#### Step-by-Step Deployment

**1. Install Vercel CLI**

```bash
npm i -g vercel
```

**2. Login to Vercel**

```bash
vercel login
```

**3. Deploy**

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**4. Set Environment Variables**

```bash
# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Or use Vercel Dashboard
# Go to Project Settings → Environment Variables
```

**5. Set Up Vercel Postgres**

```bash
# Create database
vercel postgres create

# Link to project
vercel link

# Get connection string
vercel env pull
```

**6. Run Database Migrations**

```bash
# Migrations run automatically on deployment
# Or manually:
vercel env pull .env.production
npx prisma db push
```

**7. Configure Custom Domain (Optional)**

```bash
# Add domain
vercel domains add yourdomain.com

# Configure DNS
# Add CNAME record: www → cname.vercel-dns.com
# Add A record: @ → 76.76.21.21
```

#### Vercel Configuration

Your `vercel.json` is already configured! It includes:
- Build commands
- Environment variables
- CORS headers
- Region settings

### Option 2: Railway

#### Why Railway?
- ✅ Simple deployment
- ✅ Built-in PostgreSQL
- ✅ Affordable pricing
- ✅ Great for startups

#### Deployment Steps

**1. Install Railway CLI**

```bash
npm i -g @railway/cli
```

**2. Login**

```bash
railway login
```

**3. Initialize Project**

```bash
railway init
```

**4. Add PostgreSQL**

```bash
railway add postgresql
```

**5. Deploy**

```bash
railway up
```

**6. Set Environment Variables**

```bash
# Set variables
railway variables set NEXTAUTH_SECRET=your-secret
railway variables set NEXTAUTH_URL=https://your-app.railway.app

# Or use Railway Dashboard
```

**7. Get Database URL**

```bash
railway variables
# Copy DATABASE_URL
```

### Option 3: AWS (Advanced)

#### Why AWS?
- ✅ Full control
- ✅ Scalable
- ✅ Enterprise-ready
- ✅ Many services

#### Services Needed
- **Amplify** or **EC2** - Application hosting
- **RDS** - PostgreSQL database
- **S3** - File storage
- **CloudFront** - CDN
- **Route 53** - DNS
- **SES** - Email service

#### Quick Deploy with Amplify

**1. Install Amplify CLI**

```bash
npm install -g @aws-amplify/cli
amplify configure
```

**2. Initialize Amplify**

```bash
amplify init
```

**3. Add Hosting**

```bash
amplify add hosting
amplify publish
```

**4. Set Up RDS**

1. Go to AWS RDS Console
2. Create PostgreSQL database
3. Configure security groups
4. Get connection string

**5. Configure Environment Variables**

```bash
amplify env add production
# Add variables in Amplify Console
```

### Option 4: DigitalOcean App Platform

#### Why DigitalOcean?
- ✅ Simple pricing
- ✅ Good documentation
- ✅ Managed databases
- ✅ Developer-friendly

#### Deployment Steps

**1. Create Account**

Visit [digitalocean.com](https://www.digitalocean.com)

**2. Create App**

1. Click "Create" → "Apps"
2. Connect GitHub repository
3. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`

**3. Add Database**

1. Create → Databases → PostgreSQL
2. Copy connection string
3. Add to app environment variables

**4. Configure Environment**

Add all required environment variables in App Settings.

**5. Deploy**

Click "Deploy" - automatic deployments on git push!

### Option 5: Self-Hosted (Docker)

#### Why Self-Host?
- ✅ Full control
- ✅ Cost-effective at scale
- ✅ Data sovereignty
- ✅ Custom infrastructure

#### Using Docker Compose

**1. Create docker-compose.yml**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/evolution
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=evolution
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**2. Build and Run**

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

**3. Set Up Nginx (Optional)**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**4. SSL with Let's Encrypt**

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

## Post-Deployment Steps

### 1. Verify Deployment

```bash
# Check health endpoint
curl https://your-domain.com/api/health

# Expected response:
# {"status":"healthy","timestamp":"...","database":"connected"}
```

### 2. Test Authentication

1. Visit your site
2. Try to sign up
3. Try to log in
4. Check dashboard access

### 3. Set Up Monitoring

#### Vercel Analytics (Automatic)

Already enabled on Vercel!

#### Sentry Error Tracking

```bash
# Already configured!
# Just add SENTRY_DSN to environment variables
```

#### Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com) (Free)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

### 4. Configure Email Service

#### SendGrid

```bash
# Add to environment variables
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=noreply@yourdomain.com
```

#### AWS SES

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
```

### 5. Set Up Backups

#### Automated Database Backups

**Vercel Postgres:**
- Automatic daily backups
- Point-in-time recovery

**Railway:**
- Automatic backups included
- Manual backups available

**Self-Hosted:**
```bash
# Create backup script
#!/bin/bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Add to crontab
0 2 * * * /path/to/backup.sh
```

### 6. Configure CDN (Optional)

#### Cloudflare

1. Add site to Cloudflare
2. Update nameservers
3. Enable caching
4. Configure SSL

Benefits:
- ✅ DDoS protection
- ✅ Global CDN
- ✅ Free SSL
- ✅ Analytics

## Environment Variables Reference

### Required

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### Optional but Recommended

```env
# Email
SENDGRID_API_KEY="..."
EMAIL_FROM="noreply@yourdomain.com"

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."

# Storage
AWS_S3_BUCKET="..."
AWS_S3_REGION="us-east-1"
AWS_S3_ACCESS_KEY_ID="..."
AWS_S3_SECRET_ACCESS_KEY="..."

# Payment
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Performance Optimization

### 1. Enable Caching

```typescript
// next.config.mjs
export default {
  headers: async () => [
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};
```

### 2. Image Optimization

Already configured with Next.js Image component!

### 3. Database Connection Pooling

```env
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20"
```

### 4. Enable Compression

Automatic on Vercel and most platforms!

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database password strong
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Input validation working
- [ ] SQL injection protection (Prisma)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Security headers configured

## Monitoring Dashboard

### Key Metrics to Track

1. **Uptime** - Should be > 99.9%
2. **Response Time** - Should be < 500ms
3. **Error Rate** - Should be < 1%
4. **Database Performance** - Query time < 100ms
5. **User Signups** - Track growth
6. **Active Users** - Daily/Monthly active users

### Tools

- **Vercel Analytics** - Built-in
- **Sentry** - Error tracking
- **Google Analytics** - User analytics
- **Prisma Pulse** - Database monitoring

## Troubleshooting

### Build Fails

```bash
# Check logs
vercel logs

# Common issues:
# - Missing environment variables
# - Database connection failed
# - TypeScript errors
```

### Database Connection Issues

```bash
# Test connection
psql "your-database-url"

# Check Prisma
npx prisma db pull
```

### 500 Errors

```bash
# Check Sentry for error details
# Check server logs
# Verify environment variables
```

## Cost Estimation

### Vercel + Vercel Postgres
- **Free Tier**: $0/month (hobby projects)
- **Pro**: $20/month + $20/month database
- **Total**: ~$40/month

### Railway
- **Starter**: $5/month
- **Developer**: $10/month
- **Total**: ~$10-15/month

### AWS (Minimal)
- **Amplify**: ~$15/month
- **RDS t3.micro**: ~$15/month
- **S3**: ~$1/month
- **Total**: ~$30/month

### Self-Hosted (VPS)
- **DigitalOcean Droplet**: $6-12/month
- **Database**: Included
- **Total**: ~$10/month

## Next Steps

1. ✅ Choose deployment platform
2. ✅ Set up database
3. ✅ Configure environment variables
4. ✅ Deploy application
5. ✅ Test all features
6. ✅ Set up monitoring
7. ✅ Configure backups
8. ✅ Add custom domain
9. ✅ Enable SSL
10. ✅ Launch! 🚀

## Support

Need help deploying?

- 📧 Email: support@evolutionfuture.com
- 📚 Docs: See other guides in this repo
- 💬 Community: Join our Discord

---

**Your app is ready for the world! 🌍**
