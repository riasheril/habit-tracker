# Authentication Setup Guide

This application uses [Clerk](https://clerk.com) for authentication. Follow these steps to set up authentication for local development and deployment.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Clerk account (free tier available at https://clerk.com)

## Step 1: Create a Clerk Application

1. Go to https://clerk.com and sign up or log in
2. Create a new application in the Clerk Dashboard
3. Choose your application name (e.g., "Habit Tracker")
4. Enable the following authentication methods:
   - **Google OAuth** (recommended)
   - **Email/Password** (recommended)
5. Save your application

## Step 2: Get Your Clerk Keys

1. In the Clerk Dashboard, navigate to **API Keys**
2. Copy the following keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root of your project (if it doesn't exist):

```bash
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database Connection
DATABASE_URL=postgresql://user:password@localhost:5432/habit_tracker

# Optional: Customize Clerk URLs (usually not needed for development)
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

## Step 4: Run Database Migrations

Apply the authentication migration to add the users table and update the habits table:

```bash
# Connect to your PostgreSQL database and run:
psql -d habit_tracker -f migrations/001_add_auth.sql
```

Or manually execute the SQL in `migrations/001_add_auth.sql`:

```sql
-- Creates users table
-- Adds user_id foreign key to habits table
-- Creates necessary indexes
```

## Step 5: Configure Clerk Redirect URLs

In the Clerk Dashboard, configure the following URLs:

1. Go to **Settings** → **Paths**
2. Set the following paths:
   - **Sign-in page**: `/sign-in`
   - **Sign-up page**: `/sign-up`
   - **After sign-in URL**: `/onboarding`
   - **After sign-up URL**: `/onboarding`

3. Go to **Settings** → **Allowed redirect URLs** and add:
   - `http://localhost:3000/onboarding`
   - `http://localhost:3000/home`
   - Your production domain URLs when deploying

## Step 6: Test Authentication Flow

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000`
3. You should be redirected to `/sign-in` if not authenticated
4. Sign up with Google or email/password
5. After signing in, you'll be redirected to `/onboarding` to set your username
6. After setting username, you'll be redirected to `/home`

## Authentication Flow

```
User visits app
  ↓
Not authenticated? → Redirect to /sign-in
  ↓
Sign up/Sign in (Clerk UI)
  ↓
Redirect to /onboarding
  ↓
User sets username (stored in DB)
  ↓
Redirect to /home (authenticated)
```

## Protected Routes

The following routes require authentication:
- `/home` - Main habit tracker page
- `/stats` - Statistics page
- `/onboarding` - Username setup (only shown once)

Public routes:
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page

## How Authentication Works

1. **ClerkProvider**: Wraps the entire app in `app/layout.tsx`
2. **Middleware**: Protects routes in `middleware.ts`
3. **Server Actions**: All habit/completion actions verify user authentication
4. **Database Queries**: All queries filter by `user_id` to ensure data isolation
5. **User Creation**: Users are automatically created in our database on first sign-in via `getOrCreateUser()`

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Habits Table (Updated)
```sql
ALTER TABLE habits
ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
```

## Troubleshooting

### "Unauthorized" errors
- Ensure `CLERK_SECRET_KEY` is set in `.env.local`
- Verify the key starts with `sk_test_` for development
- Restart your dev server after changing environment variables

### Redirected to sign-in repeatedly
- Check that `afterSignInUrl` is set to `/onboarding` in Clerk Dashboard
- Verify middleware.ts is not blocking the onboarding route
- Clear browser cookies and try again

### "Username already taken" on onboarding
- This is expected if the username is already in use
- Try a different username
- Check your database to see existing usernames: `SELECT username FROM users;`

### Database connection errors
- Verify `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running
- Verify the migration was applied successfully

## Deployment

When deploying to production:

1. Update Clerk Dashboard with production URLs:
   - Add production domain to allowed redirect URLs
   - Update sign-in/sign-up paths if needed

2. Set environment variables in your hosting platform:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (use production key, starts with `pk_live_`)
   - `CLERK_SECRET_KEY` (use production key, starts with `sk_live_`)
   - `DATABASE_URL`

3. Run database migrations on your production database

4. Test the complete authentication flow in production

## Security Notes

- **Never commit** `.env.local` to version control
- Use separate Clerk applications for development and production
- Production keys start with `pk_live_` and `sk_live_`
- Development keys start with `pk_test_` and `sk_test_`
- All habit data is scoped to the authenticated user via `user_id` foreign key
- Clerk handles password hashing, OAuth tokens, and session management securely

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Authentication Flows](https://clerk.com/docs/authentication/configuration)
