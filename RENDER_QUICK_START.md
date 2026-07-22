# 🚀 Render Deployment Quick Start

**Follow these steps to deploy your e-commerce app in 30 minutes.**

---

## ✅ Checklist

### Phase 1: Setup External Services (10 min)

- [ ] **Create Cloudinary Account** (free, for persistent images)
  - Go to https://cloudinary.com/users/register/free
  - Sign up and verify email
  - Note: Cloud Name, API Key, API Secret (from Dashboard → Account)

- [ ] **GitHub is already set up**
  - ✓ Repository: https://github.com/Pramila-stack/LegalizeDreams
  - ✓ Branch: main
  - ✓ All files committed

### Phase 2: Create Render Service (5 min)

- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub & select `LegalizeDreams` repository
- [ ] Configure:
  - Name: `legalizedreams-prod`
  - Build Command: `bash build.sh`
  - Start Command: `cd backend && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --timeout 60`

### Phase 3: Add PostgreSQL Database (3 min)

- [ ] Scroll to "Add PostgreSQL" on service page
- [ ] Create database (free tier)
- [ ] **Copy `DATABASE_URL`** from credentials

### Phase 4: Add Environment Variables (5 min)

**Generate random keys (run in terminal):**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Add these to Render Environment (Service → Environment):**

```
DEBUG=False
SECRET_KEY=[PASTE GENERATED KEY HERE]
JWT_SECRET_KEY=[PASTE GENERATED KEY HERE]
ALLOWED_HOSTS=legalizedreams-prod.onrender.com,localhost,127.0.0.1
DATABASE_URL=[PASTE FROM POSTGRESQL]
CORS_ALLOWED_ORIGINS=https://legalizedreams-prod.onrender.com,http://localhost:5173
CLOUDINARY_CLOUD_NAME=[FROM CLOUDINARY]
CLOUDINARY_API_KEY=[FROM CLOUDINARY]
CLOUDINARY_API_SECRET=[FROM CLOUDINARY]
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=[CHOOSE STRONG PASSWORD]
DJANGO_SUPERUSER_EMAIL=your-email@example.com
```

**Save all variables.**

### Phase 5: Deploy! (5 min)

- [ ] Go to Render service → "Deploys" tab
- [ ] Click "Deploy Latest Commit"
- [ ] Wait for "Live" status (should take 3-5 minutes)
- [ ] Watch logs for errors

### Phase 6: Verify Deployment ✅

- [ ] **Homepage:** https://legalizedreams-prod.onrender.com
  - ✓ Hero section loads
  - ✓ Categories visible
  - ✓ Products displayed

- [ ] **API:** https://legalizedreams-prod.onrender.com/api/products/
  - ✓ Returns JSON with products

- [ ] **Admin:** https://legalizedreams-prod.onrender.com/admin/
  - ✓ Login with admin/[your password]
  - ✓ Can see categories and products

- [ ] **Images Work:**
  - ✓ Upload product with image in admin
  - ✓ Image appears in product detail
  - ✓ Image URL shows `cloudinary.com` domain

- [ ] **Images Persist:**
  - ✓ Redeploy service
  - ✓ Images still appear (Cloudinary external storage)

---

## 🎯 If Something Goes Wrong

### Build Fails

**Check logs for:**
```
ModuleNotFoundError: No module named X
→ Fix: Add to backend/requirements.txt, commit, redeploy

Database connection refused
→ Fix: Verify DATABASE_URL is set and correct, redeploy

Timeout after 3 minutes
→ Fix: Service is overloaded; retry deployment
```

### Homepage Blank, No Products

**Check browser console (F12):**
```
CORS error?
→ Fix: Verify CORS_ALLOWED_ORIGINS in Render includes your domain

404 on /api/products?
→ Fix: Check Django logs; migrations may have failed
```

### Images Show Broken Link

**Check admin product:**
```
If Cloudinary credentials missing
→ Fix: Add CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET to Render

If URL shows localhost:8000
→ Fix: Backend is using dev .env; need production DATABASE_URL set
```

---

## 📊 Architecture Summary

```
Your Render Service:
├─ Frontend (React)
│  └─ Built by: npm run build → dist/ → Django static/
├─ Backend (Django)
│  ├─ REST API endpoints
│  ├─ Admin panel
│  └─ User authentication
├─ Database (PostgreSQL)
│  └─ Stores products, orders, users
└─ Media Storage (Cloudinary)
   └─ Stores product images (persistent!)
```

**Why This Works:**
- ✅ Single service = lower cost, no coordination
- ✅ PostgreSQL = data survives redeploys
- ✅ Cloudinary = images persist (ephemeral filesystem doesn't matter)
- ✅ WhiteNoise = fast static file serving
- ✅ Gunicorn = production-grade WSGI server

---

## 📚 Full Documentation

**See `DEPLOYMENT_GUIDE.md` for:**
- Detailed step-by-step instructions
- Screenshots
- Troubleshooting guide
- Performance tips
- Custom domain setup

---

## ⏱️ Timeline

| Phase | Time | Status |
|-------|------|--------|
| Setup Cloudinary | 5 min | Now |
| Create Render service | 5 min | After Step 1 |
| Add database | 3 min | After Step 2 |
| Add env vars | 5 min | After Step 3 |
| Deploy | 5 min | After Step 4 |
| **Total** | **~23 minutes** | ✅ Live! |

---

## 🎉 Success Indicators

When you see these, you're done:

- ✅ Service status: "Live" (green)
- ✅ Homepage: Categories and products load
- ✅ API: `/api/products/` returns JSON
- ✅ Admin: Login works
- ✅ Images: Appear and URL shows `cloudinary.com`
- ✅ Persists: Image still there after redeploy

---

**Questions? See `DEPLOYMENT_GUIDE.md` for detailed help.**

**Your app is live! 🚀**
