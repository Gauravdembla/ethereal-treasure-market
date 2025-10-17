# 🔧 Deployment Troubleshooting Guide

## Common Issues & Solutions

---

## 1. Backend Not Running

### Symptoms
- `pm2 status` shows backend as "stopped" or "errored"
- API endpoints return 502 Bad Gateway
- `curl http://localhost:4000/health` fails

### Solutions

**Check PM2 Status:**
```bash
pm2 status
pm2 logs ethereal-backend
```

**Restart Backend:**
```bash
pm2 restart ethereal-backend
```

**Check for Errors:**
```bash
pm2 logs ethereal-backend --lines 50
```

**Verify Port 4000 is Free:**
```bash
netstat -tlnp | grep 4000
# If something is using it:
lsof -i :4000
kill -9 <PID>
```

**Restart PM2:**
```bash
pm2 kill
pm2 start server/index.ts --name "ethereal-backend" --interpreter tsx
pm2 save
```

---

## 2. Nginx Not Working

### Symptoms
- Frontend not loading
- 502 Bad Gateway errors
- `systemctl status nginx` shows failed

### Solutions

**Test Nginx Configuration:**
```bash
nginx -t
# Should output: "syntax is ok" and "test is successful"
```

**Check Nginx Status:**
```bash
systemctl status nginx
```

**View Nginx Error Log:**
```bash
tail -f /var/log/nginx/error.log
```

**Restart Nginx:**
```bash
systemctl restart nginx
```

**Check if Port 80/443 is Free:**
```bash
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

**Verify Nginx Config:**
```bash
cat /etc/nginx/sites-available/ethereal-treasure-market
# Check if domain is correct
```

---

## 3. MongoDB Connection Error

### Symptoms
- Backend logs show "MongooseError"
- API returns database connection errors
- Products/orders not loading

### Solutions

**Check MongoDB Status (if local):**
```bash
systemctl status mongodb
```

**Restart MongoDB:**
```bash
systemctl restart mongodb
```

**Verify Connection String:**
```bash
# Check .env file
cat /var/www/ethereal-treasure-market/.env | grep MONGODB_URI
```

**Test MongoDB Connection:**
```bash
# For local MongoDB
mongo --eval "db.adminCommand('ping')"

