# Ethereal Treasure Market - Monorepo Structure

This project uses a **monorepo structure** with separate frontend and backend folders, each with their own `package.json` and dependencies.

## 📁 Project Structure

```
ethereal-treasure-market/
├── frontend/                          # React + Vite frontend
│   ├── src/                           # React components, pages, services
│   ├── public/                        # Static assets
│   ├── index.html                     # HTML entry point
│   ├── vite.config.ts                 # Vite configuration
│   ├── tsconfig.app.json              # TypeScript config for app
│   ├── tsconfig.node.json             # TypeScript config for build tools
│   ├── package.json                   # Frontend dependencies
│   ├── tailwind.config.ts             # Tailwind CSS config
│   ├── postcss.config.js              # PostCSS config
│   ├── components.json                # shadcn/ui config
│   ├── eslint.config.js               # ESLint config
│   └── .env.example                   # Environment variables template
│
├── backend/                           # Express.js backend
│   ├── server/                        # Express app, routes, models
│   │   ├── index.ts                   # Main server file
│   │   ├── models/                    # MongoDB models
│   │   ├── routes/                    # API routes
│   │   ├── utils/                     # Utility functions
│   │   └── scripts/                   # Helper scripts
│   ├── package.json                   # Backend dependencies
│   ├── tsconfig.json                  # TypeScript config
│   ├── .env                           # Environment variables (backend)
│   └── .env.example                   # Environment variables template
│
├── package.json                       # Root package.json (monorepo scripts)
├── tsconfig.json                      # Root TypeScript config
├── .gitignore                         # Git ignore rules
├── README.md                          # Main project README
├── MONOREPO_STRUCTURE.md              # This file
├── DEPLOYMENT_GUIDES/                 # Deployment documentation
└── ...
```

## 🚀 Getting Started

### Installation

Install dependencies for all packages:

```bash
npm run install:all
```

Or manually:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### Development

Run both frontend and backend in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Frontend (port 8080)
npm run dev:client

# Terminal 2 - Backend (port 4000)
npm run dev:server
```

### Building

Build the frontend for production:

```bash
npm run build
```

### Other Commands

```bash
# Lint frontend code
npm run lint

# Preview production build
npm run preview

# Initialize MongoDB
npm run init:mongo
```

## 📦 Frontend (`/frontend`)

**Technology Stack:**
- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS
- shadcn/ui components
- React Router
- Zustand (state management)
- React Hook Form
- Zod (validation)

**Key Files:**
- `src/main.tsx` - React entry point
- `src/App.tsx` - Main app component
- `src/pages/` - Page components
- `src/components/` - Reusable components
- `src/services/` - API services
- `src/hooks/` - Custom React hooks

**Environment Variables:**
```
VITE_API_BASE_URL=http://localhost:4000/api
```

## 🔧 Backend (`/backend`)

**Technology Stack:**
- Express.js
- TypeScript
- MongoDB + Mongoose
- CORS
- dotenv

**Key Files:**
- `server/index.ts` - Express server setup
- `server/routes/` - API endpoints
- `server/models/` - MongoDB schemas
- `server/utils/` - Utility functions

**Environment Variables:**
```
CLIENT_URL=http://localhost:8080
PORT=4000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
```

## 🔄 API Communication

The frontend communicates with the backend via HTTP requests:

- **Frontend API Base URL:** `http://localhost:8080` (dev)
- **Backend API Base URL:** `http://localhost:4000/api` (dev)
- **Environment Variable:** `VITE_API_BASE_URL` in frontend

Example API call:
```typescript
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`);
```

## 📝 Scripts Reference

### Root Level Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run both frontend and backend |
| `npm run dev:client` | Run frontend only |
| `npm run dev:server` | Run backend only |
| `npm run build` | Build frontend for production |
| `npm run build:dev` | Build frontend in dev mode |
| `npm run lint` | Lint frontend code |
| `npm run preview` | Preview production build |
| `npm run init:mongo` | Initialize MongoDB |
| `npm run install:all` | Install all dependencies |

### Frontend Scripts

Located in `frontend/package.json`:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run lint` | Lint code |
| `npm run preview` | Preview build |

### Backend Scripts

Located in `backend/package.json`:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start backend with hot reload |
| `npm run start` | Start backend (production) |
| `npm run init:mongo` | Initialize MongoDB |

## 🚢 Deployment

### Frontend Deployment

```bash
cd frontend
npm install
npm run build
# dist/ folder contains production build
```

### Backend Deployment

```bash
cd backend
npm install
npm run start
# or use PM2: pm2 start server/index.ts --name "ethereal-backend"
```

See `HOSTINGER_DEPLOYMENT_GUIDE.md` for complete deployment instructions.

## 📚 Additional Resources

- `README.md` - Main project documentation
- `HOSTINGER_DEPLOYMENT_GUIDE.md` - Deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `QUICK_DEPLOYMENT_SCRIPT.sh` - Automated deployment script

## 🔗 Important Notes

1. **Separate Dependencies:** Frontend and backend have separate `package.json` files with their own dependencies
2. **Environment Variables:** Each folder has its own `.env` file
3. **TypeScript:** Both frontend and backend use TypeScript
4. **Development:** Use `npm run dev` from root to run both simultaneously
5. **Production:** Build frontend separately, run backend with PM2 or Node

## ❓ Troubleshooting

### Port Already in Use

If port 8080 or 4000 is already in use:

```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

### Dependencies Not Installed

```bash
npm run install:all
```

### MongoDB Connection Error

Ensure `MONGODB_URI` is set correctly in `backend/.env`

### API Calls Failing

Check that:
1. Backend is running on port 4000
2. `VITE_API_BASE_URL` is set correctly in frontend
3. CORS is enabled in backend

