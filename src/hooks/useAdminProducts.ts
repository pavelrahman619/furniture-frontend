"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '@/services/product.service';
import { productKeys } from './useProducts';
import {
  CreateProductRequest,
  UpdateProductRequest,
  ProductsQueryParams,
} from '@/types/product.types';

/**
 * Admin-specific query keys for products
 */
export const adminProductKeys = {
  all: ['admin', 'products'] as const,
  lists: () => [...adminProductKeys.all, 'list'] as const,
  list: (params?: ProductsQueryParams) => [...adminProductKeys.lists(), params] as const,
};

/**
 * Hook for admin products with authentication
 */
export function useAdminProducts(params?: ProductsQueryParams, token?: string) {
  return useQuery({
    queryKey: adminProductKeys.list(params),
    queryFn: () => ProductService.getAdminProducts(params, token),
    staleTime: 1000 * 60 * 2, // 2 minutes for admin data
    enabled: !!token, // Only fetch if authenticated
  });
}

/**
 * Hook for creating a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productData, token }: { productData: CreateProductRequest; token: string }) =>
      ProductService.createProduct(productData, token),
    onSuccess: () => {
      // Invalidate all product queries to refresh the data
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    },
    onError: (error) => {
      console.error('Failed to create product:', error);
    },
  });
}

/**
 * Hook for updating an existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      productData, 
      token 
    }: { 
      id: string; 
      productData: UpdateProductRequest; 
      token: string 
    }) => ProductService.updateProduct(id, productData, token),
    onSuccess: (updatedProduct) => {
      // Invalidate all product queries
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
      
      // Update the specific product in cache
      queryClient.setQueryData(
        productKeys.detail(updatedProduct._id),
        updatedProduct
      );
    },
    onError: (error) => {
      console.error('Failed to update product:', error);
    },
  });
}

/**
 * Hook for deleting a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) =>
      ProductService.deleteProduct(id, token),
    onSuccess: (_, { id }) => {
      // Invalidate all product queries
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
      
      // Remove the specific product from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Failed to delete product:', error);
    },
  });
}

/**
 * Hook for updating product stock
 */
export function useUpdateProductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      stockData, 
      token 
    }: { 
      id: string; 
      stockData: { stock: number }; 
      token: string 
    }) => ProductService.updateProductStock(id, stockData, token),
    onSuccess: (stockInfo, { id }) => {
      // Invalidate product queries to refresh stock data
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.stock(id) });
    },
    onError: (error) => {
      console.error('Failed to update product stock:', error);
    },
  });
}

/**
 * Hook to invalidate admin product queries
 */
export function useInvalidateAdminProducts() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: adminProductKeys.all }),
    invalidateList: (params?: ProductsQueryParams) =>
      queryClient.invalidateQueries({ queryKey: adminProductKeys.list(params) }),
  };
}