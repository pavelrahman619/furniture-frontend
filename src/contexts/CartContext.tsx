"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import cartService from "@/services/cart.service";

export interface CartItem {
  id: string; // This should be the original MongoDB ObjectId
  cartId: string; // Unique identifier for cart item (includes variants)
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
  category: string;
  availability: "in-stock" | "out-of-stock" | "on-order";
  variant_id?: string; // MongoDB ObjectId of the variant
  variant_sku?: string; // SKU of the variant
  // Variant information
  variants?: {
    size?: string;
    color?: string;
    finish?: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  // Backend sync methods
  syncWithBackend: (userId: string, token: string) => Promise<void>;
  mergeWithBackend: (userId: string, token: string) => Promise<void>;
  isLoading: boolean;
  syncError: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Omit<CartItem, "quantity">, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.cartId === product.cartId);

      if (existingItem) {
        // If item exists, update quantity
        return prevItems.map((item) =>
          item.cartId === product.cartId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // If item doesn't exist, add new item
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (cartId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.cartId !== cartId)
    );
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  /**
   * Merge local cart with backend cart on login
   * Strategy: Combines local cart with backend cart, using max quantity for duplicates
   * This preserves both local and backend cart items
   */
  const mergeWithBackend = useCallback(async (userId: string, token: string) => {
    setIsLoading(true);
    setSyncError(null);

    try {
      // Get current local cart items
      const localItems = cartItems;

      if (localItems.length === 0) {
        // No local items to merge, just continue
        console.log('No local cart items to merge');
        setIsLoading(false);
        return;
      }

      console.log(`Merging ${localItems.length} local cart items with backend...`);

      // Call backend merge API
      const response = await cartService.mergeCart(userId, localItems, token);

      if (response.success) {
        console.log('Cart merged successfully:', response.data);
        // Keep local cart as is - backend has been updated
        // In a more advanced implementation, you could refresh from backend
      } else {
        throw new Error(response.message || 'Failed to merge cart');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync cart with backend';
      console.error('Cart merge error:', errorMessage);
      setSyncError(errorMessage);
      // Don't throw - keep local cart working even if sync fails
    } finally {
      setIsLoading(false);
    }
  }, [cartItems]);

  /**
   * Full sync - Replace backend cart with local cart
   * Use this when you want local cart to be the single source of truth
   */
  const syncWithBackend = useCallback(async (userId: string, token: string) => {
    setIsLoading(true);
    setSyncError(null);

    try {
      const localItems = cartItems;

      console.log(`Syncing ${localItems.length} cart items to backend...`);

      // Call backend sync API
      const response = await cartService.syncCart(userId, localItems, token);

      if (response.success) {
        console.log('Cart synced successfully:', response.data);
      } else {
        throw new Error(response.message || 'Failed to sync cart');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync cart with backend';
      console.error('Cart sync error:', errorMessage);
      setSyncError(errorMessage);
      // Don't throw - keep local cart working even if sync fails
    } finally {
      setIsLoading(false);
    }
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        syncWithBackend,
        mergeWithBackend,
        isLoading,
        syncError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
