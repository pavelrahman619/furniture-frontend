/**
 * Order Status Display Component
 * Shows current order status with progress indicator
 */

import React from 'react';
import type { Order, OrderStatus } from '@/types/order-tracking.types';
import { STATUS_CONFIG, getOrderProgress, isStatusCompleted } from '@/lib/order-tracking.utils';

interface OrderStatusDisplayProps {
  order: Order;
}

export function OrderStatusDisplay({ order }: OrderStatusDisplayProps) {
  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;
  const progress = getOrderProgress(order.status);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-center mb-6">
        <div
          className={`inline-flex items-center px-6 py-3 text-lg font-semibold rounded-full border ${statusConfig.className}`}
        >
          <StatusIcon className="h-6 w-6 mr-3" />
          {statusConfig.label}
        </div>
      </div>
      <p className="text-center text-gray-600 mb-8">
        {statusConfig.description}
      </p>

      {/* Progress Timeline */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {Object.entries(STATUS_CONFIG)
            .filter(([key]) => !['cancelled', 'refunded'].includes(key))
            .map(([key, config]) => {
              const isCompleted = isStatusCompleted(order.status, key as OrderStatus);
              const isCurrent = key === order.status;

              return (
                <div key={key} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      isCompleted
                        ? 'bg-green-100 border-green-500 text-green-600'
                        : isCurrent
                        ? 'bg-blue-100 border-blue-500 text-blue-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                  >
                    <config.icon className="h-6 w-6" />
                  </div>
                  <span
                    className={`text-sm mt-2 font-medium ${
                      isCompleted || isCurrent
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {config.label}
                  </span>
                </div>
              );
            })}
        </div>
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tracking Information */}
      {/* {order.trackingNumber && order.status === 'shipped' && (
        <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-1">
                Tracking Number
              </h3>
              <p className="text-sm text-purple-700 font-mono">
                {order.trackingNumber}
              </p>
            </div>
            <button 
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              onClick={() => {
                // In a real app, this would open tracking with the carrier
                navigator.clipboard.writeText(order.trackingNumber || '');
              }}
            >
              Copy Number
            </button>
          </div>
        </div>
      )} */}

      {/* Expected Delivery */}
      {/* {order.estimatedDelivery && order.status !== 'delivered' && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Expected delivery:{' '}
            <span className="font-medium text-gray-900">
              {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </p>
        </div>
      )} */}
    </div>
  );
}

