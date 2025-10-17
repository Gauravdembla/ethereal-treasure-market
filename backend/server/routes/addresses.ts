import express from "express";
import createHttpError from "http-errors";
import AddressModel, { type AddressDocument } from "../models/Address";

const router = express.Router();

const mapAddressDocument = (address: AddressDocument) => ({
  id: address._id.toString(),
  userId: address.userId,
  type: address.type,
  name: address.name,
  address1: address.address1,
  address2: address.address2 || "",
  nearby: address.nearby || "",
  city: address.city,
  state: address.state,
  country: address.country,
  zipCode: address.zipCode,
  isDefault: address.isDefault,
  fullAddress: [
    address.address1,
    address.address2,
    address.nearby ? `Near ${address.nearby}` : null,
  ]
    .filter((part) => part && part.length > 0)
    .join(", "),
  createdAt: address.createdAt,
  updatedAt: address.updatedAt,
});

const normalizeAddressPayload = (payload: any) => {
  if (!payload || typeof payload !== "object") {
    throw new createHttpError.BadRequest("Invalid address payload");
  }

  const {
    userId,
    type,
    name,
    address1,
    address2,
    nearby,
    city,
    state,
    country,
    zipCode,
    isDefault,
  } = payload;

  if (!userId || typeof userId !== "string") {
    throw new createHttpError.BadRequest("userId is required");
  }
  if (!type || typeof type !== "string") {
    throw new createHttpError.BadRequest("type is required");
  }
  if (!name || typeof name !== "string") {
    throw new createHttpError.BadRequest("name is required");
  }
  if (!address1 || typeof address1 !== "string") {
    throw new createHttpError.BadRequest("address1 is required");
  }
  if (!city || typeof city !== "string") {
    throw new createHttpError.BadRequest("city is required");
  }
  if (!state || typeof state !== "string") {
    throw new createHttpError.BadRequest("state is required");
  }
  if (!country || typeof country !== "string") {
    throw new createHttpError.BadRequest("country is required");
  }
  if (!zipCode || typeof zipCode !== "string") {
    throw new createHttpError.BadRequest("zipCode is required");
  }

  return {
    userId,
    type,
    name,
    address1,
    address2: address2 ?? "",
    nearby: nearby ?? "",
    city,
    state,
    country,
    zipCode,
    isDefault: Boolean(isDefault),
  };
};

router.get("/", async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      throw new createHttpError.BadRequest("userId query parameter is required");
    }

    const addresses = await AddressModel.find({ userId }).sort({ isDefault: -1, updatedAt: -1 });

    res.json(addresses.map(mapAddressDocument));
  } catch (error: unknown) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = normalizeAddressPayload(req.body);

    if (payload.isDefault) {
      await AddressModel.updateMany({ userId: payload.userId }, { isDefault: false });
    }

    const created = await AddressModel.create(payload);
    res.status(201).json(mapAddressDocument(created));
  } catch (error: unknown) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = normalizeAddressPayload(req.body);

    const address = await AddressModel.findOneAndUpdate(
      { _id: id, userId: payload.userId },
      payload,
      { new: true, runValidators: true },
    );

    if (!address) {
      throw new createHttpError.NotFound("Address not found");
    }

    if (payload.isDefault) {
      await AddressModel.updateMany(
        { userId: payload.userId, _id: { $ne: id } },
        { isDefault: false },
      );
    }

    res.json(mapAddressDocument(address));
  } catch (error: unknown) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      throw new createHttpError.BadRequest("userId query parameter is required");
    }

    const deleted = await AddressModel.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      throw new createHttpError.NotFound("Address not found");
    }

    if (deleted.isDefault) {
      const nextDefault = await AddressModel.findOne({ userId }).sort({ updatedAt: -1 });
      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }

    res.status(204).send();
  } catch (error: unknown) {
    next(error);
  }
});

router.use((error: unknown, _req, res, _next) => {
  if (createHttpError.isHttpError(error)) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error("Unhandled address route error", error);
  return res.status(500).json({ message: "Internal server error" });
});

export default router;
