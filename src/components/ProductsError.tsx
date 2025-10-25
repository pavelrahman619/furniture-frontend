import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ProductsErrorProps {
  error: Error;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ProductsError({ error, onRetry, isRetrying = false }: ProductsErrorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load products
        </h3>
        <p className="text-gray-600 mb-6">
          {error.message || 'An unexpected error occurred while loading products.'}
        </p>
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ProductsError;