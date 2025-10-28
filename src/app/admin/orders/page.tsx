"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import { useAdminOrders, useUpdateOrderStatus, AdminOrdersParams } from "@/hooks/useAdminOrders";
import { AdminOrder } from "@/services/order.service";
import {
  Search, // Still needed for "No orders found" icon
  Filter,
  ChevronDown,
  ChevronUp,
  // ArrowUpDown, // Commented out as sorting is not supported
  Loader2,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// Re-export types from service for consistency
type Order = AdminOrder;

// Constants for pagination and UI
const ORDERS_PER_PAGE = 20;

// Sorting types commented out as backend doesn't support sorting
// type SortField = keyof Order;
// type SortDirection = "asc" | "desc";

const TABLE_HEIGHT = "calc(100vh - 400px)";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800",
  },
  processing: {
    label: "Processing",
    icon: Package,
    className: "bg-blue-100 text-blue-800",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    className: "bg-purple-100 text-purple-800",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-100 text-red-800",
  },
};

export default function OrdersPage() {
  // Filter and pagination state
  // const [searchTerm, setSearchTerm] = useState(""); // Backend doesn't support search
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [totalRange, setTotalRange] = useState({ min: "", max: "" });
  // const [sortField, setSortField] = useState<SortField>("orderDate"); // Backend doesn't support sorting
  // const [sortDirection, setSortDirection] = useState<SortDirection>("desc"); // Backend doesn't support sorting
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Build query parameters (only backend-supported parameters)
  const queryParams: AdminOrdersParams = useMemo(() => {
    const params: AdminOrdersParams = {
      page: currentPage,
      limit: ORDERS_PER_PAGE,
      // sort_field: sortField, // Backend doesn't support sorting
      // sort_direction: sortDirection, // Backend doesn't support sorting
    };

    // if (searchTerm.trim()) params.search = searchTerm.trim(); // Backend doesn't support search
    if (statusFilter) params.status = statusFilter;
    if (dateRange.start) params.date_from = dateRange.start;
    if (dateRange.end) params.date_to = dateRange.end;

    return params;
  }, [statusFilter, dateRange, currentPage]); // Removed searchTerm, sortField, sortDirection

  // API hooks
  const { data: ordersData, isLoading, error, refetch } = useAdminOrders(queryParams);
  const updateOrderStatusMutation = useUpdateOrderStatus();

  // Handle order status changes
  const updateOrderStatus = useCallback((orderId: string, newStatus: Order["status"]) => {
    updateOrderStatusMutation.mutate({ 
      orderId, 
      status: newStatus 
    });
  }, [updateOrderStatusMutation]);

  // Handle sorting - Commented out as backend doesn't support sorting
  // const handleSort = useCallback((field: SortField) => {
  //   if (sortField === field) {
  //     setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  //   } else {
  //     setSortField(field);
  //     setSortDirection("asc");
  //   }
  //   setCurrentPage(1); // Reset to first page when sorting changes
  // }, [sortField, sortDirection]);

  // Get pagination info from API response
  const pagination = ordersData?.pagination;

  // Client-side filtering for total range (since backend might not support this)
  const displayedOrders = useMemo(() => {
    const orders = ordersData?.orders || [];
    
    if (!totalRange.min && !totalRange.max) {
      return orders;
    }

    return orders.filter((order) => {
      const matchesTotal =
        (!totalRange.min || order.total >= Number(totalRange.min)) &&
        (!totalRange.max || order.total <= Number(totalRange.max));
      return matchesTotal;
    });
  }, [ordersData?.orders, totalRange]);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateRange, totalRange]); // Removed searchTerm as it's not used

  const clearFilters = useCallback(() => {
    // setSearchTerm(""); // Commented out as search is not supported
    setStatusFilter("");
    setDateRange({ start: "", end: "" });
    setTotalRange({ min: "", max: "" });
    setCurrentPage(1);
  }, []);

  return (
    <AdminGuard>
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600 mt-1">
                Manage customer orders and track order status
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {error && (
                <button
                  onClick={() => refetch()}
                  className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                  title="Retry loading orders"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </button>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>
                  Total Revenue: $
                  {displayedOrders
                    .reduce((sum, order) => sum + order.total, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search - Commented out as backend doesn't support search */}
            {/* <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search orders by number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div> */}
            
            {/* Placeholder for search - Backend doesn't support search yet */}
            <div className="flex-1">
              <div className="text-sm text-gray-500 italic">
                {/* Search functionality will be available when backend supports it */}
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        end: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Total
                  </label>
                  <input
                    type="number"
                    placeholder="$0"
                    value={totalRange.min}
                    onChange={(e) =>
                      setTotalRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Total
                  </label>
                  <input
                    type="number"
                    placeholder="$10000"
                    value={totalRange.max}
                    onChange={(e) =>
                      setTotalRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 mb-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load orders
              </h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error 
                  ? error.message.includes('authentication') || error.message.includes('Unauthorized')
                    ? 'Authentication required. Please log in again.'
                    : error.message
                  : 'An error occurred while loading orders'
                }
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                <span className="text-sm text-gray-600">Loading orders...</span>
              </div>
            </div>
          )}
          <div className="overflow-x-auto relative">
            {/* Fixed Header */}
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  {/* Sorting disabled - Backend doesn't support sorting */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Change Status
                  </th>
                </tr>
              </thead>
            </table>

            {/* Scrollable Body */}
            <div
              ref={scrollContainerRef}
              className="overflow-y-auto"
              style={{ height: TABLE_HEIGHT }}
            >
              <table className="w-full">
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedOrders.map((order) => {
                    const StatusIcon = statusConfig[order.status].icon;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {order.orderNumber}
                            </Link>
                            <div className="text-sm text-gray-500">
                              ID: {order.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.customerEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.items.length} item
                            {order.items.length > 1 ? "s" : ""}
                          </div>
                          {/* <div className="text-xs text-gray-500 max-w-xs truncate">
                            {order.items.map((item) => item.name).join(", ")}
                          </div> */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${order.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              statusConfig[order.status].className
                            }`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[order.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                          {order.estimatedDelivery && (
                            <div className="text-xs text-gray-500">
                              Est. delivery:{" "}
                              {new Date(
                                order.estimatedDelivery
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(
                                order.id,
                                e.target.value as Order["status"]
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                            disabled={updateOrderStatusMutation.isPending}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {updateOrderStatusMutation.isPending && (
                            <Loader2 className="h-3 w-3 animate-spin text-blue-600 ml-2 inline" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex justify-center items-center py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.has_prev || isLoading}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <span className="text-sm text-gray-600">
                      Page {pagination.current_page} of {pagination.total_pages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.has_next || isLoading}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* No results message */}
          {!isLoading && !error && displayedOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders found
                </h3>
                <p>Try adjusting your filter criteria.</p>
              </div>
            </div>
          )}

          {/* Results summary */}
          {!isLoading && !error && displayedOrders.length > 0 && pagination && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {displayedOrders.length} of {pagination.total_count} orders
                {pagination.total_pages > 1 && (
                  <span> (Page {pagination.current_page} of {pagination.total_pages})</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
    </AdminGuard>
  );
}
