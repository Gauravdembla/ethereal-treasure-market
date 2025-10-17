import express, { Request, Response, NextFunction } from "express";
import { ShopSettingsModel } from "../models/ShopSettings.js";
import createHttpError from "http-errors";

const router = express.Router();

// Get shop settings (returns the single settings document or creates default)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await ShopSettingsModel.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await ShopSettingsModel.create({});
    }
    
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// Update shop settings
router.put("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = req.body;
    
    // Find existing settings or create new one
    let settings = await ShopSettingsModel.findOne();
    
    if (!settings) {
      settings = await ShopSettingsModel.create(updates);
    } else {
      // Update existing settings
      Object.assign(settings, updates);
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// Get specific setting by key
router.get("/:key", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;
    const settings = await ShopSettingsModel.findOne();
    
    if (!settings) {
      throw createHttpError(404, "Settings not found");
    }
    
    if (!(key in settings.toObject())) {
      throw createHttpError(404, `Setting '${key}' not found`);
    }
    
    res.json({ [key]: (settings as any)[key] });
  } catch (error) {
    next(error);
  }
});

export default router;

