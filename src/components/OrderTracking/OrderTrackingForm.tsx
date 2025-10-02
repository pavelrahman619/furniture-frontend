/**
 * Order Tracking Form Component
 * Form for entering order number and initiating tracking
 */

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface OrderTrackingFormProps {
  onTrack: (orderNumber: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function OrderTrackingForm({ onTrack, isLoading, error }: OrderTrackingFormProps) {
  const [orderNumber, setOrderNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onTrack(orderNumber);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="relative">
          <label
            htmlFor="orderNumber"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Order Number
          </label>
          <div className="flex">
            <input
              type="text"
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Enter your order ID (24 characters)"
              className="flex-1 border border-gray-300 rounded-l-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isLoading}
              maxLength={24}
            />
            <button
              type="submit"
              disabled={isLoading || !orderNumber.trim()}
              className="bg-gray-900 text-white px-6 py-3 rounded-r-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Your order ID is a 24-character string found in your order confirmation email.
          </p>
        </div>
      </form>
    </div>
  );
}

