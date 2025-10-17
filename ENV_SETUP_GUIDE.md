# 🔐 Environment Variables Setup Guide

## 📁 File Locations

```
ethereal-treasure-market/
├── backend/
│   ├── .env              ← Backend environment variables
│   └── .env.example      ← Template (reference only)
├── frontend/
│   └── .env              ← Frontend environment variables
└── .gitignore            ← .env files are ignored (not committed)
```

---

## 🔧 Backend Environment Setup

### Location: `backend/.env`

**Create the file:**

```bash
cd backend
nano .env
```

**Paste this content and update with your values:**

```env
# ============================================
# BACKEND CONFIGURATION
# ============================================

# Server Port
PORT=4000

# Environment
NODE_ENV=production

# Frontend URL (for CORS)
CLIENT_URL=https://yourdomain.com

# ============================================
# DATABASE CONFIGURATION
# ============================================

# MongoDB Atlas Connection String
# Format: mongodb+srv://username:password@cluster.mongodb.net/database_name
MONGODB_URI=mongodb+srv://connect_db_user:bl2JT2Wc3Bacj5Lb@cluster0.6pjokiu.mongodb.net/ethereal_market?retryWrites=true&w=majority

# ============================================
# EMAIL CONFIGURATION (Optional)
# ============================================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# ============================================
# PAYMENT GATEWAY (Optional)
# ============================================

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# ============================================
# JWT CONFIGURATION (Optional)
# ============================================

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

**Save:** `Ctrl+X` → `Y` → `Enter`

---

## 🎨 Frontend Environment Setup

### Location: `frontend/.env`

**Create the file:**

```bash
cd frontend
nano .env
```

**Paste this content and update with your values:**

```env
# ============================================
# FRONTEND CONFIGURATION
# ============================================

# Backend API URL
VITE_API_URL=https://yourdomain.com/api

# App Name
VITE_APP_NAME=Ethereal Treasure Market

# ============================================
# SUPABASE CONFIGURATION (Optional)
# ============================================

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ============================================
# FEATURE FLAGS (Optional)
# ============================================

VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_REVIEWS=true
```

**Save:** `Ctrl+X` → `Y` → `Enter`

---

## 🚀 Local Development Setup

### Backend (.env for local)

```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:8080
MONGODB_URI=mongodb+srv://connect_db_user:bl2JT2Wc3Bacj5Lb@cluster0.6pjokiu.mongodb.net/ethereal_market?retryWrites=true&w=majority
```

### Frontend (.env for local)

```env
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=Ethereal Treasure Market
```

---

## 🔑 Getting Your Values

### MongoDB URI

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Connect" on your cluster
3. Select "Drivers"
4. Copy the connection string
5. Replace `<password>` with your database password

**Example:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
```

### Razorpay Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to Settings → API Keys
3. Copy Key ID and Key Secret

### Gmail SMTP

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use the generated password as `SMTP_PASS`

### Supabase Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy URL and Anon Key

---

## ✅ Verification Checklist

### Backend

```bash
cd backend
# Check if .env exists
ls -la .env

# Verify MongoDB connection
npm run dev
# Should start without errors
```

### Frontend

```bash
cd frontend
# Check if .env exists
ls -la .env

# Verify API URL is correct
npm run dev
# Should start on http://localhost:8080
```

---

## 🔒 Security Best Practices

✅ **DO:**
- Keep `.env` files in `.gitignore` (already configured)
- Use strong, unique passwords
- Rotate keys regularly
- Use environment-specific values
- Store secrets securely

❌ **DON'T:**
- Commit `.env` files to Git
- Share `.env` files via email/chat
- Use same keys for dev and production
- Hardcode secrets in code
- Push `.env` to public repositories

---

## 📋 Environment Variables by Environment

### Development

```env
# backend/.env
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:8080

# frontend/.env
VITE_API_URL=http://localhost:4000/api
```

### Production (Hostinger)

```env
# backend/.env
NODE_ENV=production
PORT=4000
CLIENT_URL=https://yourdomain.com

# frontend/.env
VITE_API_URL=https://yourdomain.com/api
```

### Staging

```env
# backend/.env
NODE_ENV=staging
PORT=4000
CLIENT_URL=https://staging.yourdomain.com

# frontend/.env
VITE_API_URL=https://staging.yourdomain.com/api
```

---

## 🆘 Troubleshooting

### "Cannot find module .env"

```bash
# Make sure .env file exists
touch backend/.env
touch frontend/.env
```

### "MongoDB connection failed"

```bash
# Check connection string format
# Verify IP whitelist in MongoDB Atlas
# Test connection: npm run dev
```

### "API calls returning 404"

```bash
# Check VITE_API_URL in frontend/.env
# Verify backend is running on correct port
# Check CORS settings in backend
```

### "Port already in use"

```bash
# Kill process using port
lsof -i :4000
kill -9 <PID>
```

---

## 📞 Quick Reference

| File | Location | Purpose |
|------|----------|---------|
| Backend .env | `backend/.env` | Backend configuration |
| Frontend .env | `frontend/.env` | Frontend configuration |
| .env.example | `backend/.env.example` | Template reference |

**Remember:** Always create `.env` files locally and on the server. Never commit them to Git!

