# 📋 Deployment Quick Reference Card

## Pre-Deployment Checklist

```
☐ Hostinger VPS account created
☐ SSH credentials ready
☐ Domain name registered
☐ MongoDB connection string ready
☐ Code pushed to GitHub
☐ All tests passing locally
```

---

## 3-Step Quick Deployment

### Step 1: SSH & Setup (15 min)
```bash
ssh root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs git npm

# Install PM2 & Nginx
npm install -g pm2
apt install -y nginx
```

### Step 2: Clone & Build (15 min)
```bash
mkdir -p /var/www/ethereal-treasure-market
cd /var/www/ethereal-treasure-market
git clone https://github.com/Gauravdembla/ethereal-treasure-market.git .

# Install & build
npm install
npm run build

# Create .env
nano .env
# Add: PORT=4000, NODE_ENV=production, MONGODB_URI=..., etc.
```

### Step 3: Deploy & Secure (20 min)
```bash
# Start backend
pm2 start server/index.ts --name "ethereal-backend" --interpreter tsx
pm2 save

# Configure Nginx (see guide for full config)
nano /etc/nginx/sites-available/ethereal-treasure-market
ln -s /etc/nginx/sites-available/ethereal-treasure-market /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Setup SSL
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

---

## Essential Commands

### Status Checks
```bash
pm2 status                    # Backend status
systemctl status nginx        # Nginx status
systemctl status mongodb      # MongoDB status (if local)
```

### View Logs
```bash
pm2 logs ethereal-backend     # Backend logs
tail -f /var/log/nginx/error.log    # Nginx errors
tail -f /var/log/nginx/access.log   # Nginx access
```

### Restart Services
```bash
pm2 restart ethereal-backend  # Restart backend
systemctl restart nginx       # Restart Nginx
pm2 restart all              # Restart all PM2 apps
```

### Update Code
```bash
cd /var/www/ethereal-treasure-market
git pull origin main
npm install
npm run build
pm2 restart ethereal-backend
```

### Check Ports
```bash
netstat -tlnp | grep 80      # Port 80 (HTTP)
netstat -tlnp | grep 443     # Port 443 (HTTPS)
netstat -tlnp | grep 4000    # Port 4000 (Backend)
```

---

## Environment Variables

```env
PORT=4000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

---

## Directory Structure

```
/var/www/ethereal-treasure-market/
├── dist/                    # Frontend build (served by Nginx)
├── server/                  # Backend code
│   ├── index.ts            # Main server file
│   ├── routes/             # API routes
│   ├── models/             # MongoDB models
│   └── uploads/            # Uploaded files
├── src/                    # Frontend source
├── package.json
├── .env                    # Environment variables
└── vite.config.ts
```

---

## Nginx Config (Minimal)

```nginx
upstream backend {
    server localhost:4000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        root /var/www/ethereal-treasure-market/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads/ {
        alias /var/www/ethereal-treasure-market/server/uploads/;
    }
}
```

---

## Testing Endpoints

```bash
# Frontend
curl https://yourdomain.com

# Backend health
curl https://yourdomain.com/health

# API
curl https://yourdomain.com/api/products

# Local testing
curl http://localhost:4000/health
curl http://localhost/health
```

---

## Troubleshooting Quick Fixes

| Problem | Fix |
|---------|-----|
| Backend not running | `pm2 restart ethereal-backend` |
| Nginx error | `nginx -t && systemctl restart nginx` |
| 502 error | `pm2 logs ethereal-backend` |
| Port in use | `lsof -i :PORT` then `kill -9 PID` |
| SSL error | `certbot renew --force-renewal` |
| DB error | `systemctl restart mongodb` |
| Build failed | `rm -rf node_modules && npm install` |

---

## Monitoring Commands

```bash
# Real-time monitoring
pm2 monit

# Memory usage
free -h

# Disk usage
df -h

# CPU usage
top -b -n 1 | head -20

# Process list
ps aux | grep node
```

---

## Deployment Timeline

```
Phase 1: VPS Setup          → 15 min
Phase 2: Clone & Install    → 10 min
Phase 3: Build & Configure  → 10 min
Phase 4: Start Services     → 5 min
Phase 5: SSL Setup          → 5 min
Phase 6: Verification       → 5 min
─────────────────────────────────────
Total                       → ~50 min
```

---

## Success Checklist

```
✓ Frontend loads at https://yourdomain.com
✓ Backend health: https://yourdomain.com/health
✓ API working: https://yourdomain.com/api/products
✓ Login works
✓ Products display
✓ Cart works
✓ Checkout works
✓ Payment works
✓ Admin panel works
✓ SSL valid
✓ No console errors
✓ No 502 errors
✓ Database connected
✓ Logs show no errors
```

---

## Emergency Commands

```bash
# Kill all PM2 processes
pm2 kill

# Restart everything
pm2 restart all
systemctl restart nginx
systemctl restart mongodb

# Check everything
pm2 status
systemctl status nginx
netstat -tlnp | grep -E ":(80|443|4000)"

# View all logs
pm2 logs
tail -f /var/log/nginx/error.log
```

---

## Useful Links

- **Main Guide:** HOSTINGER_DEPLOYMENT_GUIDE.md
- **Checklist:** DEPLOYMENT_CHECKLIST.md
- **Troubleshooting:** DEPLOYMENT_TROUBLESHOOTING.md
- **Automated Script:** QUICK_DEPLOYMENT_SCRIPT.sh

---

## Important Notes

⚠️ **Security:**
- Change default passwords
- Use strong credentials
- Enable firewall
- Keep SSL updated

⚠️ **Backups:**
- Backup database regularly
- Keep code in Git
- Document configuration

⚠️ **Monitoring:**
- Check logs daily
- Monitor disk space
- Monitor memory usage
- Monitor CPU usage

---

## Support

**If stuck:**
1. Check logs: `pm2 logs ethereal-backend`
2. Check Nginx: `nginx -t`
3. Check ports: `netstat -tlnp`
4. Restart: `pm2 restart all && systemctl restart nginx`
5. Read: DEPLOYMENT_TROUBLESHOOTING.md

---

**Print this card and keep it handy! 📌**

