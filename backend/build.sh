#!/usr/bin/env bash
set -o errexit

echo "=== Building React Frontend ==="
cd frontend
npm ci
npm run build
cd ..

echo "=== Copying React build to Django static/ ==="
mkdir -p backend/static
rm -rf backend/static/*
cp -r frontend/dist/* backend/static/

echo "=== Installing Python dependencies ==="
cd backend
pip install -r requirements.txt

echo "=== Running Django setup ==="
python manage.py collectstatic --noinput
python manage.py migrate
python manage.py init_admin

echo "=== Build complete ==="
