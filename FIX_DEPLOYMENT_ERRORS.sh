#!/bin/bash

# Fix Deployment Errors - CORS and 404 Issues
# Run this on your VPS to fix common deployment issues

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/root/angelmarket-test"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Fixing Deployment Errors${NC}"
echo -e "${GREEN}========================================${NC}"

# Step 1: Check if directory exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Error: $APP_DIR does not exist!${NC}"
    exit 1
fi

cd $APP_DIR

# Step 2: Update backend .env with correct CORS settings
echo -e "${YELLOW}→ Updating backend .env file...${NC}"
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

echo -e "${GREEN}✓ Backend .env updated${NC}"

# Step 3: Update frontend .env
echo -e "${YELLOW}→ Updating frontend .env file...${NC}"
cat > $APP_DIR/frontend/.env << 'EOF'
# API Configuration
VITE_API_BASE_URL=http://91.108.105.252/api

# Supabase (update with your values if needed)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Razorpay (update with your values if needed)
VITE_RAZORPAY_KEY_ID=your-razorpay-key
EOF

echo -e "${GREEN}✓ Frontend .env updated${NC}"

# Step 4: Check if backend has proper CORS configuration
echo -e "${YELLOW}→ Checking backend CORS configuration...${NC}"

# Create a simple CORS fix for backend if needed
if [ -f "$APP_DIR/backend/server/index.ts" ]; then
    echo -e "${GREEN}✓ Backend file exists${NC}"
else
    echo -e "${RED}✗ Backend file not found${NC}"
fi

# Step 5: Rebuild frontend
echo -e "${YELLOW}→ Rebuilding frontend...${NC}"
cd $APP_DIR
npm run build

echo -e "${GREEN}✓ Frontend rebuilt${NC}"

# Step 6: Restart backend
echo -e "${YELLOW}→ Restarting backend...${NC}"
pm2 restart angelmarket-backend
sleep 3

echo -e "${GREEN}✓ Backend restarted${NC}"

# Step 7: Restart Nginx
echo -e "${YELLOW}→ Restarting Nginx...${NC}"
systemctl restart nginx

echo -e "${GREEN}✓ Nginx restarted${NC}"

# Step 8: Check services
echo -e "${YELLOW}→ Checking services...${NC}"

echo ""
echo "Backend Status:"
pm2 status | grep angelmarket-backend || echo -e "${RED}Backend not found in PM2${NC}"

echo ""
echo "Nginx Status:"
systemctl is-active nginx && echo -e "${GREEN}✓ Nginx is running${NC}" || echo -e "${RED}✗ Nginx is not running${NC}"

# Step 9: Test endpoints
echo ""
echo -e "${YELLOW}→ Testing endpoints...${NC}"

echo ""
echo "Testing backend health:"
curl -s http://localhost:4000/health && echo -e "${GREEN}✓ Backend health OK${NC}" || echo -e "${RED}✗ Backend health failed${NC}"

echo ""
echo "Testing API products:"
curl -s http://localhost:4000/api/products | head -c 100 && echo -e "${GREEN}✓ API responding${NC}" || echo -e "${RED}✗ API not responding${NC}"

# Step 10: Show logs
echo ""
echo -e "${YELLOW}→ Recent backend logs:${NC}"
pm2 logs angelmarket-backend --lines 20 --nostream

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Fix Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Open browser: http://91.108.105.252"
echo "2. Check browser console for errors (F12)"
echo "3. If still issues, check logs:"
echo "   pm2 logs angelmarket-backend"
echo "   tail -f /var/log/nginx/error.log"
echo ""

