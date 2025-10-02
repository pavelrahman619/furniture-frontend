/**
 * Order Items Component
 * Displays list of items in the order
 */

import React from 'react';
import Image from 'next/image';
import type { OrderItem } from '@/types/order-tracking.types';

interface OrderItemsProps {
  items: OrderItem[];
}

export function OrderItems({ items }: OrderItemsProps) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center">No items found for this order.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-light text-gray-900 tracking-wider">
          ORDER ITEMS
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-6 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0"
            >
              <div className="flex-shrink-0">
                <div className="w-24 h-24 relative bg-gray-100 rounded-lg overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-light text-gray-900 mb-2">
                  {item.name}
                </h3>
                {item.sku && (
                  <p className="text-sm text-gray-500 mb-1">
                    Item# {item.sku}
                  </p>
                )}
                {item.category && (
                  <p className="text-sm text-gray-500 mb-1">
                    Category: {item.category}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Qty: {item.quantity}</span>
                  <span>•</span>
                  <span>${item.price.toLocaleString()} each</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-light text-gray-900">
                  ${(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

