# Render Deployment Setup Guide

## Issues Found & Fixed

Your Django backend was returning "not found" because:

### ❌ Problems Fixed in Code
1. **No root endpoint** - When visiting https://legalizedreams.onrender.com/, Django had no URL pattern for `/`
   - ✅ **Fixed:** Added API root endpoint that displays all available endpoints
   
2. **Duplicate STATIC_ROOT** - Defined twice in settings.py
   - ✅ **Fixed:** Removed duplicate definition

3. **Missing documentation** - No clear production configuration guide
   - ✅ **Fixed:** Updated `.env.example` with production comments

### ⚠️ Issues Requiring Manual Render Configuration
These require you to update environment variables in your Render dashboard (NOT the local .env file):

## Required Render Environment Variables

You must set these in your [Render Dashboard](https://dashboard.render.com/) → Your Service → Environment:

### 1. **DEBUG** (CRITICAL - Currently Wrong)
```
DEBUG=False
```
- Local .env has `DEBUG=True` (this is fine for development)
- Render needs `DEBUG=False` to hide sensitive information
- If DEBUG=True in production, stack traces expose your code structure

### 2. **ALLOWED_HOSTS** (CRITICAL - Currently Wrong)
```
ALLOWED_HOSTS=localhost,127.0.0.1,legalizedreams.onrender.com
```
- Your local .env only has: `localhost,127.0.0.1`
- Django rejects requests from domains NOT in ALLOWED_HOSTS
- This was likely causing your "not found" error
- Add `legalizedreams.onrender.com` (the domain showing as "live")

### 3. **CORS_ALLOWED_ORIGINS**
```
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```
- Currently only has: `http://localhost:5173`
- When your frontend is deployed to Vercel/Netlify, update this to: `https://your-frontend-domain.com`
- This prevents API calls from unauthorized domains

### 4. **SECRET_KEY** (Already Set ✅)
- Keep your current secret key (auto-configured on Render)

### 5. **DATABASE_URL** (Auto-Configured ✅)
- Render automatically provides PostgreSQL
- Remove or ignore SQLite configuration
- Render sets this automatically when you add PostgreSQL addon

### 6. **JWT Configuration** (Already Set ✅)
```
JWT_SECRET_KEY=[your-secret-key]
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=7
```

---

## Step-by-Step: Update Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click your backend service (likely named "legalizedreams" or similar)
3. Click **Environment** in the left sidebar
4. Update these variables:
   
   | Variable | Value |
   |----------|-------|
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `localhost,127.0.0.1,legalizedreams.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` |

5. Click **Save Changes**
6. Render will automatically redeploy your service

---

## After Updating Environment Variables

**Your site should now work!** Visit: https://legalizedreams.onrender.com/

You should see:
```json
{
  "message": "LEGALIZE DREAMS API",
  "version": "1.0",
  "status": "online",
  "endpoints": {
    "admin": "/admin/",
    "auth": "/api/auth/",
    "products": "/api/products/",
    "categories": "/api/categories/",
    "orders": "/api/orders/",
    "cart": "/api/cart/"
  }
}
```

---

## Testing the API Endpoints

Once the root endpoint works, test these:

### Categories
```bash
curl https://legalizedreams.onrender.com/api/categories/
```

### Products
```bash
curl https://legalizedreams.onrender.com/api/products/
```

### Admin Panel
```
https://legalizedreams.onrender.com/admin/
# Login with: admin / admin123
```

---

## Deploying Your Frontend

When you deploy your frontend to Vercel/Netlify:

1. Set your frontend's API URL environment variable:
   ```
   VITE_API_URL=https://legalizedreams.onrender.com/api
   ```

2. Update Render's `CORS_ALLOWED_ORIGINS` to include your frontend URL:
   ```
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://your-frontend-domain.com
   ```

3. Redeploy backend after updating CORS

---

## Troubleshooting

### Still Getting "Not Found"?
1. Verify you're visiting: `https://legalizedreams.onrender.com/` (with trailing slash)
2. Check that you've set `ALLOWED_HOSTS` correctly in Render dashboard
3. Check that `DEBUG=False` is set (not `True`)
4. Wait ~1 minute after saving environment variables (Render redeploys)

### API Returns 404 for /api/products/
- Check that `DEBUG=False` (if True, Render shows verbose error page)
- Verify database migrations ran (happens in build.sh)
- Check Render's logs for errors

### CORS errors in browser console
- Frontend URL not in `CORS_ALLOWED_ORIGINS`
- Update in Render dashboard and redeploy

### Database errors
- Render provides PostgreSQL automatically
- No action needed - it's already configured via DATABASE_URL

---

## Local Development (No Changes Needed)

Your local `.env` file is correct for development:
```bash
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
DATABASE_URL=sqlite:///db.sqlite3
```

Just run:
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

---

## Summary

| Environment | Variable | Value |
|-------------|----------|-------|
| **Local Dev** | DEBUG | True |
| **Local Dev** | ALLOWED_HOSTS | localhost,127.0.0.1 |
| **Render Prod** | DEBUG | False ⚠️ SET THIS |
| **Render Prod** | ALLOWED_HOSTS | localhost,127.0.0.1,legalizedreams.onrender.com ⚠️ SET THIS |
| **Render Prod** | CORS_ALLOWED_ORIGINS | http://localhost:5173,http://localhost:3000 ⚠️ UPDATE WHEN FRONTEND DEPLOYED |

The code is ready. You just need to update the Render environment variables!
