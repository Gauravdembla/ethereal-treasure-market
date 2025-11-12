# Deployment Guide

## 🚀 Simple Deployment Process

This project uses **GitHub Actions** for automated deployment. Everything is built on GitHub's servers (Linux), then uploaded to your Hostinger server.

### How It Works

1. **You push to `main` branch** → Deployment automatically starts
2. **GitHub Actions builds everything** on Linux (no platform issues!)
3. **Built files are uploaded** to your server via rsync
4. **Backend restarts** automatically with PM2

### No More Issues With:
- ✅ Platform-specific packages (darwin vs linux)
- ✅ npm install failures on the server
- ✅ Permission errors with node_modules
- ✅ Lockfile conflicts

---

## 📋 Prerequisites

### Required GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SSH_HOST` | Your server hostname/IP | `123.45.67.89` or `yourdomain.com` |
| `SSH_USER` | SSH username | `angelsonearthhub-aoeshop` |
| `SSH_PRIVATE_KEY` | SSH private key | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `APP_PATH` | Path to app on server | `/home/angelsonearthhub-aoeshop/htdocs/app` |

### Server Requirements

Your Hostinger server needs:
- Node.js 20.x installed
- PM2 installed globally (`npm install -g pm2`)
- SSH access enabled
- Enough disk space for the application

---

## 🎯 How to Deploy

### Automatic Deployment (Recommended)

Just push to the `main` branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

The deployment will start automatically!

### Manual Deployment

1. Go to GitHub → Actions
2. Click "Deploy to Hostinger (CloudPanel)"
3. Click "Run workflow"
4. Select `main` branch
5. Click "Run workflow"

---

## 📊 Monitoring Deployment

### View Deployment Status

1. Go to: https://github.com/Gauravdembla/ethereal-treasure-market/actions
2. Click on the latest workflow run
3. Watch the progress in real-time

### Deployment Steps

The workflow performs these steps:

1. **📥 Checkout code** - Gets the latest code from GitHub
2. **🔧 Setup Node.js** - Installs Node.js 20
3. **📦 Install dependencies** - Installs all npm packages (with `--no-optional` to skip platform-specific packages)
4. **🏗️ Build frontend** - Compiles React app to static files
5. **📤 Deploy via rsync** - Uploads files to server (fast, only changed files)
6. **🔄 Restart backend** - Restarts the Node.js backend with PM2

---

## 🔧 Server Setup (One-Time)

If this is your first deployment, SSH into your server and run:

```bash
# Install Node.js 20 (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Create app directory (if it doesn't exist)
mkdir -p /home/angelsonearthhub-aoeshop/htdocs/app

# Set proper permissions
chown -R $USER:$USER /home/angelsonearthhub-aoeshop/htdocs/app
```

---

## 🐛 Troubleshooting

### Deployment Failed?

1. **Check GitHub Actions logs:**
   - Go to Actions tab
   - Click on the failed run
   - Expand the failed step to see the error

2. **Common Issues:**

   **SSH Connection Failed:**
   - Verify `SSH_HOST`, `SSH_USER`, and `SSH_PRIVATE_KEY` secrets are correct
   - Make sure SSH access is enabled on your server
   - Check if your IP is whitelisted (if server has firewall)

   **rsync Failed:**
   - Make sure the `APP_PATH` directory exists on the server
   - Check file permissions on the server

   **PM2 Restart Failed:**
   - SSH into server and check PM2 status: `pm2 status`
   - View PM2 logs: `pm2 logs ethereal-backend`
   - Restart manually: `pm2 restart ethereal-backend`

   **Backend Health Check Failed:**
   - This is often just a timing issue (backend still starting)
   - SSH into server and check: `curl http://localhost:4000/health`
   - Check backend logs: `pm2 logs ethereal-backend`

### Manual Deployment (If GitHub Actions Fails)

If you need to deploy manually:

```bash
# 1. SSH into your server
ssh your-user@your-server

# 2. Navigate to app directory
cd /home/angelsonearthhub-aoeshop/htdocs/app

# 3. Pull latest code
git pull origin main

# 4. Install dependencies (on Linux, no platform issues!)
npm ci --no-optional
cd frontend && npm ci --no-optional && cd ..
cd backend && npm ci --no-optional && cd ..

# 5. Build frontend
cd frontend && npm run build && cd ..

# 6. Restart backend
pm2 restart ethereal-backend || (cd backend && pm2 start server/index.ts --name ethereal-backend --interpreter npx --interpreter-args "tsx")
pm2 save

# 7. Check status
pm2 status
curl http://localhost:4000/health
```

---

## 🔍 Checking Deployment Status

### On GitHub

- **Actions tab:** See all deployments and their status
- **Green checkmark:** Deployment successful ✅
- **Red X:** Deployment failed ❌
- **Yellow dot:** Deployment in progress 🟡

### On Server

```bash
# SSH into server
ssh your-user@your-server

# Check PM2 status
pm2 status

# View backend logs
pm2 logs ethereal-backend

# Check backend health
curl http://localhost:4000/health

# Check if frontend files exist
ls -la /home/angelsonearthhub-aoeshop/htdocs/app/frontend/dist
```

---

## 📝 Environment Variables

Make sure your server has a `.env` file in the backend directory:

```bash
# SSH into server
ssh your-user@your-server

# Create/edit .env file
cd /home/angelsonearthhub-aoeshop/htdocs/app/backend
nano .env
```

Required variables:
```env
MONGODB_URI=mongodb://localhost:27017/ethereal-treasure-market
PORT=4000
NODE_ENV=production
```

**Note:** The `.env` file is excluded from rsync deployment, so it won't be overwritten.

---

## 🎉 Success!

If deployment succeeds, you should see:
- ✅ All GitHub Actions steps completed
- ✅ Backend health check passed
- ✅ PM2 shows `ethereal-backend` as `online`
- ✅ Your website is accessible

---

## 📞 Need Help?

1. Check the GitHub Actions logs first
2. SSH into server and check PM2 logs: `pm2 logs ethereal-backend`
3. Check backend health: `curl http://localhost:4000/health`
4. Review this guide for common issues

---

**Last Updated:** 2025-11-12

