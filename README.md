# Tiny Habit Streak Tracker

A minimalist habit tracking app built with Next.js, Clerk authentication, and PostgreSQL. Track your tiny habits, build streaks, and visualize your progress.

## Features

- User authentication with Clerk
- Create and track multiple habits
- Daily completion tracking with Yes/No buttons
- Streak tracking and calendar view
- Statistics and progress visualization
- Responsive design with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Authentication:** Clerk
- **Database:** PostgreSQL
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or hosted)
- Clerk account for authentication

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/riasheril/habit-tracker.git
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `CLERK_SECRET_KEY` - From Clerk dashboard
- `DATABASE_URL` - Your PostgreSQL connection string

4. Set up the database:
```bash
psql -U your_user -d your_database -f migrations/001_add_auth.sql
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This app is configured for deployment on Vercel.

### Environment Setup

The repository uses a branch-based deployment strategy:
- `main` branch → Production environment
- `staging` branch → Staging environment

### Deploying to Vercel

1. **Connect your GitHub repository** to Vercel

2. **Create two Clerk projects:**
   - One for staging (development mode)
   - One for production

3. **Set up two databases:**
   - Staging database (e.g., Neon, Supabase, or Vercel Postgres)
   - Production database

4. **Configure environment variables in Vercel:**

   **For Production (main branch):**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Production Clerk key
   - `CLERK_SECRET_KEY` - Production Clerk secret
   - `DATABASE_URL` - Production database URL

   **For Staging (staging branch):**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Staging Clerk key
   - `CLERK_SECRET_KEY` - Staging Clerk secret
   - `DATABASE_URL` - Staging database URL

5. **Deploy:**
   - Push to `staging` branch to deploy to staging
   - Push to `main` branch to deploy to production

### Workflow

1. Develop and test features locally
2. Push to `staging` branch for staging deployment
3. Test on staging environment
4. Merge `staging` into `main` for production deployment

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── home/            # Main habit tracking page
│   ├── onboarding/      # First-time user setup
│   ├── stats/           # Statistics and analytics
│   └── sign-in/         # Authentication pages
├── components/          # React components
├── lib/                 # Utilities and server actions
│   ├── actions/        # Server actions
│   ├── queries/        # Database queries
│   └── db.ts           # Database connection
├── migrations/          # Database migration scripts
└── types/              # TypeScript type definitions
```

## Database Schema

See `migrations/001_add_auth.sql` for the complete schema.

Main tables:
- `habits` - User habits
- `completions` - Daily completion records

## Contributing

This is a personal project, but feel free to fork and customize for your own use.

## License

MIT
