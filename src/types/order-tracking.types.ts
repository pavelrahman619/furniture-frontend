/**
 * Order Tracking Types
 * TypeScript interfaces for order tracking functionality
 */

import { LucideIcon } from 'lucide-react';

// Backend API Response Types
export interface BackendOrderItem {
  product_id: string | {
    _id: string;
    name: string;
    images?: Array<{ url: string; is_primary?: boolean }>;
    variants?: Array<{
      _id?: string;
      images?: Array<{ url: string; is_primary?: boolean }>;
    }>;
  };
  variant_id?: string;
  quantity: number;
  price: number;
  name: string;
}

export interface BackendAddress {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface BackendTimelineEvent {
  status: string;
  timestamp: string;
  notes?: string;
}

export interface BackendOrderResponse {
  order: {
    _id: string;
    customer_id?: string;
    customer_email?: string;
    customer_phone?: string;
    items: BackendOrderItem[];
    shipping_address: BackendAddress;
    billing_address: BackendAddress;
    payment_method: string;
    payment_status: string;
    status: string;
    timeline: BackendTimelineEvent[];
    tracking_number?: string;
    estimated_delivery?: string;
    subtotal: number;
    delivery_cost: number;
    distance_miles?: number;
    delivery_zone_validated?: boolean;
    tax?: number;
    total: number;
    created_at: string;
    updated_at: string;
  };
}

export interface BackendTrackingResponse {
  order: {
    status: string;
    timeline: BackendTimelineEvent[];
    tracking_number?: string;
    estimated_delivery?: string;
  };
}

// Frontend UI Types
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  category?: string;
}

export interface TimelineEvent {
  id: string;
  status: string;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  icon: LucideIcon;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  orderDate: string;
  estimatedDelivery?: string;
  shippingAddress: string;
  billingAddress?: string;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  deliveryInstructions?: string;
  timeline?: TimelineEvent[];
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed'
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded';

// API Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Component Props Types
export interface OrderTrackingFormProps {
  onTrack: (orderNumber: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface OrderDisplayProps {
  order: Order;
}

export interface OrderTimelineProps {
  timeline: TimelineEvent[];
}

export interface OrderItemsProps {
  items: OrderItem[];
}

export interface OrderSummaryProps {
  order: Order;
}