# For MongoDB Atlas
# Use MongoDB Compass or mongosh to test
```

**Check MongoDB Logs:**
```bash
tail -f /var/log/mongodb/mongodb.log
```

**Verify Network Access (for MongoDB Atlas):**
- Go to MongoDB Atlas dashboard
- Check IP whitelist includes your VPS IP
- Add VPS IP if missing: `0.0.0.0/0` (for testing only)

---

## 4. SSL Certificate Issues

### Symptoms
- HTTPS not working
- "Certificate not found" errors
- Mixed content warnings

### Solutions

**Check Certificate Status:**
```bash
certbot certificates
```

**Renew Certificate:**
```bash
certbot renew --dry-run
# If dry run succeeds:
certbot renew
```

**Force Renewal:**
```bash
certbot renew --force-renewal
```

**Check Certificate Expiry:**
```bash
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -noout -dates
```

**Verify Nginx SSL Config:**
```bash
grep -n "ssl" /etc/nginx/sites-available/ethereal-treasure-market
```

**Restart Nginx After SSL Update:**
```bash
systemctl restart nginx
```

---

## 5. Frontend Not Loading

### Symptoms
- Blank page or 404 errors
- CSS/JS files not loading
- "Cannot GET /" error

### Solutions

**Check if Build Exists:**
```bash
ls -la /var/www/ethereal-treasure-market/dist/
# Should contain: index.html, assets/, etc.
```

**Rebuild Frontend:**
```bash
cd /var/www/ethereal-treasure-market
npm run build
```

**Check Nginx Root Path:**
```bash
grep "root" /etc/nginx/sites-available/ethereal-treasure-market
# Should be: /var/www/ethereal-treasure-market/dist
```

**Check File Permissions:**
```bash
ls -la /var/www/ethereal-treasure-market/dist/index.html
# Should be readable by nginx user
chmod -R 755 /var/www/ethereal-treasure-market/dist
```

**Check Nginx Access Log:**
```bash
tail -f /var/log/nginx/access.log
```

---

## 6. API Endpoints Returning 502

### Symptoms
- Frontend loads but API calls fail
- "502 Bad Gateway" errors
- Backend appears to be running

### Solutions

**Check Backend is Running:**
```bash
pm2 status
curl http://localhost:4000/health
```

**Check Nginx Proxy Config:**
```bash
grep -A 10 "location /api/" /etc/nginx/sites-available/ethereal-treasure-market
```

**Verify Backend Port:**
```bash
netstat -tlnp | grep 4000
# Should show: tcp 0 0 127.0.0.1:4000
```

**Check Backend Logs:**
```bash
pm2 logs ethereal-backend
```

**Restart Both Services:**
```bash
pm2 restart ethereal-backend
systemctl restart nginx
```

---

## 7. High Memory Usage

### Symptoms
- VPS running slow
- Out of memory errors
- Services crashing

### Solutions

**Check Memory Usage:**
```bash
free -h
top -b -n 1 | head -20
```

**Check PM2 Memory:**
```bash
pm2 monit
```

**Identify Memory Hogs:**
```bash
ps aux --sort=-%mem | head -10
```

**Restart Services:**
```bash
pm2 restart ethereal-backend
systemctl restart nginx
```

**Clear Cache:**
```bash
npm cache clean --force
```

---

## 8. Disk Space Issues

### Symptoms
- "No space left on device" errors
- Build fails
- Services crash

### Solutions

**Check Disk Space:**
```bash
df -h
```

**Find Large Files:**
```bash
du -sh /var/www/ethereal-treasure-market/*
du -sh /var/log/*
```

**Clean Up:**
```bash
# Clear npm cache
npm cache clean --force

# Clear old logs
pm2 flush

# Remove old node_modules
rm -rf /var/www/ethereal-treasure-market/node_modules
npm install
```

---

## 9. Git Pull Fails

### Symptoms
- "Permission denied" errors
- "Repository not found"
- Merge conflicts

### Solutions

**Check Git Status:**
```bash
cd /var/www/ethereal-treasure-market
git status
```

**Fix Permissions:**
```bash
sudo chown -R $USER:$USER /var/www/ethereal-treasure-market
```

**Setup SSH Key (if using SSH):**
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
# Add to GitHub SSH keys
```

**Pull Latest Code:**
```bash
cd /var/www/ethereal-treasure-market
git pull origin main
```

---

## 10. Environment Variables Not Loading

### Symptoms
- API calls to external services fail
- Database connection fails
- Razorpay not working

### Solutions

**Check .env File:**
```bash
cat /var/www/ethereal-treasure-market/.env
```

**Verify .env Exists:**
```bash
ls -la /var/www/ethereal-treasure-market/.env
```

**Restart Backend to Load .env:**
```bash
pm2 restart ethereal-backend
```

**Check Backend Logs for Env Errors:**
```bash
pm2 logs ethereal-backend | grep -i "env\|undefined"
```

**Verify Variables in Backend:**
```bash
# Add to server/index.ts temporarily:
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("PORT:", process.env.PORT);
```

---

## Quick Diagnostic Commands

```bash
# Overall status
pm2 status
systemctl status nginx
systemctl status mongodb

# Check ports
netstat -tlnp | grep -E ":(80|443|4000|27017)"

# Check logs
pm2 logs ethereal-backend
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Check resources
free -h
df -h
top -b -n 1 | head -20

# Test connectivity
curl http://localhost:4000/health
curl http://localhost/health
curl https://yourdomain.com/health
```

---

## Emergency Restart

If everything is broken:

```bash
# Kill all PM2 processes
pm2 kill

# Restart Nginx
systemctl restart nginx

# Restart MongoDB (if local)
systemctl restart mongodb

# Start backend again
cd /var/www/ethereal-treasure-market
pm2 start server/index.ts --name "ethereal-backend" --interpreter tsx

# Check status
pm2 status
systemctl status nginx
```

---

## Getting Help

If you're still stuck:

1. **Check logs first:**
   ```bash
   pm2 logs ethereal-backend
   tail -f /var/log/nginx/error.log
   ```

2. **Verify configuration:**
   ```bash
   cat /var/www/ethereal-treasure-market/.env
   cat /etc/nginx/sites-available/ethereal-treasure-market
   ```

3. **Test connectivity:**
   ```bash
   curl http://localhost:4000/health
   curl http://localhost/health
   ```

4. **Check resources:**
   ```bash
   free -h
   df -h
   ```

---

**Still need help? Review the main deployment guide: HOSTINGER_DEPLOYMENT_GUIDE.md**

