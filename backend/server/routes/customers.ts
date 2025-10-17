import { Router } from "express";
import CustomerModel from "../models/Customer";

const router = Router();

// Get customer by userId
router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const customer = await CustomerModel.findOne({ userId }).lean();

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.json(customer);
  } catch (err) {
    next(err);
  }
});

// Create or update customer (upsert)
router.put("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      name,
      email,
      phone,
      countryCode,
      profilePicUrl,
      angelCoins,
      leaderboardRank,
      membershipTier,
      badges,
      subscriptions,
      onboarding,
      isBlockedFromCommunityEngagement,
    } = req.body || {};

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: "name and email are required" });
    }

    const updateData = {
      userId,
      name,
      email,
      phone: phone || '',
      countryCode: countryCode || '+91',
      profilePicUrl: profilePicUrl || '',
      angelCoins: typeof angelCoins === 'number' ? angelCoins : 0,
      leaderboardRank: typeof leaderboardRank === 'number' ? leaderboardRank : undefined,
      membershipTier: membershipTier || 'none',
      badges: Array.isArray(badges) ? badges : [],
      subscriptions: Array.isArray(subscriptions) ? subscriptions : [],
      onboarding: onboarding || undefined,
      isBlockedFromCommunityEngagement: isBlockedFromCommunityEngagement || false,
      lastSyncedAt: new Date(),
    };

    const customer = await CustomerModel.findOneAndUpdate(
      { userId },
      updateData,
      { upsert: true, new: true, runValidators: true }
    ).lean();

    console.log(`Customer ${userId} synced to database`);

    return res.json(customer);
  } catch (err) {
    next(err);
  }
});

// Delete customer
router.delete("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const deleted = await CustomerModel.findOneAndDelete({ userId }).lean();
    
    if (!deleted) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.json({ message: "Customer deleted successfully", userId });
  } catch (err) {
    next(err);
  }
});

// List all customers (with optional filters)
router.get("/", async (req, res, next) => {
  try {
    const { membershipTier, limit = 100, skip = 0 } = req.query;
    
    const filter: any = {};
    if (membershipTier && typeof membershipTier === 'string') {
      filter.membershipTier = membershipTier;
    }

    const customers = await CustomerModel.find(filter)
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    return res.json(customers);
  } catch (err) {
    next(err);
  }
});

export default router;

