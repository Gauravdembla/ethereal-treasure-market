import express from "express";
import OrderModel, { type OrderStatus } from "../models/Order";
import CustomerModel from "../models/Customer";

const router = express.Router();

// Helper function to enrich orders with customer data from Customer collection
async function enrichOrdersWithCustomerData(orders: any[]): Promise<any[]> {
  if (!orders || orders.length === 0) return orders;

  // Get unique userIds from orders
  const userIds = [...new Set(orders.map(o => o.userId).filter(Boolean))];

  // Fetch all customers in one query
  const customers = await CustomerModel.find({ userId: { $in: userIds } }).lean();

  // Create a map for quick lookup
  const customerMap = new Map(customers.map(c => [c.userId, c]));

  // Enrich orders with customer data and ensure id field exists
  return orders.map(order => {
    const customer = customerMap.get(order.userId);
    return {
      ...order,
      id: order._id?.toString() || order.id,
      customerEmail: customer?.email || order.customerEmail || '',
      customerPhone: customer?.phone || '',
    };
  });
}

// List all orders (optional ?status=incart|paid|failed|abandoned|full_refund|partial_refund)
router.get("/", async (req, res, next) => {
  try {
    const { status } = req.query as { status?: string };
    const filter: any = {};
    const validStatuses = ["incart", "paid", "failed", "abandoned", "full_refund", "partial_refund"];
    if (status && validStatuses.includes(status)) {
      filter.status = status;
    }
    const list = await OrderModel.find(filter).sort({ createdAt: -1 }).lean();
    const enrichedList = await enrichOrdersWithCustomerData(list);
    return res.json(enrichedList);
  } catch (err) { next(err); }
});

// List orders for a specific user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const list = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
    const enrichedList = await enrichOrdersWithCustomerData(list);
    return res.json(enrichedList);
  } catch (err) { next(err); }
});

// Get current in-cart order for user
router.get("/incart/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const order = await OrderModel.findOne({ userId, status: "incart" }).sort({ updatedAt: -1 }).lean();
    if (!order) return res.status(404).json({ message: "No in-cart order" });

    // Enrich with customer data
    const enrichedOrders = await enrichOrdersWithCustomerData([order]);
    const enrichedOrder = enrichedOrders[0];

    // Ensure id field is present (convert _id to id)
    const response = {
      ...enrichedOrder,
      id: enrichedOrder?._id?.toString() || enrichedOrder?.id,
    };

    return res.json(response);
  } catch (err) {
    next(err);
  }
});

// Upsert in-cart order for user (replace items)
router.put("/incart/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { items, meta, subtotal, total, customerName, customerEmail, gstInvoice } = req.body || {};
    console.log('[PUT /incart/:userId] Received gstInvoice:', gstInvoice, 'Type:', typeof gstInvoice);
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "items array is required" });
    }

    // If items array is empty, delete the order instead of saving
    if (items.length === 0) {
      console.log('Items array is empty, deleting in-cart order for user:', userId);
      const deleted = await OrderModel.findOneAndDelete({ userId, status: "incart" }).lean();
      if (deleted) {
        console.log('Deleted empty in-cart order:', deleted._id);
      }
      return res.json({ message: "In-cart order deleted (empty cart)", deleted: !!deleted });
    }

    // Check if order exists
    const existing = await OrderModel.findOne({ userId, status: "incart" });

    // If order exists but has no orderId, we need to set it
    const updateData: any = {
      userId,
      status: "incart",
      items,
      customerName,
      customerEmail,
      meta: meta ?? {},
      subtotal: typeof subtotal === "number" ? subtotal : undefined,
      discount: typeof meta?.discount === "number" ? meta.discount : undefined,
      angelCoinsUsed: typeof meta?.angelCoinsUsed === "number" ? meta.angelCoinsUsed : undefined,
      angelCoinsDiscount: typeof meta?.angelCoinsDiscount === "number" ? meta.angelCoinsDiscount : undefined,
      gst: typeof meta?.gst === "number" ? meta.gst : undefined,
      shipping: typeof meta?.shipping === "number" ? meta.shipping : undefined,
      shippingAddress: meta?.shippingAddress,
      billingAddress: meta?.billingAddress,
      total: typeof total === "number" ? total : undefined,
    };

    // Only update gstInvoice if it's explicitly provided (not undefined)
    // This prevents cart sync from overwriting the gstInvoice value
    if (gstInvoice !== undefined) {
      updateData.gstInvoice = gstInvoice;
      console.log('[PUT /incart/:userId] Setting gstInvoice to:', gstInvoice);
    } else {
      console.log('[PUT /incart/:userId] gstInvoice not provided, keeping existing value');
    }

    // If existing order doesn't have orderId, generate one
    if (existing && !existing.orderId) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      updateData.orderId = `ORD-${year}${month}${day}-${random}`;
      console.log('Generated orderId for existing order:', updateData.orderId);
    } else if (!existing) {
      // New order - let the default function generate orderId
      console.log('New order - orderId will be auto-generated');
    } else {
      console.log('Existing order already has orderId:', existing.orderId);
    }

    const updated = await OrderModel.findOneAndUpdate(
      { userId, status: "incart" },
      updateData,
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    // Ensure id field is present (convert _id to id)
    const response = {
      ...updated,
      id: updated?._id?.toString() || updated?.id,
    };

    return res.json(response);
  } catch (err) {
    next(err);
  }
});

