# ✅ Hostinger VPS Deployment Checklist

## Pre-Deployment

- [ ] Hostinger VPS account created
- [ ] SSH access credentials ready
- [ ] Domain name registered (optional)
- [ ] MongoDB connection string ready
- [ ] All environment variables prepared
- [ ] Code pushed to GitHub main branch
- [ ] All tests passing locally

---

## Step-by-Step Deployment

### Phase 1: VPS Setup (15 minutes)

- [ ] SSH into VPS: `ssh root@YOUR_VPS_IP`
- [ ] Update system: `apt update && apt upgrade -y`
- [ ] Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && apt install -y nodejs`
- [ ] Install Git: `apt install -y git`
- [ ] Install PM2: `npm install -g pm2`
- [ ] Install Nginx: `apt install -y nginx && systemctl start nginx && systemctl enable nginx`
- [ ] Install MongoDB (optional): `apt install -y mongodb && systemctl start mongodb`

### Phase 2: Clone & Setup (10 minutes)

- [ ] Create app directory: `mkdir -p /var/www/ethereal-treasure-market && cd /var/www/ethereal-treasure-market`
- [ ] Clone repo: `git clone https://github.com/Gauravdembla/ethereal-treasure-market.git .`
- [ ] Verify clone: `ls -la` (check for package.json, server/, src/)
- [ ] Install dependencies: `npm install`
- [ ] Create .env file: `nano .env`
- [ ] Add all environment variables
- [ ] Save .env file: `Ctrl+X → Y → Enter`

### Phase 3: Build & Configure (10 minutes)

- [ ] Build frontend: `npm run build`
- [ ] Verify build: `ls -la dist/` (check for index.html, assets/)
- [ ] Create Nginx config: `nano /etc/nginx/sites-available/ethereal-treasure-market`
- [ ] Add Nginx configuration (see guide)
- [ ] Enable site: `ln -s /etc/nginx/sites-available/ethereal-treasure-market /etc/nginx/sites-enabled/`
- [ ] Test Nginx: `nginx -t` (should show "syntax is ok")
- [ ] Restart Nginx: `systemctl restart nginx`

### Phase 4: Start Services (5 minutes)

- [ ] Start backend: `pm2 start server/index.ts --name "ethereal-backend" --interpreter tsx`
- [ ] Verify backend: `pm2 list` (should show ethereal-backend as online)
- [ ] Check logs: `pm2 logs ethereal-backend` (should show no errors)
- [ ] Save PM2: `pm2 save && pm2 startup`

### Phase 5: SSL & HTTPS (5 minutes)

- [ ] Install Certbot: `apt install -y certbot python3-certbot-nginx`
- [ ] Get SSL cert: `certbot --nginx -d yourdomain.com -d www.yourdomain.com`
- [ ] Enable auto-renewal: `systemctl enable certbot.timer && systemctl start certbot.timer`

### Phase 6: Verification (5 minutes)

- [ ] Check Nginx status: `systemctl status nginx`
- [ ] Check PM2 status: `pm2 status`
- [ ] Test frontend: `curl http://yourdomain.com`
- [ ] Test backend health: `curl http://yourdomain.com/health`
- [ ] Test API: `curl http://yourdomain.com/api/products`
- [ ] Check Nginx logs: `tail -f /var/log/nginx/error.log`
- [ ] Check PM2 logs: `pm2 logs ethereal-backend`

---

## Environment Variables Needed

```env
# Server
PORT=4000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ethereal-treasure-market

# Frontend API
VITE_API_BASE_URL=https://yourdomain.com/api

# Supabase (if using)
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

# Razorpay (if using)
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

---

## Post-Deployment

- [ ] Visit https://yourdomain.com in browser
- [ ] Test login functionality
- [ ] Test product browsing
- [ ] Test cart functionality
- [ ] Test checkout flow
- [ ] Test payment (use test mode)
- [ ] Check admin panel
- [ ] Monitor logs for errors
- [ ] Setup monitoring/alerts (optional)

---

## Maintenance Tasks

### Daily
- [ ] Monitor error logs: `pm2 logs ethereal-backend`
- [ ] Check disk space: `df -h`
- [ ] Check memory: `free -h`

### Weekly
- [ ] Review Nginx logs: `tail -f /var/log/nginx/access.log`
- [ ] Check for updates: `apt update`
- [ ] Backup database (if local MongoDB)

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Review SSL certificate expiry: `certbot certificates`
- [ ] Full system update: `apt upgrade -y`

---

## Useful Commands

### View Logs
```bash
pm2 logs ethereal-backend          # Backend logs
tail -f /var/log/nginx/error.log   # Nginx errors
tail -f /var/log/nginx/access.log  # Nginx access
```

### Restart Services
```bash
pm2 restart ethereal-backend       # Restart backend
systemctl restart nginx            # Restart Nginx
pm2 restart all                    # Restart all PM2 apps
```

### Update Code
```bash
cd /var/www/ethereal-treasure-market
git pull origin main
npm install
npm run build
pm2 restart ethereal-backend
```

### Check Status
```bash
pm2 status                         # PM2 apps
systemctl status nginx             # Nginx
systemctl status mongodb           # MongoDB (if local)
netstat -tlnp | grep 4000         # Port 4000
netstat -tlnp | grep 80           # Port 80
```

---

## Troubleshooting Quick Links

| Issue | Command |
|---|---|
| Backend not running | `pm2 restart ethereal-backend` |
| Nginx not working | `nginx -t && systemctl restart nginx` |
| Port 4000 in use | `lsof -i :4000` |
| Port 80 in use | `lsof -i :80` |
| MongoDB error | `systemctl restart mongodb` |
| SSL error | `certbot renew --force-renewal` |

---

## Estimated Time

- **Total Setup Time:** ~50 minutes
- **First Deployment:** ~1 hour (including SSL)
- **Subsequent Updates:** ~5 minutes

---

## Support

If you encounter issues:
1. Check logs: `pm2 logs ethereal-backend`
2. Check Nginx: `nginx -t`
3. Check ports: `netstat -tlnp`
4. Restart services: `pm2 restart all && systemctl restart nginx`
5. Review guide: See HOSTINGER_DEPLOYMENT_GUIDE.md

---

**Ready to deploy? Follow the steps above! 🚀**

