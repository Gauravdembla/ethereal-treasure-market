#!/bin/bash

# Deploy Local Code to Hostinger VPS
# This script syncs your current local code (main branch) to the VPS

set -e

VPS_IP="91.108.105.252"
VPS_USER="root"
REMOTE_DIR="/root/angelmarket-test"
LOCAL_DIR="/Users/nishchaynagpal/Desktop/ethereal-treasure-market"

echo "=========================================="
echo "🚀 Deploying Local Code (main branch) to VPS"
echo "=========================================="
echo ""
echo "Local:  $LOCAL_DIR (main branch)"
echo "Remote: $VPS_USER@$VPS_IP:$REMOTE_DIR"
echo ""
echo "⚠️  This will deploy your current local changes!"
echo ""

# Step 1: Sync code using rsync (excludes node_modules, .git, etc.)
echo "📦 Step 1: Syncing code to VPS..."
echo ""

rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude 'build' \
  --exclude '.env' \
  --exclude '.DS_Store' \
  --exclude 'coverage' \
  --exclude '.vscode' \
  --exclude '.idea' \
  --exclude '*.log' \
  "$LOCAL_DIR/" "$VPS_USER@$VPS_IP:$REMOTE_DIR/"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Code synced successfully!"
    echo ""
else
    echo ""
    echo "❌ Failed to sync code"
    exit 1
fi

# Step 2: SSH and run deployment commands
echo "=========================================="
echo "📋 Step 2: Building and deploying on VPS..."
echo "=========================================="
echo ""

ssh "$VPS_USER@$VPS_IP" << 'ENDSSH'
set -e

APP_DIR="/root/angelmarket-test"
cd $APP_DIR

echo "→ Installing dependencies..."
npm run install:all

echo ""
echo "→ Creating/updating .env files..."

# Backend .env
cat > $APP_DIR/backend/.env << 'EOF'
# Server Configuration
PORT=4000
NODE_ENV=production
CLIENT_URL=http://91.108.105.252

# MongoDB
MONGODB_URI=mongodb+srv://connect_db_user:bl2JT2Wc3Bacj5Lb@cluster0.6pjokiu.mongodb.net/ethereal-treasure

# CORS - Allow all origins for testing
ALLOWED_ORIGINS=http://91.108.105.252,http://localhost:8080,http://localhost:5173

# Session Secret
SESSION_SECRET=ethereal-treasure-secret-key-2024
EOF

# Frontend .env
cat > $APP_DIR/frontend/.env << 'EOF'
# API Configuration
VITE_API_BASE_URL=http://91.108.105.252/api

# Supabase (update with your values if needed)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Razorpay (update with your values if needed)
VITE_RAZORPAY_KEY_ID=your-razorpay-key
EOF

echo "✅ Environment files created"
echo ""

echo "→ Building application..."
npm run build

echo ""
echo "→ Restarting backend..."
pm2 restart angelmarket-backend || pm2 start backend/server/index.ts --name "angelmarket-backend" --interpreter tsx

echo ""
echo "→ Restarting Nginx..."
systemctl restart nginx

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Backend Status:"
pm2 status | grep angelmarket-backend

echo ""
echo "Testing backend health:"
sleep 2
curl -s http://localhost:4000/health && echo "✅ Backend is healthy" || echo "❌ Backend health check failed"

echo ""
echo "🎉 Your site is live at: http://91.108.105.252"
echo ""
echo "To view logs:"
echo "  pm2 logs angelmarket-backend"
echo ""

ENDSSH

echo ""
echo "=========================================="
echo "🎉 Deployment Complete!"
echo "=========================================="
echo ""
echo "Your local code is now deployed!"
echo ""
echo "Frontend: http://91.108.105.252"
echo "Backend API: http://91.108.105.252/api"
echo ""

