/**
 * Order Tracking Hook
 * Custom hook for managing order tracking state and API calls
 */

import { useState, useCallback } from 'react';
import { OrderService } from '@/services/order.service';
import type { Order, ApiError } from '@/types/order-tracking.types';
import { 
  transformOrder, 
  createApiError, 
  validateOrderNumber 
} from '@/lib/order-tracking.utils';

interface UseOrderTrackingReturn {
  // State
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  
  // Actions
  trackOrder: (orderNumber: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export function useOrderTracking(): UseOrderTrackingReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setOrder(null);
    setError(null);
    setHasSearched(false);
    setIsLoading(false);
  }, []);

  const trackOrder = useCallback(async (orderNumber: string) => {
    // Validate input
    const validation = validateOrderNumber(orderNumber);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid order number');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // First try to get full order details
      const orderResponse = await OrderService.getOrder(orderNumber.trim());
      const transformedOrder = transformOrder(orderResponse);
      setOrder(transformedOrder);
    } catch (orderError) {
      console.error('Failed to fetch order details:', orderError);
      
      try {
        // Fallback: try tracking endpoint if full order fails
        const trackingResponse = await OrderService.trackOrder(orderNumber.trim());
        
        // Create minimal order object with tracking data
        const { transformTrackingData } = await import('@/lib/order-tracking.utils');
        const trackingData = transformTrackingData(
          { order: trackingResponse }, 
          orderNumber.trim()
        );
        
        const minimalOrder: Order = {
          id: orderNumber.trim(),
          orderNumber: orderNumber.trim(),
          total: 0,
          status: trackingData.status!,
          items: [],
          orderDate: new Date().toISOString(),
          shippingAddress: '',
          ...trackingData,
        };
        
        setOrder(minimalOrder);
      } catch (trackingError) {
        console.error('Failed to track order:', trackingError);
        const apiError = createApiError(trackingError);
        
        // Handle specific error cases
        if (apiError.status === 404) {
          setError('Order not found. Please check your order number and try again.');
        } else if (apiError.status === 401) {
          setError('Authentication required. Please log in to track your order.');
        } else if (apiError.status === 403) {
          setError('Access denied. You can only track your own orders.');
        } else if (apiError.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(apiError.message || 'Failed to track order. Please try again.');
        }
        
        setOrder(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    order,
    isLoading,
    error,
    hasSearched,
    trackOrder,
    clearError,
    reset,
  };
}
