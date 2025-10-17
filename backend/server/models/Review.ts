import mongoose, { Schema } from "mongoose";

export interface ReviewDocument extends mongoose.Document {
  product_id: string; // reference to Product _id or stable id
  product_name: string;
  customer_name: string;
  customer_email?: string; // enforce uniqueness by product when provided
  customer_picture?: string;
  rating: number;
  review_text: string;
  verified: boolean;
  status: "published" | "pending" | "rejected";
  user_id?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<ReviewDocument>(
  {
    product_id: { type: String, required: true, index: true },
    product_name: { type: String, required: true },
    customer_name: { type: String, required: true },
    customer_email: { type: String, index: true },
    customer_picture: { type: String },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    review_text: { type: String, required: true },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ["published", "pending", "rejected"], default: "published", index: true },
    user_id: { type: String, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Unique composite index when customer_email is present
ReviewSchema.index(
  { product_id: 1, customer_email: 1 },
  { unique: true, partialFilterExpression: { customer_email: { $type: "string" } } }
);

export const ReviewModel =
  (mongoose.models.Review as mongoose.Model<ReviewDocument>) ||
  mongoose.model<ReviewDocument>("Review", ReviewSchema);

