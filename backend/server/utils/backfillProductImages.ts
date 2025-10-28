import type { AnyBulkWriteOperation } from "mongodb";
import { ProductModel, PRODUCT_DEFAULT_IMAGE } from "../models/Product";
import type { ProductDocument } from "../models/Product";

const buildImagesArray = (product: { images?: unknown; image?: unknown }) => {
  const rawImages = Array.isArray(product.images) ? product.images : [];
  const normalizedImages = rawImages
    .map((img) => (typeof img === "string" ? img.trim() : ""))
    .filter((img): img is string => img.length > 0);

  const legacyImage =
    typeof product.image === "string" && product.image.trim().length > 0
      ? product.image.trim()
      : undefined;

  const combined = legacyImage ? [legacyImage, ...normalizedImages] : normalizedImages;
  const unique = Array.from(new Set(combined));

  return unique.length > 0 ? unique : [PRODUCT_DEFAULT_IMAGE];
};

const arraysEqual = (first: string[], second: string[]) => {
  if (first.length !== second.length) return false;
  return first.every((value, index) => value === second[index]);
};

type UpdatePayload = {
  $set?: { images: string[] };
  $unset?: { image: "" };
};

export const backfillProductImages = async () => {
  try {
    const products = await ProductModel.find()
      .select({ _id: 1, images: 1, image: 1 })
      .lean();

    if (!products.length) {
      return;
    }

    const operations = products.reduce<AnyBulkWriteOperation<ProductDocument>[]>((acc, product) => {
      const currentImages = Array.isArray(product.images)
        ? Array.from(
            new Set(
              product.images
                .map((img: unknown) => (typeof img === "string" ? img.trim() : ""))
                .filter((img: string) => img.length > 0)
            )
          )
        : [];

      const desiredImages = buildImagesArray(product);

      const update: UpdatePayload = {};
      let requiresUpdate = false;

      if (!arraysEqual(currentImages, desiredImages)) {
        update.$set = { images: desiredImages };
        requiresUpdate = true;
      }

      if (Object.prototype.hasOwnProperty.call(product, "image")) {
        update.$unset = { image: "" };
        requiresUpdate = true;
      }

      if (requiresUpdate) {
        acc.push({
          updateOne: {
            filter: { _id: product._id },
            update,
          },
        });
      }

      return acc;
    }, []);

    if (operations.length === 0) {
      return;
    }

    await ProductModel.bulkWrite(operations, { ordered: false });
    console.log(`Backfilled product images for ${operations.length} records.`);
  } catch (error) {
    console.error("Failed to backfill product images array", error);
  }
};

