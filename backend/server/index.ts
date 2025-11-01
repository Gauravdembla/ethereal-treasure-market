import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import productsRouter from "./routes/products";
import addressesRouter from "./routes/addresses";
import reviewsRouter from "./routes/reviews";
import shopSettingsRouter from "./routes/shopSettings";
import userProfilesRouter from "./routes/userProfiles";
import customersRouter from "./routes/customers";
import ordersRouter from "./routes/orders";

import { ensureMongoConnection } from "./utils/mongo";
import { seedReviewsFromStaticData } from "./utils/seedReviews";

// ───────────────────────────────────────────────────────────────
// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ───────────────────────────────────────────────────────────────
// Middleware
// Parse ALLOWED_ORIGINS from env or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [CLIENT_URL, "http://localhost:8080", "http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));

// ───────────────────────────────────────────────────────────────
// Serve uploaded media files
app.use("/uploads", express.static(path.resolve(__dirname, "..", "server", "uploads")));

// Health check route
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/products", productsRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/shop-settings", shopSettingsRouter);
app.use("/api/user-profiles", userProfilesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/orders", ordersRouter);

// ───────────────────────────────────────────────────────────────
// Serve built frontend (Vite dist folder)
const distPath = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(distPath));

// For any non-API GET request, return index.html (SPA fallback)
// (Express v5-safe pattern; avoids the '*' issue)
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ───────────────────────────────────────────────────────────────
// Connect to Mongo and start server
(async () => {
  try {
    await ensureMongoConnection();
    await seedReviewsFromStaticData();

    app.listen(PORT, () => {
      console.log(`🚀 API + Frontend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server", error);
    process.exit(1);
  }
})();
