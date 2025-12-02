"use client";

import React from "react";
import Link from "next/link";
import { XCircle, Search, Phone, Mail, Home, ShoppingBag } from "lucide-react";

// Hooks and utilities
import { useOrderTracking } from "@/hooks/useOrderTracking";

// Components
import {
  OrderTrackingForm,
  OrderStatusDisplay,
  OrderTimeline,
  OrderItems,
  OrderSummary,
} from "@/components/OrderTracking";

/**
 * Order Tracking Page
 * Allows customers to track their orders using order ID
 */

export default function OrderTrackingPage() {
  const { order, isLoading, error, hasSearched, trackOrder, reset } = useOrderTracking();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 tracking-wider mb-4">
            TRACK YOUR ORDER
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your order number below to see the current status and tracking
            information for your furniture order.
          </p>
        </div>

        {/* Search Form */}
        <OrderTrackingForm 
          onTrack={trackOrder} 
          isLoading={isLoading} 
          error={error} 
        />

        {/* Order Results */}
        {hasSearched && !isLoading && (
          <>
            {order ? (
              <div className="space-y-8">
                {/* Order Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-light text-gray-900 tracking-wider mb-2">
                      ORDER #{order.orderNumber}
                    </h2>
                    <p className="text-gray-600">
                      Placed on{" "}
                      {new Date(order.orderDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Order Status */}
                <OrderStatusDisplay order={order} />

                {/* Order Timeline */}
                <OrderTimeline timeline={order.timeline || []} />

                {/* Order Items */}
                <OrderItems items={order.items} />

                {/* Order Summary */}
                <OrderSummary order={order} />

                {/* Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="text-center space-y-4 lg:space-y-0 lg:space-x-6 lg:flex lg:justify-center">
                    <Link
                      href="/products"
                      className="inline-flex items-center w-full lg:w-auto justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium tracking-wider hover:bg-gray-50 transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      CONTINUE SHOPPING
                    </Link>

                    <Link
                      href="/"
                      className="inline-flex items-center w-full lg:w-auto justify-center bg-gray-900 text-white px-6 py-3 font-medium tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      BACK TO HOME
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Order Not Found
                </h2>
                <p className="text-gray-600 mb-6">
                  We couldn&apos;t find an order with that ID. Please check your order number and try again.
                </p>
                <div className="space-x-4">
                  <button
                    onClick={reset}
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Try Again
                  </button>
                  <Link
                    href="/products"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* Help Section */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-light text-gray-900 tracking-wider mb-4">
              NEED HELP WITH YOUR ORDER?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our customer service team is here to help. Contact us if you have
              any questions about your order, delivery, or tracking.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>(323) 618-4663</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@palacioshomeco.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
