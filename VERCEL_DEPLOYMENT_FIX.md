# Vercel Deployment Guide for Amrita Vidyalayam SMS

## Prerequisites
1. Neon PostgreSQL database created and connection string ready
2. Vercel account connected to your GitHub repository

## Environment Variables Required in Vercel

Go to your Vercel project settings → Environment Variables and add:

```
POSTGRES_PRISMA_URL=your_neon_pooled_connection_string
POSTGRES_URL_NON_POOLING=your_neon_direct_connection_string
DATABASE_URL=your_neon_connection_string
NODE_ENV=production
```

## Deployment Steps

### Option 1: Automatic GitHub Deployment
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Fixed Vercel deployment configuration"
   git push origin main
   ```

2. Vercel will automatically detect the push and deploy

### Option 2: Manual Deployment via Vercel CLI
1. Install Vercel CLI (if not already):
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

## What's Been Fixed

1. **PostCSS Configuration**: Updated postcss.config.js with explicit string keys
2. **Next.js Config**: Added webpack configuration for Leaflet (map library)
3. **Package.json**: Added `postinstall` script to auto-generate Prisma client
4. **Build Script**: Updated to run `prisma generate` before build
5. **npmrc**: Added legacy-peer-deps support for better dependency resolution
6. **vercel.json**: Simplified configuration, removed conflicting settings

## Build Process

The build now runs:
```
npm install → prisma generate → next build
```

## Database Setup on First Deploy

After deployment, you need to seed the database:

1. Go to Vercel Dashboard → Your Project → Settings → Functions
2. Enable "Enable Edge Runtime" (optional)
3. Run seed via Vercel CLI:
   ```bash
   vercel env pull .env.local
   npm run db:push
   npm run db:seed
   ```

Or manually create initial data through the app admin panel.

## Common Issues & Solutions

### Issue: "Cannot find module 'tailwindcss'"
**Solution**: Ensure all dependencies are in `dependencies` not `devDependencies` for production

### Issue: "Prisma Client not generated"
**Solution**: The `postinstall` script now handles this automatically

### Issue: "Database connection failed"
**Solution**: Verify environment variables are correctly set in Vercel dashboard

### Issue: "Module not found: Can't resolve 'leaflet'"
**Solution**: Updated next.config.js with proper webpack externals handling

## Testing Deployment

After successful deployment:
1. Visit: `https://your-app.vercel.app`
2. Test login with seeded credentials:
   - Admin: admin@123 / admin
   - Teacher: teacher@123 / teacher
   - Student: student@123 / student
   - Driver: driver@123 / driver

## Post-Deployment Checks

- [ ] Landing page loads correctly
- [ ] Login works for all user roles
- [ ] Dashboard displays without errors
- [ ] Database connections work
- [ ] All modules load (Students, Teachers, Classes, etc.)
- [ ] Bus tracking map displays
- [ ] Library system functions properly

## Performance Optimization

The app is configured with:
- SWC minification enabled
- React strict mode
- Static page generation where possible
- Optimized Leaflet loading (client-side only)
- Prisma connection pooling via Neon

## Monitoring

Check Vercel dashboard for:
- Build logs
- Runtime logs
- Function execution time
- Database query performance

## Support

If deployment fails:
1. Check Vercel build logs for specific error
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check Prisma schema matches database: `npx prisma db push`

---

**Current Build Status**: ✅ Passing locally
**Last Updated**: November 6, 2025
