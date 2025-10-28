import mongoose, { Schema } from "mongoose";

export interface ProductDocument extends mongoose.Document {
  id: string;
  sku: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images: string[];
  rating: number;
  benefits: string[];
  specifications: Record<string, string>;
  category: string;
  inStock: boolean;
  featured: boolean;
  availableQuantity: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const specificationSchema = new Schema({}, { strict: false, _id: false });
export const PRODUCT_DEFAULT_IMAGE = "/assets/product-placeholder.jpg";

const ProductSchema = new Schema<ProductDocument>(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    detailedDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    images: {
      type: [String],
      default: [PRODUCT_DEFAULT_IMAGE],
      set: (values: unknown) => {
        const items = Array.isArray(values) ? values : [values];
        const sanitized = items
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter((item): item is string => item.length > 0);
        const unique = Array.from(new Set(sanitized));
        return unique.length > 0 ? unique : [PRODUCT_DEFAULT_IMAGE];
      },
    },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    benefits: { type: [String], default: [] },
    specifications: { type: specificationSchema, default: {} },
    category: { type: String, default: "" },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    availableQuantity: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        const images = Array.isArray(ret.images)
          ? ret.images
              .map((value: unknown) => (typeof value === "string" ? value.trim() : ""))
              .filter((value: string) => value.length > 0)
          : [];
        const uniqueImages = Array.from(new Set(images));
        ret.images = uniqueImages.length > 0 ? uniqueImages : [PRODUCT_DEFAULT_IMAGE];
        ret.image = ret.images[0];
        return ret;
      },
    },
  }
);

export const ProductModel =
  (mongoose.models.Product as mongoose.Model<ProductDocument>) ||
  mongoose.model<ProductDocument>("Product", ProductSchema);
