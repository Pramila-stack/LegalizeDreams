# Render Deployment Guide: Single Deployment (Django + React)

**Last Updated:** 2026-07-22  
**Architecture:** Single Render service with Django serving React SPA + REST API  
**Target:** Free tier ($0/month with $7.99 PostgreSQL)  

---

## Why This Architecture?

### ✅ Benefits
- **Simpler:** One service, one deployment, no frontend/backend coordination
- **Cheaper:** Single database, single service
- **Faster:** No API latency between frontend and backend (same origin)
- **Easier Auth:** CSRF tokens, session cookies work naturally

### Single Deployment Process
```
GitHub Push → Render Build
  ├─ Run build.sh
  │   ├─ npm ci + npm run build (React)
  │   ├─ Copy dist/ to Django static/
  │   ├─ pip install requirements
  │   └─ Migrations + collectstatic
  └─ Start Gunicorn (serves React + API)
```

---

## Prerequisites

1. **GitHub Account** — Code already pushed
2. **Render Account** — Free tier available
3. **Cloudinary Account** — Free 10GB storage for images
4. **Domain/Email** — Optional but recommended

---

## Step 1: Set Up Cloudinary (For Persistent Images)

### Why Cloudinary?
- ✅ Render's free tier has **ephemeral filesystem** (files deleted on redeploy)
- ✅ Database stores file references; Cloudinary stores actual images
- ✅ Free tier: 10GB storage, 25M transformations/month (plenty for e-commerce)
- ✅ Auto-optimization and CDN (images load faster)

### Setup (5 minutes)

1. **Create Account:** https://cloudinary.com/users/register/free
2. **Verify Email** and login
3. **Get Credentials:**
   - Click your profile (top-right)
   - Copy `Cloud Name`
   - Go to Dashboard → Account → API Environment variable
   - Copy `API Key` and `API Secret`
4. **Keep Safe:** You'll add these to Render in Step 3

---

## Step 2: Create Render Service

### 2.1 Connect GitHub Repo

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect account"** (if needed) → Authorize GitHub
4. Select repository: `LegalizeDreams`
5. Select branch: `main`
6. Click **"Connect"**

### 2.2 Configure Service

| Setting | Value |
|---------|-------|
| **Name** | `legalizedreams-prod` |
| **Runtime** | `Python 3` |
| **Region** | (Select closest to users) |
| **Branch** | `main` |
| **Build Command** | `bash build.sh` |
| **Start Command** | `cd backend && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --timeout 60` |

---

## Step 3: Add PostgreSQL Database

### 3.1 Create Database

1. **While on service page**, scroll down → **"Add PostgreSQL"**
2. Configure:
   - **Name:** (auto-filled, e.g., `legalizedreams-prod-db`)
   - **Database:** (auto-filled)
   - **User:** (auto-filled)
   - **Version:** `15` (or latest)
   - **Plan:** Free tier
