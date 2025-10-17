const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const toApiUrl = (path: string) => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export type OrderStatus = "incart" | "paid" | "failed" | "abandoned" | "full_refund" | "partial_refund";
export type PaymentMode = "razorpay" | "tag_mango" | "gpay" | "bank_transfer" | "upi" | "phonepe" | "cash" | "cod";
export type DeliveryStatus = "order_received" | "in_packing" | "ready_to_dispatch" | "shipped" | "in_transit" | "delivered" | "returned";

export interface OrderItemDto {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface PaymentDetails {
  paymentMode?: PaymentMode;
  dateOfPayment?: string;
  paymentId?: string;
}

export interface OrderDto {
  id: string;
  orderId: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: OrderStatus;
  deliveryStatus?: DeliveryStatus;
  items: OrderItemDto[];
  subtotal?: number;
  discount?: number;
  angelCoinsUsed?: number;
  angelCoinsDiscount?: number;
  gst?: number;
  shipping?: number;
  total?: number;
  adminRemarks?: string;
  shippingAddress?: any;
  billingAddress?: any;
  gstInvoice?: boolean;
  paymentDetails?: PaymentDetails;
  createdAt?: string;
  updatedAt?: string;
}

export const orderService = {
  async listAll(status?: OrderStatus): Promise<OrderDto[]> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    const res = await fetch(toApiUrl(`orders${qs}`), { credentials: "include" });
    if (!res.ok) throw new Error(`Failed to list orders: ${res.status}`);
    return res.json();
  },
  async listByUser(userId: string): Promise<OrderDto[]> {
    const res = await fetch(toApiUrl(`orders/user/${encodeURIComponent(userId)}`), { credentials: "include" });
    if (!res.ok) throw new Error(`Failed to list user orders: ${res.status}`);
    return res.json();
  },
  async getInCart(userId: string): Promise<OrderDto | null> {
    const res = await fetch(toApiUrl(`orders/incart/${encodeURIComponent(userId)}`), { credentials: "include" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch in-cart order: ${res.status}`);
    return res.json();
  },
  async saveInCart(userId: string, items: OrderItemDto[], subtotal?: number, total?: number, meta?: any, customerName?: string, customerEmail?: string, gstInvoice?: boolean): Promise<OrderDto> {
    const res = await fetch(toApiUrl(`orders/incart/${encodeURIComponent(userId)}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items, subtotal, total, meta, customerName, customerEmail, gstInvoice })
    });
    if (!res.ok) throw new Error(`Failed to save in-cart order: ${res.status}`);
    return res.json();
  },
  async createOrder(payload: { userId: string; items: OrderItemDto[]; subtotal?: number; total?: number; status?: OrderStatus; meta?: any; customerName?: string; customerEmail?: string; }): Promise<OrderDto> {
    const res = await fetch(toApiUrl("orders"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to create order: ${res.status}`);
    return res.json();
  },
  async updateStatus(id: string, status: OrderStatus, paymentDetails?: PaymentDetails): Promise<OrderDto> {
    const res = await fetch(toApiUrl(`orders/${encodeURIComponent(id)}/status`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status, paymentDetails })
    });
    if (!res.ok) throw new Error(`Failed to update order status: ${res.status}`);
    return res.json();
  },
  async updateRemarks(id: string, adminRemarks: string): Promise<OrderDto> {
    const res = await fetch(toApiUrl(`orders/${encodeURIComponent(id)}/remarks`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ adminRemarks })
    });
    if (!res.ok) throw new Error(`Failed to update order remarks: ${res.status}`);
    return res.json();
  },
  async updateOrder(id: string, updates: Partial<OrderDto>): Promise<OrderDto> {
    const res = await fetch(toApiUrl(`orders/${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`Failed to update order: ${res.status}`);
    return res.json();
  },
  async deleteOrder(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(toApiUrl(`orders/${encodeURIComponent(id)}`), {
      method: "DELETE",
      credentials: "include"
    });
    if (!res.ok) throw new Error(`Failed to delete order: ${res.status}`);
    return res.json();
  },
  async deleteInCartOrder(userId: string): Promise<{ message: string; id: string }> {
    const res = await fetch(toApiUrl(`orders/incart/${encodeURIComponent(userId)}`), {
      method: "DELETE",
      credentials: "include"
    });
    if (res.status === 404) return { message: "No in-cart order found", id: "" };
    if (!res.ok) throw new Error(`Failed to delete in-cart order: ${res.status}`);
    return res.json();
  },
  async updateDeliveryStatus(id: string, deliveryStatus: DeliveryStatus): Promise<OrderDto> {
    const res = await fetch(toApiUrl(`orders/${encodeURIComponent(id)}/delivery-status`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ deliveryStatus })
    });
    if (!res.ok) throw new Error(`Failed to update delivery status: ${res.status}`);
    return res.json();
  }
};

