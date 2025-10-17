#!/bin/bash

# Ethereal Treasure Market - Quick Deployment Script for Hostinger VPS
# This script automates the deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="${1:-}"
DOMAIN="${2:-}"
MONGODB_URI="${3:-}"
APP_DIR="/var/www/ethereal-treasure-market"
REPO_URL="https://github.com/Gauravdembla/ethereal-treasure-market.git"

# Functions
print_header() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}"
}

print_step() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# Validate inputs
if [ -z "$VPS_IP" ] || [ -z "$DOMAIN" ] || [ -z "$MONGODB_URI" ]; then
    echo "Usage: $0 <VPS_IP> <DOMAIN> <MONGODB_URI>"
    echo ""
    echo "Example:"
    echo "  $0 192.168.1.1 yourdomain.com 'mongodb+srv://user:pass@cluster.mongodb.net/db'"
    exit 1
fi

print_header "Ethereal Treasure Market - Deployment Script"

# Step 1: Update System
print_step "Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"

# Step 2: Install Node.js
print_step "Installing Node.js v20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
print_success "Node.js installed: $(node --version)"

# Step 3: Install Git
print_step "Installing Git..."
apt install -y git
print_success "Git installed: $(git --version)"

# Step 4: Install PM2
print_step "Installing PM2..."
npm install -g pm2
print_success "PM2 installed: $(pm2 --version)"

# Step 5: Install Nginx
print_step "Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
print_success "Nginx installed and started"

# Step 6: Clone Repository
print_step "Cloning repository..."
mkdir -p $APP_DIR
cd $APP_DIR
git clone $REPO_URL . 2>/dev/null || git pull origin main
print_success "Repository cloned/updated"

# Step 7: Install Dependencies
print_step "Installing Node dependencies..."
npm install
print_success "Dependencies installed"

# Step 8: Create .env File
print_step "Creating .env file..."
cat > $APP_DIR/.env << EOF
# Server Configuration
PORT=4000
NODE_ENV=production
CLIENT_URL=https://$DOMAIN

# MongoDB
MONGODB_URI=$MONGODB_URI

# Frontend API
VITE_API_BASE_URL=https://$DOMAIN/api

# Supabase (update with your values)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Razorpay (update with your values)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
EOF
print_success ".env file created"

# Step 9: Build Frontend
print_step "Building frontend..."
npm run build
print_success "Frontend built successfully"

# Step 10: Configure Nginx
print_step "Configuring Nginx..."
cat > /etc/nginx/sites-available/ethereal-treasure-market << 'NGINX_CONFIG'
upstream backend {
    server localhost:4000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend - Serve static files
    location / {
        root /var/www/ethereal-treasure-market/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }

    # API - Proxy to backend
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/ethereal-treasure-market/server/uploads/;
        expires 30d;
    }

    # Health check
    location /health {
        proxy_pass http://backend;
    }
}
NGINX_CONFIG

# Replace domain in Nginx config
sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/ethereal-treasure-market

# Enable site
ln -sf /etc/nginx/sites-available/ethereal-treasure-market /etc/nginx/sites-enabled/

# Test Nginx
if nginx -t; then
    systemctl restart nginx
    print_success "Nginx configured and restarted"
else
    print_error "Nginx configuration error"
    exit 1
fi

# Step 11: Start Backend with PM2
print_step "Starting backend with PM2..."
cd $APP_DIR
pm2 start server/index.ts --name "ethereal-backend" --interpreter tsx
pm2 save
pm2 startup
print_success "Backend started with PM2"

# Step 12: Install SSL Certificate
print_step "Installing SSL certificate..."
apt install -y certbot python3-certbot-nginx
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN
systemctl enable certbot.timer
systemctl start certbot.timer
print_success "SSL certificate installed"

# Step 13: Verification
print_header "Deployment Verification"

print_step "Checking services..."
systemctl status nginx --no-pager | grep "active (running)" && print_success "Nginx is running" || print_error "Nginx is not running"
pm2 status | grep "ethereal-backend" && print_success "Backend is running" || print_error "Backend is not running"

print_step "Testing endpoints..."
sleep 2
curl -s http://localhost:4000/health > /dev/null && print_success "Backend health check passed" || print_error "Backend health check failed"

print_header "Deployment Complete! 🎉"

echo ""
echo "Your application is now deployed!"
echo ""
echo "Frontend: https://$DOMAIN"
echo "Backend API: https://$DOMAIN/api"
echo "Health Check: https://$DOMAIN/health"
echo ""
echo "Next steps:"
echo "1. Update .env file with your actual credentials:"
echo "   nano $APP_DIR/.env"
echo ""
echo "2. Monitor logs:"
echo "   pm2 logs ethereal-backend"
echo ""
echo "3. Restart services if needed:"
echo "   pm2 restart ethereal-backend"
echo "   systemctl restart nginx"
echo ""
echo "4. Update code:"
echo "   cd $APP_DIR"
echo "   git pull origin main"
echo "   npm install && npm run build"
echo "   pm2 restart ethereal-backend"
echo ""

