# Vercel Deployment Fix Guide

## Issues Identified
1. **Login Not Working** - Environment variables not set in Vercel
2. **Database Connection Issues** - Prisma configuration for serverless
3. **Build configuration** - Vercel-specific optimizations needed

---

## 🔧 STEP 1: Update Prisma for Serverless (Vercel)

The current Prisma setup needs optimization for Vercel's serverless environment.

### Update `src/lib/prisma.ts`:

```typescript
// Database connection using Neon PostgreSQL with Prisma - Optimized for Vercel
import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use Neon serverless driver for Vercel
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // Production: Use Neon Serverless adapter for better cold start performance
  const neon = new Pool({ connectionString: process.env.POSTGRES_PRISMA_URL });
  const adapter = new PrismaNeon(neon);
  
  prisma = new PrismaClient({ 
    adapter,
    log: ['error']
  });
} else {
  // Development: Standard Prisma Client
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
  
  globalForPrisma.prisma = prisma;
}

export { prisma };
export default prisma;

// Connection test function
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectDB() {
  await prisma.$disconnect();
}
```

---

## 🔧 STEP 2: Update Prisma Schema for Better Vercel Support

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL") // Uses connection pooling
  directUrl = env("POSTGRES_URL_NON_POOLING") // Uses direct connection for migrations
}
```

---

## 🔧 STEP 3: Update `package.json` Build Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma db push --skip-generate && next build"
  }
}
```

---

## 🔧 STEP 4: Update Vercel Configuration

Update `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "PRISMA_GENERATE_SKIP_AUTOINSTALL": "false"
  },
  "build": {
    "env": {
      "PRISMA_GENERATE_SKIP_AUTOINSTALL": "false",
      "PRISMA_SKIP_POSTINSTALL_GENERATE": "false"
    }
  },
  "functions": {
    "app/api/**/*.ts": {
      "memory": 3008,
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

---

## 📝 STEP 5: Set Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

### Required Variables:

1. **POSTGRES_PRISMA_URL**
   ```
   postgresql://neondb_owner:npg_ZLQXp7dK9Asc@ep-solitary-star-a1omvioc-pooler.ap-southeast-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
   ```

2. **POSTGRES_URL_NON_POOLING**
   ```
   postgresql://neondb_owner:npg_ZLQXp7dK9Asc@ep-solitary-star-a1omvioc.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

3. **DATABASE_URL** (same as POSTGRES_PRISMA_URL)
   ```
   postgresql://neondb_owner:npg_ZLQXp7dK9Asc@ep-solitary-star-a1omvioc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

4. **JWT_SECRET**
   ```
   amrita-vidyalayam-super-secret-key-2025-production
   ```

5. **NODE_ENV**
   ```
   production
   ```

6. **NEXT_PUBLIC_APP_URL** (your Vercel URL)
   ```
   https://your-app-name.vercel.app
   ```

### How to Add in Vercel:
1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable with the values above
4. Make sure to check all environments (Production, Preview, Development)
5. Click "Save"

---

## 🔧 STEP 6: Fix API Route for Serverless

Update `src/app/api/auth/login/route.ts` to handle serverless properly:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Query user from database
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        role: role.toUpperCase(),
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // In production, use bcrypt for password hashing
    // For now, simple password comparison
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          role: user.role.toLowerCase(),
        },
        token: `token-${user.id}`
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
```

---

## 🔧 STEP 7: Add Middleware for CORS (if needed)

Create `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add CORS headers if needed
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## 📋 STEP 8: Deploy to Vercel

### Option 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 2: Deploy via GitHub
1. Push your code to GitHub
2. Import project in Vercel Dashboard
3. Vercel will auto-deploy

---

## 🧪 STEP 9: Test Deployment

After deployment, test these:

### 1. Database Connection Test
Create `src/app/api/test-db/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test connection
    await prisma.$connect();
    
    // Count users
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully',
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
```

Visit: `https://your-app.vercel.app/api/test-db`

### 2. Login Test
```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@amrita.edu",
    "password": "admin123",
    "role": "admin"
  }'
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Prisma Client not found"
**Solution**: Make sure `postinstall` script runs:
```bash
npm run postinstall
```

### Issue 2: "Database connection timeout"
**Solution**: 
- Check Neon database is not suspended (free tier sleeps after inactivity)
- Verify connection string has `connect_timeout=15`
- Increase function maxDuration in vercel.json

### Issue 3: "Function execution timeout"
**Solution**: Update vercel.json:
```json
"functions": {
  "app/api/**/*.ts": {
    "memory": 3008,
    "maxDuration": 30
  }
}
```

### Issue 4: "Environment variables not found"
**Solution**:
- Double-check all env vars are set in Vercel Dashboard
- Redeploy after adding env vars
- Check spelling of variable names

### Issue 5: "Cold start issues"
**Solution**: Use Neon serverless adapter (already in the updated code)

---

## 📝 Deployment Checklist

- [ ] Updated `src/lib/prisma.ts` with serverless adapter
- [ ] Updated `prisma/schema.prisma` with driverAdapters
- [ ] Updated `package.json` build scripts
- [ ] Updated `vercel.json` configuration
- [ ] Set all environment variables in Vercel Dashboard
- [ ] Added `export const dynamic = 'force-dynamic'` to API routes
- [ ] Created test endpoint (`/api/test-db`)
- [ ] Pushed code to GitHub
- [ ] Deployed to Vercel
- [ ] Tested database connection
- [ ] Tested login functionality
- [ ] Verified all pages load correctly

---

## 🎯 Quick Commands for Local Testing Before Deploy

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Push schema to database (if needed)
npm run db:push

# 3. Seed database (if needed)
npm run db:seed

# 4. Build for production
npm run build

# 5. Start production server locally
npm start

# 6. Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@amrita.edu","password":"admin123","role":"admin"}'
```

---

## 📞 Need Help?

If issues persist:
1. Check Vercel deployment logs: Dashboard → Deployments → Click on deployment → View logs
2. Check Neon database status: Neon Dashboard → Your database
3. Check function logs: Vercel Dashboard → Your project → Functions

---

**Last Updated**: Now
**Status**: Ready for Deployment
**Environment**: Vercel + Neon PostgreSQL
