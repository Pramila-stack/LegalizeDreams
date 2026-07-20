#!/usr/bin/env bash
set -o errexit

echo "=== BUILDING REACT FRONTEND ==="
cd frontend
npm install
npm run build
cd ..

echo "=== COPYING REACT BUILD TO DJANGO ==="
mkdir -p backend/staticfiles
cp -r frontend/dist/* backend/staticfiles/

echo "=== INSTALLING DJANGO DEPENDENCIES ==="
cd backend
pip install -r requirements.txt

echo "=== DJANGO SETUP ==="
python manage.py collectstatic --noinput
python manage.py migrate
python manage.py init_admin

echo "=== BUILD COMPLETE ==="
cd ..
