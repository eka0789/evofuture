# Evolution Future - Setup Guide

## ✅ Setup Completed!

Your Evolution Future application is now running successfully!

## 🚀 Access the Application

Open your browser and visit: **http://localhost:3000**

## 👤 Demo Accounts

### Admin Account
- Email: `admin@evolutionfuture.com`
- Password: `admin123`
- Access: Full admin dashboard and all features

### Demo User Account
- Email: `demo@evolutionfuture.com`
- Password: `demo123`
- Access: Standard user features

## 📁 Project Structure

```
evolution-future/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── app/               # Protected app pages
│   ├── api/               # API routes
│   └── (public)/          # Public pages
├── components/            # Reusable UI components
├── lib/                   # Utilities & configurations
├── prisma/                # Database schema & migrations
├── services/              # Business logic layer
└── types/                 # TypeScript definitions
```

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Start development server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed database with demo data
npm run db:studio        # Open Prisma Studio

# Build & Production
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint
```

## 🔧 Configuration

### Environment Variables (.env)
- `DATABASE_URL` - SQLite database file location
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `GOOGLE_CLIENT_ID` - (Optional) Google OAuth
- `GOOGLE_CLIENT_SECRET` - (Optional) Google OAuth

### Adding Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

## 📊 Features Available

### Public Pages
- ✅ Landing page
- ✅ Features showcase
- ✅ Pricing plans
- ✅ Blog
- ✅ Contact form
- ✅ FAQ
- ✅ Documentation
- ✅ About, Terms, Privacy, Security

### Dashboard Features
- ✅ Analytics dashboard
- ✅ Activity logging
- ✅ Notifications
- ✅ User profile
- ✅ Team management
- ✅ Referral system
- ✅ Integrations hub
- ✅ Settings
- ✅ Admin panel (admin only)

### Technical Features
- ✅ Authentication (Email + Google OAuth)
- ✅ Role-based access control
- ✅ Dark/Light mode
- ✅ Mobile responsive
- ✅ Real-time notifications
- ✅ Data export
- ✅ Search functionality
- ✅ Onboarding wizard

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or run on different port
PORT=3001 npm run dev
```

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Clear Cache
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📚 Next Steps

1. **Customize Branding**
   - Update logo in `components/navbar.tsx`
   - Modify colors in `tailwind.config.ts`
   - Edit content in public pages

2. **Add Google OAuth**
   - Follow Google OAuth setup above
   - Test login with Google account

3. **Deploy to Production**
   - Update `DATABASE_URL` to PostgreSQL
   - Set production `NEXTAUTH_SECRET`
   - Deploy to Vercel, Railway, or your preferred platform

4. **Add Payment Integration**
   - Integrate Stripe in `app/api/webhooks/stripe`
   - Update billing page with real plans

5. **Customize Features**
   - Add your own pages in `app/`
   - Create custom API routes in `app/api/`
   - Extend database schema in `prisma/schema.prisma`

## 🎉 You're All Set!

Your Evolution Future application is ready for development. Happy coding!

For questions or issues, check the main README.md or create an issue on GitHub.
