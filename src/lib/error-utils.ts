/**
 * Error handling utilities for API responses
 */

import { ApiException } from './api-service';

/**
 * Product-specific error types
 */
export enum ProductErrorCode {
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  INVALID_PRODUCT_DATA = 'INVALID_PRODUCT_DATA',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  DUPLICATE_SKU = 'DUPLICATE_SKU',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}

/**
 * Product error interface
 */
export interface ProductError {
  code: ProductErrorCode;
  message: string;
  field?: string;
  details?: unknown;
}

/**
 * Product service exception
 */
export class ProductServiceException extends Error {
  code: ProductErrorCode;
  field?: string;
  details?: unknown;
  status?: number;

  constructor(error: ProductError, status?: number) {
    super(error.message);
    this.name = 'ProductServiceException';
    this.code = error.code;
    this.field = error.field;
    this.details = error.details;
    this.status = status;
  }
}

/**
 * Transform API errors into product-specific errors
 */
export const transformApiError = (error: unknown): ProductServiceException => {
  if (error instanceof ApiException) {
    // Map HTTP status codes to product error codes
    switch (error.status) {
      case 404:
        return new ProductServiceException({
          code: ProductErrorCode.PRODUCT_NOT_FOUND,
          message: 'Product not found',
        }, error.status);
      
      case 400:
        // Check if it's a validation error
        if (error.data && typeof error.data === 'object' && 'errors' in error.data) {
          return new ProductServiceException({
            code: ProductErrorCode.VALIDATION_ERROR,
            message: error.message || 'Validation failed',
            details: error.data,
          }, error.status);
        }
        return new ProductServiceException({
          code: ProductErrorCode.INVALID_PRODUCT_DATA,
          message: error.message || 'Invalid product data',
        }, error.status);
      
      case 401:
      case 403:
        return new ProductServiceException({
          code: ProductErrorCode.UNAUTHORIZED_ACCESS,
          message: 'Unauthorized access to product operations',
        }, error.status);
      
      case 409:
        return new ProductServiceException({
          code: ProductErrorCode.DUPLICATE_SKU,
          message: 'Product with this SKU already exists',
        }, error.status);
      
      case 422:
        return new ProductServiceException({
          code: ProductErrorCode.INSUFFICIENT_STOCK,
          message: 'Insufficient stock for this operation',
        }, error.status);
      
      case 0:
        return new ProductServiceException({
          code: ProductErrorCode.NETWORK_ERROR,
          message: 'Network error - please check your connection',
        }, error.status);
      
      default:
        return new ProductServiceException({
          code: ProductErrorCode.SERVER_ERROR,
          message: error.message || 'Server error occurred',
        }, error.status);
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return new ProductServiceException({
      code: ProductErrorCode.SERVER_ERROR,
      message: error.message,
    });
  }

  // Handle unknown errors
  return new ProductServiceException({
    code: ProductErrorCode.SERVER_ERROR,
    message: 'An unexpected error occurred',
  });
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: ProductServiceException): string => {
  switch (error.code) {
    case ProductErrorCode.PRODUCT_NOT_FOUND:
      return 'The requested product could not be found.';
    
    case ProductErrorCode.INVALID_PRODUCT_DATA:
      return 'Please check your product information and try again.';
    
    case ProductErrorCode.INSUFFICIENT_STOCK:
      return 'Not enough stock available for this operation.';
    
    case ProductErrorCode.DUPLICATE_SKU:
      return 'A product with this SKU already exists. Please use a different SKU.';
    
    case ProductErrorCode.UNAUTHORIZED_ACCESS:
      return 'You do not have permission to perform this action.';
    
    case ProductErrorCode.VALIDATION_ERROR:
      return 'Please correct the highlighted fields and try again.';
    
    case ProductErrorCode.NETWORK_ERROR:
      return 'Unable to connect to the server. Please check your internet connection.';
    
    case ProductErrorCode.SERVER_ERROR:
    default:
      return 'Something went wrong. Please try again later.';
  }
};

/**
 * Extract validation errors from API response
 */
export const extractValidationErrors = (error: ProductServiceException): Record<string, string> => {
  const validationErrors: Record<string, string> = {};

  if (error.code === ProductErrorCode.VALIDATION_ERROR && error.details) {
    const details = error.details as { errors?: Array<{ field?: string; message?: string }> };
    
    if (details.errors && Array.isArray(details.errors)) {
      details.errors.forEach((err: { field?: string; message?: string }) => {
        if (err.field && err.message) {
          validationErrors[err.field] = err.message;
        }
      });
    }
  }

  return validationErrors;
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: ProductServiceException): boolean => {
  return [
    ProductErrorCode.NETWORK_ERROR,
    ProductErrorCode.SERVER_ERROR,
  ].includes(error.code);
};