3. Click **"Create Database"**
4. Wait 2-3 minutes for database to initialize
5. Copy the **`DATABASE_URL`** from the database credentials page (you'll paste this in Step 4)

---

## Step 4: Configure Environment Variables

### 4.1 Get Values

**Generate New Keys:**
```bash
# In terminal, run this to generate random keys:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
(Run twice, once for SECRET_KEY, once for JWT_SECRET_KEY)

**Collect from Services:**
- PostgreSQL DATABASE_URL → From database credentials
- Cloudinary credentials → From Step 1
- Your domain → Will be `https://legalizedreams-prod.onrender.com` (or custom domain)

### 4.2 Add to Render

1. On Render dashboard, go to your service → **"Environment"**
2. Click **"Add Environment Variable"** and add these:

| Variable | Value |
|----------|-------|
| `DEBUG` | `False` |
| `SECRET_KEY` | (Paste from generator above) |
| `JWT_SECRET_KEY` | (Paste from generator above) |
| `ALLOWED_HOSTS` | `legalizedreams-prod.onrender.com,localhost,127.0.0.1` |
| `DATABASE_URL` | (Paste from PostgreSQL credentials) |
| `CORS_ALLOWED_ORIGINS` | `https://legalizedreams-prod.onrender.com,http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | (From Cloudinary dashboard) |
| `CLOUDINARY_API_KEY` | (From Cloudinary dashboard) |
| `CLOUDINARY_API_SECRET` | (From Cloudinary dashboard) |
| `DJANGO_SUPERUSER_USERNAME` | `admin` |
| `DJANGO_SUPERUSER_PASSWORD` | (Choose strong password) |
| `DJANGO_SUPERUSER_EMAIL` | (Your email) |

**Important:** Click **"Save"** after each addition (or add all, then save once)

---

## Step 5: Deploy

### 5.1 Trigger Deployment

1. Go to service → **"Deploys"** tab
2. Click **"Deploy Latest Commit"**
3. Watch logs for:
   ```
   ✓ React build successful
   ✓ Django migrations applied
   ✓ Collecting static files
   ✓ Admin user created
   ✓ Gunicorn listening at 0.0.0.0:10000
   ```

### 5.2 Expected Logs (Good Signs)

```
=== BUILDING REACT FRONTEND ===
✓ Successfully compiled

=== COPYING REACT BUILD TO DJANGO ===
✓ Files copied

=== INSTALLING DJANGO DEPENDENCIES ===
✓ Successfully installed

=== DJANGO SETUP ===
✓ 176 static files collected
✓ Migrations applied
✓ Admin user created

=== BUILD COMPLETE ===
```

### 5.3 If Build Fails

Check logs for:
- **"No such file or directory build.sh"** → Push files to GitHub
- **"ModuleNotFoundError"** → Missing package in requirements.txt
- **"Database connection refused"** → DATABASE_URL not set correctly
- **Timeout after 3 minutes** → Increase timeout or reduce build steps

**Fix and Retry:**
```bash
git add -A && git commit -m "fix: deployment issue" && git push origin main
```
Then click **"Deploy Latest Commit"** in Render.

---

## Step 6: Verify Deployment

### 6.1 Test Homepage
```
https://legalizedreams-prod.onrender.com/
```

Expected: ✅ Hero section, categories, featured products, FAQ

### 6.2 Test API
```
https://legalizedreams-prod.onrender.com/api/products/
https://legalizedreams-prod.onrender.com/api/categories/
```

Expected: ✅ JSON responses with data

### 6.3 Test Admin Panel
```
https://legalizedreams-prod.onrender.com/admin/
```

Login with credentials from `DJANGO_SUPERUSER_USERNAME/PASSWORD`  
Expected: ✅ Can access categories, products, orders

### 6.4 Test Image Upload

1. **In Admin:** Add a product with image
2. **In Frontend:** Browse to product
3. **Inspect:** Right-click image → Inspect → Check URL
4. **Expected URL pattern:** `https://res.cloudinary.com/your-cloud-name/...`

---

## Step 7: Handle Persistent Storage (Images)

### Architecture Overview

```
User Upload
    ↓
Django (admin/API)
    ↓
Cloudinary Storage
    ↓
Database Record (stores Cloudinary URL)
    ↓
Frontend renders <img src="cloudinary-url" />
```

### Why This Works

1. **User uploads image** → Django receives file
2. **django-cloudinary-storage** intercepts → Uploads to Cloudinary
3. **Stores URL** in database (e.g., `https://res.cloudinary.com/.../product.jpg`)
4. **Frontend renders** the Cloudinary URL
5. **On redeploy:** URLs persist (Cloudinary external storage)

### Verification

1. Upload product with image in admin
2. Redeploy service (no data loss!)
3. Image still appears

---

## Database Strategy: PostgreSQL vs SQLite

| Aspect | SQLite | PostgreSQL |
|--------|--------|-----------|
| **Storage** | Ephemeral (lost on redeploy) | Persistent (Render managed) |
| **Images** | Lost | Database links persist; Cloudinary stores images |
| **Data** | Lost | Preserved ✅ |
| **Cost** | Free | $7.99/month |
| **Best For** | Development only | Production ✅ |

**Recommendation:** ✅ **PostgreSQL + Cloudinary**
- Database survives redeploys
- Images persisted in Cloudinary
- Low cost ($8/month)
- Production-grade reliability

---

## Troubleshooting

### Issue: Homepage blank, no products showing

**Cause:** Frontend can't reach API (CORS or URL mismatch)  
**Fix:**
1. Check browser DevTools Console for errors
2. Verify `CORS_ALLOWED_ORIGINS` includes `https://legalizedreams-prod.onrender.com`
3. Restart service (Settings → Manual restart)

### Issue: Images show broken link icon

**Cause:** Cloudinary not configured  
**Fix:**
1. Verify `CLOUDINARY_CLOUD_NAME` is set (not empty)
2. Check credentials are correct
3. Re-add product with image (should upload to Cloudinary now)

### Issue: Admin panel shows 500 error

**Cause:** Settings.py error or missing app  
**Fix:**
1. Check logs for specific error
2. Verify all environment variables are set
3. May need to clear browser cache

### Issue: "Port 10000 already in use"

**Cause:** Previous instance didn't shut down  
**Fix:** Render handles automatically on redeploy. Wait 2 minutes for old instance to terminate.

### Issue: Deployment timeout

**Cause:** Build takes >30 minutes (React build slow)  
**Fix:**
1. Check frontend build isn't installing from scratch each time
2. Use `npm ci` (already in build.sh) instead of `npm install`
3. Clear browser cache to speed downloads

---

## Post-Deployment Checklist

- ✅ Service status shows "Live" (green)
- ✅ Homepage loads with hero, categories, products
- ✅ Images appear (check Cloudinary URLs in DevTools)
- ✅ API endpoints return JSON (`/api/products/`, `/api/categories/`)
- ✅ Admin panel accessible and functional
- ✅ Can add/edit products in admin
- ✅ Images persist after redeploy
- ✅ No console errors in browser DevTools

---

## Performance Tips (Free Tier)

1. **Keep active:** Render free instances spin down after 15 mins of inactivity (cold start ~30s)
2. **Image optimization:** Cloudinary auto-optimizes images by 50-80%
3. **Database:** PostgreSQL free tier has 256MB storage (enough for ~10K products)
4. **Static files:** WhiteNoise caches and compresses (already configured)

---

## Next Steps (When Ready)

1. **Custom Domain:** Render → Settings → Add domain (costs $7/month with SSL)
2. **Email Notifications:** Add service like SendGrid for order confirmations
3. **Monitoring:** Render dashboard shows error rates, logs, resource usage
4. **Upgrades:** When you outgrow free tier, upgrade to Render Standard ($7+)

---

## Support & Documentation

- **Render Docs:** https://render.com/docs
- **Django Docs:** https://docs.djangoproject.com/en/4.2/
- **Cloudinary Docs:** https://cloudinary.com/documentation

---

**You're all set! Your e-commerce app is now live on Render with persistent images.** 🎉
