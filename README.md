# Evolution Future 🚀

Enterprise-ready SaaS platform built with Next.js 14, TypeScript, and modern web technologies.

## Features

- ✨ Modern, responsive UI with Tailwind CSS & Shadcn UI
- 🔐 Authentication with NextAuth (Google OAuth + Email)
- 📊 Dashboard with analytics and KPI cards
- 🎨 Dark/Light mode support
- 🗄️ PostgreSQL database with Prisma ORM
- 🔒 Role-based access control (Admin/User)
- 📱 Mobile-first responsive design
- ⚡ Optimized for performance (Lighthouse > 90)
- 🐳 Docker ready
- 🔄 Activity logging & audit trail

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI, Radix UI
- **State Management**: Zustand, React Query
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS + CSS Variables
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm or yarn

## Setup Instructions

1. Clone and install:
```bash
git clone https://github.com/eka0789/evofuture.git
cd evofuture
npm install
```

2. Setup environment:
```bash
cp .env.example .env
```

3. Configure `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/evolution_future"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Initialize database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Start development:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Demo Credentials

- Email: `demo@evolutionfuture.com`
- Password: `demo123`

## Project Structure

```
evolution-future/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   └── app/            # Protected app pages
├── components/         # Reusable components
│   └── ui/            # Shadcn UI components
├── features/          # Feature modules (future)
├── lib/               # Utilities & configs
├── services/          # Business logic layer (future)
├── hooks/             # Custom React hooks (future)
├── store/             # Zustand stores (future)
├── prisma/            # Database schema & migrations
└── types/             # TypeScript definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Prisma Studio

## Docker Deployment

Build and run with Docker:

```bash
docker build -t evolution-future .
docker run -p 3000:3000 evolution-future
```

## Security Features

- CSRF protection via NextAuth
- XSS-safe rendering
- Rate limiting ready
- Role-based access control
- Secure password hashing (bcrypt)
- JWT session management
- Audit logging

## Future Roadmap

### ✅ Completed (5/9 = 56%)
- [x] **Payment integration (Stripe)** - Full subscription management with webhooks
- [x] **WebSocket real-time features** - Live notifications, presence, typing indicators
- [x] **Advanced analytics** - Comprehensive metrics, charts, export, revenue tracking
- [x] **Team collaboration features** - Team creation, invitations, role management
- [x] **API documentation** - Complete OpenAPI spec, code examples, interactive docs

### 📋 Planned (4/9 = 44%)
- [ ] **AI agent modules** - Chat assistant, content generation, smart recommendations
- [ ] **Multi-tenancy support** - Organization/workspace model with data isolation
- [ ] **White-label capabilities** - Custom branding, domains, themes (Enterprise only)
- [ ] **Mobile app** - React Native iOS/Android app with offline support

> 📊 **Progress:** 5/9 features complete (56%) | See [ROADMAP-PROGRESS.md](./ROADMAP-PROGRESS.md) for details

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
