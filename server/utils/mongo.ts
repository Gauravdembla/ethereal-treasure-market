import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

export const ensureMongoConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error", err);
    });
  }

  return connectionPromise;
};
