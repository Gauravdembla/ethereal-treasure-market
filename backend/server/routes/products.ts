import { Router, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { ProductModel } from "../models/Product";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

interface ProductRequestBody {
  sku?: string;
  name?: string;
  description?: string;
  detailedDescription?: string;
  detailed_description?: string;
  price?: number | string;
  originalPrice?: number | string;
  original_price?: number | string;
  image?: string; // legacy single image
  images?: Array<{
    url?: string;
    altText?: string;
    alt_text?: string;
    isPrimary?: boolean;
    is_primary?: boolean;
    sortOrder?: number;
    sort_order?: number;
  }> | string[];
  videoUrl?: string;
  video?: string;
  video_url?: string;
  videoIsPrimary?: boolean | string;
  video_is_primary?: boolean | string;
  videoSortOrder?: number | string;
  video_sort_order?: number | string;
  rating?: number | string;
  benefits?: string[] | string;
  benefitsList?: string[] | string;
  specifications?: Record<string, unknown>;
  category?: string;
  inStock?: boolean | string;
  in_stock?: boolean | string;
  featured?: boolean | string;
  availableQuantity?: number | string;
  available_quantity?: number | string;
  tags?: string[] | string;
}

const normalizePayload = (body: ProductRequestBody) => {
  const toNumber = (value: unknown) => {
    if (value === undefined || value === null || value === "") return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const toBoolean = (value: unknown, fallback = false) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
    return fallback;
  };

  const toStringArray = (value: unknown) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
    if (typeof value === "string") {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return [];
  };

  const toImages = (value: unknown) => {
    if (!value) return [] as Array<{ url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }>;
    if (Array.isArray(value)) {
      return value
        .map((v: any, idx) => {
          if (typeof v === "string") return { url: v, isPrimary: idx === 0, sortOrder: idx };
          const url = v?.url ? String(v.url) : "";
          if (!url) return null;
          return {
            url,
            altText: v?.altText ?? v?.alt_text,
            isPrimary: v?.isPrimary ?? v?.is_primary ?? idx === 0,
            sortOrder: v?.sortOrder ?? v?.sort_order ?? idx,
          };
        })
        .filter(Boolean) as Array<{ url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }>;
    }
    return [] as Array<{ url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }>;
  };

  const specifications =
    body.specifications && typeof body.specifications === "object"
      ? Object.entries(body.specifications).reduce<Record<string, string>>((acc, [key, value]) => {
          acc[key] = typeof value === "string" ? value : String(value);
          return acc;
        }, {})
      : {};

  const benefits = body.benefits ?? body.benefitsList;
  const images = toImages(body.images);
  const videoUrl = (body.videoUrl ?? body.video ?? body.video_url) as string | undefined;
  const videoIsPrimary = toBoolean(body.videoIsPrimary ?? body.video_is_primary, false);
  const videoSortOrder = toNumber(body.videoSortOrder ?? body.video_sort_order) ?? 0;

  const payload: Record<string, unknown> = {
    sku: body.sku,
    name: body.name,
    description: body.description,
    detailedDescription: body.detailedDescription ?? body.detailed_description,
    price: toNumber(body.price),
    originalPrice: toNumber(body.originalPrice ?? body.original_price),
    image: body.image,
    images,
    videoUrl,
    videoIsPrimary,
    videoSortOrder,
    rating: toNumber(body.rating) ?? 5,
    benefits: toStringArray(benefits),
    specifications,
    category: body.category,
    inStock: toBoolean(body.inStock ?? body.in_stock, true),
    featured: toBoolean(body.featured, false),
    availableQuantity: toNumber(body.availableQuantity ?? body.available_quantity) ?? 0,
    tags: toStringArray(body.tags),
  };

  // Backward compatibility: ensure legacy `image` mirrors primary images[0]
  if (!payload.image && images.length > 0) {
    (payload as any).image = images[0].url;
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
};
// Persist data URL media to disk and replace with /uploads/... URLs to avoid Mongo 16MB doc limit
const saveMediaIfDataUrl = (productId: string, payload: any) => {
  try {
    const baseDir = path.resolve(__dirname, "..", "uploads", "products", productId);
    fs.mkdirSync(baseDir, { recursive: true });
    const parseDataUrl = (dataUrl: string): { buffer: Buffer; ext: string } | null => {
      const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
      if (!match) return null;
      const mime = match[1] || "application/octet-stream";
      const b64 = match[2];
      const buffer = Buffer.from(b64, "base64");
      const ext = (mime.split("/")[1] || "bin").split(";")[0];
      return { buffer, ext };
    };

    if (Array.isArray(payload.images)) {
      payload.images = payload.images.map((img: any, idx: number) => {
        const url = img?.url;
        if (typeof url === "string" && url.startsWith("data:")) {
          const parsed = parseDataUrl(url);
          if (parsed) {
            const filename = `img_${Date.now()}_${idx}.${parsed.ext}`;
            fs.writeFileSync(path.join(baseDir, filename), parsed.buffer);
            return { ...img, url: `/uploads/products/${productId}/${filename}` };
          }
        }
        return img;
      });
    }

    if (typeof payload.videoUrl === "string" && payload.videoUrl.startsWith("data:")) {
      const parsed = parseDataUrl(payload.videoUrl);
      if (parsed) {
        const filename = `video_${Date.now()}.${parsed.ext}`;
        fs.writeFileSync(path.join(baseDir, filename), parsed.buffer);
        payload.videoUrl = `/uploads/products/${productId}/${filename}`;
      }
    }
  } catch (e) {
    console.warn("Failed to persist media to uploads folder", e);
  }
};


const mapProductDocument = (product: any) => {
  if (!product) return product;
  const id = product.id ?? (typeof product._id === "object" && "toString" in product._id
    ? product._id.toString()
    : product._id);

  return {
    ...product,
    id,
  };
};

router.get("/", async (_req, res, next) => {
  try {
    const products = await ProductModel.find().sort({ createdAt: -1 }).lean();
    res.json(products.map(mapProductDocument));
  } catch (error: unknown) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id).lean();
    if (!product) {
      throw new createHttpError.NotFound("Product not found");
    }
    res.json(mapProductDocument(product));
  } catch (error: unknown) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);

    if (!payload.sku || !payload.name || !payload.price) {
      throw new createHttpError.BadRequest("Missing required fields: sku, name, price");
    }

    const product = await ProductModel.create(payload);
    res.status(201).json(mapProductDocument(product.toJSON()));
  } catch (error: unknown) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    console.log('[PUT /products/:id] Received body:', JSON.stringify(req.body, null, 2));
    const payload = normalizePayload(req.body);
    console.log('[PUT /products/:id] Normalized payload:', JSON.stringify(payload, null, 2));
    console.log('[PUT /products/:id] Payload images:', payload.images);
    console.log('[PUT /products/:id] Payload videoUrl:', payload.videoUrl);
    console.log('[PUT /products/:id] Payload availableQuantity:', payload.availableQuantity);

    // Persist base64 media to disk and replace with file URLs before saving
    saveMediaIfDataUrl(req.params.id, payload);
    console.log('[PUT /products/:id] After saveMediaIfDataUrl, payload images:', payload.images);
    console.log('[PUT /products/:id] After saveMediaIfDataUrl, payload videoUrl:', payload.videoUrl);

    const updated = await ProductModel.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new createHttpError.NotFound("Product not found");
    }

    const result = mapProductDocument(updated.toJSON());
    console.log('[PUT /products/:id] Returning result:', JSON.stringify(result, null, 2));
    console.log('[PUT /products/:id] Result images:', result.images);
    console.log('[PUT /products/:id] Result videoUrl:', result.videoUrl);
    console.log('[PUT /products/:id] Result availableQuantity:', result.availableQuantity);

    res.json(result);
  } catch (error: any) {
    console.error("PUT /api/products/:id failed:", error?.message || error, error?.stack);
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await ProductModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      throw new createHttpError.NotFound("Product not found");
    }

    res.status(204).send();
  } catch (error: unknown) {
    next(error);
  }
});

// Bulk delete products
router.post("/bulk/delete", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw createHttpError(400, "Product IDs array is required");
    }
    const result = await ProductModel.deleteMany({ _id: { $in: ids } });
    res.json({
      message: `${result.deletedCount} product(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
});

// Bulk update products
router.post("/bulk/update", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw createHttpError(400, "Product IDs array is required");
    }
    if (!updates || typeof updates !== "object") {
      throw createHttpError(400, "Updates object is required");
    }

    // Normalize the updates
    const normalizedUpdates = normalizePayload(updates);

    const result = await ProductModel.updateMany(
      { _id: { $in: ids } },
      { $set: normalizedUpdates }
    );

    res.json({
      message: `${result.modifiedCount} product(s) updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
});

router.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (createHttpError.isHttpError(error)) {
    return res.status(error.statusCode).json({ message: error.message, details: error });
  }

  console.error("Unhandled product route error", error);
  return res.status(500).json({ message: "Internal server error" });
});

export default router;
