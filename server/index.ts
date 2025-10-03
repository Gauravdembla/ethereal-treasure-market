import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productsRouter from "./routes/products";
import addressesRouter from "./routes/addresses";
import { ensureMongoConnection } from "./utils/mongo";
import { seedProductsFromStaticData } from "./utils/seed";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productsRouter);
app.use("/api/addresses", addressesRouter);

(async () => {
  try {
    await ensureMongoConnection();
    await seedProductsFromStaticData();

    app.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
})();
