# 🚀 Deploy to Vercel - Step by Step Guide
## For: https://sms1-f4f3.vercel.app

---

## ✅ STEP 1: Add Environment Variables to Vercel

1. Go to: **https://vercel.com/dashboard**
2. Click on your project: **sms1-f4f3**
3. Click **Settings** tab (top menu)
4. Click **Environment Variables** (left sidebar)

---

## 📋 STEP 2: Add These 6 Required Variables

### Variable 1:
- **Key:** `POSTGRES_PRISMA_URL`
- **Value:** 
  ```
  postgresql://neondb_owner:npg_ZLQXp7dK9Asc@ep-solitary-star-a1omvioc-pooler.ap-southeast-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
  ```
- **Environments:** Check ✓ Production, ✓ Preview, ✓ Development
- Click **Save**

### Variable 2:
- **Key:** `POSTGRES_URL_NON_POOLING`
- **Value:** 
  ```
  postgresql://neondb_owner:npg_ZLQXp7dK9Asc@ep-solitary-star-a1omvioc.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
  ```
- **Environments:** Check ✓ Production, ✓ Preview, ✓ Development
- Click **Save**

### Variable 3:
- **Key:** `DATABASE_URL`
- **Value:** 
  ```
  postgresql://neondb_owner:npg_ZLQXp7dK9Asc@ep-solitary-star-a1omvioc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
  ```
- **Environments:** Check ✓ Production, ✓ Preview, ✓ Development
- Click **Save**

### Variable 4:
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Environments:** Check ✓ Production only
- Click **Save**

### Variable 5:
- **Key:** `JWT_SECRET`
- **Value:** `amrita-vidyalayam-super-secret-key-2025-production`
- **Environments:** Check ✓ Production, ✓ Preview, ✓ Development
- Click **Save**

### Variable 6:
- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://sms1-f4f3.vercel.app`
- **Environments:** Check ✓ Production, ✓ Preview, ✓ Development
- Click **Save**

---

## 🔄 STEP 3: Redeploy Your Application

1. Go to **Deployments** tab (top menu)
2. Find your latest deployment
3. Click the **⋯** (three dots) menu on the right
4. Click **Redeploy**
5. Select **Use existing Build Cache** (faster)
6. Click **Redeploy** button
7. Wait 2-3 minutes for deployment to complete

---

## ✅ STEP 4: Test Your Deployment

### Test 1: Database Connection
Open this URL in your browser:
```
https://sms1-f4f3.vercel.app/api/test-db
```

**Expected Result:** JSON response showing:
```json
{
  "success": true,
  "message": "✅ Database connected successfully",
  "counts": {
    "users": 4,
    "students": ...,
    "teachers": ...
  }
}
```

### Test 2: Login Page
Open this URL:
```
https://sms1-f4f3.vercel.app/login
```

**Test Login:**
- Email: `admin@amrita.edu`
- Password: `admin123`
- Role: Select **Admin**
- Click **Sign In**

**Expected Result:** Should redirect to dashboard

### Test 3: Dashboard
After login, you should see:
- Welcome message with your name
- 4 stat cards (Students, Teachers, Classes, Library)
- Quick access buttons
- All navigation working

---

## 🔧 Optional: Add Email Configuration (for notifications)

If you want to send emails from the system:

### Variable 7 (Optional):
- **Key:** `EMAIL_HOST`
- **Value:** `smtp.gmail.com`

### Variable 8 (Optional):
- **Key:** `EMAIL_PORT`
- **Value:** `587`

### Variable 9 (Optional):
- **Key:** `EMAIL_USER`
- **Value:** `kaarthii009.g@gmail.com`

### Variable 10 (Optional):
- **Key:** `EMAIL_PASSWORD`
- **Value:** (Your Gmail App Password)
  
**How to get Gmail App Password:**
1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not enabled)
3. Go to: https://myaccount.google.com/apppasswords
4. Create new app password for "Mail"
5. Copy the 16-character password
6. Paste it as EMAIL_PASSWORD value

---

## 🚨 Troubleshooting

### Problem: "Database connection failed"
**Solution:**
1. Check Neon database is active (not suspended)
2. Go to Neon dashboard: https://console.neon.tech
3. Check if database is sleeping (free tier)
4. Click on database to wake it up
5. Redeploy on Vercel

### Problem: "Login not working"
**Solution:**
1. Check all 6 environment variables are added
2. Check no extra spaces in values
3. Redeploy after adding variables
4. Clear browser cache and try again

### Problem: "Build failed"
**Solution:**
1. Check Vercel deployment logs
2. Look for error messages
3. Most common: Missing environment variables
4. Add missing variables and redeploy

### Problem: "API routes returning 500 error"
**Solution:**
1. Check function logs in Vercel dashboard
2. Go to: Project → Deployments → Click deployment → Functions
3. Look for specific error messages
4. Usually database connection or missing env vars

---

## 📱 Mobile Access

Your app is now accessible from:
- **Desktop:** https://sms1-f4f3.vercel.app
- **Mobile:** https://sms1-f4f3.vercel.app
- **Tablet:** https://sms1-f4f3.vercel.app

Share this URL with your school administrators and teachers!

---

## 🎯 Quick Checklist

- [ ] Added all 6 required environment variables
- [ ] Redeployed the application
- [ ] Tested database connection (/api/test-db)
- [ ] Tested login with admin credentials
- [ ] Checked dashboard loads correctly
- [ ] Tested navigation between modules
- [ ] Shared URL with team members

---

## 📞 Need Help?

If you encounter any issues:
1. Check Vercel deployment logs
2. Check Neon database status
3. Verify all environment variables are correct
4. Try redeploying
5. Check browser console for errors (F12)

---

**Your App URL:** https://sms1-f4f3.vercel.app
**Database:** Neon PostgreSQL (Singapore region)
**Status:** Ready to deploy! 🚀

Follow the steps above and your app will be live in 5 minutes!
