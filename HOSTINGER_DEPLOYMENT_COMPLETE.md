# 🚀 Hostinger Deployment Guide - Complete Setup

## 📋 Prerequisites

- Hostinger VPS account with SSH access
- Node.js 18+ installed on VPS
- MongoDB Atlas account (or local MongoDB)
- Git installed on VPS
- PM2 for process management

---

## 🔧 Step 1: SSH into Your Hostinger VPS

```bash
ssh root@your_vps_ip
# or
ssh username@your_vps_ip
```

---

## 📁 Step 2: Clone the Repository

```bash
cd /var/www
git clone https://github.com/Gauravdembla/ethereal-treasure-market.git
cd ethereal-treasure-market
```

---

## 🔐 Step 3: Setup Environment Files

### Backend Environment File

```bash
# Create backend .env file
nano backend/.env
```

**Add the following content:**

```env
# Backend Configuration
PORT=4000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ethereal_market?retryWrites=true&w=majority

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Razorpay Configuration (Optional)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### Frontend Environment File

```bash
# Create frontend .env file
nano frontend/.env
```

**Add the following content:**

```env
# Frontend Configuration
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=Ethereal Treasure Market
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## 📦 Step 4: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install --legacy-peer-deps
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

---

## 🏗️ Step 5: Build Frontend

```bash
npm run build
```

This creates a `frontend/dist` folder with production-ready files.

---

## 🌐 Step 6: Setup Nginx Reverse Proxy

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/ethereal-market
```

**Add the following configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend - Serve static files
    location / {
        root /var/www/ethereal-treasure-market/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;
}
```

**Enable the site:**

```bash
sudo ln -s /etc/nginx/sites-available/ethereal-market /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Step 7: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 🚀 Step 8: Start Backend with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start backend
cd /var/www/ethereal-treasure-market/backend
pm2 start index.ts --name "ethereal-backend" --interpreter tsx

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup
# Copy and run the command it outputs
```

**Verify backend is running:**

```bash
pm2 list
pm2 logs ethereal-backend
```

---

## 📊 Step 9: Verify Deployment

### Check Backend

```bash
curl http://localhost:4000/api/health
# Should return: {"status":"ok"}
```

### Check Frontend

```bash
curl https://yourdomain.com
# Should return HTML content
```

### Check Nginx

```bash
sudo systemctl status nginx
```

---

## 🔄 Step 10: Setup Auto-Deployment (Optional)

Create a deployment script:

```bash
nano /var/www/deploy.sh
```

**Add:**

```bash
#!/bin/bash
cd /var/www/ethereal-treasure-market
git pull origin main
cd frontend && npm install --legacy-peer-deps && npm run build && cd ..
cd backend && npm install && cd ..
pm2 restart ethereal-backend
sudo systemctl restart nginx
echo "Deployment completed at $(date)"
```

**Make executable:**

```bash
chmod +x /var/www/deploy.sh
```

**Setup cron job (optional):**

```bash
crontab -e
# Add: 0 2 * * * /var/www/deploy.sh >> /var/log/deploy.log 2>&1
```

---

## 📝 Environment Variables Reference

### Backend (.env)

| Variable | Example | Description |
|----------|---------|-------------|
| PORT | 4000 | Backend server port |
| NODE_ENV | production | Environment mode |
| CLIENT_URL | https://yourdomain.com | Frontend URL |
| MONGODB_URI | mongodb+srv://... | Database connection |
| SMTP_HOST | smtp.gmail.com | Email service |
| RAZORPAY_KEY_ID | key_xxx | Payment gateway |

### Frontend (.env)

| Variable | Example | Description |
| VITE_API_URL | https://yourdomain.com/api | Backend API URL |
| VITE_APP_NAME | Ethereal Treasure Market | App name |

---

## 🆘 Troubleshooting

### Backend not starting?

```bash
pm2 logs ethereal-backend
# Check for errors
```

### Frontend not loading?

```bash
sudo tail -f /var/log/nginx/error.log
# Check Nginx errors
```

### MongoDB connection failed?

```bash
# Verify connection string in backend/.env
# Check MongoDB Atlas IP whitelist
```

### Port already in use?

```bash
lsof -i :4000
kill -9 <PID>
```

---

## ✅ Deployment Checklist

- [ ] SSH access to VPS working
- [ ] Repository cloned
- [ ] backend/.env created with correct values
- [ ] frontend/.env created
- [ ] Dependencies installed
- [ ] Frontend built successfully
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Backend running with PM2
- [ ] Frontend accessible via domain
- [ ] API endpoints responding
- [ ] Database connection working

---

## 🎉 You're Live!

Your application is now deployed on Hostinger! 

**Access your app:** https://yourdomain.com

**Monitor backend:** `pm2 logs ethereal-backend`

**View Nginx logs:** `sudo tail -f /var/log/nginx/access.log`

---

## 📞 Support

For issues, check:
1. PM2 logs: `pm2 logs ethereal-backend`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. MongoDB connection
4. Firewall rules on Hostinger

