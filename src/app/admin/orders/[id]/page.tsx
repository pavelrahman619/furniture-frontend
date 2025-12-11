"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { useAdminOrder, useUpdateOrderStatus } from "@/hooks/useAdminOrders";
import { ProductService } from "@/services/product.service";
import { Product } from "@/types/product.types";
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
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// Order status type for status updates
type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

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

// Helper function to format address
function formatAddress(address: {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip_code}`;
}

// Helper function to generate order number from ID
function generateOrderNumber(id: string): string {
  return `ORD-${id.slice(-6).toUpperCase()}`;
}

// Order item display component with product/variant data
interface OrderItemDisplayProps {
  item: {
    product_id: string | { _id: string; [key: string]: string | number };
    variant_id?: string;
    variant_image?: string;
    variant_sku?: string;
    variant_attribute?: string;
    variation_type?: string;
    name: string;
    price: number;
    quantity: number;
  };
  index: number;
}

function OrderItemDisplay({ item, index }: OrderItemDisplayProps) {
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract product ID - handle both string and populated object cases
  const getProductId = (): string => {
    if (typeof item.product_id === "string") {
      return item.product_id;
    }
    // If product_id is populated (object), extract _id
    if (
      item.product_id &&
      typeof item.product_id === "object" &&
      "_id" in item.product_id
    ) {
      return String(item.product_id._id);
    }
    // Fallback: try to stringify if it's an object
    if (item.product_id && typeof item.product_id === "object") {
      return String(item.product_id);
    }
    return String(item.product_id);
  };

  const productId = getProductId();

  // Only fetch product data if snapshot is incomplete
  useEffect(() => {
    const needsProductData = !item.variant_image || !item.variant_attribute;

    if (!needsProductData) {
      // We have complete snapshot data, no need to fetch
      setLoading(false);
      return;
    }

    const fetchProductData = async () => {
      if (!productId) {
        setLoading(false);
        setError("Product ID is missing");
        return;
      }

      try {
        setLoading(true);
        const product = await ProductService.getProduct(productId);
        setProductData(product);
        setError(null);
      } catch (err) {
        console.error(`Error fetching product ${productId}:`, err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, item.variant_image, item.variant_attribute]);

  // Get the correct image based on snapshot with fallback to fetched data
  const getItemImage = (): string => {
    // Priority 1: Use snapshot image (historical accuracy)
    if (item.variant_image) {
      return item.variant_image;
    }

    // Priority 2: Try to find variant in fetched product data
    if (
      item.variant_id &&
      productData?.variants &&
      productData.variants.length > 0
    ) {
      const variant = productData.variants.find(
        (v) => v._id === item.variant_id
      );
      if (variant && variant.images && variant.images.length > 0) {
        const primaryImage = variant.images.find((img) => img.is_primary);
        return primaryImage?.url || variant.images[0].url;
      }
    }

    // Priority 3: Fallback to product images
    if (productData && productData.images && productData.images.length > 0) {
      const primaryImage = productData.images.find((img) => img.is_primary);
      return primaryImage?.url || productData.images[0].url;
    }

    // Priority 4: Final fallback
    return "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
  };

  // Get variant details from snapshot with fallback to fetched data
  const getVariantDetails = (): string | null => {
    // Priority 1: Use snapshot data (historical accuracy)
    if (item.variant_attribute) {
      const variationType = item.variation_type || "Variant";
      return `${variationType}: ${item.variant_attribute}`;
    }

    // Priority 2: Fallback to fetched variant data if snapshot is missing
    if (item.variant_id && productData?.variants) {
      const variant = productData.variants.find(
        (v) => v._id === item.variant_id
      );
      if (variant && variant.attribute) {
        const variationType = productData.variation || "Variant";
        return `${variationType}: ${variant.attribute}`;
      }
    }

    return null;
  };

  const imageUrl = getItemImage();
  const variantDetails = getVariantDetails();

  return (
    <div
      key={`${item.product_id}-${index}`}
      className="flex items-center space-x-4 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0"
    >
      <div className="flex-shrink-0">
        <div className="w-20 h-20 relative bg-gray-100 rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="80px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
              }}
            />
          )}
        </div>
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {String(item.name || "Unknown Product")}
        </h3>
        {variantDetails && (
          <p className="text-sm text-gray-600 mb-1">{variantDetails}</p>
        )}
        {item.variant_sku && (
          <p className="text-sm text-gray-500 mb-1">SKU: {item.variant_sku}</p>
        )}
        <p className="text-sm text-gray-500 mb-1">
          Product ID: {productId || "N/A"}
        </p>
        {item.variant_id && (
          <p className="text-sm text-gray-500 mb-2">
            Variant ID: {String(item.variant_id)}
          </p>
        )}
        {error && (
          <p className="text-xs text-red-500 mb-1">
            Failed to load product details
          </p>
        )}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Qty: {Number(item.quantity || 0)}</span>
          <span>•</span>
          <span>${Number(item.price || 0).toLocaleString()} each</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold text-gray-900">
          $
          {(
            Number(item.price || 0) * Number(item.quantity || 0)
          ).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  // API hooks
  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useAdminOrder(orderId);
  const updateOrderStatusMutation = useUpdateOrderStatus();

  // Extract order data from API response
  const order = orderResponse?.order;

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    if (!order) return;

    updateOrderStatusMutation.mutate({
      orderId: order._id,
      status: newStatus,
    });
  };

  if (isLoading) {
    return (
      <AdminGuard>
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading order details...</p>
              </div>
            </div>
          </div>
        </main>
      </AdminGuard>
    );
  }

  if (error) {
    return (
      <AdminGuard>
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-sm border border-red-200 p-12">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Failed to Load Order
                </h1>
                <p className="text-gray-600 mb-6">
                  {error instanceof Error
                    ? error.message.includes("authentication") ||
                      error.message.includes("Unauthorized")
                      ? "Authentication required. Please log in again."
                      : error.message
                    : "An error occurred while loading the order details"}
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => refetch()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </button>
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
          </div>
        </main>
      </AdminGuard>
    );
  }

  if (!order) {
    return (
      <AdminGuard>
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
      </AdminGuard>
    );
  }

  // Generate display data from backend order
  const orderNumber = generateOrderNumber(order._id);
  const customerName = 
    (order.customer_first_name && order.customer_last_name)
      ? `${order.customer_first_name} ${order.customer_last_name}`
      : order.customer_first_name ||
        order.customer_email?.split('@')[0] || 
        'Guest Customer';
  const shippingAddress = formatAddress(order.shipping_address);
  const orderStatus = order.status.toLowerCase() as OrderStatus;

  const StatusIcon = statusConfig[orderStatus].icon;

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
                    Order {orderNumber}
                  </h1>
                  <p className="text-gray-600">
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {/* <div className="flex items-center space-x-3">
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div> */}
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
                    className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${statusConfig[orderStatus].className}`}
                  >
                    <StatusIcon className="h-4 w-4 mr-2" />
                    {statusConfig[orderStatus].label}
                  </div>
                </div>
                <Edit3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-4">
                <select
                  value={orderStatus}
                  onChange={(e) =>
                    updateOrderStatus(e.target.value as OrderStatus)
                  }
                  disabled={updateOrderStatusMutation.isPending}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {updateOrderStatusMutation.isPending && (
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating status...
                  </div>
                )}
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
                    {order.estimated_delivery
                      ? new Date(order.estimated_delivery).toLocaleDateString()
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
                    {order.items.map((item, index) => (
                      <OrderItemDisplay
                        key={`${item.product_id}-${index}`}
                        item={item}
                        index={index}
                      />
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
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Display timeline from backend data */}
                    {order.timeline && order.timeline.length > 0 ? (
                      order.timeline
                        .sort(
                          (a, b) =>
                            new Date(a.timestamp).getTime() -
                            new Date(b.timestamp).getTime()
                        )
                        .map((timelineEntry, index) => {
                          const timelineStatus =
                            timelineEntry.status.toLowerCase();
                          let icon = Clock;
                          let bgColor = "bg-gray-100";
                          let iconColor = "text-gray-600";

                          if (
                            timelineStatus.includes("confirmed") ||
                            timelineStatus.includes("processing")
                          ) {
                            icon = Package;
                            bgColor = "bg-blue-100";
                            iconColor = "text-blue-600";
                          } else if (timelineStatus.includes("shipped")) {
                            icon = Truck;
                            bgColor = "bg-purple-100";
                            iconColor = "text-purple-600";
                          } else if (timelineStatus.includes("delivered")) {
                            icon = CheckCircle;
                            bgColor = "bg-green-100";
                            iconColor = "text-green-600";
                          } else if (timelineStatus.includes("cancelled")) {
                            icon = XCircle;
                            bgColor = "bg-red-100";
                            iconColor = "text-red-600";
                          }

                          const TimelineIcon = icon;

                          return (
                            <div
                              key={index}
                              className="flex items-center space-x-3"
                            >
                              <div className="flex-shrink-0">
                                <div
                                  className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}
                                >
                                  <TimelineIcon
                                    className={`h-5 w-5 ${iconColor}`}
                                  />
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {timelineEntry.status}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(
                                    timelineEntry.timestamp
                                  ).toLocaleString()}
                                </p>
                                {timelineEntry.notes && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {timelineEntry.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      // Fallback timeline based on current status
                      <>
                        {orderStatus !== "pending" && (
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

                        {(orderStatus === "shipped" ||
                          orderStatus === "delivered") && (
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
                                {order.tracking_number &&
                                  `Tracking: ${order.tracking_number}`}
                              </p>
                            </div>
                          </div>
                        )}

                        {orderStatus === "delivered" && (
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
                      </>
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
                        {customerName}
                      </p>
                      <p className="text-sm text-gray-500">Customer</p>
                    </div>
                  </div>

                  {order.customer_email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.customer_email}
                        </p>
                        <p className="text-sm text-gray-500">Email</p>
                      </div>
                    </div>
                  )}

                  {order.customer_phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.customer_phone}
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
                      <p className="text-sm text-gray-500">{shippingAddress}</p>
                    </div>
                  </div>

                  {order.tracking_number && (
                    <div className="flex items-center space-x-3">
                      <Truck className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Tracking Number
                        </p>
                        <p className="text-sm text-gray-500 font-mono">
                          {order.tracking_number}
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
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.payment_method}
                      </p>
                      <p className="text-sm text-gray-500">Payment Method</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Payment Status
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        paymentStatusConfig[
                          order.payment_status as keyof typeof paymentStatusConfig
                        ] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.payment_status.charAt(0).toUpperCase() +
                        order.payment_status.slice(1)}
                    </span>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">
                        ${order.subtotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="text-gray-900">
                        {order.delivery_cost === 0
                          ? "Free"
                          : `$${order.delivery_cost.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">
                        ${order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
