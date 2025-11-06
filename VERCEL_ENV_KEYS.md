# Vercel Environment Variables - Key & Value Pairs

## Copy these EXACTLY to Vercel Dashboard → Settings → Environment Variables

---

## DATABASE CONFIGURATION

**Key:** `POSTGRES_PRISMA_URL`  
**Value:** `postgresql://neondb_owner:npg_ZLQXp7dK9Asc@ep-solitary-star-a1omvioc-pooler.ap-southeast-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require`

**Key:** `POSTGRES_URL_NON_POOLING`  
**Value:** `postgresql://neondb_owner:npg_ZLQXp7dK9Asc@ep-solitary-star-a1omvioc.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

**Key:** `DATABASE_URL`  
**Value:** `postgresql://neondb_owner:npg_ZLQXp7dK9Asc@ep-solitary-star-a1omvioc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

---

## APPLICATION CONFIGURATION

**Key:** `NODE_ENV`  
**Value:** `production`

**Key:** `JWT_SECRET`  
**Value:** `amrita-vidyalayam-super-secret-key-2025-production`

**Key:** `NEXT_PUBLIC_APP_URL`  
**Value:** `https://sms1-f4f3.vercel.app`

---

## OPTIONAL (Email Configuration)

**Key:** `EMAIL_HOST`  
**Value:** `smtp.gmail.com`

**Key:** `EMAIL_PORT`  
**Value:** `587`

**Key:** `EMAIL_USER`  
**Value:** `kaarthii009.g@gmail.com`

**Key:** `EMAIL_PASSWORD`  
**Value:** `your-gmail-app-password` *(Generate from Google Account → Security → 2-Step Verification → App passwords)*

---

## OPTIONAL (SMS Configuration)

**Key:** `SMS_API_KEY`  
**Value:** `your-sms-api-key`

**Key:** `SMS_SENDER_ID`  
**Value:** `AMRITA`

---

## HOW TO ADD TO VERCEL:

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar
5. For each key-value pair above:
   - Click **Add New**
   - Enter the **Key** (exactly as shown)
   - Enter the **Value** (exactly as shown)
   - Select environments: **Production**, **Preview**, **Development** (check all)
   - Click **Save**
6. After adding all variables, go to **Deployments** tab
7. Click the **...** menu on latest deployment
8. Click **Redeploy** → **Use existing Build Cache** → **Redeploy**

---

## VERIFY SETUP:

After deployment, test these URLs:

1. **Database Test:**
   ```
   https://sms1-f4f3.vercel.app/api/test-db
   ```
   Should show: "Database connected successfully"

2. **Login Test:**
   ```
   https://sms1-f4f3.vercel.app/login
   ```
   Login with: admin@amrita.edu / admin123

---

## TROUBLESHOOTING:

### If login fails:
- Check POSTGRES_PRISMA_URL is correct
- Check JWT_SECRET is set
- Check all variables have no extra spaces
- Redeploy after adding variables

### If database connection fails:
- Verify Neon database is not suspended (free tier)
- Check connection string has no typos
- Test connection string in local .env file first

---

**IMPORTANT:** 
- Copy values EXACTLY as shown (no extra spaces)
- Don't forget to select all environments when adding
- Always redeploy after adding/changing env variables
