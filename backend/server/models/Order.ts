import { Schema, model, type Document } from "mongoose";

export type OrderStatus = "incart" | "paid" | "failed" | "abandoned" | "full_refund" | "partial_refund";
export type PaymentMode = "razorpay" | "tag_mango" | "gpay" | "bank_transfer" | "upi" | "phonepe" | "cash" | "cod";
export type DeliveryStatus = "order_received" | "in_packing" | "ready_to_dispatch" | "shipped" | "in_transit" | "delivered" | "returned";

export interface OrderItem {
  productId: string;
  name: string;
  price: number; // price per unit at time of adding
  image?: string;
  quantity: number;
}

export interface PaymentDetails {
  paymentMode?: PaymentMode;
  dateOfPayment?: Date;
  paymentId?: string;
}

export interface OrderDocument extends Document {
  orderId: string; // Unique order ID like ORD-20250115-001
  userId: string;
  customerName?: string;
  customerEmail?: string;
  status: OrderStatus;
  deliveryStatus?: DeliveryStatus; // Delivery tracking status
  items: OrderItem[];
  subtotal?: number;
  discount?: number;
  angelCoinsUsed?: number;
  angelCoinsDiscount?: number;
  gst?: number;
  shipping?: number;
  total?: number;
  adminRemarks?: string;
  shippingAddress?: Record<string, any>;
  billingAddress?: Record<string, any>;
  gstInvoice?: boolean; // Whether GST invoice is required
  paymentDetails?: PaymentDetails; // Payment details when status is 'paid'
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// Helper function to generate unique order ID
function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
}

const PaymentDetailsSchema = new Schema<PaymentDetails>(
  {
    paymentMode: {
      type: String,
      enum: ["razorpay", "tag_mango", "gpay", "bank_transfer", "upi", "phonepe", "cash", "cod"]
    },
    dateOfPayment: { type: Date },
    paymentId: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: generateOrderId
    },
    userId: { type: String, required: true, index: true },
    customerName: { type: String },
    customerEmail: { type: String },
    status: {
      type: String,
      enum: ["incart", "paid", "failed", "abandoned", "full_refund", "partial_refund"],
      default: "incart",
      index: true
    },
    deliveryStatus: {
      type: String,
      enum: ["order_received", "in_packing", "ready_to_dispatch", "shipped", "in_transit", "delivered", "returned"],
      index: true
    },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number },
    discount: { type: Number },
    angelCoinsUsed: { type: Number },
    angelCoinsDiscount: { type: Number },
    gst: { type: Number },
    shipping: { type: Number },
    total: { type: Number },
    adminRemarks: { type: String },
    shippingAddress: { type: Schema.Types.Mixed },
    billingAddress: { type: Schema.Types.Mixed },
    gstInvoice: { type: Boolean, default: false },
    paymentDetails: { type: PaymentDetailsSchema },
    meta: { type: Schema.Types.Mixed },
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

OrderSchema.index({ userId: 1, status: 1, updatedAt: -1 });

const OrderModel = model<OrderDocument>("Order", OrderSchema);
export default OrderModel;

