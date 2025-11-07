#!/bin/bash

# Ethereal Treasure Market - Deployment Script
# This script is called by GitHub Actions to deploy the application

set -e  # Exit on error

echo "=========================================="
echo "🚀 Starting Deployment"
echo "=========================================="
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

echo "→ Application directory: $APP_DIR"
cd "$APP_DIR"

# Step 1: Pull latest code
echo ""
echo "→ Step 1: Pulling latest code from Git..."
git fetch origin
git reset --hard origin/main
git clean -fd
echo "✓ Code updated"

# Step 2: Clean npm cache and node_modules to avoid permission issues
echo ""
echo "→ Step 2: Cleaning old dependencies..."
rm -rf node_modules
rm -rf frontend/node_modules
rm -rf backend/node_modules
rm -rf package-lock.json
rm -rf frontend/package-lock.json
rm -rf backend/package-lock.json
echo "✓ Old dependencies cleaned"

# Step 3: Install dependencies with clean slate
echo ""
echo "→ Step 3: Installing dependencies..."
npm install --legacy-peer-deps
cd frontend && npm install --legacy-peer-deps
cd ../backend && npm install --legacy-peer-deps
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
if pm2 describe ethereal-backend > /dev/null 2>&1; then
    echo "  Restarting existing PM2 process..."
    pm2 restart ethereal-backend
else
    echo "  Starting new PM2 process..."
    cd backend
    pm2 start server/index.ts --name "ethereal-backend" --interpreter tsx
    cd ..
fi
pm2 save
echo "✓ Backend restarted"

# Step 6: Restart Nginx (if available)
echo ""
echo "→ Step 6: Restarting Nginx..."
if command -v nginx > /dev/null 2>&1; then
    if command -v systemctl > /dev/null 2>&1; then
        sudo systemctl restart nginx || echo "  ⚠️  Could not restart Nginx (may need sudo)"
    else
        sudo service nginx restart || echo "  ⚠️  Could not restart Nginx (may need sudo)"
    fi
    echo "✓ Nginx restarted"
else
    echo "  ℹ️  Nginx not found, skipping..."
fi

# Step 7: Verification
echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "→ Checking services..."
pm2 status | grep ethereal-backend || echo "  ⚠️  Backend not found in PM2"

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
echo "  pm2 logs ethereal-backend"
echo ""
