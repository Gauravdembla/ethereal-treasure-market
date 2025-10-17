import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Mail } from "lucide-react";
import { orderService } from "@/services/orderService";
import { useAuth } from "@/hooks/useAuth";

interface OrderData {
  orderId: string;
  clientOrderId: string;
  paymentId?: string;
  paymentStatus?: string;
  amount: number;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  address?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function OrderDetails() {
  const { clientOrderId } = useParams<{ clientOrderId: string }>();
  const navigate = useNavigate();
  const { user, externalUser } = useAuth();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUserId = externalUser?.userId || localStorage.getItem('AOE_userId') || user?.id || user?.email || 'default';

  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (!clientOrderId) {
          setError("Order ID not found");
          setLoading(false);
          return;
        }

        // Try to fetch from backend
        const orderData = await orderService.getInCart(apiUserId);
        
        if (orderData && (orderData.orderId === clientOrderId || orderData.id === clientOrderId)) {
          // Convert backend order to display format
          const items = orderData.items?.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })) || [];

          const subtotal = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
          const tax = subtotal * 0.18; // 18% GST
          const total = subtotal + tax;

          setOrder({
            orderId: orderData.id,
            clientOrderId: orderData.orderId,
            paymentId: orderData.paymentId,
            paymentStatus: orderData.status,
            amount: total,
            date: new Date(orderData.createdAt).toLocaleDateString(),
            customerName: orderData.customerName || '',
            customerEmail: orderData.customerEmail || '',
            customerPhone: orderData.customerPhone || '',
            items,
            subtotal,
            tax,
            total,
            address: orderData.address,
          });
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Failed to load order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [clientOrderId, apiUserId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-angelic-cream/30 to-white/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-angelic-deep/70">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-angelic-cream/30 to-white/50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="font-playfair font-bold text-2xl text-angelic-deep mb-4">
            {error || "Order Not Found"}
          </h2>
          <Button onClick={() => navigate("/")} className="mt-4">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-angelic-cream/30 to-white/50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-playfair font-bold text-3xl text-angelic-deep">
            Order Details
          </h1>
        </div>

        {/* Order Summary Card */}
        <Card className="p-6 md:p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-angelic-deep/60 mb-1">Order ID</p>
              <p className="font-semibold text-lg text-angelic-deep">
                {order.clientOrderId}
              </p>
            </div>
            <div>
              <p className="text-sm text-angelic-deep/60 mb-1">Order Date</p>
              <p className="font-semibold text-lg text-angelic-deep">
                {order.date}
              </p>
            </div>
            {order.paymentId && (
              <div>
                <p className="text-sm text-angelic-deep/60 mb-1">Payment ID</p>
                <p className="font-mono text-sm text-angelic-deep break-all">
                  {order.paymentId}
                </p>
              </div>
            )}
            {order.paymentStatus && (
              <div>
                <p className="text-sm text-angelic-deep/60 mb-1">Status</p>
                <p className="font-semibold text-green-600">
                  {order.paymentStatus}
                </p>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg text-angelic-deep mb-3">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-angelic-deep/60">Name</p>
                <p className="text-angelic-deep">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-angelic-deep/60">Email</p>
                <p className="text-angelic-deep">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-angelic-deep/60">Phone</p>
                <p className="text-angelic-deep">{order.customerPhone}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg text-angelic-deep mb-3">
              Order Items
            </h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-angelic-deep">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Pricing */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">₹{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                window.location.href = `mailto:support@shreedembla.com?subject=Order ${order.clientOrderId}`;
              }}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

