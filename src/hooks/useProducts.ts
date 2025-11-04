"use client";

import { useMemo } from 'react';
import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
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
export function useInfiniteProducts(baseParams?: Omit<ProductsQueryParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: [...productKeys.lists(), 'infinite', baseParams],
    queryFn: ({ pageParam = 1 }) =>
      ProductService.getProducts({ ...baseParams, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination.has_next ? pagination.current_page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch infinite products for display (transformed)
 */
export function useInfiniteProductsForDisplay(baseParams?: Omit<ProductsQueryParams, 'page'>) {
  const query = useInfiniteProducts(baseParams);
  
  // Transform the data to flat array of DisplayProducts
  const allProducts = useMemo(() => {
    if (!query.data) return [];
    
    return query.data.pages.flatMap(page => {
      const { products, filters_available } = page;
      
      // Update filter store with dynamic filter data if available (only from first page)
      if (filters_available && query.data.pages.indexOf(page) === 0) {
        try {
          import('../stores/filterStore').then(({ useFilterStore }) => {
            const store = useFilterStore.getState();
            const updateOptions: Partial<{
              availability: Array<{ value: string; label: string }>;
              categories: Array<{ value: string; label: string; slug: string }>;
              colors: Array<{ value: string; label: string }>;
              materials: Array<{ value: string; label: string }>;
            }> = {};
            
            // Update categories if available
            if (filters_available.categories) {
              updateOptions.categories = filters_available.categories.map(cat => ({
                value: cat.id,
                label: cat.name,
                slug: cat.name.toLowerCase().replace(/\s+/g, '-')
              }));
            }
            
            // Update colors if available
            if (filters_available.colors) {
              updateOptions.colors = filters_available.colors.map(color => ({
                value: color,
                label: color
              }));
            }
            
            // Update materials if available
            if (filters_available.materials) {
              updateOptions.materials = filters_available.materials.map(material => ({
                value: material,
                label: material
              }));
            }
            
            store.updateFilterOptions(updateOptions);
          });
        } catch (error) {
          console.warn('Failed to update filter store with dynamic filter data:', error);
        }
      }

      // Transform products to DisplayProduct format
      return products.map(product => {
        const images = product.images || [];
        // const categoryField = product.category_id;
        const totalStock = typeof product.stock === 'number' && !Number.isNaN(product.stock)
          ? product.stock
          : (product.variants || []).reduce((sum, variant) => sum + (variant.stock || 0), 0);

        return {
          id: product._id,
          name: product.name,
          category_id: typeof product.category_id === 'string' 
            ? product.category_id 
            : (product.category_id?._id || ''),
          category_name: typeof product.category_id === 'object' && product.category_id?.name 
            ? product.category_id.name 
            : undefined,
          price: product.price,
          featured: product.featured ?? false,
          sku: product.sku,
          description: product.description,
          variants: product.variants || [],
          images: images,
          stock: totalStock,
          availability: (totalStock > 0 ? 'in-stock' : 'out-of-stock') as 'in-stock' | 'out-of-stock',
        };
      });
    });
  }, [query.data]);

  return {
    ...query,
    allProducts,
  };
}

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
