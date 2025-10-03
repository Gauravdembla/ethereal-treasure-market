import mongoose, { Schema } from "mongoose";

export interface ProductDocument extends mongoose.Document {
  id: string;
  sku: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: number;
  originalPrice?: number;
  image: string;
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

const ProductSchema = new Schema<ProductDocument>(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    detailedDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    image: { type: String, default: "/assets/product-placeholder.jpg" },
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
      transform: (_doc: any, ret:any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ProductModel =
  (mongoose.models.Product as mongoose.Model<ProductDocument>) ||
  mongoose.model<ProductDocument>("Product", ProductSchema);
