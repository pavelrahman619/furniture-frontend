import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/lib/api-config';

// Types for order operations
export interface CreateOrderData {
  items: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  billing_address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  payment_method: string;
  customer_id?: string;
  customer_email?: string;
  customer_phone?: string;
  delivery_cost?: number;
  distance_miles?: number;
  delivery_zone_validated?: boolean;
}

export interface OrderResponse {
  order: {
    _id: string;
    customer_id?: string;
    customer_email?: string;
    customer_phone?: string;
    items: Array<{
      product_id: string;
      variant_id?: string;
      quantity: number;
      price: number;
      name: string;
    }>;
    shipping_address: {
      street: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
    };
    billing_address: {
      street: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
    };
    payment_method: string;
    payment_status: string;
    status: string;
    timeline: Array<{
      status: string;
      timestamp: string;
      notes?: string;
    }>;
    tracking_number?: string;
    estimated_delivery?: string;
    subtotal: number;
    delivery_cost: number;
    total: number;
    created_at: string;
    updated_at: string;
  };
}

export interface OrderListResponse {
  orders: Array<{
    _id: string;
    customer_id?: string;
    customer_email?: string;
    customer_phone?: string;
    items: Array<{
      product_id: string;
      variant_id?: string;
      quantity: number;
      price: number;
      name: string;
    }>;
    shipping_address: {
      street: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
    };
    billing_address: {
      street: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
    };
    payment_method: string;
    payment_status: string;
    status: string;
    timeline: Array<{
      status: string;
      timestamp: string;
      notes?: string;
    }>;
    tracking_number?: string;
    estimated_delivery?: string;
    subtotal: number;
    delivery_cost: number;
    total: number;
    created_at: string;
    updated_at: string;
  }>;
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export class OrderService {
  /**
   * Create a new order
   */
  static async createOrder(orderData: CreateOrderData): Promise<string> {
    const response = await apiService.post<{ orderId?: string; _id?: string }>(
      API_ENDPOINTS.ORDERS.CREATE,
      orderData
    );
    if (!response.data) {
      throw new Error('Failed to create order - no response data');
    }
    return response.data.orderId || response.data._id || '';
  }

  /**
   * Get order by ID
   */
  static async getOrder(orderId: string): Promise<OrderResponse> {
    const response = await apiService.get<OrderResponse>(
      API_ENDPOINTS.ORDERS.DETAIL(orderId)
    );
    if (!response.data) {
      throw new Error('Failed to fetch order - no response data');
    }
    return response.data;
  }

  /**
   * Get orders list with pagination
   */
  static async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    customer?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<OrderListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.customer) queryParams.append('customer', params.customer);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);

    const endpoint = `${API_ENDPOINTS.ORDERS.LIST}?${queryParams.toString()}`;

    const response = await apiService.get<OrderListResponse>(endpoint);
    if (!response.data) {
      throw new Error('Failed to fetch orders - no response data');
    }
    return response.data;
  }

  /**
   * Track order by ID
   */
  static async trackOrder(orderId: string): Promise<{
    status: string;
    timeline: Array<{
      status: string;
      timestamp: string;
      notes?: string;
    }>;
    tracking_number?: string;
    estimated_delivery?: string;
  }> {
    const response = await apiService.get<{
      status: string;
      timeline: Array<{
        status: string;
        timestamp: string;
        notes?: string;
      }>;
      tracking_number?: string;
      estimated_delivery?: string;
    }>(API_ENDPOINTS.ORDERS.TRACK(orderId));
    if (!response.data) {
      throw new Error('Failed to track order - no response data');
    }
    return response.data;
  }

  /**
   * Update order status (admin only)
   */
  static async updateOrderStatus(
    orderId: string,
    status: string,
    notes?: string
  ): Promise<{ status: string; notes: string }> {
    const response = await apiService.put<{ status: string; notes: string }>(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
      { status, notes }
    );
    if (!response.data) {
      throw new Error('Failed to update order status - no response data');
    }
    return response.data;
  }
}

export default OrderService;
