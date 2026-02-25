# 🐘 PostgreSQL Migration Guide

This guide will help you migrate from SQLite (development) to PostgreSQL (production).

## Why PostgreSQL?

- ✅ Better performance at scale
- ✅ Advanced features (JSON, full-text search)
- ✅ Better concurrency handling
- ✅ Production-ready
- ✅ Supported by all major cloud providers

## Migration Steps

### Option 1: Vercel Postgres (Recommended for Vercel Deployment)

#### 1. Create Vercel Postgres Database

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Create Postgres database
vercel postgres create
```

#### 2. Get Connection String

```bash
# Get your database URL
vercel env pull .env.production
```

#### 3. Update Prisma Schema

The schema is already PostgreSQL-compatible! Just update your `.env`:

```env
DATABASE_URL="postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
```

#### 4. Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to PostgreSQL
npx prisma db push

# Seed database
npm run db:seed
```

### Option 2: Railway

#### 1. Create Railway Account

Visit [railway.app](https://railway.app) and sign up.

#### 2. Create PostgreSQL Database

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add postgresql
```

#### 3. Get Connection String

```bash
# Get database URL
railway variables
```

Copy the `DATABASE_URL` to your `.env` file.

#### 4. Run Migrations

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### Option 3: Supabase

#### 1. Create Supabase Project

Visit [supabase.com](https://supabase.com) and create a new project.

#### 2. Get Connection String

Go to Project Settings → Database → Connection String

Choose "Connection Pooling" for better performance.

#### 3. Update .env

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
```

#### 4. Run Migrations

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### Option 4: AWS RDS

#### 1. Create RDS Instance

1. Go to AWS RDS Console
2. Create Database → PostgreSQL
3. Choose instance size (t3.micro for testing)
4. Set master username and password
5. Configure VPC and security groups

#### 2. Get Connection String

```env
DATABASE_URL="postgresql://username:password@your-instance.region.rds.amazonaws.com:5432/dbname"
```

#### 3. Run Migrations

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### Option 5: Local PostgreSQL

#### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

#### 2. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE evolution_future;

# Create user
CREATE USER evofuture WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE evolution_future TO evofuture;

# Exit
\q
```

#### 3. Update .env

```env
DATABASE_URL="postgresql://evofuture:your_password@localhost:5432/evolution_future?schema=public"
```

#### 4. Run Migrations

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

## Schema Changes for PostgreSQL

Good news! Your Prisma schema is already compatible with PostgreSQL. The only changes needed were:

### Already Done ✅
- ✅ Changed `@default(uuid())` for ID fields
- ✅ Proper indexing with `@@index`
- ✅ Correct data types
- ✅ Proper relationships

### No Changes Needed
Your current schema works with both SQLite and PostgreSQL!

## Data Migration (Optional)

If you have existing SQLite data you want to migrate:

### 1. Export from SQLite

```bash
# Install sqlite3
npm install -g sqlite3

# Export data
sqlite3 prisma/dev.db .dump > backup.sql
```

### 2. Convert to PostgreSQL Format

```bash
# Install pgloader (macOS)
brew install pgloader

# Convert and load
pgloader prisma/dev.db postgresql://user:pass@host:5432/dbname
```

### 3. Or Use Prisma Studio

```bash
# Open SQLite database
DATABASE_URL="file:./dev.db" npx prisma studio

# Copy data manually to PostgreSQL
DATABASE_URL="postgresql://..." npx prisma studio
```

## Verification

After migration, verify everything works:

```bash
# Check database connection
npx prisma db pull

# Open Prisma Studio
npx prisma studio

# Run your app
npm run dev

# Check health endpoint
curl http://localhost:3000/api/health
```

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql "postgresql://user:pass@host:5432/dbname"
```

### SSL Issues

Add `?sslmode=require` to your connection string:

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
```

### Migration Errors

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually reset
npx prisma db push --force-reset
```

### Performance Issues

Add connection pooling:

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname?connection_limit=10&pool_timeout=20"
```

## Production Best Practices

### 1. Use Connection Pooling

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 2. Enable Query Logging (Development)

```env
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20&log=query"
```

### 3. Backup Strategy

```bash
# Automated backups with pg_dump
pg_dump -h host -U user -d dbname > backup_$(date +%Y%m%d).sql

# Restore
psql -h host -U user -d dbname < backup.sql
```

### 4. Monitoring

- Use Prisma Pulse for real-time monitoring
- Set up CloudWatch (AWS) or similar
- Monitor connection pool usage
- Track slow queries

## Cost Comparison

| Provider | Free Tier | Paid Plans |
|----------|-----------|------------|
| Vercel Postgres | 256 MB | From $20/mo |
| Railway | 500 MB | From $5/mo |
| Supabase | 500 MB | From $25/mo |
| AWS RDS | None | From $15/mo |
| Neon | 3 GB | From $19/mo |

## Next Steps

After migration:

1. ✅ Update environment variables
2. ✅ Run migrations
3. ✅ Test all features
4. ✅ Set up backups
5. ✅ Monitor performance
6. ✅ Deploy to production

## Support

Need help? Check:
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)

---

**Your database is now production-ready! 🎉**
