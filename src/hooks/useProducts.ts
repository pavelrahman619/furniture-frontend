"use client";

import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '@/services/product.service';
import {
  ProductsQueryParams,
} from '@/types/product.types';

/**
 * Query keys for products
 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductsQueryParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (query: string, filters?: Partial<ProductsQueryParams>) =>
    [...productKeys.all, 'search', query, filters] as const,
  stock: (id: string) => [...productKeys.all, 'stock', id] as const,
};

/**
 * Hook to fetch products with filters and pagination
 */
export function useProducts(params?: ProductsQueryParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => ProductService.getProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => data, // Extract the data from ApiResponse
  });
}

/**
 * Hook to fetch products for display (transformed)
 */
export function useProductsForDisplay(params?: ProductsQueryParams) {
  return useQuery({
    queryKey: [...productKeys.list(params), 'display'],
    queryFn: () => ProductService.getProductsForDisplay(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch infinite products (for pagination)
 */
// export function useInfiniteProducts(baseParams?: Omit<ProductsQueryParams, 'page'>) {
//   return useInfiniteQuery({
//     queryKey: [...productKeys.lists(), 'infinite', baseParams],
//     queryFn: ({ pageParam = 1 }) =>
//       ProductService.getProducts({ ...baseParams, page: pageParam }),
//     getNextPageParam: (lastPage) => {
//       if (!lastPage.success || !lastPage.data) return undefined;
//       const { pagination } = lastPage.data;
//       return pagination.has_next ? pagination.current_page + 1 : undefined;
//     },
//     initialPageParam: 1,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   });
// }

/**
 * Hook to fetch a single product
 */
export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => ProductService.getProduct(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes for individual products
    select: (data) => data, // Extract the data from ApiResponse
  });
}

/**
 * Hook to search products
 */
export function useProductSearch(
  query: string,
  filters?: Partial<ProductsQueryParams>,
  enabled = true
) {
  return useQuery({
    queryKey: productKeys.search(query, filters),
    queryFn: () => ProductService.searchProducts(query, filters),
    enabled: enabled && !!query.trim(),
    staleTime: 1000 * 60 * 2, // 2 minutes for search results
    select: (data) => data, // Extract the data from ApiResponse
  });
}

/**
 * Hook to fetch product stock
 */
export function useProductStock(id: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.stock(id),
    queryFn: () => ProductService.getProductStock(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 30, // 30 seconds for stock info
    select: (data) => data, // Extract the data from ApiResponse
  });
}

/**
 * Hook to prefetch products (useful for hovering effects)
 */
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(id),
      queryFn: () => ProductService.getProduct(id),
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  };
}

/**
 * Hook to invalidate product queries (useful after mutations)
 */
export function useInvalidateProducts() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
    invalidateList: (params?: ProductsQueryParams) =>
      queryClient.invalidateQueries({ queryKey: productKeys.list(params) }),
    invalidateDetail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) }),
    invalidateStock: (id: string) =>
      queryClient.invalidateQueries({ queryKey: productKeys.stock(id) }),
  };
}
