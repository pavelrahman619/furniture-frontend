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

// Admin-specific order interfaces (simplified for admin table display)
export interface AdminOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: AdminOrderItem[];
  orderDate: string;
  estimatedDelivery?: string;
  shippingAddress: string;
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Transformation utilities
function formatAddress(address: {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip_code}`;
}

function transformOrderItemForAdmin(backendItem: {
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  name: string;
}): AdminOrderItem {
  return {
    id: backendItem.product_id,
    name: backendItem.name,
    price: backendItem.price,
    quantity: backendItem.quantity,
    // Default image - in a real app, you'd fetch this from product data
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  };
}

function transformOrderForAdmin(backendOrder: {
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
}): AdminOrder {
  // Generate order number from ID (backend might not have orderNumber field)
  const orderNumber = `ORD-${backendOrder._id.slice(-6).toUpperCase()}`;
  
  // Extract customer name from email if no separate name field
  const customerName = backendOrder.customer_email?.split('@')[0] || 'Guest Customer';
  
  return {
    id: backendOrder._id,
    orderNumber,
    customerName,
    customerEmail: backendOrder.customer_email || '',
    total: backendOrder.total,
    status: backendOrder.status.toLowerCase() as AdminOrder['status'],
    items: backendOrder.items.map(transformOrderItemForAdmin),
    orderDate: backendOrder.created_at,
    estimatedDelivery: backendOrder.estimated_delivery,
    shippingAddress: formatAddress(backendOrder.shipping_address),
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
   * Get orders list for admin with transformation (includes filtering)
   */
  static async getOrdersForAdmin(params?: {
    page?: number;
    limit?: number;
    status?: string;
    customer?: string;
    date_from?: string;
    date_to?: string;
    // search?: string; // Backend doesn't support search parameter
    // sort_field?: string; // Backend doesn't support sorting parameters
    // sort_direction?: 'asc' | 'desc'; // Backend doesn't support sorting parameters
  }): Promise<AdminOrdersResponse> {
    // Get admin token for authentication
    const { AdminService } = await import('./admin.service');
    const token = AdminService.getCurrentToken();
    
    if (!token) {
      throw new Error('Admin authentication required');
    }

    const queryParams = new URLSearchParams();

    // Only include parameters that the backend supports
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.customer) queryParams.append('customer', params.customer);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    
    // Remove unsupported parameters
    // if (params?.search) queryParams.append('search', params.search);
    // if (params?.sort_field) queryParams.append('sort_field', params.sort_field);
    // if (params?.sort_direction) queryParams.append('sort_direction', params.sort_direction);

    const endpoint = `${API_ENDPOINTS.ORDERS.LIST}?${queryParams.toString()}`;

    const response = await apiService.get<OrderListResponse>(endpoint, token);
    if (!response.data) {
      throw new Error('Failed to fetch orders - no response data');
    }

    // Transform backend response to admin format
    return {
      orders: response.data.orders.map(transformOrderForAdmin),
      pagination: response.data.pagination,
    };
  }

  /**
   * Update order status (admin only)
   */
  static async updateOrderStatus(
    orderId: string,
    status: string,
    notes?: string
  ): Promise<{ status: string; notes: string }> {
    // Get admin token for authentication
    const { AdminService } = await import('./admin.service');
    const token = AdminService.getCurrentToken();
    
    if (!token) {
      throw new Error('Admin authentication required');
    }

    const response = await apiService.put<{ status: string; notes: string }>(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
      { status, notes },
      token
    );
    if (!response.data) {
      throw new Error('Failed to update order status - no response data');
    }
    return response.data;
  }

  /**
   * Export orders to Excel (admin only)
   */
  static async exportOrders(params?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    format?: 'xlsx' | 'csv';
  }): Promise<Blob> {
    // Get admin token for authentication
    const { AdminService } = await import('./admin.service');
    const token = AdminService.getCurrentToken();
    
    if (!token) {
      throw new Error('Admin authentication required');
    }

    const queryParams = new URLSearchParams();
    
    // Add filter parameters
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.format) queryParams.append('format', params.format);

    // Build full URL with base URL and query params
    const { buildApiUrl, getApiHeaders } = await import('@/lib/api-config');
    const url = buildApiUrl(`${API_ENDPOINTS.ORDERS.EXPORT}?${queryParams.toString()}`);
    const headers = getApiHeaders(token);

    // Override Accept header to expect binary response (Excel file)
    headers['Accept'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    // Remove Content-Type for GET requests with binary response
    delete headers['Content-Type'];

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to export orders';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        if (response.status === 404) {
          throw new Error('Export endpoint not found. Feature may not be available yet.');
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      
      // Validate that we received a valid file
      if (blob.size === 0) {
        throw new Error('Export file is empty');
      }

      return blob;
    } catch (error) {
      console.error('Error exporting orders to Excel:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred during export');
    }
  }
}

export default OrderService;
