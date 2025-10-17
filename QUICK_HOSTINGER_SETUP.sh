#!/bin/bash

# 🚀 Quick Hostinger Deployment Script
# This script automates the deployment process

set -e

echo "================================"
echo "🚀 Ethereal Treasure Market"
echo "   Hostinger Deployment Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}Please run as root (use sudo)${NC}"
   exit 1
fi

# Step 1: Update system
echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Step 2: Install Node.js if not present
echo -e "${YELLOW}[2/10] Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Step 3: Install Git if not present
echo -e "${YELLOW}[3/10] Checking Git installation...${NC}"
if ! command -v git &> /dev/null; then
    apt-get install -y git
fi
echo -e "${GREEN}✓ Git installed${NC}"

# Step 4: Clone repository
echo -e "${YELLOW}[4/10] Cloning repository...${NC}"
cd /var/www
if [ ! -d "ethereal-treasure-market" ]; then
    git clone https://github.com/Gauravdembla/ethereal-treasure-market.git
else
    cd ethereal-treasure-market
    git pull origin main
    cd /var/www
fi
echo -e "${GREEN}✓ Repository ready${NC}"

# Step 5: Install dependencies
echo -e "${YELLOW}[5/10] Installing dependencies...${NC}"
cd /var/www/ethereal-treasure-market
npm install

cd frontend
npm install --legacy-peer-deps
cd ..

cd backend
npm install
cd ..
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 6: Build frontend
echo -e "${YELLOW}[6/10] Building frontend...${NC}"
cd /var/www/ethereal-treasure-market
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"

# Step 7: Install PM2
echo -e "${YELLOW}[7/10] Setting up PM2...${NC}"
npm install -g pm2
echo -e "${GREEN}✓ PM2 installed${NC}"

# Step 8: Start backend with PM2
echo -e "${YELLOW}[8/10] Starting backend service...${NC}"
cd /var/www/ethereal-treasure-market/backend
pm2 start index.ts --name "ethereal-backend" --interpreter tsx
pm2 save
pm2 startup
echo -e "${GREEN}✓ Backend running${NC}"

# Step 9: Install Nginx
echo -e "${YELLOW}[9/10] Setting up Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
fi
systemctl enable nginx
echo -e "${GREEN}✓ Nginx configured${NC}"

# Step 10: Setup SSL (Let's Encrypt)
echo -e "${YELLOW}[10/10] Setting up SSL certificate...${NC}"
apt-get install -y certbot python3-certbot-nginx
echo -e "${GREEN}✓ SSL tools installed${NC}"

echo ""
echo "================================"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Create backend/.env file:"
echo "   nano /var/www/ethereal-treasure-market/backend/.env"
echo ""
echo "2. Create frontend/.env file:"
echo "   nano /var/www/ethereal-treasure-market/frontend/.env"
echo ""
echo "3. Setup SSL certificate:"
echo "   sudo certbot certonly --nginx -d yourdomain.com"
echo ""
echo "4. Configure Nginx:"
echo "   nano /etc/nginx/sites-available/ethereal-market"
echo "   (Use template from HOSTINGER_DEPLOYMENT_COMPLETE.md)"
echo ""
echo "5. Enable Nginx site:"
echo "   sudo ln -s /etc/nginx/sites-available/ethereal-market /etc/nginx/sites-enabled/"
echo "   sudo nginx -t"
echo "   sudo systemctl restart nginx"
echo ""
echo "6. Verify backend:"
echo "   curl http://localhost:4000/api/health"
echo ""
echo "📚 Documentation:"
echo "   - HOSTINGER_DEPLOYMENT_COMPLETE.md"
echo "   - ENV_SETUP_GUIDE.md"
echo ""
echo "🎉 Your app will be live at: https://yourdomain.com"
echo ""

