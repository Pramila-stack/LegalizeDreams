# 🆓 100% FREE Render Deployment Guide

**Everything free. No paid subscriptions required.**

---

## Why This Works (Free Tier)

| Component | Provider | Cost | Why |
|-----------|----------|------|-----|
| **Web Service** | Render | 🆓 Free | Hibernates after 15 min, ~512MB RAM |
| **Database** | Supabase | 🆓 Free | 500MB PostgreSQL (plenty for e-commerce) |
| **Images** | Cloudinary | 🆓 Free | 10GB storage (way more than needed) |

**Total Cost: $0/month** ✅

---

## The Issue with Free Render Web Service

Render's free tier hibernates after 15 minutes of inactivity:
- ✅ Your app will start when someone visits
- ⏱️ First request takes 30-45 seconds (cold start)
- ✅ After that, instant loads
- 🔄 Goes to sleep again after 15 min no traffic

**This is fine for:** A personal project, hobby app, testing  
**Not ideal for:** High-traffic production  

**But completely acceptable for learning!**

---

## Quick Start (30 Minutes)

### Step 1: Create Supabase Account (5 min)

**Why Supabase instead of Render PostgreSQL?**
- Render PostgreSQL: $7.99/month
- Supabase PostgreSQL: Free (500MB)
- Supabase is managed by Supabase team, works seamlessly

1. Go to https://supabase.com
2. Sign up with GitHub (easiest)
3. Create new project
4. Wait 2 minutes for database to initialize
5. Go to **Project Settings** → **Database**
6. Copy the connection string (looks like: `postgresql://user:password@...`)

### Step 2: Create Cloudinary Account (5 min)

1. Go to https://cloudinary.com/users/register/free
2. Sign up
3. Go to **Dashboard** → Copy **Cloud Name**
4. Go to **Account** → Copy **API Key** and **API Secret**

### Step 3: Create Render Service (5 min)

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect GitHub → Select `LegalizeDreams`
4. Configure:
   ```
   Name:            legalizedreams-prod
   Build Command:   bash build.sh
   Start Command:   cd backend && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --timeout 60
   ```

### Step 4: Add Environment Variables (5 min)

**Generate random keys (run in terminal):**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Add to Render Environment:**

```
DEBUG=False
SECRET_KEY=[PASTE GENERATED KEY]
JWT_SECRET_KEY=[PASTE GENERATED KEY]
ALLOWED_HOSTS=your-app-name.onrender.com,localhost,127.0.0.1
DATABASE_URL=[PASTE FROM SUPABASE]
CORS_ALLOWED_ORIGINS=https://your-app-name.onrender.com,http://localhost:5173
CLOUDINARY_CLOUD_NAME=[FROM CLOUDINARY]
CLOUDINARY_API_KEY=[FROM CLOUDINARY]
CLOUDINARY_API_SECRET=[FROM CLOUDINARY]
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=[STRONG PASSWORD]
DJANGO_SUPERUSER_EMAIL=your@email.com
```

### Step 5: Deploy (10 min)

1. Render → **Deploys** tab
2. Click **Deploy Latest Commit**
3. Wait for **Live** status (3-5 minutes)
4. Visit your URL: `https://your-app-name.onrender.com`

---

## Free Tier Cold Start Explained

### First Request (Cold Start)
```
User visits website
    ↓
Render wakes up service (30-45 seconds)
    ↓
Django starts
    ↓
App loads ✅
```

### Subsequent Requests (Within 15 min)
```
User clicks something
    ↓
Instant response ✅
```

### After 15 Minutes Idle
```
No traffic for 15 minutes
    ↓
Service goes to sleep
    ↓
Next visitor triggers cold start again
```

---

## What Stays Free Forever

✅ **Database:** Supabase free tier persists data indefinitely (not ephemeral)  
✅ **Images:** Cloudinary free tier stores images indefinitely  
✅ **Web Service:** Render free tier (with hibernation)  
✅ **No surprise charges:** All truly free

---

## What If You Want Always-On Later?

When your app gets popular, upgrade to:
- Render Paid: $7/month (keeps service always running)
- OR Railway: $5/month (persistent PostgreSQL included)
- OR Fly.io: $5/month (persistent PostgreSQL included)

But **for now, free is perfect!**

---

## Complete Free Setup Checklist

### Phase 1: External Services (10 min)
- [ ] Create Supabase account → Copy DATABASE_URL
- [ ] Create Cloudinary account → Copy credentials
- [ ] Have GitHub credentials ready

