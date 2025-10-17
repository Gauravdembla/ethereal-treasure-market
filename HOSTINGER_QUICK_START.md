# ⚡ Hostinger Quick Start - 5 Minutes Setup

## 🎯 What You Need

- Hostinger VPS with SSH access
- Your domain name
- MongoDB Atlas account (or local MongoDB)
- Git installed on VPS

---

## 🚀 5-Minute Setup

### 1️⃣ SSH to Your VPS (1 min)

```bash
ssh root@your_vps_ip
# Enter your password
```

---

### 2️⃣ Clone & Install (2 min)

```bash
cd /var/www
git clone https://github.com/Gauravdembla/ethereal-treasure-market.git
cd ethereal-treasure-market

# Install everything
npm run install:all

# Build frontend
npm run build
```

---

### 3️⃣ Create Environment Files (1 min)

**Backend .env:**

```bash
cat > backend/.env << 'EOF'
PORT=4000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://connect_db_user:bl2JT2Wc3Bacj5Lb@cluster0.6pjokiu.mongodb.net/ethereal_market?retryWrites=true&w=majority
EOF
```

**Frontend .env:**

```bash
cat > frontend/.env << 'EOF'
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=Ethereal Treasure Market
EOF
```

---

### 4️⃣ Start Backend (1 min)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start index.ts --name "ethereal-backend" --interpreter tsx
pm2 save
pm2 startup

# Verify it's running
pm2 list
```

---

### 5️⃣ Configure Nginx (1 min)

```bash
# Create Nginx config
sudo tee /etc/nginx/sites-available/ethereal-market > /dev/null << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        root /var/www/ethereal-treasure-market/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/ethereal-market /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Setup SSL Certificate

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Generate certificate (replace yourdomain.com)
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## ✅ Verify Everything Works

```bash
# Check backend
curl http://localhost:4000/api/health

# Check frontend
curl https://yourdomain.com

# Check PM2
pm2 list

# Check Nginx
sudo systemctl status nginx
```

---

## 📝 Environment Variables Explained

### Backend (.env)

```env
PORT=4000                                    # Backend port
NODE_ENV=production                          # Production mode
CLIENT_URL=https://yourdomain.com           # Frontend URL (for CORS)
MONGODB_URI=mongodb+srv://...               # Database connection
```

### Frontend (.env)

```env
VITE_API_URL=https://yourdomain.com/api     # Backend API URL
VITE_APP_NAME=Ethereal Treasure Market      # App name
```

---

## 🔄 Update Your App

```bash
cd /var/www/ethereal-treasure-market

# Pull latest code
git pull origin main

# Rebuild frontend
npm run build

# Restart backend
pm2 restart ethereal-backend

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🆘 Quick Troubleshooting

### Backend not starting?
```bash
pm2 logs ethereal-backend
```

### Frontend not loading?
```bash
sudo tail -f /var/log/nginx/error.log
```

### Port 4000 in use?
```bash
lsof -i :4000
kill -9 <PID>
```

### MongoDB connection failed?
```bash
# Check connection string in backend/.env
# Verify IP whitelist in MongoDB Atlas
```

---

## 📚 Full Documentation

For detailed information, see:

- **HOSTINGER_DEPLOYMENT_COMPLETE.md** - Complete guide with all details
- **ENV_SETUP_GUIDE.md** - Environment variables reference
- **DEPLOYMENT_SUMMARY.md** - Overview and checklist

---

## 🎉 You're Live!

Your app is now running at: **https://yourdomain.com**

**Backend API:** https://yourdomain.com/api

**Monitor:** `pm2 logs ethereal-backend`

---

## 📞 Common Commands

```bash
# View backend logs
pm2 logs ethereal-backend

# Restart backend
pm2 restart ethereal-backend

# Stop backend
pm2 stop ethereal-backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Rebuild frontend
npm run build

# Restart Nginx
sudo systemctl restart nginx
```

---

**That's it! Your Ethereal Treasure Market is live! 🚀**

