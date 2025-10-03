import { Schema, model, type Document } from "mongoose";

export interface AddressDocument extends Document {
  userId: string;
  type: string;
  name: string;
  address1: string;
  address2?: string;
  nearby?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<AddressDocument>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String },
    nearby: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

addressSchema.index({ userId: 1, isDefault: 1 });

const AddressModel = model<AddressDocument>("Address", addressSchema);

export default AddressModel;
