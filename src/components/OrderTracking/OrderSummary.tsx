/**
 * Order Summary Component
 * Displays order totals and shipping information
 */

import React from 'react';
import { MapPin, CreditCard } from 'lucide-react';
import type { Order } from '@/types/order-tracking.types';

interface OrderSummaryProps {
  order: Order;
}

export function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-light text-gray-900 tracking-wider">
            ORDER SUMMARY
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {order.subtotal && order.subtotal > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">
                ${order.subtotal.toLocaleString()}
              </span>
            </div>
          )}

          {order.shippingCost !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900">
                {order.shippingCost === 0
                  ? 'Complimentary'
                  : `$${order.shippingCost.toLocaleString()}`}
              </span>
            </div>
          )}

          {order.tax !== undefined && order.tax > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tax:</span>
              <span className="text-gray-900">
                ${order.tax.toLocaleString()}
              </span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">
                Total:
              </span>
              <span className="text-xl font-light text-gray-900">
                ${order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-light text-gray-900 tracking-wider">
            SHIPPING DETAILS
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {order.shippingAddress && (
            <div>
              <div className="flex items-center mb-3">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Address
                </h3>
              </div>
              <p className="text-gray-900 leading-relaxed">
                {order.shippingAddress}
              </p>
              {order.deliveryInstructions && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">
                      Delivery Instructions:
                    </span>{' '}
                    {order.deliveryInstructions}
                  </p>
                </div>
              )}
            </div>
          )}

          {order.paymentMethod && (
            <div>
              <div className="flex items-center mb-3">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </h3>
              </div>
              <p className="text-gray-900">{order.paymentMethod}</p>
              {order.paymentStatus && (
                <p className="text-sm text-gray-500 mt-1">
                  Status: <span className="capitalize">{order.paymentStatus}</span>
                </p>
              )}
            </div>
          )}

          {order.customerEmail && (
            <div>
              <div className="flex items-center mb-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Contact Information
                </h3>
              </div>
              <p className="text-gray-900">{order.customerEmail}</p>
              {order.customerPhone && (
                <p className="text-gray-900 mt-1">{order.customerPhone}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

