"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService, AdminOrdersResponse, AdminOrder } from '@/services/order.service';

// Query key factory for admin orders
export const adminOrderKeys = {
  all: ['admin-orders'] as const,
  lists: () => [...adminOrderKeys.all, 'list'] as const,
  list: (params: AdminOrdersParams) => [...adminOrderKeys.lists(), params] as const,
  details: () => [...adminOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminOrderKeys.details(), id] as const,
};

// Parameters for admin orders query (only backend-supported parameters)
export interface AdminOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  customer?: string;
  date_from?: string;
  date_to?: string;
  // search?: string; // Backend doesn't support search
  // sort_field?: string; // Backend doesn't support sorting
  // sort_direction?: 'asc' | 'desc'; // Backend doesn't support sorting
}

/**
 * Hook for fetching admin orders with filtering and pagination
 */
export function useAdminOrders(params: AdminOrdersParams = {}) {
  return useQuery({
    queryKey: adminOrderKeys.list(params),
    queryFn: () => OrderService.getOrdersForAdmin(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry for authentication errors (401, 403)
      const apiError = error as { status?: number; message?: string };
      if (apiError?.status === 401 || apiError?.status === 403) {
        return false;
      }
      // Don't retry for other 4xx errors except 408 (timeout)
      if (apiError?.status && apiError.status >= 400 && apiError.status < 500 && apiError.status !== 408) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for updating order status with optimistic updates
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      notes 
    }: { 
      orderId: string; 
      status: AdminOrder['status']; 
      notes?: string;
    }) => {
      return OrderService.updateOrderStatus(orderId, status, notes);
    },
    onMutate: async ({ orderId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminOrderKeys.all });

      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: adminOrderKeys.lists() });

      // Optimistically update all relevant queries
      queryClient.setQueriesData<AdminOrdersResponse>(
        { queryKey: adminOrderKeys.lists() },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            orders: old.orders.map((order) =>
              order.id === orderId ? { ...order, status } : order
            ),
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
    },
  });
}

/**
 * Hook for getting a single order details (for future use)
 */
export function useAdminOrder(orderId: string) {
  return useQuery({
    queryKey: adminOrderKeys.detail(orderId),
    queryFn: () => OrderService.getOrder(orderId),
    enabled: !!orderId,
    staleTime: 60000, // 1 minute
  });
}