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
import { ensureMongoConnection } from "./utils/mongo";
// Seeding: only reviews for now (products already exist)
import { seedReviewsFromStaticData } from "./utils/seedReviews";
import ordersRouter from "./routes/orders";

// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// CORS: allow both Vite (5173) and the app on 8080
app.use(cors({ origin: [CLIENT_URL, "http://localhost:8080"], credentials: true }));
// Increase body size limits to support large base64 images/videos from admin editor
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));

// Serve uploaded media files (files are saved under server/uploads)
// Note: __dirname in compiled JS points to dist/, so we go up one level then into server/uploads
app.use("/uploads", express.static(path.resolve(__dirname, "..", "server", "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productsRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/shop-settings", shopSettingsRouter);
app.use("/api/user-profiles", userProfilesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/orders", ordersRouter);

(async () => {
  try {
    await ensureMongoConnection();
    // await seedProductsFromStaticData();
    await seedReviewsFromStaticData();

    app.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
})();
