import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Eye, Truck, Package, CheckCircle, XCircle, Clock, Search, Download, Filter, Trash2, Plus, Edit } from "lucide-react";
import { orderService, type OrderStatus, type PaymentMode, type DeliveryStatus } from "@/services/orderService";
import { customerService, type CustomerDto } from "@/services/customerService";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: string;
  total: string;
}

interface PaymentDetailsUI {
  paymentMode?: PaymentMode;
  dateOfPayment?: string;
  paymentId?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  deliveryStatus?: DeliveryStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  items: OrderItem[];
  subtotal: string;
  tax: string;
  shipping: string;
  angelCoinsUsed: number;
  angelCoinsDiscount: string;
  total: string;
  shippingAddress: {
    type?: string;
    name: string;
    phone?: string;
    address?: string; // Old format
    address1?: string; // New format
    address2?: string;
    nearby?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    type?: string;
    name: string;
    phone?: string;
    address?: string; // Old format
    address1?: string; // New format
    address2?: string;
    nearby?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  trackingNumber?: string;
  notes?: string;
  adminRemarks?: string;
  gstInvoice?: boolean;
  paymentDetails?: PaymentDetailsUI;
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await orderService.listAll();
        if (!mounted) return;
        // Filter out orders with 0 items (empty carts that weren't properly deleted)
        const validOrders = list.filter(o => o.items && o.items.length > 0);
        // Helper to format numbers to 2 decimal places
        const formatPrice = (val: number | undefined | null): string => {
          if (typeof val !== 'number') return '0.00';
          return val.toFixed(2);
        };

        // Map backend orders to UI Order shape
        const mapped: Order[] = validOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderId || o.id,
          customerId: o.userId,
          customerName: o.customerName || o.userId,
          customerEmail: o.customerEmail || "",
          customerPhone: o.customerPhone || "",
          status: o.status,
          deliveryStatus: o.deliveryStatus,
          paymentStatus: o.status === 'paid' ? 'paid' : (o.status === 'failed' ? 'failed' : (o.status === 'full_refund' || o.status === 'partial_refund' ? 'refunded' : 'pending')),
          paymentMethod: o.paymentDetails?.paymentMode || '',
          items: (o.items || []).map((it, idx) => ({
            id: String(idx),
            productId: it.productId,
            productName: it.name,
            productImage: it.image || '',
            quantity: it.quantity,
            price: formatPrice(it.price),
            total: formatPrice((it.price || 0) * (it.quantity || 0)),
          })),
          subtotal: formatPrice(o.subtotal),
          tax: formatPrice(o.gst),
          shipping: formatPrice(o.shipping),
          angelCoinsUsed: typeof o.angelCoinsUsed === 'number' ? o.angelCoinsUsed : 0,
          angelCoinsDiscount: formatPrice(o.angelCoinsDiscount),
          total: formatPrice(o.total || o.subtotal),
          shippingAddress: o.shippingAddress || { type: '', name: '', phone: '', address: '', address1: '', address2: '', nearby: '', city: '', state: '', zipCode: '', country: '' },
          billingAddress: o.billingAddress || { type: '', name: '', phone: '', address: '', address1: '', address2: '', nearby: '', city: '', state: '', zipCode: '', country: '' },
          orderDate: o.createdAt || new Date().toISOString(),
          notes: '',
          adminRemarks: o.adminRemarks || '',
          gstInvoice: o.gstInvoice || false,
          paymentDetails: o.paymentDetails,
        }));
        setOrders(mapped);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load orders');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);


  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [adminRemarksInput, setAdminRemarksInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Payment details dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ orderId: string; status: OrderStatus } | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('razorpay');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentId, setPaymentId] = useState<string>('');

  // Create/Edit order dialog state
  const [isCreateEditDialogOpen, setIsCreateEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [orderFormData, setOrderFormData] = useState({
    userId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    status: 'incart' as OrderStatus,
    subtotal: 0,
    gst: 0,
    shipping: 0,
    total: 0,
    angelCoinsUsed: 0,
    angelCoinsDiscount: 0,
    gstInvoice: false,
  });

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'incart', label: 'In Cart' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'abandoned', label: 'Abandoned' },
    { value: 'full_refund', label: 'Full Refund' },
    { value: 'partial_refund', label: 'Partial Refund' },
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const deliveryStatusOptions = [
    { value: 'order_received', label: 'Order Received' },
    { value: 'in_packing', label: 'In Packing' },
    { value: 'ready_to_dispatch', label: 'Ready to Dispatch' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'returned', label: 'Returned' },
  ];

  const paymentModeOptions: { value: PaymentMode; label: string }[] = [
    { value: 'razorpay', label: 'Razorpay' },
    { value: 'tag_mango', label: 'Tag Mango' },
    { value: 'gpay', label: 'GPay' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
    { value: 'phonepe', label: 'PhonePe' },
    { value: 'cash', label: 'Cash' },
    { value: 'cod', label: 'COD' },
  ];

  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = (order.orderNumber || '').toLowerCase().includes(search) ||
                         (order.customerName || '').toLowerCase().includes(search) ||
                         (order.customerEmail || '').toLowerCase().includes(search) ||
                         (order.id || '').toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setAdminRemarksInput(order.adminRemarks || '');
    setIsOrderDetailOpen(true);
  };

  const handleSaveRemarks = async () => {
    if (!selectedOrder) return;
    try {
      await orderService.updateRemarks(selectedOrder.id, adminRemarksInput);
      setOrders(prev => prev.map(order =>
        order.id === selectedOrder.id ? { ...order, adminRemarks: adminRemarksInput } : order
      ));
      setSelectedOrder({ ...selectedOrder, adminRemarks: adminRemarksInput });
      alert('Remarks saved successfully');
    } catch (e) {
      console.error('Failed to save remarks', e);
      alert('Failed to save remarks');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      await orderService.deleteOrder(orderId);
      setOrders(prev => prev.filter(order => order.id !== orderId));

      // Close the order detail dialog if the deleted order was being viewed
      if (selectedOrder?.id === orderId) {
        setIsOrderDetailOpen(false);
        setSelectedOrder(null);
      }

      alert('Order deleted successfully');
    } catch (e) {
      console.error('Failed to delete order', e);
      alert('Failed to delete order');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    // If status is 'paid', show payment details dialog
    if (newStatus === 'paid') {
      setPendingStatusChange({ orderId, status: newStatus });
      setIsPaymentDialogOpen(true);
      return;
    }

    // For other statuses, update directly
    try {
      const updated = await orderService.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => order.id === orderId ? {
        ...order,
        status: updated.status,
        paymentDetails: updated.paymentDetails,
        gstInvoice: updated.gstInvoice
      } : order));

      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? {
          ...prev,
          status: updated.status,
          paymentDetails: updated.paymentDetails,
          gstInvoice: updated.gstInvoice
        } : null);
      }
    } catch (e) {
      console.error('Failed to update order status', e);
      alert('Failed to update order status');
    }
  };

  const handleUpdateDeliveryStatus = async (orderId: string, newDeliveryStatus: DeliveryStatus) => {
    try {
      const updated = await orderService.updateDeliveryStatus(orderId, newDeliveryStatus);
      setOrders(prev => prev.map(order => order.id === orderId ? {
        ...order,
        deliveryStatus: updated.deliveryStatus
      } : order));

      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? {
          ...prev,
          deliveryStatus: updated.deliveryStatus
        } : null);
      }
    } catch (e) {
      console.error('Failed to update delivery status', e);
      alert('Failed to update delivery status');
    }
  };

  const handleSavePaymentDetails = async () => {
    if (!pendingStatusChange) return;

    try {
      const paymentDetails: PaymentDetailsUI = {
        paymentMode,
        dateOfPayment: paymentDate,
        paymentId: paymentId || undefined,
      };

      const updated = await orderService.updateStatus(
        pendingStatusChange.orderId,
        pendingStatusChange.status,
        paymentDetails
      );

      setOrders(prev => prev.map(order => order.id === pendingStatusChange.orderId ? {
        ...order,
        status: updated.status,
        paymentDetails: updated.paymentDetails,
        paymentStatus: 'paid',
        gstInvoice: updated.gstInvoice
      } : order));

      // Update selected order if it's the one being updated
      if (selectedOrder?.id === pendingStatusChange.orderId) {
        setSelectedOrder(prev => prev ? {
          ...prev,
          status: updated.status,
          paymentDetails: updated.paymentDetails,
          paymentStatus: 'paid',
          gstInvoice: updated.gstInvoice
        } : null);
      }

      // Reset dialog state
      setIsPaymentDialogOpen(false);
      setPendingStatusChange(null);
      setPaymentMode('razorpay');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentId('');
    } catch (e) {
      console.error('Failed to save payment details', e);
      alert('Failed to save payment details');
    }
  };

  // Load customers on mount
  useEffect(() => {
    (async () => {
      try {
        const allCustomers = await customerService.listCustomers({ limit: 1000 });
        setCustomers(allCustomers);
      } catch (e) {
        console.error('Failed to load customers', e);
      }
    })();
  }, []);

  const handleOpenCreateDialog = () => {
    setEditingOrder(null);
    setSelectedCustomer(null);
    setCustomerSearchTerm('');
    setOrderFormData({
      userId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      status: 'incart',
      subtotal: 0,
      gst: 0,
      shipping: 0,
      total: 0,
      angelCoinsUsed: 0,
      angelCoinsDiscount: 0,
      gstInvoice: false,
    });
    setIsCreateEditDialogOpen(true);
  };

  const handleOpenEditDialog = (order: Order) => {
    setEditingOrder(order);
    const customer = customers.find(c => c.userId === order.customerId);
    setSelectedCustomer(customer || null);
    setCustomerSearchTerm(customer?.email || '');
    setOrderFormData({
      userId: order.customerId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      status: order.status,
      subtotal: parseFloat(order.subtotal) || 0,
      gst: parseFloat(order.tax) || 0,
      shipping: parseFloat(order.shipping) || 0,
      total: parseFloat(order.total) || 0,
      angelCoinsUsed: order.angelCoinsUsed || 0,
      angelCoinsDiscount: parseFloat(order.angelCoinsDiscount) || 0,
      gstInvoice: order.gstInvoice || false,
    });
    setIsCreateEditDialogOpen(true);
  };

  const handleCustomerSelect = (customer: CustomerDto) => {
    setSelectedCustomer(customer);
    setCustomerSearchTerm(customer.email);
    setOrderFormData(prev => ({
      ...prev,
      userId: customer.userId,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: `${customer.countryCode}${customer.phone}`,
    }));
  };

  const filteredCustomers = customers.filter(c =>
    c.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const handleSaveOrder = async () => {
    if (!orderFormData.userId) {
      alert('Please select a customer');
      return;
    }

    try {
      if (editingOrder) {
        // Update existing order
        const updatePayload = {
          userId: orderFormData.userId,
          customerName: orderFormData.customerName,
          customerEmail: orderFormData.customerEmail,
          status: orderFormData.status,
          subtotal: orderFormData.subtotal,
          gst: orderFormData.gst,
          shipping: orderFormData.shipping,
          total: orderFormData.total,
          angelCoinsUsed: orderFormData.angelCoinsUsed,
          angelCoinsDiscount: orderFormData.angelCoinsDiscount,
          gstInvoice: orderFormData.gstInvoice,
        };
        console.log('Updating order with payload:', updatePayload);
        await orderService.updateOrder(editingOrder.id, updatePayload as any);
        alert('Order updated successfully');
      } else {
        // Create new order
        await orderService.saveInCart(
          orderFormData.userId,
          [], // Empty items for now
          orderFormData.subtotal,
          orderFormData.total,
          {},
          orderFormData.customerName,
          orderFormData.customerEmail,
          orderFormData.gstInvoice
        );
        alert('Order created successfully');
      }

      setIsCreateEditDialogOpen(false);
      // Reload orders
      const list = await orderService.listAll();
      const validOrders = list.filter(o => o.items && o.items.length > 0);
      const formatPrice = (val: number | undefined | null): string => {
        if (typeof val !== 'number') return '0.00';
        return val.toFixed(2);
      };
      const mapped: Order[] = validOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderId || o.id,
        customerId: o.userId,
        customerName: o.customerName || o.userId,
        customerEmail: o.customerEmail || "",
        customerPhone: o.customerPhone || "",
        status: o.status,
        deliveryStatus: o.deliveryStatus,
        paymentStatus: o.status === 'paid' ? 'paid' : (o.status === 'failed' ? 'failed' : (o.status === 'full_refund' || o.status === 'partial_refund' ? 'refunded' : 'pending')),
        paymentMethod: o.paymentDetails?.paymentMode || '',
        items: (o.items || []).map((it, idx) => ({
          id: String(idx),
          productId: it.productId,
          productName: it.name,
          productImage: it.image || '',
          quantity: it.quantity,
          price: formatPrice(it.price),
          total: formatPrice((it.price || 0) * (it.quantity || 0)),
        })),
        subtotal: formatPrice(o.subtotal),
        tax: formatPrice(o.gst),
        shipping: formatPrice(o.shipping),
        angelCoinsUsed: typeof o.angelCoinsUsed === 'number' ? o.angelCoinsUsed : 0,
        angelCoinsDiscount: formatPrice(o.angelCoinsDiscount),
        total: formatPrice(o.total || o.subtotal),
        shippingAddress: o.shippingAddress || { type: '', name: '', phone: '', address: '', address1: '', address2: '', nearby: '', city: '', state: '', zipCode: '', country: '' },
        billingAddress: o.billingAddress || { type: '', name: '', phone: '', address: '', address1: '', address2: '', nearby: '', city: '', state: '', zipCode: '', country: '' },
        orderDate: o.createdAt || new Date().toISOString(),
        notes: '',
        adminRemarks: o.adminRemarks || '',
        gstInvoice: o.gstInvoice || false,
        paymentDetails: o.paymentDetails,
      }));
      setOrders(mapped);
    } catch (e) {
      console.error('Failed to save order', e);
      alert('Failed to save order');
    }
  };

  const getStatusBadge = (status: any) => {
    const statusConfig: Record<string, { variant: 'default'|'secondary'|'destructive'; icon: any; label: string }> = {
      incart: { variant: 'secondary', icon: Clock, label: 'In Cart' },
      paid: { variant: 'default', icon: CheckCircle, label: 'Paid' },
      failed: { variant: 'destructive', icon: XCircle, label: 'Failed' },
      abandoned: { variant: 'destructive', icon: XCircle, label: 'Abandoned' },
      full_refund: { variant: 'destructive', icon: XCircle, label: 'Full Refund' },
      partial_refund: { variant: 'secondary', icon: XCircle, label: 'Partial Refund' },
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
    };
    const config = statusConfig[status] || statusConfig['pending'];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, color: 'text-yellow-600' },
      paid: { variant: 'default' as const, color: 'text-green-600' },
      failed: { variant: 'destructive' as const, color: 'text-red-600' },
      refunded: { variant: 'destructive' as const, color: 'text-orange-600' }
    };

    const config = statusConfig[status];

    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const calculateOrderStats = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'incart').length;
    const shippedOrders = orders.filter(o => o.status === 'paid').length;
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, order) => {
        const asString = typeof order.total === 'string' ? order.total : String(order.total ?? '0');
        const numeric = parseFloat(asString.replace(/,/g, ''));
        return sum + (Number.isNaN(numeric) ? 0 : numeric);
      }, 0);

    return { totalOrders, pendingOrders, shippedOrders, totalRevenue };
  };

  const stats = calculateOrderStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOpenCreateDialog} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Order
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shipped Orders</p>
              <p className="text-2xl font-bold">{stats.shippedOrders}</p>
            </div>
            <Truck className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="search">Search Orders</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Order number, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Order Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="payment">Payment Status</Label>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentStatusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dateRange">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        {loading && (
          <div className="p-6 text-sm text-muted-foreground">Loading orders...</div>
        )}
        {!loading && error && (
          <div className="p-6 text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">No orders found.</div>
        )}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">Order ID</TableHead>
                  <TableHead className="min-w-[180px]">Customer</TableHead>
                  <TableHead className="min-w-[100px]">Items</TableHead>
                  <TableHead className="min-w-[100px]">Total</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[160px]">Delivery Status</TableHead>
                  <TableHead className="min-w-[100px]">Payment</TableHead>
                  <TableHead className="min-w-[120px]">Date</TableHead>
                  <TableHead className="min-w-[280px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      {order.trackingNumber && (
                        <p className="text-sm text-gray-500">Track: {order.trackingNumber}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      {order.angelCoinsUsed > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {order.angelCoinsUsed} coins
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">₹{order.total}</p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.deliveryStatus || ''}
                      onValueChange={(value) => handleUpdateDeliveryStatus(order.id, value as DeliveryStatus)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Set status" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryStatusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {formatDate(order.orderDate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleUpdateOrderStatus(order.id, value as Order['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditDialog(order)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Customer Name</Label>
                  <p className="text-sm">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Customer Email</Label>
                  <p className="text-sm">{selectedOrder.customerEmail || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Customer Phone</Label>
                  <p className="text-sm">{selectedOrder.customerPhone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Order Date</Label>
                  <p className="text-sm">{formatDate(selectedOrder.orderDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Order Items</Label>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <img src={item.productImage} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <p className="font-semibold">₹{item.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.angelCoinsUsed > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-primary">
                      <span>Angel Coins Used:</span>
                      <span>{selectedOrder.angelCoinsUsed} coins</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Angel Coins Discount:</span>
                      <span>-₹{selectedOrder.angelCoinsDiscount}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span>GST (18%):</span>
                  <span>₹{selectedOrder.tax}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>₹{selectedOrder.shipping}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
              </div>

              <Separator />

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (selectedOrder.shippingAddress.address || selectedOrder.shippingAddress.address1) && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Shipping Address</Label>
                  <div className="p-3 bg-gray-50 rounded text-sm">
                    {selectedOrder.shippingAddress.type && (
                      <Badge variant="outline" className="mb-2">{selectedOrder.shippingAddress.type}</Badge>
                    )}
                    <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                    {selectedOrder.shippingAddress.address1 && <p>{selectedOrder.shippingAddress.address1}</p>}
                    {selectedOrder.shippingAddress.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
                    {selectedOrder.shippingAddress.nearby && <p className="text-gray-600">Near: {selectedOrder.shippingAddress.nearby}</p>}
                    {/* Fallback for old address format */}
                    {!selectedOrder.shippingAddress.address1 && selectedOrder.shippingAddress.address && (
                      <p>{selectedOrder.shippingAddress.address}</p>
                    )}
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                    {selectedOrder.shippingAddress.phone && <p>Phone: {selectedOrder.shippingAddress.phone}</p>}
                  </div>
                </div>
              )}

              <Separator />

              {/* Payment Details */}
              {selectedOrder.paymentDetails && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Payment Details</Label>
                    <div className="p-3 bg-gray-50 rounded text-sm space-y-1">
                      <div><strong>Payment Mode:</strong> {paymentModeOptions.find(opt => opt.value === selectedOrder.paymentDetails?.paymentMode)?.label || selectedOrder.paymentDetails.paymentMode}</div>
                      {selectedOrder.paymentDetails.dateOfPayment && (
                        <div><strong>Date of Payment:</strong> {formatDate(selectedOrder.paymentDetails.dateOfPayment)}</div>
                      )}
                      {selectedOrder.paymentDetails.paymentId && (
                        <div><strong>Payment ID:</strong> {selectedOrder.paymentDetails.paymentId}</div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* GST Invoice */}
              <div>
                <Label className="text-sm font-semibold">GST Invoice Required</Label>
                <p className="text-sm mt-1">{selectedOrder.gstInvoice ? 'Yes' : 'No'}</p>
              </div>

              <Separator />

              {/* Admin Remarks */}
              <div className="space-y-2">
                <Label htmlFor="adminRemarks" className="text-sm font-semibold">Admin Remarks</Label>
                <Textarea
                  id="adminRemarks"
                  value={adminRemarksInput}
                  onChange={(e) => setAdminRemarksInput(e.target.value)}
                  placeholder="Add remarks about this order..."
                  rows={4}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveRemarks} size="sm">
                    Save Remarks
                  </Button>
                  <Button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    size="sm"
                    variant="destructive"
                    className="ml-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Order
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Payment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="paymentMode">Payment Mode *</Label>
              <Select value={paymentMode} onValueChange={(value) => setPaymentMode(value as PaymentMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentModeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentDate">Date of Payment *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="paymentId">Payment ID (Optional)</Label>
              <Input
                id="paymentId"
                type="text"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                placeholder="Enter payment transaction ID"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setIsPaymentDialogOpen(false);
                setPendingStatusChange(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleSavePaymentDetails}>
                Save & Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Order Dialog */}
      <Dialog open={isCreateEditDialogOpen} onOpenChange={setIsCreateEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Edit Order' : 'Create New Order'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Customer Selection */}
            <div>
              <Label htmlFor="customerSearch">Customer Email *</Label>
              <Input
                id="customerSearch"
                type="text"
                placeholder="Search by email or name..."
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                className="mb-2"
              />
              {customerSearchTerm && filteredCustomers.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {filteredCustomers.slice(0, 10).map((customer) => (
                    <div
                      key={customer.userId}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <p className="font-medium">{customer.email}</p>
                      <p className="text-sm text-gray-600">{customer.name} - {customer.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Customer Info */}
            {selectedCustomer && (
              <Card className="p-3 bg-blue-50">
                <p className="text-sm font-semibold">Selected Customer:</p>
                <p className="text-sm"><strong>User ID:</strong> {orderFormData.userId}</p>
                <p className="text-sm"><strong>Name:</strong> {orderFormData.customerName}</p>
                <p className="text-sm"><strong>Email:</strong> {orderFormData.customerEmail}</p>
                <p className="text-sm"><strong>Phone:</strong> {orderFormData.customerPhone}</p>
              </Card>
            )}

            {/* Order Items (if editing) */}
            {editingOrder && editingOrder.items && editingOrder.items.length > 0 && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">Order Items</Label>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editingOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {item.productImage && (
                                <img src={item.productImage} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                              )}
                              <span className="text-sm">{item.productName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.price}</TableCell>
                          <TableCell>₹{item.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Order Status */}
            <div>
              <Label htmlFor="orderStatus">Order Status *</Label>
              <Select
                value={orderFormData.status}
                onValueChange={(value) => setOrderFormData(prev => ({ ...prev, status: value as OrderStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subtotal">Subtotal (₹)</Label>
                <Input
                  id="subtotal"
                  type="number"
                  step="0.01"
                  value={orderFormData.subtotal}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, subtotal: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="gst">GST (₹)</Label>
                <Input
                  id="gst"
                  type="number"
                  step="0.01"
                  value={orderFormData.gst}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, gst: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="shipping">Shipping (₹)</Label>
                <Input
                  id="shipping"
                  type="number"
                  step="0.01"
                  value={orderFormData.shipping}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, shipping: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="total">Total (₹)</Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  value={orderFormData.total}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, total: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="angelCoinsUsed">Angel Coins Used</Label>
                <Input
                  id="angelCoinsUsed"
                  type="number"
                  value={orderFormData.angelCoinsUsed}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, angelCoinsUsed: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="angelCoinsDiscount">Angel Coins Discount (₹)</Label>
                <Input
                  id="angelCoinsDiscount"
                  type="number"
                  step="0.01"
                  value={orderFormData.angelCoinsDiscount}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, angelCoinsDiscount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* GST Invoice */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="gstInvoice"
                checked={orderFormData.gstInvoice}
                onChange={(e) => setOrderFormData(prev => ({ ...prev, gstInvoice: e.target.checked }))}
                className="w-4 h-4"
              />
              <Label htmlFor="gstInvoice">GST Invoice Required</Label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsCreateEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveOrder}>
                {editingOrder ? 'Update Order' : 'Create Order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;
