import { apiService, ApiResponse } from '../lib/api-service';
import { API_ENDPOINTS } from '../lib/api-config';

/**
 * Backend cart item interface (from API)
 */
export interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number;
    images: string[];
    stock: number;
  };
  quantity: number;
  price: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Backend cart interface (from API)
 */
export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Local cart item format (from CartContext)
 * Used for syncing with backend
 */
export interface LocalCartItem {
  id: string;              // Product MongoDB ObjectId
  cartId: string;          // Unique cart identifier (includes variants)
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
  category: string;
  availability: 'in-stock' | 'out-of-stock' | 'on-order';
  variants?: {
    size?: string;
    color?: string;
    finish?: string;
  };
}

/**
 * Backend cart item format for sync
 */
export interface BackendCartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

export interface MergeCartRequest {
  user_id: string;
  local_items: BackendCartItem[];
}

export interface SyncCartRequest {
  user_id: string;
  items: BackendCartItem[];
}

/**
 * Cart API service
 */
export const cartService = {
  /**
   * Get user's cart
   */
  getCart: async (token: string): Promise<ApiResponse<Cart>> => {
    return apiService.get<Cart>(API_ENDPOINTS.CART.GET, token);
  },

  /**
   * Add item to cart
   */
  addToCart: async (data: AddToCartRequest, token: string): Promise<ApiResponse<CartItem>> => {
    return apiService.post<CartItem>(API_ENDPOINTS.CART.ADD, data, token);
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (data: UpdateCartItemRequest, token: string): Promise<ApiResponse<CartItem>> => {
    return apiService.put<CartItem>(API_ENDPOINTS.CART.UPDATE, data, token);
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (itemId: string, token: string): Promise<ApiResponse<unknown>> => {
    return apiService.delete(API_ENDPOINTS.CART.REMOVE, token);
  },

  /**
   * Clear entire cart
   */
  clearCart: async (token: string): Promise<ApiResponse<unknown>> => {
    return apiService.delete(API_ENDPOINTS.CART.CLEAR, token);
  },

  /**
   * Get cart items count
   */
  getCartCount: async (token: string): Promise<ApiResponse<{ count: number }>> => {
    return apiService.get<{ count: number }>(API_ENDPOINTS.CART.COUNT, token);
  },

  /**
   * Merge local cart with backend cart
   * Used when user logs in - combines local cart items with existing backend cart
   * Strategy: For duplicates, uses maximum quantity
   * 
   * @param userId - User's ID
   * @param localItems - Local cart items to merge
   * @param token - Auth token
   * @returns Merged cart from backend
   */
  mergeCart: async (userId: string, localItems: LocalCartItem[], token: string): Promise<ApiResponse<any>> => {
    // Transform local cart items to backend format
    const backendItems: BackendCartItem[] = localItems.map(item => ({
      product_id: item.id,
      variant_id: item.variants ? 
        `${item.variants.size || ''}-${item.variants.color || ''}-${item.variants.finish || ''}` : 
        undefined,
      quantity: item.quantity,
      price: item.price,
    }));

    return apiService.post<any>(API_ENDPOINTS.CART.MERGE, {
      user_id: userId,
      local_items: backendItems,
    }, token);
  },

  /**
   * Full sync - Replace backend cart with local cart
   * Use when local cart is the source of truth
   * 
   * @param userId - User's ID
   * @param localItems - Local cart items
   * @param token - Auth token
   * @returns Synced cart from backend
   */
  syncCart: async (userId: string, localItems: LocalCartItem[], token: string): Promise<ApiResponse<any>> => {
    // Transform local cart items to backend format
    const backendItems: BackendCartItem[] = localItems.map(item => ({
      product_id: item.id,
      variant_id: item.variants ? 
        `${item.variants.size || ''}-${item.variants.color || ''}-${item.variants.finish || ''}` : 
        undefined,
      quantity: item.quantity,
      price: item.price,
    }));

    return apiService.post<any>(API_ENDPOINTS.CART.SYNC, {
      user_id: userId,
      items: backendItems,
    }, token);
  },
};

/**
 * Helper function to convert local cart items to backend format
 * Exported for use in CartContext
 */
export const convertLocalToBackendItems = (localItems: LocalCartItem[]): BackendCartItem[] => {
  return localItems.map(item => ({
    product_id: item.id,
    variant_id: item.variants ? 
      `${item.variants.size || ''}-${item.variants.color || ''}-${item.variants.finish || ''}` : 
      undefined,
    quantity: item.quantity,
    price: item.price,
  }));
};

export default cartService;
