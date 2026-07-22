#!/usr/bin/env bash
set -o errexit

echo "========================================="
echo "1. BUILDING REACT FRONTEND"
echo "========================================="
cd frontend
npm ci  # Use npm ci for reproducible installs (better than npm install)
npm run build
cd ..

echo ""
echo "========================================="
echo "2. COPYING REACT BUILD TO DJANGO"
echo "========================================="
mkdir -p backend/static
rm -rf backend/static/*
cp -r frontend/dist/* backend/static/

echo ""
echo "========================================="
echo "3. INSTALLING DJANGO DEPENDENCIES"
echo "========================================="
cd backend
pip install -r requirements.txt

echo ""
echo "========================================="
echo "4. DJANGO SETUP"
echo "========================================="
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo ""
echo "Running migrations..."
python manage.py migrate

echo ""
echo "Creating initial admin & sample data..."
python manage.py init_admin

echo ""
echo "========================================="
echo "BUILD COMPLETE - READY FOR DEPLOYMENT"
echo "========================================="
cd ..
