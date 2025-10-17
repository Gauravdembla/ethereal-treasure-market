# 🚀 Ethereal Treasure Market - Hostinger VPS Deployment Guide

## Overview
This guide will help you deploy your Ethereal Treasure Market application to Hostinger VPS using GitHub. The app consists of:
- **Frontend:** React + Vite (runs on port 8080)
- **Backend:** Express.js + MongoDB (runs on port 4000)
- **Database:** MongoDB (local or cloud)

---

## Prerequisites

Before starting, ensure you have:
1. ✅ Hostinger VPS account with SSH access
2. ✅ GitHub repository with your code pushed
3. ✅ Domain name (optional, but recommended)
4. ✅ MongoDB connection string (local or Atlas)
5. ✅ Environment variables ready

---

## Step 1: SSH into Your Hostinger VPS

### 1.1 Connect to VPS
```bash
ssh root@YOUR_VPS_IP_ADDRESS
# Or if you have a specific user
ssh username@YOUR_VPS_IP_ADDRESS
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
```

---

## Step 2: Install Required Software

### 2.1 Install Node.js (v18 or higher)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
node --version
npm --version
```

### 2.2 Install Git
```bash
apt install -y git
git --version
```

### 2.3 Install PM2 (Process Manager)
```bash
npm install -g pm2
pm2 --version
```

### 2.4 Install Nginx (Reverse Proxy)
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 2.5 Install MongoDB (Optional - if using local)
```bash
apt install -y mongodb
systemctl start mongodb
systemctl enable mongodb
```

---

## Step 3: Clone Repository from GitHub

### 3.1 Create App Directory
```bash
mkdir -p /var/www/ethereal-treasure-market
cd /var/www/ethereal-treasure-market
```

### 3.2 Clone Repository
```bash
git clone https://github.com/Gauravdembla/ethereal-treasure-market.git .
```

### 3.3 Verify Clone
```bash
ls -la
# Should show: package.json, server/, src/, vite.config.ts, etc.
```

---

## Step 4: Install Dependencies

### 4.1 Install Node Packages
```bash
npm install
```

### 4.2 Verify Installation
```bash
npm list | head -20
```

---

## Step 5: Configure Environment Variables

### 5.1 Create .env File
```bash
nano .env
```

### 5.2 Add Environment Variables
```env
# Server Configuration
PORT=4000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ethereal-treasure-market?retryWrites=true&w=majority
# Or for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/ethereal-treasure-market

# Supabase (if using)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# API Configuration
VITE_API_BASE_URL=https://yourdomain.com/api

# Razorpay (if using)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 5.3 Save File
```
Ctrl+X → Y → Enter
```

---

## Step 6: Build Frontend

### 6.1 Build React App
```bash
npm run build
```

### 6.2 Verify Build
```bash
ls -la dist/
# Should contain: index.html, assets/, etc.
```

---

## Step 7: Configure Nginx

### 7.1 Create Nginx Config
```bash
nano /etc/nginx/sites-available/ethereal-treasure-market
```

### 7.2 Add Configuration
```nginx
upstream backend {
    server localhost:4000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (optional, after SSL setup)
    # return 301 https://$server_name$request_uri;

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

    # Uploads - Serve uploaded files
    location /uploads/ {
        alias /var/www/ethereal-treasure-market/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        proxy_pass http://backend;
    }
}
```

### 7.3 Enable Site
```bash
ln -s /etc/nginx/sites-available/ethereal-treasure-market /etc/nginx/sites-enabled/
```

### 7.4 Test Nginx Config
```bash
nginx -t
# Should output: "syntax is ok" and "test is successful"
```

### 7.5 Restart Nginx
```bash
systemctl restart nginx
```

---

## Step 8: Start Backend with PM2

### 8.1 Start Backend Server
```bash
cd /var/www/ethereal-treasure-market
pm2 start server/index.ts --name "ethereal-backend" --interpreter tsx
```

### 8.2 Verify Backend Running
```bash
pm2 list
pm2 logs ethereal-backend
```

### 8.3 Save PM2 Config
```bash
pm2 save
pm2 startup
```

---

## Step 9: Setup SSL Certificate (HTTPS)

### 9.1 Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 9.2 Get SSL Certificate
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 9.3 Auto-Renewal
```bash
systemctl enable certbot.timer
systemctl start certbot.timer
```

---

## Step 10: Verify Deployment

### 10.1 Check Services
```bash
# Check Nginx
systemctl status nginx

# Check PM2
pm2 status

# Check MongoDB (if local)
systemctl status mongodb
```

### 10.2 Test Endpoints
```bash
# Frontend
curl http://yourdomain.com

# Backend Health
curl http://yourdomain.com/health

# API
curl http://yourdomain.com/api/products
```

### 10.3 Check Logs
```bash
# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PM2
pm2 logs ethereal-backend
```

---

## Step 11: Setup Auto-Deployment from GitHub

### 11.1 Create Deployment Script
```bash
nano /var/www/ethereal-treasure-market/deploy.sh
```

### 11.2 Add Script Content
```bash
#!/bin/bash
cd /var/www/ethereal-treasure-market

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build frontend
npm run build

# Restart backend
pm2 restart ethereal-backend

echo "Deployment completed at $(date)"
```

### 11.3 Make Script Executable
```bash
chmod +x /var/www/ethereal-treasure-market/deploy.sh
```

### 11.4 Setup GitHub Webhook (Optional)
- Go to GitHub repo → Settings → Webhooks
- Add webhook URL: `http://yourdomain.com/webhook`
- Trigger on push events
- (Requires webhook handler on backend)

---

## Step 12: Monitoring & Maintenance

### 12.1 Monitor Logs
```bash
# Real-time logs
pm2 logs ethereal-backend

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

### 12.2 Restart Services
```bash
# Restart backend
pm2 restart ethereal-backend

# Restart Nginx
systemctl restart nginx

# Restart all
pm2 restart all && systemctl restart nginx
```

### 12.3 Update Code
```bash
cd /var/www/ethereal-treasure-market
git pull origin main
npm install
npm run build
pm2 restart ethereal-backend
```

---

## Troubleshooting

### Issue: Backend not connecting
```bash
# Check if port 4000 is listening
netstat -tlnp | grep 4000

# Check PM2 logs
pm2 logs ethereal-backend

# Restart backend
pm2 restart ethereal-backend
```

### Issue: Frontend not loading
```bash
# Check Nginx config
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### Issue: MongoDB connection error
```bash
# Check MongoDB status
systemctl status mongodb

# Check MongoDB logs
tail -f /var/log/mongodb/mongodb.log

# Restart MongoDB
systemctl restart mongodb
```

### Issue: SSL certificate error
```bash
# Renew certificate
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal
```

---

## Quick Reference Commands

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Navigate to app
cd /var/www/ethereal-treasure-market

# View logs
pm2 logs ethereal-backend

# Restart services
pm2 restart ethereal-backend
systemctl restart nginx

# Update code
git pull origin main
npm install
npm run build
pm2 restart ethereal-backend

# Check status
pm2 status
systemctl status nginx
systemctl status mongodb
```

---

## Summary

✅ Node.js installed
✅ Git repository cloned
✅ Dependencies installed
✅ Environment variables configured
✅ Frontend built
✅ Nginx configured
✅ Backend running with PM2
✅ SSL certificate installed
✅ Services monitored

---

**Your app is now live! 🎉**

Visit: `https://yourdomain.com`

