"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  User,
  Calendar,
  DollarSign,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Edit3,
  Printer,
  Download,
} from "lucide-react";

// Order interfaces (matching the main orders page)
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku?: string;
  category?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  orderDate: string;
  estimatedDelivery?: string;
  shippingAddress: string;
  billingAddress?: string;
  paymentMethod?: string;
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  notes?: string;
  trackingNumber?: string;
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  discount?: number;
}

// Extended sample orders data with more detailed information
const sampleOrderDetails: Record<string, Order> = {
  ORD001: {
    id: "ORD001",
    orderNumber: "ORD-2024-001",
    customerName: "John Smith",
    customerEmail: "john.smith@email.com",
    customerPhone: "+1 (555) 123-4567",
    total: 2599,
    status: "processing",
    items: [
      {
        id: "59972101",
        name: "Mattai Reclaimed Wood 4Dwr Console",
        price: 1599,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1494947665470-20322015e3a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        sku: "MW-4DWR-001",
        category: "Console Tables",
      },
      {
        id: "59972102",
        name: "Modern Oak Dining Table",
        price: 1000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        sku: "OAK-DT-002",
        category: "Dining Tables",
      },
    ],
    orderDate: "2024-01-15",
    estimatedDelivery: "2024-01-25",
    shippingAddress: "123 Main St, New York, NY 10001",
    billingAddress: "123 Main St, New York, NY 10001",
    paymentMethod: "Credit Card ending in 4242",
    paymentStatus: "paid",
    notes: "Customer requested white glove delivery. Call before delivery.",
    trackingNumber: "1Z999AA1234567890",
    subtotal: 2599,
    shippingCost: 0,
    tax: 208,
    discount: 0,
  },
  ORD002: {
    id: "ORD002",
    orderNumber: "ORD-2024-002",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.johnson@email.com",
    customerPhone: "+1 (555) 234-5678",
    total: 1299,
    status: "shipped",
    items: [
      {
        id: "59972104",
        name: "Vintage Leather Armchair",
        price: 1299,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        sku: "VL-AC-004",
        category: "Armchairs",
      },
    ],
    orderDate: "2024-01-14",
    estimatedDelivery: "2024-01-22",
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
    billingAddress: "456 Oak Ave, Los Angeles, CA 90210",
    paymentMethod: "Credit Card ending in 5555",
    paymentStatus: "paid",
    trackingNumber: "1Z999AA1234567891",
    subtotal: 1299,
    shippingCost: 0,
    tax: 104,
    discount: 50,
  },
};

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  processing: {
    label: "Processing",
    icon: Package,
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

const paymentStatusConfig = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch order details
    const fetchOrder = async () => {
      setIsLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        const orderData = sampleOrderDetails[orderId];
        setOrder(orderData || null);
        setIsLoading(false);
      }, 500);
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const updateOrderStatus = async (newStatus: Order["status"]) => {
    if (!order) return;

    setIsUpdatingStatus(true);
    // Simulate API call
    setTimeout(() => {
      setOrder({ ...order, status: newStatus });
      setIsUpdatingStatus(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The order with ID &quot;{orderId}&quot; could not be found.
              </p>
              <Link
                href="/admin/orders"
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const StatusIcon = statusConfig[order.status].icon;

  return (
    <AdminGuard>
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/orders"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Orders
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order {order.orderNumber}
                </h1>
                <p className="text-gray-600">
                  Placed on {new Date(order.orderDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Order Status and Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Status
                </p>
                <div
                  className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${
                    statusConfig[order.status].className
                  }`}
                >
                  <StatusIcon className="h-4 w-4 mr-2" />
                  {statusConfig[order.status].label}
                </div>
              </div>
              <Edit3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-4">
              <select
                value={order.status}
                onChange={(e) =>
                  updateOrderStatus(e.target.value as Order["status"])
                }
                disabled={isUpdatingStatus}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </p>
                <p className="text-xl font-bold text-gray-900">
                  ${order.total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Package className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {order.items.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Expected Delivery
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {order.estimatedDelivery
                    ? new Date(order.estimatedDelivery).toLocaleDateString()
                    : "TBD"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Items
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 relative bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        {item.sku && (
                          <p className="text-sm text-gray-500 mb-1">
                            SKU: {item.sku}
                          </p>
                        )}
                        {item.category && (
                          <p className="text-sm text-gray-500 mb-2">
                            Category: {item.category}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span>${item.price.toLocaleString()} each</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Timeline
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order Placed
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {order.status !== "pending" && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order Confirmed
                        </p>
                        <p className="text-sm text-gray-500">
                          Payment processed successfully
                        </p>
                      </div>
                    </div>
                  )}

                  {(order.status === "shipped" ||
                    order.status === "delivered") && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Truck className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order Shipped
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.trackingNumber &&
                            `Tracking: ${order.trackingNumber}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === "delivered" && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order Delivered
                        </p>
                        <p className="text-sm text-gray-500">
                          Successfully delivered to customer
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Customer Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.customerName}
                    </p>
                    <p className="text-sm text-gray-500">Customer</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.customerEmail}
                    </p>
                    <p className="text-sm text-gray-500">Email</p>
                  </div>
                </div>

                {order.customerPhone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.customerPhone}
                      </p>
                      <p className="text-sm text-gray-500">Phone</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Shipping Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Shipping Address
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.shippingAddress}
                    </p>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Tracking Number
                      </p>
                      <p className="text-sm text-gray-500 font-mono">
                        {order.trackingNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {order.paymentMethod && (
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.paymentMethod}
                      </p>
                      <p className="text-sm text-gray-500">Payment Method</p>
                    </div>
                  </div>
                )}

                {order.paymentStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Payment Status
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        paymentStatusConfig[order.paymentStatus]
                      }`}
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)}
                    </span>
                  </div>
                )}

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  {order.subtotal && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">
                        ${order.subtotal.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {order.shippingCost !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-gray-900">
                        {order.shippingCost === 0
                          ? "Free"
                          : `$${order.shippingCost.toLocaleString()}`}
                      </span>
                    </div>
                  )}

                  {order.tax && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900">
                        ${order.tax.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {order.discount && order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600">
                        -${order.discount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">
                      ${order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order Notes
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
    </AdminGuard>
  );
}
