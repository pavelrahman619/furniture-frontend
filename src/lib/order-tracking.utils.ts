/**
 * Order Tracking Utilities
 * Helper functions for order tracking functionality
 */

import { 
  Clock, 
  Package, 
  CheckCircle, 
  Truck, 
  XCircle,
  AlertCircle 
} from 'lucide-react';
import type {
  BackendOrderResponse,
  BackendTrackingResponse,
  Order,
  OrderItem,
  TimelineEvent,
  OrderStatus,
  PaymentStatus,
  ApiError
} from '@/types/order-tracking.types';

/**
 * Status configuration for UI display
 */
export const STATUS_CONFIG = {
  pending: {
    label: 'Order Placed',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Your order has been placed and is being processed.',
  },
  confirmed: {
    label: 'Order Confirmed',
    icon: CheckCircle,
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Your order has been confirmed and payment verified.',
  },
  processing: {
    label: 'In Production',
    icon: Package,
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Your order is being prepared for shipment.',
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    className: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Your order is on the way to you.',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200',
    description: 'Your order has been delivered successfully.',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200',
    description: 'This order has been cancelled.',
  },
  refunded: {
    label: 'Refunded',
    icon: AlertCircle,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'This order has been refunded.',
  },
} as const;

/**
 * Transform backend address to display string
 */
export function formatAddress(address: {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip_code}, ${address.country}`;
}

/**
 * Transform backend order item to frontend format
 */
export function transformOrderItem(backendItem: {
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  name: string;
}): OrderItem {
  return {
    id: backendItem.product_id,
    name: backendItem.name,
    price: backendItem.price,
    quantity: backendItem.quantity,
    // Note: Backend doesn't provide image, sku, category in current response
    // These would need to be fetched separately or added to backend response
    image: undefined,
    sku: backendItem.variant_id,
    category: undefined,
  };
}

/**
 * Generate timeline event title and description based on status
 */
function getTimelineEventDetails(status: string, notes?: string): {
  title: string;
  description: string;
} {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'pending':
      return {
        title: 'Order Placed',
        description: notes || 'Your order has been successfully placed and payment is being processed.',
      };
    case 'confirmed':
      return {
        title: 'Order Confirmed',
        description: notes || 'Payment processed and order details verified.',
      };
    case 'processing':
      return {
        title: 'In Production',
        description: notes || 'Your handcrafted furniture is being prepared by our artisans.',
      };
    case 'shipped':
      return {
        title: 'Out for Delivery',
        description: notes || 'Your order is on its way to you via our delivery service.',
      };
    case 'delivered':
      return {
        title: 'Successfully Delivered',
        description: notes || 'Your order has been delivered and set up in your home.',
      };
    case 'cancelled':
      return {
        title: 'Order Cancelled',
        description: notes || 'This order has been cancelled.',
      };
    case 'refunded':
      return {
        title: 'Order Refunded',
        description: notes || 'This order has been refunded.',
      };
    default:
      return {
        title: `Status: ${status}`,
        description: notes || `Order status updated to ${status}.`,
      };
  }
}

/**
 * Transform backend timeline event to frontend format
 */
export function transformTimelineEvent(
  backendEvent: {
    status: string;
    timestamp: string;
    notes?: string;
  },
  index: number
): TimelineEvent {
  const { title, description } = getTimelineEventDetails(backendEvent.status, backendEvent.notes);
  const statusConfig = STATUS_CONFIG[backendEvent.status.toLowerCase() as keyof typeof STATUS_CONFIG];
  
  return {
    id: `${backendEvent.status}-${index}`,
    status: backendEvent.status.toLowerCase(),
    title,
    description,
    timestamp: backendEvent.timestamp,
    icon: statusConfig?.icon || AlertCircle,
  };
}

/**
 * Transform backend order response to frontend format
 */
export function transformOrder(backendResponse: BackendOrderResponse): Order {
  const { order } = backendResponse;
  
  return {
    id: order._id,
    orderNumber: order._id, // Backend doesn't have orderNumber field, using _id
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    total: order.total,
    status: order.status.toLowerCase() as OrderStatus,
    items: order.items.map(transformOrderItem),
    orderDate: order.created_at,
    estimatedDelivery: order.estimated_delivery,
    shippingAddress: formatAddress(order.shipping_address),
    billingAddress: formatAddress(order.billing_address),
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status as PaymentStatus,
    trackingNumber: order.tracking_number,
    subtotal: order.subtotal,
    shippingCost: order.delivery_cost,
    timeline: order.timeline.map(transformTimelineEvent),
  };
}

/**
 * Transform backend tracking response to frontend format
 */
export function transformTrackingData(
  backendResponse: BackendTrackingResponse,
  orderId: string
): Partial<Order> {
  const { order } = backendResponse;
  
  return {
    id: orderId,
    status: order.status.toLowerCase() as OrderStatus,
    trackingNumber: order.tracking_number,
    estimatedDelivery: order.estimated_delivery,
    timeline: order.timeline.map(transformTimelineEvent),
  };
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Validate order number format
 */
export function validateOrderNumber(orderNumber: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = orderNumber.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Please enter an order number' };
  }
  
  // MongoDB ObjectId is 24 characters
  if (trimmed.length !== 24) {
    return { 
      isValid: false, 
      error: 'Order number should be 24 characters long' 
    };
  }
  
  // Check if it's a valid hex string
  if (!/^[a-fA-F0-9]{24}$/.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'Invalid order number format' 
    };
  }
  
  return { isValid: true };
}

/**
 * Create API error from various error types
 */
export function createApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: (error as any).status || (error as any).statusCode,
      code: (error as any).code,
    };
  }
  
  if (typeof error === 'string') {
    return { message: error };
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return error as ApiError;
  }
  
  return { message: 'An unexpected error occurred' };
}

/**
 * Get progress percentage for order status
 */
export function getOrderProgress(status: OrderStatus): number {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return 0;
    case 'processing':
      return 33;
    case 'shipped':
      return 66;
    case 'delivered':
      return 100;
    case 'cancelled':
    case 'refunded':
      return 0;
    default:
      return 0;
  }
}

/**
 * Check if order status is completed
 */
export function isStatusCompleted(currentStatus: OrderStatus, checkStatus: OrderStatus): boolean {
  const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const checkIndex = statusOrder.indexOf(checkStatus);
  
  return currentIndex >= checkIndex;
}

