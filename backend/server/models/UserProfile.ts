import { Schema, model, type Document } from "mongoose";

export interface CompanyDetailsDoc {
  companyName: string;
  address: string;
  gstNo?: string;
}

export interface UserProfileDocument extends Document {
  userId: string;
  companyDetails?: CompanyDetailsDoc;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyDetailsSchema = new Schema<CompanyDetailsDoc>(
  {
    companyName: { type: String, required: true },
    address: { type: String, required: true },
    gstNo: { type: String },
  },
  { _id: false }
);

const UserProfileSchema = new Schema<UserProfileDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    companyDetails: { type: CompanyDetailsSchema, required: false },
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

const UserProfileModel = model<UserProfileDocument>("UserProfile", UserProfileSchema);
export default UserProfileModel;

