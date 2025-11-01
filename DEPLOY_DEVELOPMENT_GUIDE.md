# 🚀 Deploy Development Branch - Quick Guide

## Overview
This guide will help you deploy the **development** branch of Ethereal Treasure Market to any server.

---

## 📋 What You Need

Before starting, gather these:

1. **Server Access**
   - VPS/Server IP address
   - SSH access (username/password or SSH key)
   - Root or sudo privileges

2. **Domain Name** (optional but recommended)
   - Example: `dev.yourdomain.com` or `staging.yourdomain.com`
   - Point DNS A record to your server IP

3. **MongoDB Database**
   - MongoDB Atlas connection string (recommended), OR
   - Local MongoDB on the server
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/ethereal-treasure`

4. **API Keys** (optional, can add later)
   - Supabase URL and Anon Key
   - Razorpay Key ID and Secret

---

## 🎯 Deployment Options

### **Option 1: Automated Script (Fastest - 5 minutes)** ⚡

**Best for:** Quick deployment, minimal manual work

#### Steps:

1. **Copy the deployment script to your server:**
   ```bash
   scp DEPLOY_DEVELOPMENT_BRANCH.sh root@YOUR_SERVER_IP:/root/
   ```

2. **SSH into your server:**
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

3. **Run the deployment script:**
   ```bash
   chmod +x /root/DEPLOY_DEVELOPMENT_BRANCH.sh
   bash /root/DEPLOY_DEVELOPMENT_BRANCH.sh YOUR_SERVER_IP your-domain.com "mongodb+srv://user:pass@cluster.mongodb.net/db"
   ```

   **Example:**
   ```bash
   bash /root/DEPLOY_DEVELOPMENT_BRANCH.sh 192.168.1.100 dev.etherealmarket.com "mongodb+srv://admin:pass123@cluster0.mongodb.net/ethereal"
   ```

4. **Wait for completion** (5-10 minutes)

5. **Update credentials:**
   ```bash
   nano /var/www/ethereal-treasure-market/backend/.env
   nano /var/www/ethereal-treasure-market/frontend/.env
   ```

6. **Rebuild and restart:**
   ```bash
   cd /var/www/ethereal-treasure-market
   npm run build
   pm2 restart ethereal-backend
   ```

7. **Visit your site:**
   - Open browser: `http://your-domain.com`

---

### **Option 2: Manual Deployment (Recommended for Learning)** 📖

**Best for:** Understanding the process, full control

#### Step 1: Prepare Server

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install Git
apt install -y git

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx (Web Server)
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

#### Step 2: Clone Development Branch

```bash
# Create app directory
mkdir -p /var/www/ethereal-treasure-market
cd /var/www/ethereal-treasure-market

# Clone development branch
git clone -b development https://github.com/Gauravdembla/ethereal-treasure-market.git .

# Verify branch
git branch
# Should show: * development
```

#### Step 3: Install Dependencies

```bash
cd /var/www/ethereal-treasure-market

# Install all dependencies (frontend + backend)
npm run install:all
```

#### Step 4: Configure Environment Variables

**Backend .env:**
```bash
nano /var/www/ethereal-treasure-market/backend/.env
```

Add this content:
```env
# Server Configuration
PORT=4000
NODE_ENV=production
CLIENT_URL=https://your-domain.com

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ethereal-treasure

# CORS
ALLOWED_ORIGINS=https://your-domain.com,http://your-domain.com

# Session Secret
SESSION_SECRET=your-random-secret-key-here
```

**Frontend .env:**
```bash
nano /var/www/ethereal-treasure-market/frontend/.env
```

Add this content:
```env
# API Configuration
VITE_API_BASE_URL=https://your-domain.com/api

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Razorpay
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

#### Step 5: Build Application

```bash
cd /var/www/ethereal-treasure-market
npm run build
```

This will build the frontend into `frontend/dist/`

#### Step 6: Configure Nginx

```bash
nano /etc/nginx/sites-available/ethereal-treasure-market
```

Add this configuration:
```nginx
upstream backend {
    server localhost:4000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /var/www/ethereal-treasure-market/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/ethereal-treasure-market/backend/server/uploads/;
    }

    # Health check
    location /health {
        proxy_pass http://backend/health;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/ethereal-treasure-market /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

#### Step 7: Start Backend with PM2

```bash
cd /var/www/ethereal-treasure-market/backend
pm2 start server/index.ts --name "ethereal-backend" --interpreter tsx
pm2 save
pm2 startup
```

#### Step 8: Install SSL Certificate (Optional)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### Step 9: Verify Deployment

```bash
# Check Nginx
systemctl status nginx

# Check Backend
pm2 status

# Test health endpoint
curl http://localhost:4000/health

# Check logs
pm2 logs ethereal-backend
```

---

## 🔄 Updating Code After Deployment

When you push new changes to the development branch:

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Navigate to app directory
cd /var/www/ethereal-treasure-market

# Pull latest changes
git pull origin development

# Install any new dependencies
npm run install:all

# Rebuild frontend
npm run build

# Restart backend
pm2 restart ethereal-backend

# Check status
pm2 status
pm2 logs ethereal-backend --lines 50
```

---

## 🐛 Troubleshooting

### Backend not starting?
```bash
# Check logs
pm2 logs ethereal-backend

# Check if port 4000 is in use
lsof -i :4000

# Restart
pm2 restart ethereal-backend
```

### Frontend showing blank page?
```bash
# Check Nginx logs
tail -f /var/log/nginx/error.log

# Verify build exists
ls -la /var/www/ethereal-treasure-market/frontend/dist/

# Rebuild
cd /var/www/ethereal-treasure-market
npm run build
```

### API calls failing?
```bash
# Check backend is running
pm2 status

# Test health endpoint
curl http://localhost:4000/health

# Check Nginx proxy
nginx -t
systemctl restart nginx
```

### MongoDB connection issues?
```bash
# Check .env file
cat /var/www/ethereal-treasure-market/backend/.env

# Test MongoDB connection
# Add this to backend and check logs
pm2 logs ethereal-backend | grep -i mongo
```

---

## 📊 Monitoring

### Check Application Status
```bash
pm2 status
pm2 monit
```

### View Logs
```bash
# Backend logs
pm2 logs ethereal-backend

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

### Resource Usage
```bash
# CPU and Memory
pm2 monit

# Disk space
df -h

# Network
netstat -tulpn | grep LISTEN
```

---

## 🔐 Security Checklist

- [ ] Change default SSH port
- [ ] Setup firewall (UFW)
- [ ] Install SSL certificate
- [ ] Use strong passwords
- [ ] Regular backups
- [ ] Keep system updated
- [ ] Monitor logs regularly

---

## 📞 Need Help?

- **Full Documentation:** `HOSTINGER_DEPLOYMENT_GUIDE.md`
- **Troubleshooting:** `DEPLOYMENT_TROUBLESHOOTING.md`
- **Quick Reference:** `DEPLOYMENT_QUICK_REFERENCE.md`

---

## ✅ Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] Backend API responding
- [ ] Database connected
- [ ] SSL certificate installed
- [ ] PM2 auto-restart configured
- [ ] Nginx serving frontend
- [ ] Logs are clean
- [ ] Environment variables set
- [ ] Firewall configured
- [ ] Monitoring setup

---

**Congratulations! Your development branch is now deployed! 🎉**

