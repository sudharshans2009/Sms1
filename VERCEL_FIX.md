# Vercel Deployment Instructions

## Fix for "npn: command not found" Error

If you see the error: `sh: line 1: npn: command not found`

This is likely a typo in your Vercel project settings. Here's how to fix it:

### Option 1: Via Vercel Dashboard
1. Go to your project in Vercel Dashboard
2. Click on **Settings** → **General**
3. Scroll to **Build & Development Settings**
4. Check the **Build Command** field
5. It should say: `npm run build` (NOT "npn run build")
6. If it says "npn", change it to "npm"
7. Click **Save**
8. Redeploy your project

### Option 2: Let Vercel Auto-detect (Recommended)
1. Go to project **Settings** → **General**
2. Under **Build & Development Settings**
3. Set **Framework Preset** to: `Next.js`
4. Leave **Build Command** empty (Vercel will use default: `npm run build`)
5. Leave **Output Directory** empty (Vercel will use default: `.next`)
6. Leave **Install Command** empty (Vercel will use default: `npm install`)
7. Click **Save**

## Environment Variables Required

Make sure these are set in Vercel:

```
DATABASE_URL="your-neon-postgres-url"
POSTGRES_PRISMA_URL="your-neon-prisma-url"
POSTGRES_URL_NON_POOLING="your-neon-non-pooling-url"
```

## Deployment Checklist

✅ **Build Command:** `npm run build` (automatically runs `prisma generate`)  
✅ **Install Command:** `npm install`  
✅ **Output Directory:** `.next`  
✅ **Framework:** Next.js 14  
✅ **Node Version:** 18.x or higher  
✅ **Environment Variables:** All DATABASE_URL variables set  

## Post-Deployment

After successful deployment, run this command to seed the database (one-time):

```bash
# This can be run from your local machine or Vercel CLI
npx prisma db push
npx prisma db seed
```

Or use Vercel CLI:
```bash
vercel env pull
npm run db:push
npm run db:seed
```

## Test Credentials

After seeding, these accounts will be available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@amrita.edu | admin123 |
| Teacher | teacher@amrita.edu | teacher123 |
| Student | student@amrita.edu | student123 |
| Driver | driver@amrita.edu | driver123 |

## Troubleshooting

### Build fails with Prisma errors
- Ensure all environment variables are set in Vercel
- Check that DATABASE_URL is accessible from Vercel's servers
- Verify your Neon database allows connections from anywhere (0.0.0.0/0)

### Theme toggle not working
- Fixed: Added proper SSR checks for `window` and `document` objects
- Theme state is now properly synced with localStorage

### Login not working
- Fixed: Updated seed data with correct email format
- Ensure database is seeded after deployment

## Support

If issues persist, check:
1. Vercel deployment logs
2. Runtime logs in Vercel dashboard
3. Database connection in Neon dashboard
