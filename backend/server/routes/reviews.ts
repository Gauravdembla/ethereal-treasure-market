import { Router, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { ReviewModel } from "../models/Review";

const router = Router();

const isNonEmptyArray = (val: unknown): val is string[] => Array.isArray(val) && val.length > 0 && val.every(v => typeof v === "string" && v.trim().length > 0);

interface ReviewRequestBody {
  product_id?: string;
  product_name?: string;
  customer_name?: string;
  customer_email?: string;
  customer_picture?: string;
  rating?: number | string;
  review_text?: string;
  verified?: boolean | string;
  status?: "published" | "pending" | "rejected" | string;
  user_id?: string;
}

const normalizePayload = (body: ReviewRequestBody) => {
  const toNumber = (value: unknown) => {
    if (value === undefined || value === null || value === "") return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };
  const toBoolean = (value: unknown) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
    return undefined;
  };

  const payload: Record<string, unknown> = {
    product_id: body.product_id,
    product_name: body.product_name,
    customer_name: body.customer_name,
    customer_email: body.customer_email,
    customer_picture: body.customer_picture,
    rating: toNumber(body.rating),
    review_text: body.review_text,
    verified: toBoolean(body.verified),
    status: body.status,
    user_id: body.user_id,
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key];
  });

  return payload;
};

const mapDoc = (doc: any) => {
  if (!doc) return doc;
  const id = doc.id ?? (typeof doc._id === "object" && "toString" in doc._id ? doc._id.toString() : doc._id);
  return { ...doc, id };
};

// GET /api/reviews
// supports query: productId, status, rating, search, page, limit
router.get("/", async (req, res, next) => {
  try {
    const { productId, status, rating, search } = req.query as {
      productId?: string; status?: string; rating?: string; search?: string;
    };
    const page = Math.max(parseInt(String(req.query.page ?? '1')), 1);
    const limit = Math.max(Math.min(parseInt(String(req.query.limit ?? '0')), 200), 0); // 0 = no limit (legacy)

    const filter: Record<string, unknown> = {};
    if (productId) filter.product_id = productId;
    if (status && ["published", "pending", "rejected"].includes(status)) filter.status = status;
    if (rating && !Number.isNaN(Number(rating))) filter.rating = Number(rating);
    if (search && search.trim().length > 0) {
      const rx = new RegExp(search.trim(), 'i');
      Object.assign(filter, { $or: [{ product_name: rx }, { customer_name: rx }, { review_text: rx }] });
    }

    if (limit > 0) {
      const [items, total] = await Promise.all([
        ReviewModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        ReviewModel.countDocuments(filter),
      ]);
      return res.json({ items: items.map(mapDoc), total, page, pageSize: limit });
    } else {
      const items = await ReviewModel.find(filter).sort({ createdAt: -1 }).lean();
      return res.json(items.map(mapDoc));
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/reviews/counts?productIds=a,b,c (published only unless status provided)
router.get("/counts", async (req, res, next) => {
  try {
    const productIds = String(req.query.productIds || '').split(',').map(s => s.trim()).filter(Boolean);
    const status = String(req.query.status || 'published');
    if (productIds.length === 0) return res.json({});
    const docs = await ReviewModel.aggregate([
      { $match: { product_id: { $in: productIds }, ...(status ? { status } : {}) } },
      { $group: { _id: "$product_id", count: { $sum: 1 } } },
    ]);
    const map: Record<string, number> = {};
    for (const d of docs) map[d._id] = d.count;
    return res.json(map);
  } catch (error) {
    next(error);
  }
});

// GET /api/reviews/:id
router.get("/:id", async (req, res, next) => {
  try {
    const review = await ReviewModel.findById(req.params.id).lean();
    if (!review) throw new createHttpError.NotFound("Review not found");
    res.json(mapDoc(review));
  } catch (error) {
    next(error);
  }
});

// POST /api/reviews
router.post("/", async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    if (!payload.product_id || !payload.product_name || !payload.customer_name || !payload.review_text) {
      throw new createHttpError.BadRequest("Missing required fields: product_id, product_name, customer_name, review_text");
    }
    // Enforce uniqueness by (product_id, customer_email) when email provided
    if (payload.product_id && payload.customer_email) {
      const exists = await ReviewModel.findOne({ product_id: payload.product_id, customer_email: payload.customer_email });
      if (exists) {
        throw new createHttpError.Conflict("Customer has already reviewed this product");
      }
    }
    const created = await ReviewModel.create(payload);
    res.status(201).json(mapDoc(created.toJSON()));
  } catch (error) {
    next(error);
  }
});

// PUT /api/reviews/:id
router.put("/:id", async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    const updated = await ReviewModel.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!updated) throw new createHttpError.NotFound("Review not found");
    res.json(mapDoc(updated.toJSON()));
  } catch (error) {
    next(error);
  }
});

