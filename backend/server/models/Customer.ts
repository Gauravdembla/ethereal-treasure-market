import { Schema, model, type Document } from "mongoose";

export interface Badge {
  _id: string;
  creator: string;
  name: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscription {
  _id: string;
  creator: string;
  status: string;
  mango: {
    _id: string;
    title: string;
    price: number;
    currency: string;
    description: string;
    isHidden: boolean;
    recurringType: string;
  };
}

export interface CustomerDocument extends Document {
  userId: string; // External user ID from AOE system
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  profilePicUrl: string;
  angelCoins: number; // score from API
  leaderboardRank?: number;
  membershipTier: 'diamond' | 'platinum' | 'gold' | 'none';
  badges: Badge[];
  subscriptions: Subscription[];
  onboarding?: string;
  isBlockedFromCommunityEngagement?: boolean;
  // Metadata
  lastSyncedAt: Date; // Last time data was synced from external API
  createdAt: Date;
  updatedAt: Date;
}

const BadgeSchema = new Schema<Badge>(
  {
    _id: { type: String, required: true },
    creator: { type: String, required: true },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    createdAt: { type: String },
    updatedAt: { type: String },
  },
  { _id: false }
);

const SubscriptionSchema = new Schema<Subscription>(
  {
    _id: { type: String, required: true },
    creator: { type: String, required: true },
    status: { type: String, required: true },
    mango: {
      _id: { type: String, required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      currency: { type: String, required: true },
      description: { type: String, required: true },
      isHidden: { type: Boolean, required: true },
      recurringType: { type: String, required: true },
    },
  },
  { _id: false }
);

const CustomerSchema = new Schema<CustomerDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    countryCode: { type: String, default: '+91' },
    profilePicUrl: { type: String, default: '' },
    angelCoins: { type: Number, default: 0 },
    leaderboardRank: { type: Number },
    membershipTier: { 
      type: String, 
      enum: ['diamond', 'platinum', 'gold', 'none'], 
      default: 'none' 
    },
    badges: { type: [BadgeSchema], default: [] },
    subscriptions: { type: [SubscriptionSchema], default: [] },
    onboarding: { type: String },
    isBlockedFromCommunityEngagement: { type: Boolean, default: false },
    lastSyncedAt: { type: Date, default: Date.now },
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

// Index for faster lookups (userId already has index: true in schema, so we don't need to add it again)
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ membershipTier: 1 });

const CustomerModel = model<CustomerDocument>("Customer", CustomerSchema);
export default CustomerModel;

