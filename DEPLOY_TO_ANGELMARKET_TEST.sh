#!/bin/bash

# Ethereal Treasure Market - Deploy to angelmarket-test folder
# This script deploys the DEVELOPMENT branch to existing angelmarket-test folder

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="${1:-}"
DOMAIN="${2:-}"
MONGODB_URI="${3:-}"
APP_DIR="/root/angelmarket-test"  # Using your existing folder
REPO_URL="https://github.com/Gauravdembla/ethereal-treasure-market.git"
BRANCH="development"  # Deploy development branch

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

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
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
    echo "  $0 91.108.105.252 91.108.105.252 'mongodb+srv://user:pass@cluster.mongodb.net/db'"
    echo ""
    echo "Note: This will deploy to /root/angelmarket-test folder"
    exit 1
fi

print_header "Deploying to angelmarket-test folder"
print_info "Target directory: $APP_DIR"
print_info "Branch: $BRANCH"
print_info "Domain: $DOMAIN"

# Step 1: Update System
print_step "Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"

# Step 2: Install Node.js
print_step "Installing Node.js v20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt install -y nodejs
fi
print_success "Node.js installed: $(node --version)"

# Step 3: Install Git
print_step "Installing Git..."
if ! command -v git &> /dev/null; then
    apt install -y git
fi
print_success "Git installed: $(git --version)"

# Step 4: Install PM2
print_step "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
print_success "PM2 installed: $(pm2 --version)"

# Step 5: Install Nginx
print_step "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi
print_success "Nginx installed and running"

# Step 6: Setup Repository in angelmarket-test folder
print_step "Setting up repository in angelmarket-test..."
if [ -d "$APP_DIR/.git" ]; then
    print_info "Repository exists, updating..."
    cd $APP_DIR
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
else
    print_info "Cloning repository to angelmarket-test..."
    # Backup existing folder if it has content
    if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
        print_info "Backing up existing angelmarket-test folder..."
        mv $APP_DIR ${APP_DIR}_backup_$(date +%Y%m%d_%H%M%S)
    fi
    mkdir -p $APP_DIR
    cd $APP_DIR
    git clone -b $BRANCH $REPO_URL .
fi
print_success "Repository ready on branch: $BRANCH"

# Step 7: Install Dependencies
print_step "Installing dependencies..."
cd $APP_DIR
npm run install:all
print_success "Dependencies installed"

# Step 8: Create .env Files
print_step "Creating environment files..."

# Backend .env
cat > $APP_DIR/backend/.env << EOF
# Server Configuration
PORT=4000
NODE_ENV=production
CLIENT_URL=http://$DOMAIN

# MongoDB
MONGODB_URI=$MONGODB_URI

# CORS
ALLOWED_ORIGINS=http://$DOMAIN,https://$DOMAIN

# Session Secret
SESSION_SECRET=$(openssl rand -base64 32)
EOF

# Frontend .env
cat > $APP_DIR/frontend/.env << EOF
# API Configuration
VITE_API_BASE_URL=http://$DOMAIN/api

# Supabase (update with your values)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Razorpay (update with your values)
VITE_RAZORPAY_KEY_ID=your_razorpay_key
EOF

print_success "Environment files created"
print_info "⚠️  Remember to update Supabase and Razorpay credentials!"

# Step 9: Build Application
print_step "Building application..."
cd $APP_DIR
npm run build
print_success "Application built successfully"

# Step 10: Configure Nginx
print_step "Configuring Nginx..."
cat > /etc/nginx/sites-available/angelmarket-test << NGINX_CONFIG
upstream angelmarket_backend {
    server localhost:4000;
    keepalive 64;
}

server {
    listen 80;
    server_name $DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - Serve static files
    location / {
        root $APP_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }

    # API - Proxy to backend
    location /api/ {
        proxy_pass http://angelmarket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Uploads
    location /uploads/ {
        alias $APP_DIR/backend/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        proxy_pass http://angelmarket_backend/health;
        access_log off;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
NGINX_CONFIG

# Enable site
ln -sf /etc/nginx/sites-available/angelmarket-test /etc/nginx/sites-enabled/

# Remove default site if exists
rm -f /etc/nginx/sites-enabled/default

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
cd $APP_DIR/backend

# Stop existing process if running
pm2 delete angelmarket-backend 2>/dev/null || true

# Start backend
pm2 start server/index.ts --name "angelmarket-backend" --interpreter tsx --watch false
pm2 save
pm2 startup systemd -u root --hp /root

print_success "Backend started with PM2"

# Step 12: Setup Firewall
print_step "Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    ufw --force enable
    print_success "Firewall configured"
else
    print_info "UFW not installed, skipping firewall setup"
fi

# Step 13: Verification
print_header "Deployment Verification"

print_step "Checking services..."
systemctl is-active --quiet nginx && print_success "Nginx is running" || print_error "Nginx is not running"
pm2 list | grep -q "angelmarket-backend" && print_success "Backend is running" || print_error "Backend is not running"

print_step "Testing endpoints..."
sleep 3
curl -s http://localhost:4000/health > /dev/null && print_success "Backend health check passed" || print_error "Backend health check failed"

# Final Summary
print_header "Deployment Complete! 🎉"

echo ""
echo -e "${GREEN}Your DEVELOPMENT branch is deployed to angelmarket-test!${NC}"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://$DOMAIN"
echo "   Backend API: http://$DOMAIN/api"
echo "   Health Check: http://$DOMAIN/health"
echo ""
echo "📁 Installation Directory:"
echo "   $APP_DIR"
echo ""
echo "📝 Important Next Steps:"
echo ""
echo "1. Update environment variables with real credentials:"
echo "   nano $APP_DIR/backend/.env"
echo "   nano $APP_DIR/frontend/.env"
echo ""
echo "2. Rebuild frontend after updating env:"
echo "   cd $APP_DIR && npm run build"
echo "   pm2 restart angelmarket-backend"
echo ""
echo "3. Monitor application logs:"
echo "   pm2 logs angelmarket-backend"
echo "   tail -f /var/log/nginx/error.log"
echo ""
echo "4. Useful commands:"
echo "   pm2 status                      # Check backend status"
echo "   pm2 restart angelmarket-backend # Restart backend"
echo "   systemctl restart nginx         # Restart Nginx"
echo "   pm2 monit                       # Monitor resources"
echo ""
echo "5. To update code from GitHub:"
echo "   cd $APP_DIR"
echo "   git pull origin development"
echo "   npm run install:all"
echo "   npm run build"
echo "   pm2 restart angelmarket-backend"
echo ""

