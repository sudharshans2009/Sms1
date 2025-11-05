# Vercel Deployment Guide for Amrita Vidyalayam SMS

## 🚀 Quick Fix Applied

The error you encountered:
```
Error: No Output Directory named "public" found after the Build completed.
```

**Has been fixed by creating `vercel.json` configuration file.**

---

## ✅ Files Created for Deployment

### 1. `vercel.json` - Vercel Configuration
This file tells Vercel:
- ✅ Use Next.js framework
- ✅ Output directory is `.next` (not `public`)
- ✅ Build command: `npm run build`
- ✅ Install command: `npm install`
- ✅ Node environment: Production

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables (IMPORTANT!)
You need to add these in Vercel Dashboard:

Go to: **Project Settings → Environment Variables**

```bash
# Database (if using external DB)
DATABASE_URL=your-database-connection-string

# JWT Secret (REQUIRED for authentication)
JWT_SECRET=generate-a-secure-random-string-here

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# SMS Gateway (optional)
SMS_API_KEY=your-sms-api-key
SMS_SENDER_ID=AMRITA

# App URL (will be your Vercel URL)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Production flag
NODE_ENV=production
```

### 2. Update .gitignore
Ensure sensitive files are not committed:
```
.env.local
.env
.env*.local
node_modules/
.next/
```

---

## 🎯 Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Login to Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your GitHub repository `Sms1`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (should auto-detect)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (from vercel.json)
   - Install Command: `npm install` (auto-filled)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add all variables from the checklist above
   - Click "Add" for each variable

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Method 2: Deploy via Vercel CLI (Advanced)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
cd /workspaces/Sms1
vercel

# Follow the prompts:
# - Link to existing project? No (first time)
# - Project name? amrita-vidyalayam-sms
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## 🔧 Fix Common Deployment Issues

### Issue 1: Build Fails - Module Not Found
**Solution:**
```bash
# Make sure all dependencies are in package.json
npm install
npm run build  # Test locally first
```

### Issue 2: Environment Variables Not Working
**Solution:**
- Add variables in Vercel Dashboard (not in .env.local)
- Prefix client-side variables with `NEXT_PUBLIC_`
- Redeploy after adding variables

### Issue 3: API Routes Return 404
**Solution:**
- Ensure all API routes are in `src/app/api/` directory
- Check route.ts files have proper exports
- Verify Next.js App Router structure

### Issue 4: CSS Not Loading
**Solution:**
- Tailwind CSS should work automatically
- Check `tailwind.config.js` includes all paths
- Ensure `globals.css` is imported in layout

### Issue 5: Maps Not Loading (Leaflet)
**Solution:**
- Leaflet CSS loads from CDN (already configured)
- Dynamic imports are set up correctly
- No additional config needed

---

## 🎨 Update Next.js Config for Production

Your `next.config.js` is already optimal, but here are optional enhancements:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Optional: Add image domains if using external images
  images: {
    domains: ['example.com'],
  },
  
  // Optional: Redirect www to non-www
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.yourdomain.com' }],
        destination: 'https://yourdomain.com/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
```

---

## 📊 Post-Deployment Verification

### 1. Check Homepage
Visit: `https://your-app.vercel.app`
- Should see login page
- Design should load correctly (Amrita Orange colors)

### 2. Test Login
- Admin: admin@123 / admin
- Should redirect to dashboard

### 3. Test Bus Tracking
- Click "Bus Tracking" in sidebar
- Maps should load (OpenStreetMap)
- All 4 buses should appear

### 4. Check API Endpoints
```bash
# Test API endpoint
curl https://your-app.vercel.app/api/buses

# Should return JSON with bus data
```

### 5. Mobile Responsiveness
- Open on mobile device
- All features should work
- Maps should be interactive

---

## 🔐 Security Recommendations

### 1. Update Environment Variables
Don't use demo passwords in production:
```javascript
// In your database initialization, comment out demo users
// Or use strong passwords from environment variables
```

### 2. Add Rate Limiting
Install and configure rate limiting for API routes:
```bash
npm install express-rate-limit
```

