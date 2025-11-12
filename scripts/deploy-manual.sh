#!/bin/bash

# Manual deployment script
# Run this from your local machine to deploy to the server

set -e

echo "=========================================="
echo "🚀 Manual Deployment to Hostinger"
echo "=========================================="
echo ""

# Configuration
read -p "Enter SSH host (e.g., 123.45.67.89): " SSH_HOST
read -p "Enter SSH user: " SSH_USER
read -p "Enter app path on server [/home/angelsonearthhub-aoeshop/htdocs/app]: " APP_PATH
APP_PATH=${APP_PATH:-/home/angelsonearthhub-aoeshop/htdocs/app}

echo ""
echo "Configuration:"
echo "  SSH Host: $SSH_HOST"
echo "  SSH User: $SSH_USER"
echo "  App Path: $APP_PATH"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Step 1: Build locally
echo ""
echo "→ Step 1: Building frontend locally..."
cd frontend
npm run build
cd ..
echo "✓ Frontend built"

# Step 2: Deploy via rsync
echo ""
echo "→ Step 2: Uploading files to server..."
rsync -avzr --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --progress \
  ./ ${SSH_USER}@${SSH_HOST}:${APP_PATH}/

echo "✓ Files uploaded"

# Step 3: Restart backend
echo ""
echo "→ Step 3: Restarting backend on server..."
ssh ${SSH_USER}@${SSH_HOST} << EOF
  set -e
  cd ${APP_PATH}
  
  # Check if PM2 is installed
  if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
  fi
  
  # Restart or start backend
  if pm2 describe ethereal-backend > /dev/null 2>&1; then
    echo "Restarting existing PM2 process..."
    pm2 restart ethereal-backend
  else
    echo "Starting new PM2 process..."
    cd backend
    pm2 start server/index.ts --name ethereal-backend --interpreter npx --interpreter-args "tsx"
    cd ..
  fi
  
  pm2 save
  
  # Show status
  echo ""
  echo "PM2 Status:"
  pm2 status
  
  # Health check
  echo ""
  echo "Checking backend health..."
  sleep 3
  if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
  else
    echo "⚠️ Backend health check failed"
    echo "Check logs with: pm2 logs ethereal-backend"
  fi
EOF

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "To view logs:"
echo "  ssh ${SSH_USER}@${SSH_HOST}"
echo "  pm2 logs ethereal-backend"
echo ""

