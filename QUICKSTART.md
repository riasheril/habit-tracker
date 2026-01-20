# Quick Start - Deploy Your App

Your repository is now reorganized and ready for deployment! Follow these steps to get your app live.

## What Just Happened?

✅ Removed old backend/frontend folders
✅ Moved Next.js app to repository root
✅ Updated configuration files
✅ Created `staging` and `main` branches
✅ Added comprehensive documentation

## Next Steps (Do This Now!)

### 1. Push Your Changes to GitHub

```bash
# Push main branch
git push origin main

# Push staging branch
git push origin staging
```

### 2. Set Up Services (15 minutes)

You need three services:

**A. Create Clerk Projects (Authentication)**
1. Go to [clerk.com](https://clerk.com)
2. Sign up / Log in
3. Create TWO applications:
   - "Habit Tracker - Production"
   - "Habit Tracker - Staging"
4. For each, copy the API keys (you'll need them in step 3)

**B. Create Databases**
1. Go to [neon.tech](https://neon.tech) (recommended free option)
2. Create TWO projects:
   - "habit-tracker-production"
   - "habit-tracker-staging"
3. For each database, run this command:
   ```bash
   psql "your_connection_string_here" -f migrations/001_add_auth.sql
   ```

**C. Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your `habit-tracker` repository
5. Add environment variables (see below)
6. Deploy!

### 3. Environment Variables for Vercel

When deploying, add these variables:

**For PRODUCTION (main branch):**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = [Production Clerk key]
CLERK_SECRET_KEY = [Production Clerk secret]
DATABASE_URL = [Production database URL]
```

**For STAGING (staging branch):**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = [Staging Clerk key]
CLERK_SECRET_KEY = [Staging Clerk secret]
DATABASE_URL = [Staging database URL]
```

### 4. After Deployment

1. Vercel will give you two URLs:
   - Production: `your-app.vercel.app`
   - Staging: `your-app-git-staging.vercel.app`

2. Add these URLs to your Clerk projects:
   - In each Clerk app, go to "Domains"
   - Add your corresponding Vercel URL

3. Test both environments!

## Quick Reference

**Your Branches:**
- `main` → Production (live app)
- `staging` → Staging (testing)

**Workflow:**
1. Make changes locally
2. Push to `staging` to test
3. Merge `staging` → `main` for production

**Full Guide:**
See `DEPLOYMENT.md` for the complete step-by-step guide with screenshots and troubleshooting.

## Estimated Time

- Setting up accounts: 10 minutes
- Configuring and deploying: 15 minutes
- Testing: 5 minutes

**Total: ~30 minutes to go live!**

## Need Help?

- Read `DEPLOYMENT.md` for detailed instructions
- Check `README.md` for project structure
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- Clerk docs: [clerk.com/docs](https://clerk.com/docs)

---

**Ready?** Start with step 1 above and push your code to GitHub!
