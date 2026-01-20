# Deployment Guide

Complete guide for deploying the Tiny Habit Streak Tracker to staging and production environments.

## Overview

This app uses a **branch-based deployment strategy**:
- **staging branch** → Staging environment (for testing)
- **main branch** → Production environment (live users)

## Prerequisites

Before deploying, you'll need:
1. GitHub account (you already have the repo)
2. Vercel account (free tier works great)
3. Two Clerk projects (staging + production)
4. Two PostgreSQL databases (staging + production)

## Step 1: Set Up Databases

### Option A: Neon (Recommended - Free Tier)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create **two projects**:
   - `habit-tracker-staging`
   - `habit-tracker-production`
3. For each project:
   - Copy the connection string (looks like: `postgresql://user:pass@host/database`)
   - Run the migration script:
     ```bash
     psql "YOUR_CONNECTION_STRING" -f migrations/001_add_auth.sql
     ```

### Option B: Vercel Postgres

1. In Vercel dashboard, go to Storage → Create Database
2. Create two databases:
   - `habit-tracker-staging`
   - `habit-tracker-production`
3. Copy connection strings and run migrations

### Option C: Supabase

1. Go to [supabase.com](https://supabase.com) and create account
2. Create two projects (staging + production)
3. Get the PostgreSQL connection string from Project Settings → Database
4. Run migrations for each database

## Step 2: Set Up Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and sign up
2. Create **two applications**:
   - `Habit Tracker - Staging`
   - `Habit Tracker - Production`

3. For each application:
   - Go to API Keys
   - Copy `Publishable Key` (starts with `pk_`)
   - Copy `Secret Key` (starts with `sk_`)
   - **Keep these safe - you'll need them for Vercel**

## Step 3: Deploy to Vercel

### Initial Setup

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New** → **Project**
3. Import your `habit-tracker` repository
4. Vercel will auto-detect it's a Next.js app

### Configure Production Environment

1. In the import screen, **don't deploy yet**
2. Click **Environment Variables**
3. Add these variables:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   Value: [Your PRODUCTION Clerk publishable key]
   Environment: Production

   CLERK_SECRET_KEY
   Value: [Your PRODUCTION Clerk secret key]
   Environment: Production

   DATABASE_URL
   Value: [Your PRODUCTION database connection string]
   Environment: Production
   ```

4. Set **Branch** to deploy: `main`
5. Click **Deploy**

### Configure Staging Environment

1. After production deploys, go to your project settings
2. Click **Git** in the sidebar
3. Add a new environment:
   - Environment Name: `Preview`
   - Branch Pattern: `staging`

4. Go to **Environment Variables**
5. Add the same three variables but for staging:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   Value: [Your STAGING Clerk publishable key]
   Environment: Preview

   CLERK_SECRET_KEY
   Value: [Your STAGING Clerk secret key]
   Environment: Preview

   DATABASE_URL
   Value: [Your STAGING database connection string]
   Environment: Preview
   ```

6. In your local repo:
   ```bash
   git checkout staging
   git push origin staging
   ```

## Step 4: Configure Clerk Domains

After deployment, Vercel will give you URLs:
- Production: `your-app.vercel.app`
- Staging: `your-app-git-staging.vercel.app`

For each Clerk application:
1. Go to **Domains**
2. Add your Vercel URL as an allowed domain
3. Set redirect URLs if needed

## Step 5: Test Your Deployments

### Test Staging
1. Visit your staging URL
2. Try signing up with a test account
3. Create a habit and mark it complete
4. Check the database to verify data is saved

### Test Production
1. Visit your production URL
2. Create a real account
3. Test all features

## Workflow for Future Deployments

### Making Changes

1. **Develop locally:**
   ```bash
   git checkout staging
   # Make your changes
   git add .
   git commit -m "Your changes"
   ```

2. **Deploy to staging:**
   ```bash
   git push origin staging
   ```
   - Vercel automatically deploys staging
   - Test at your staging URL

3. **Deploy to production:**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```
   - Vercel automatically deploys production

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all environment variables are set
- Make sure Node.js version is 18+

### Authentication Not Working
- Verify Clerk domains are configured
- Check that environment variables match the correct Clerk project
- Make sure you're using the right keys for each environment

### Database Connection Errors
- Verify `DATABASE_URL` is correctly formatted
- Check database is accessible from Vercel's network
- Run migrations if tables don't exist

### Can't Access Staging
- Push the `staging` branch to GitHub
- Check Vercel deployment logs
- Verify staging environment variables are set

## Environment Variable Checklist

Before deploying, verify you have:

**Staging Environment:**
- [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (staging)
- [ ] CLERK_SECRET_KEY (staging)
- [ ] DATABASE_URL (staging)
- [ ] Staging Clerk project created
- [ ] Staging database created and migrated

**Production Environment:**
- [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (production)
- [ ] CLERK_SECRET_KEY (production)
- [ ] DATABASE_URL (production)
- [ ] Production Clerk project created
- [ ] Production database created and migrated

## Useful Commands

```bash
# Switch to staging
git checkout staging

# Switch to production
git checkout main

# Push staging to deploy
git push origin staging

# Deploy production (from main branch)
git push origin main

# Merge staging into production
git checkout main
git merge staging
git push origin main

# View deployment status
vercel --prod  # Production
vercel         # Staging/Preview
```

## Custom Domain (Optional)

To use your own domain:
1. Buy a domain (e.g., from Namecheap, Google Domains)
2. In Vercel, go to Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed by Vercel
5. Update Clerk allowed domains

## Next Steps

- Set up monitoring (Vercel Analytics)
- Configure custom domain
- Set up error tracking (Sentry, LogRocket)
- Enable Vercel Speed Insights
- Set up database backups

## Support

For issues with:
- **Vercel:** [vercel.com/docs](https://vercel.com/docs)
- **Clerk:** [clerk.com/docs](https://clerk.com/docs)
- **Neon:** [neon.tech/docs](https://neon.tech/docs)
