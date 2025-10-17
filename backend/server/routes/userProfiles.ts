import express from "express";
import createHttpError from "http-errors";
import UserProfileModel from "../models/UserProfile";

const router = express.Router();

// GET /api/user-profiles/:userId
router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId || typeof userId !== "string") {
      throw new createHttpError.BadRequest("userId is required");
    }

    const doc = await UserProfileModel.findOne({ userId }).lean();
    if (!doc) {
      return res.status(404).json({ message: "User profile not found" });
    }

    return res.json({ userId: doc.userId, companyDetails: doc.companyDetails || null });
  } catch (error) {
    next(error);
  }
});

// PUT /api/user-profiles/:userId (upsert)
router.put("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId || typeof userId !== "string") {
      throw new createHttpError.BadRequest("userId is required");
    }

    const { companyDetails } = req.body || {};
    if (!companyDetails || typeof companyDetails !== "object") {
      throw new createHttpError.BadRequest("companyDetails object is required");
    }

    const { companyName, address, gstNo } = companyDetails;
    if (!companyName || typeof companyName !== "string") {
      throw new createHttpError.BadRequest("companyDetails.companyName is required");
    }
    if (!address || typeof address !== "string") {
      throw new createHttpError.BadRequest("companyDetails.address is required");
    }

    const updated = await UserProfileModel.findOneAndUpdate(
      { userId },
      { userId, companyDetails: { companyName, address, gstNo } },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return res.json({ userId: updated!.userId, companyDetails: updated!.companyDetails || null });
  } catch (error) {
    next(error);
  }
});

router.use((error: unknown, _req, res, _next) => {
  if (createHttpError.isHttpError(error)) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error("Unhandled userProfiles route error", error);
  return res.status(500).json({ message: "Internal server error" });
});

export default router;