### Phase 2: Render Deployment (10 min)
- [ ] Create Render Web Service
- [ ] Add 11 environment variables
- [ ] Click "Deploy Latest Commit"
- [ ] Wait for "Live" status

### Phase 3: Verification (5 min)
- [ ] Visit homepage (expect 30-45s first load)
- [ ] Test API endpoint
- [ ] Login to admin
- [ ] Upload product with image
- [ ] Refresh page (should be instant)

### Phase 4: Celebrate! 🎉
- [ ] Redeploy (data & images persist)
- [ ] Everything still works

---

## Supabase Setup Detailed

**Get Database URL:**

1. Login to https://app.supabase.com
2. Click your project
3. Go to **Settings** (gear icon)
4. Click **Database**
5. Find **Connection string** section
6. Toggle **"Show connection string"**
7. Copy the URI that looks like:
   ```
   postgresql://postgres.xxxxxx:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
8. Paste into Render `DATABASE_URL`

**That's it!** Supabase is production-ready PostgreSQL, free tier is solid.

---

## Performance Expectations

| Scenario | Performance |
|----------|-------------|
| **First visit** | 30-45 seconds (cold start) |
| **Repeated visits** | <500ms (instant) |
| **After 15 min idle** | 30-45 seconds (wakes up) |
| **Peak traffic** | Handles ~50 concurrent users |
| **Databases** | 500MB (Supabase) - plenty for 10K products |
| **Images** | 10GB (Cloudinary) - never fill this |

---

## Free Tier Limitations (Real Talk)

✅ **You get:** Persistent data, persistent images, working app, fast for active traffic  
❌ **You don't get:** Always-on service, premium support, custom domain SSL

**This is totally fine for:**
- Learning Django/React
- Building portfolio project
- Testing production deployment
- Hobby/personal e-commerce
- Small business (if you don't need 24/7)

---

## If You Upgrade Later (Optional)

### Render Paid Web Service ($7/month)
```
Upgrade Render to Standard plan
```
- Always running (no hibernation)
- Better resources (2GB RAM)
- Same setup, just flips a switch

### Keep Everything Else Free
- Supabase free still works
- Cloudinary free still works
- Just faster web service

---

## Alternative Free Providers (If Needed)

**If you want always-on + free database:**

### Railway
- Free tier: $5/month credit (covers most small apps)
- PostgreSQL free
- Better than Render for free tier

### Fly.io
- Free tier: 3 shared instances
- PostgreSQL free
- More generous free tier

**But Render + Supabase + Cloudinary is totally solid for free.**

---

## What's the Catch?

**Render free tier:**
- Hibernates after 15 min (expected behavior)
- Limited resources (fine for this app)
- No guaranteed uptime (fine for hobby project)
- No email support (but docs are good)

**Supabase free tier:**
- 500MB storage (enough for 100K+ products)
- No guaranteed uptime SLA (but it's reliable)
- Community support (sufficient)

**Cloudinary free tier:**
- 10GB storage (probably won't fill)
- 25M transformations/month (more than enough)
- Auto-optimization (a feature, not a limitation)

**No gotchas. All genuine free tiers.**

---

## Deployment Command Reference

```bash
# Generate SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Run locally to test everything first
cd backend
python manage.py migrate
python manage.py runserver

cd ../frontend
npm run dev
```

---

## Troubleshooting

### Service still sleeping after deploy
**Expected behavior.** First load after deploy takes 30-45s. This is normal.

### Database connection refused
**Fix:** Check `DATABASE_URL` from Supabase matches exactly (copy-paste, watch for truncation)

### Images not showing
**Fix:** Verify `CLOUDINARY_CLOUD_NAME` is set (not empty string)

### Getting 502 Bad Gateway
**Reason:** App is starting. Wait 30-45 seconds and refresh.

---

## Summary

| What | How | Cost |
|------|-----|------|
| Deploy | Render Web Service | 🆓 Free |
| Database | Supabase PostgreSQL | 🆓 Free |
| Images | Cloudinary | 🆓 Free |
| Domain | subdomain.onrender.com | 🆓 Free |
| Custom domain | Not included | Paid, optional |
| **Total** | **Everything working** | **$0** |

---

**You're all set for a 100% free production deployment!** 🚀

Follow RENDER_QUICK_START.md, but use Supabase for database instead of Render PostgreSQL, and you'll be live in 30 minutes at zero cost.