// DELETE /api/reviews/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await ReviewModel.findByIdAndDelete(req.params.id);
    if (!deleted) throw new createHttpError.NotFound("Review not found");
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// BULK: create many
router.post("/bulk/create", async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) throw new createHttpError.BadRequest("Provide items: Review[]");

    const docs = items.map((b: any) => {
      const payload = normalizePayload(b);
      if (!payload.product_id || !payload.product_name || !payload.customer_name || !payload.review_text) {
        throw new createHttpError.BadRequest("Each item requires: product_id, product_name, customer_name, review_text");
      }
      return payload;
    });

    const created = await ReviewModel.insertMany(docs, { ordered: false });
    res.status(201).json(created.map((c) => mapDoc(c.toJSON?.() || c)));
  } catch (error) {
    next(error);
  }
});

// BULK: update many by ids
router.post("/bulk/update", async (req, res, next) => {
  try {
    const ids = req.body?.ids;
    const update = normalizePayload(req.body?.update || {});
    if (!isNonEmptyArray(ids)) throw new createHttpError.BadRequest("Provide non-empty ids: string[]");
    if (Object.keys(update).length === 0) throw new createHttpError.BadRequest("Provide fields in update");

    const result = await ReviewModel.updateMany({ _id: { $in: ids } }, { $set: update });
    const { matchedCount = 0, modifiedCount = 0 } = result as unknown as {
      matchedCount?: number;
      modifiedCount?: number;
    };
    res.json({ matched: matchedCount, modified: modifiedCount });
  } catch (error) {
    next(error);
  }
});

// BULK: update by filter/scope
router.post("/bulk/update-scope", async (req, res, next) => {
  try {
    const { productId, productIds, status, rating, search, verified } = req.body?.filter || {};
    const update = normalizePayload(req.body?.update || {});
    if (Object.keys(update).length === 0) throw new createHttpError.BadRequest("Provide fields in update");

    const filter: Record<string, unknown> = {};
    if (Array.isArray(productIds) && productIds.length > 0) filter.product_id = { $in: productIds };
    else if (productId) filter.product_id = productId;
    if (status && ["published","pending","rejected"].includes(status)) filter.status = status;
    if (rating && !Number.isNaN(Number(rating))) filter.rating = Number(rating);
    if (typeof verified === 'boolean') filter.verified = verified;
    if (search && String(search).trim().length > 0) {
      const rx = new RegExp(String(search).trim(), 'i');
      Object.assign(filter, { $or: [{ product_name: rx }, { customer_name: rx }, { review_text: rx }] });
    }

    const result = await ReviewModel.updateMany(filter, { $set: update });
    const { matchedCount = 0, modifiedCount = 0 } = result as unknown as {
      matchedCount?: number;
      modifiedCount?: number;
    };
    res.json({ matched: matchedCount, modified: modifiedCount });
  } catch (error) {
    next(error);
  }
});

// BULK: delete many by ids
router.post("/bulk/delete", async (req, res, next) => {
  try {
    const ids = req.body?.ids;
    if (!isNonEmptyArray(ids)) throw new createHttpError.BadRequest("Provide non-empty ids: string[]");
    const result = await ReviewModel.deleteMany({ _id: { $in: ids } });
    res.json({ deleted: result.deletedCount || 0 });
  } catch (error) {
    next(error);
  }
});

router.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (createHttpError.isHttpError(error)) {
    return res.status(error.statusCode).json({ message: error.message, details: error });
  }
  console.error("Unhandled reviews route error", error);
  return res.status(500).json({ message: "Internal server error" });
});

export default router;
