/**
 * Error handling utilities for consistent error management
 */

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Parse API errors into a consistent format
 */
export function parseApiError(error: unknown): AppError {
  // If it's already an AppError, return as is
  if (isAppError(error)) {
    return error;
  }

  // Handle API Exception from our api service
  if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
    const apiError = error as { message?: string; status?: number; data?: unknown };
    return {
      message: apiError.message || 'An error occurred',
      status: apiError.status,
      details: apiError.data,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
    };
  }

  // Handle network errors
  if (error && typeof error === 'object' && 'name' in error && (error as Error).name === 'TypeError') {
    return {
      message: 'Network error - please check your internet connection',
      code: 'NETWORK_ERROR',
    };
  }

  // Fallback for unknown errors
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: error,
  };
}

/**
 * Check if an object is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const appError = parseApiError(error);

  // Handle specific HTTP status codes
  if (appError.status) {
    switch (appError.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'You need to log in to access this resource.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'Request timeout. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        if (appError.status >= 500) {
          return 'Server error. Please try again later.';
        }
        if (appError.status >= 400) {
          return appError.message || 'Client error. Please check your request.';
        }
    }
  }

  // Handle specific error codes
  if (appError.code) {
    switch (appError.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect. Please check your internet connection.';
      case 'TIMEOUT_ERROR':
        return 'Request timed out. Please try again.';
      default:
        break;
    }
  }

  // Return the original message if it's user-friendly, otherwise return a generic message
  return appError.message || 'Something went wrong. Please try again.';
}

/**
 * Log errors for debugging (only in development)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    const appError = parseApiError(error);
    console.error(
      `[Error${context ? ` - ${context}` : ''}]:`,
      {
        message: appError.message,
        status: appError.status,
        code: appError.code,
        details: appError.details,
      }
    );
  }
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }

      // Don't retry for client errors (4xx) except 408 (timeout)
      const appError = parseApiError(error);
      if (appError.status && appError.status >= 400 && appError.status < 500 && appError.status !== 408) {
        break;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
