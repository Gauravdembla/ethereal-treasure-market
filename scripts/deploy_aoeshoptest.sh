#!/bin/bash

# Deployment script for aoeshoptest on Hostinger VPS
# This script should be placed at ~/deploy_aoeshoptest.sh on the server

set -e  # Exit on error

echo "=========================================="
echo "🚀 Starting aoeshoptest Deployment"
echo "=========================================="
echo ""

# Configuration - Update these paths as needed
APP_DIR="/home/aoeshoptest/htdocs/aoeshoptest.angelsonearthhub.com"
PM2_APP_NAME="aoeshoptest-backend"

echo "→ Application directory: $APP_DIR"
cd "$APP_DIR"

# Step 1: Pull latest code
echo ""
echo "→ Step 1: Pulling latest code from Git..."
git fetch origin
git reset --hard origin/main  # or origin/development
echo "✓ Code updated"

# Step 2: Clean old dependencies
echo ""
echo "→ Step 2: Cleaning old dependencies..."
rm -rf node_modules
rm -rf frontend/node_modules
rm -rf backend/node_modules
echo "✓ Old dependencies cleaned"

# Step 3: Install dependencies (skip platform-specific optional packages)
echo ""
echo "→ Step 3: Installing dependencies..."
export NPM_CONFIG_OPTIONAL=false

# Try npm ci first (faster), fall back to npm install
npm ci --no-optional || npm install --no-optional --legacy-peer-deps

cd frontend
npm ci --no-optional || npm install --no-optional --legacy-peer-deps
cd ..

cd backend
npm ci --no-optional || npm install --no-optional --legacy-peer-deps
cd ..

echo "✓ Dependencies installed"

# Step 4: Build frontend
echo ""
echo "→ Step 4: Building frontend..."
cd frontend
npm run build
cd ..
echo "✓ Frontend built"

# Step 5: Restart backend with PM2
echo ""
echo "→ Step 5: Restarting backend..."
if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
    echo "  Restarting existing PM2 process..."
    pm2 restart "$PM2_APP_NAME"
else
    echo "  Starting new PM2 process..."
    cd backend
    pm2 start server/index.ts --name "$PM2_APP_NAME" --interpreter tsx
    cd ..
fi
pm2 save
echo "✓ Backend restarted"

# Step 6: Verification
echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "→ Checking services..."
pm2 status | grep "$PM2_APP_NAME" || echo "  ⚠️  Backend not found in PM2"

echo ""
echo "→ Testing backend health..."
sleep 2
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "✓ Backend health check passed"
else
    echo "⚠️  Backend health check failed (may still be starting)"
fi

echo ""
echo "🎉 Deployment completed at $(date)"
echo ""
echo "To view logs:"
echo "  pm2 logs $PM2_APP_NAME"
echo ""