### 3. Enable CORS Protection
Update API routes to check origin:
```typescript
// In API routes
if (process.env.NODE_ENV === 'production') {
  // Verify request origin
}
```

### 4. Use HTTPS Only
Vercel provides HTTPS automatically, but ensure:
- No mixed content warnings
- All external resources use HTTPS
- API calls use relative paths

---

## 🎯 Optimizations for Production

### 1. Enable ISR (Incremental Static Regeneration)
For pages that don't change often:
```typescript
// In page.tsx
export const revalidate = 3600; // Revalidate every hour
```

### 2. Add Loading States
Already implemented, but ensure all components have:
- Loading spinners
- Skeleton screens
- Error boundaries

### 3. Image Optimization
If adding images later:
```typescript
import Image from 'next/image';
<Image src="/logo.png" width={200} height={100} alt="Logo" />
```

### 4. Bundle Size Analysis
Check your build output:
```bash
npm run build
# Look at the generated bundle sizes
```

---

## 🐛 Debugging Production Issues

### View Deployment Logs
1. Go to Vercel Dashboard
2. Click on your project
3. Click on the latest deployment
4. Click "View Function Logs"

### Check Runtime Logs
```bash
# Use Vercel CLI
vercel logs your-app-url
```

### Test Production Build Locally
```bash
# Build for production
npm run build

# Start production server
npm run start

# Test at http://localhost:3000
```

---

## 📱 Domain Setup (Optional)

### Add Custom Domain
1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Domains"
3. Add your domain (e.g., school.example.com)
4. Follow DNS configuration instructions
5. Vercel will auto-provision SSL certificate

### DNS Configuration Example
```
Type: CNAME
Name: school (or www)
Value: cname.vercel-dns.com
TTL: Auto
```

---

## 🚀 Continuous Deployment

**Automatic Deployments Enabled:**
- Push to `main` branch → Auto-deploy to production
- Push to other branches → Preview deployment
- Pull requests → Preview deployment with unique URL

**Preview Deployments:**
- Every git push creates a preview
- Unique URL for each deployment
- Test before merging to main

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Free)
1. Go to Project Settings
2. Enable "Analytics"
3. View:
   - Page views
   - User locations
   - Performance metrics

### Performance Monitoring
- Vercel provides built-in monitoring
- View Core Web Vitals
- Check API response times
- Monitor error rates

---

## 🎉 Success Checklist

After deployment, verify:
- ✅ App loads at Vercel URL
- ✅ Login works correctly
- ✅ Dashboard displays properly
- ✅ Bus tracking shows maps
- ✅ All modules are functional
- ✅ Mobile responsive
- ✅ No console errors
- ✅ SSL certificate active
- ✅ Environment variables set
- ✅ API endpoints working

---

## 🆘 Quick Troubleshooting

### Build Error: "Module not found"
```bash
# Fix missing dependencies
npm install
git add package.json package-lock.json
git commit -m "Fix dependencies"
git push
```

### Error: "Environment variable not defined"
- Add all required variables in Vercel Dashboard
- Check for typos in variable names
- Redeploy after adding variables

### Maps Not Loading in Production
- Check browser console for errors
- Verify Leaflet CSS loads from CDN
- Ensure dynamic imports are configured

### API Routes Return 500
- Check Vercel Function Logs
- Verify database connection (if using external DB)
- Test API routes with Postman/cURL

---

## 📞 Need More Help?

### Resources:
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Vercel CLI Docs:** https://vercel.com/docs/cli

### Common Commands:
```bash
# View logs
vercel logs

# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull
```

---

## ✅ Summary

**What We Fixed:**
1. ✅ Created `vercel.json` with correct Next.js configuration
2. ✅ Set output directory to `.next` (not `public`)
3. ✅ Configured build and install commands
4. ✅ Set production environment

**Next Steps:**
1. Push `vercel.json` to GitHub
2. Import project in Vercel Dashboard
3. Add environment variables
4. Click Deploy
5. Test your live app!

**Your app will be live at:** `https://[your-project-name].vercel.app`

---

**Deployment should now work perfectly! 🎉**