// Create a new order (typically when checking out)
router.post("/", async (req, res, next) => {
  try {
    const { userId, items, status, subtotal, total, meta, customerName, customerEmail } = req.body || {};
    if (!userId || !Array.isArray(items)) {
      return res.status(400).json({ message: "userId and items are required" });
    }
    const doc = await OrderModel.create({
      userId,
      items,
      customerName,
      customerEmail,
      status: (status as OrderStatus) || "ordered",
      subtotal,
      total,
      meta: meta ?? {},
    });
    return res.status(201).json(doc.toJSON());
  } catch (err) {
    next(err);
  }
});

// Update an order's status
router.patch("/:id/status", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentDetails } = req.body || {};
    const validStatuses = ["incart", "paid", "failed", "abandoned", "full_refund", "partial_refund"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData: any = { status };

    // If status is 'paid', payment details are required
    if (status === 'paid' && paymentDetails) {
      updateData.paymentDetails = paymentDetails;
    }

    const updated = await OrderModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Order not found" });

    // Enrich with customer data
    const enriched = await enrichOrdersWithCustomerData([updated]);
    return res.json(enriched[0]);
  } catch (err) {
    next(err);
  }
});

// Update admin remarks for an order
router.patch("/:id/remarks", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminRemarks } = req.body || {};
    const updated = await OrderModel.findByIdAndUpdate(
      id,
      { adminRemarks },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: "Order not found" });

    // Enrich with customer data
    const enriched = await enrichOrdersWithCustomerData([updated]);
    return res.json(enriched[0]);
  } catch (err) {
    next(err);
  }
});

// Update delivery status for an order
router.patch("/:id/delivery-status", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body || {};
    const validDeliveryStatuses = ["order_received", "in_packing", "ready_to_dispatch", "shipped", "in_transit", "delivered", "returned"];

    if (!deliveryStatus || !validDeliveryStatuses.includes(deliveryStatus)) {
      return res.status(400).json({ message: "Invalid delivery status" });
    }

    const updated = await OrderModel.findByIdAndUpdate(
      id,
      { deliveryStatus },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Order not found" });

    // Enrich with customer data
    const enriched = await enrichOrdersWithCustomerData([updated]);
    return res.json(enriched[0]);
  } catch (err) {
    next(err);
  }
});

// Update entire order (admin edit)
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      adminRemarks,
      paymentDetails,
      subtotal,
      discount,
      angelCoinsUsed,
      angelCoinsDiscount,
      gst,
      shipping,
      total,
      shippingAddress,
      billingAddress,
      gstInvoice
    } = req.body || {};

    console.log(`[PATCH /:id] Updating order ${id} with body:`, req.body);
    console.log(`[PATCH /:id] gstInvoice value:`, gstInvoice, typeof gstInvoice);

    const updateData: any = {};

    if (status !== undefined) updateData.status = status;
    if (adminRemarks !== undefined) updateData.adminRemarks = adminRemarks;
    if (paymentDetails !== undefined) updateData.paymentDetails = paymentDetails;
    if (subtotal !== undefined) updateData.subtotal = subtotal;
    if (discount !== undefined) updateData.discount = discount;
    if (angelCoinsUsed !== undefined) updateData.angelCoinsUsed = angelCoinsUsed;
    if (angelCoinsDiscount !== undefined) updateData.angelCoinsDiscount = angelCoinsDiscount;
    if (gst !== undefined) updateData.gst = gst;
    if (shipping !== undefined) updateData.shipping = shipping;
    if (total !== undefined) updateData.total = total;
    if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
    if (billingAddress !== undefined) updateData.billingAddress = billingAddress;
    if (gstInvoice !== undefined) updateData.gstInvoice = gstInvoice;

    console.log(`[PATCH /:id] updateData:`, updateData);

    const updated = await OrderModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Order not found" });

    // Enrich with customer data
    const enriched = await enrichOrdersWithCustomerData([updated]);
    return res.json(enriched[0]);
  } catch (err) {
    next(err);
  }
});

// Delete an order (typically for clearing cart)
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await OrderModel.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    return res.json({ message: "Order deleted successfully", id });
  } catch (err) {
    next(err);
  }
});

// Delete in-cart order for a user
router.delete("/incart/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const deleted = await OrderModel.findOneAndDelete({ userId, status: "incart" }).lean();
    if (!deleted) return res.status(404).json({ message: "No in-cart order found" });
    return res.json({ message: "In-cart order deleted successfully", id: deleted._id });
  } catch (err) {
    next(err);
  }
});

export default router;

