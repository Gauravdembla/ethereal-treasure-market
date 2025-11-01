# 🚀 Deploy Development Branch NOW - Step by Step

## Your Configuration
- **VPS IP:** `91.108.105.252`
- **SSH User:** `root`
- **MongoDB URI:** `mongodb+srv://connect_db_user:bl2JT2Wc3Bacj5Lb@cluster0.6pjokiu.mongodb.net/ethereal-treasure`

---

## 📋 Quick Deployment Steps

### Step 1: Copy Deployment Script to VPS

Open your terminal and run:

```bash
cd /Users/nishchaynagpal/Desktop/ethereal-treasure-market
scp DEPLOY_DEVELOPMENT_BRANCH.sh root@91.108.105.252:/root/
```

**Enter your VPS root password when prompted.**

---

### Step 2: SSH into Your VPS

```bash
ssh root@91.108.105.252
```

**Enter your VPS root password when prompted.**

---

### Step 3: Run Deployment Script

Once you're logged into the VPS, run:

```bash
bash /root/DEPLOY_DEVELOPMENT_BRANCH.sh 91.108.105.252 91.108.105.252 "mongodb+srv://connect_db_user:bl2JT2Wc3Bacj5Lb@cluster0.6pjokiu.mongodb.net/ethereal-treasure"
```

**This will:**
- ✅ Install Node.js, Git, PM2, Nginx
- ✅ Clone your development branch
- ✅ Install all dependencies
- ✅ Build the application
- ✅ Configure Nginx
- ✅ Start backend with PM2
- ✅ Setup everything automatically

**Wait 5-10 minutes for completion.**

---

### Step 4: Update Environment Variables

After deployment completes, update the credentials:

```bash
# Edit backend .env
nano /var/www/ethereal-treasure-market/backend/.env
```

Make sure it has:
```env
PORT=4000
NODE_ENV=production
CLIENT_URL=http://91.108.105.252
MONGODB_URI=mongodb+srv://connect_db_user:bl2JT2Wc3Bacj5Lb@cluster0.6pjokiu.mongodb.net/ethereal-treasure
ALLOWED_ORIGINS=http://91.108.105.252
SESSION_SECRET=your-generated-secret
```

**Press `Ctrl+X`, then `Y`, then `Enter` to save.**

```bash
# Edit frontend .env
nano /var/www/ethereal-treasure-market/frontend/.env
```

Make sure it has:
```env
VITE_API_BASE_URL=http://91.108.105.252/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

**Press `Ctrl+X`, then `Y`, then `Enter` to save.**

---

### Step 5: Rebuild and Restart

```bash
cd /var/www/ethereal-treasure-market
npm run build
pm2 restart ethereal-backend
```

---

### Step 6: Verify Deployment

```bash
# Check backend status
pm2 status

# Check backend logs
pm2 logs ethereal-backend --lines 20

# Check Nginx status
systemctl status nginx

# Test health endpoint
curl http://localhost:4000/health
```

---

### Step 7: Access Your Site! 🎉

Open your browser and go to:

**Frontend:** http://91.108.105.252

**Backend API:** http://91.108.105.252/api

**Health Check:** http://91.108.105.252/health

---

## 🔧 Troubleshooting

### If backend is not running:
```bash
pm2 logs ethereal-backend
pm2 restart ethereal-backend
```

### If frontend shows blank page:
```bash
ls -la /var/www/ethereal-treasure-market/frontend/dist/
cd /var/www/ethereal-treasure-market
npm run build
systemctl restart nginx
```

### If MongoDB connection fails:
```bash
# Check .env file
cat /var/www/ethereal-treasure-market/backend/.env

# Make sure MongoDB URI is correct
# Restart backend
pm2 restart ethereal-backend
pm2 logs ethereal-backend
```

---

## 📊 Monitoring Commands

```bash
# Check all services
pm2 status
systemctl status nginx

# View logs
pm2 logs ethereal-backend
tail -f /var/log/nginx/error.log

# Monitor resources
pm2 monit
htop
```

---

## 🔄 Update Code Later

When you push new changes to development branch:

```bash
ssh root@91.108.105.252
cd /var/www/ethereal-treasure-market
git pull origin development
npm run install:all
npm run build
pm2 restart ethereal-backend
```

---

## 🔐 Add Domain Later (Optional)

If you want to add a domain like `dev.etherealmarket.com`:

1. **Point DNS A record to:** `91.108.105.252`

2. **Update Nginx config:**
```bash
nano /etc/nginx/sites-available/ethereal-treasure-market
# Change server_name to your domain
```

3. **Install SSL:**
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d dev.etherealmarket.com
```

---

## ✅ Deployment Checklist

- [ ] Copy script to VPS
- [ ] SSH into VPS
- [ ] Run deployment script
- [ ] Wait for completion
- [ ] Update environment variables
- [ ] Rebuild application
- [ ] Restart services
- [ ] Test in browser
- [ ] Check logs for errors
- [ ] Verify all features work

---

**Ready? Open your terminal and start with Step 1!** 🚀

