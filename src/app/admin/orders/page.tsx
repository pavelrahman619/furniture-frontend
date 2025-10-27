"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Loader2,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";

// Order interface for table display
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  orderDate: string;
  estimatedDelivery?: string;
  shippingAddress: string;
}

// Sample orders data
const sampleOrders: Order[] = [
  {
    id: "ORD001",
    orderNumber: "ORD-2024-001",
    customerName: "John Smith",
    customerEmail: "john.smith@email.com",
    total: 2599,
    status: "processing",
    items: [
      {
        id: "59972101",
        name: "Mattai Reclaimed Wood 4Dwr Console",
        price: 1599,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1494947665470-20322015e3a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "59972102",
        name: "Modern Oak Dining Table",
        price: 1000,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
    orderDate: "2024-01-15",
    estimatedDelivery: "2024-01-25",
    shippingAddress: "123 Main St, New York, NY 10001",
  },
  {
    id: "ORD002",
    orderNumber: "ORD-2024-002",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.johnson@email.com",
    total: 1299,
    status: "shipped",
    items: [
      {
        id: "59972104",
        name: "Vintage Leather Armchair",
        price: 1299,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
    orderDate: "2024-01-14",
    estimatedDelivery: "2024-01-22",
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
  },
  {
    id: "ORD003",
    orderNumber: "ORD-2024-003",
    customerName: "Michael Brown",
    customerEmail: "michael.brown@email.com",
    total: 1598,
    status: "delivered",
    items: [
      {
        id: "59972103",
        name: "Rustic Pine Coffee Table",
        price: 899,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "59972105",
        name: "Industrial Metal Bookshelf",
        price: 699,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
    orderDate: "2024-01-12",
    estimatedDelivery: "2024-01-20",
    shippingAddress: "789 Pine St, Chicago, IL 60601",
  },
  {
    id: "ORD004",
    orderNumber: "ORD-2024-004",
    customerName: "Emily Davis",
    customerEmail: "emily.davis@email.com",
    total: 349,
    status: "pending",
    items: [
      {
        id: "59972106",
        name: "Scandinavian Nightstand",
        price: 349,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
    orderDate: "2024-01-16",
    estimatedDelivery: "2024-01-26",
    shippingAddress: "321 Elm Dr, Miami, FL 33101",
  },
  {
    id: "ORD005",
    orderNumber: "ORD-2024-005",
    customerName: "David Wilson",
    customerEmail: "david.wilson@email.com",
    total: 2198,
    status: "processing",
    items: [
      {
        id: "59972107",
        name: "Mid-Century Modern Sofa",
        price: 2199,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
    orderDate: "2024-01-13",
    estimatedDelivery: "2024-01-23",
    shippingAddress: "654 Maple Ln, Seattle, WA 98101",
  },
  {
    id: "ORD006",
    orderNumber: "ORD-2024-006",
    customerName: "Lisa Anderson",
    customerEmail: "lisa.anderson@email.com",
    total: 1548,
    status: "cancelled",
    items: [
      {
        id: "59972108",
        name: "Rustic Wooden Desk",
        price: 899,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1494947665470-20322015e3a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "59972109",
        name: "Glass Top Side Table",
        price: 449,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
    orderDate: "2024-01-11",
    shippingAddress: "987 Cedar Ave, Boston, MA 02101",
  },
  {
    id: "ORD007",
    orderNumber: "ORD-2024-007",
    customerName: "Robert Taylor",
    customerEmail: "robert.taylor@email.com",
    total: 1098,
    status: "shipped",
    items: [
      {
        id: "59972116",
        name: "Round Pedestal Table",
        price: 1099,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
    orderDate: "2024-01-10",
    estimatedDelivery: "2024-01-20",
    shippingAddress: "147 Birch St, Denver, CO 80201",
  },
  {
    id: "ORD008",
    orderNumber: "ORD-2024-008",
    customerName: "Jennifer Martinez",
    customerEmail: "jennifer.martinez@email.com",
    total: 798,
    status: "delivered",
    items: [
      {
        id: "59972115",
        name: "Leather Executive Chair",
        price: 799,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
    orderDate: "2024-01-09",
    estimatedDelivery: "2024-01-19",
    shippingAddress: "258 Spruce Way, Phoenix, AZ 85001",
  },
  {
    id: "ORD009",
    orderNumber: "ORD-2024-009",
    customerName: "Christopher Lee",
    customerEmail: "christopher.lee@email.com",
    total: 948,
    status: "processing",
    items: [
      {
        id: "59972111",
        name: "Industrial Bar Stools Set",
        price: 599,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "59972117",
        name: "Storage Bench",
        price: 399,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
    orderDate: "2024-01-08",
    estimatedDelivery: "2024-01-18",
    shippingAddress: "369 Willow Rd, Atlanta, GA 30301",
  },
  {
    id: "ORD010",
    orderNumber: "ORD-2024-010",
    customerName: "Amanda White",
    customerEmail: "amanda.white@email.com",
    total: 1899,
    status: "pending",
    items: [
      {
        id: "59972112",
        name: "Farmhouse Dining Set",
        price: 1899,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    ],
    orderDate: "2024-01-07",
    estimatedDelivery: "2024-01-17",
    shippingAddress: "741 Aspen Blvd, Portland, OR 97201",
  },
];

// Duplicate sample orders to create more data for infinite scroll demonstration
const extendedSampleOrders = [
  ...sampleOrders,
  ...sampleOrders.map((order, index) => ({
    ...order,
    id: `${order.id}_${index + 100}`,
    orderNumber: `${order.orderNumber}_${index + 100}`,
    customerName: `${order.customerName} ${index + 1}`,
    orderDate: new Date(
      new Date(order.orderDate).getTime() - (index + 1) * 86400000
    )
      .toISOString()
      .split("T")[0],
  })),
];

type SortField = keyof Order;
type SortDirection = "asc" | "desc";

const ORDERS_PER_BATCH = 10;
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
  const [orders, setOrders] = useState<Order[]>(extendedSampleOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [totalRange, setTotalRange] = useState({ min: "", max: "" });
  const [sortField, setSortField] = useState<SortField>("orderDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(ORDERS_PER_BATCH);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle order status changes
  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort all orders
  const allFilteredAndSortedOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || order.status === statusFilter;

      const matchesDate =
        (!dateRange.start || order.orderDate >= dateRange.start) &&
        (!dateRange.end || order.orderDate <= dateRange.end);

      const matchesTotal =
        (!totalRange.min || order.total >= Number(totalRange.min)) &&
        (!totalRange.max || order.total <= Number(totalRange.max));

      return matchesSearch && matchesStatus && matchesDate && matchesTotal;
    });

    // Sort orders
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue && bValue && aValue < bValue)
        return sortDirection === "asc" ? -1 : 1;
      if (aValue && bValue && aValue > bValue)
        return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    orders,
    searchTerm,
    statusFilter,
    dateRange,
    totalRange,
    sortField,
    sortDirection,
  ]);

  // Get displayed orders (for infinite scroll)
  const displayedOrders = useMemo(() => {
    return allFilteredAndSortedOrders.slice(0, displayedCount);
  }, [allFilteredAndSortedOrders, displayedCount]);

  // Load more orders
  const loadMoreOrders = useCallback(() => {
    if (displayedCount >= allFilteredAndSortedOrders.length || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    // Simulate loading delay
    setTimeout(() => {
      setDisplayedCount((prev) =>
        Math.min(prev + ORDERS_PER_BATCH, allFilteredAndSortedOrders.length)
      );
      setIsLoadingMore(false);
    }, 300);
  }, [displayedCount, allFilteredAndSortedOrders.length, isLoadingMore]);

  // Handle scroll event
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 100; // Load more when 100px from bottom

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMoreOrders();
    }
  }, [loadMoreOrders]);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(ORDERS_PER_BATCH);
  }, [
    searchTerm,
    statusFilter,
    dateRange,
    totalRange,
    sortField,
    sortDirection,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setDateRange({ start: "", end: "" });
    setTotalRange({ min: "", max: "" });
    setDisplayedCount(ORDERS_PER_BATCH);
  };

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
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>
                  Total Revenue: $
                  {allFilteredAndSortedOrders
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
            {/* Search */}
            <div className="flex-1">
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

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {/* Fixed Header */}
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 bg-gray-50"
                    onClick={() => handleSort("orderNumber")}
                  >
                    <div className="flex items-center">
                      Order
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 bg-gray-50"
                    onClick={() => handleSort("customerName")}
                  >
                    <div className="flex items-center">
                      Customer
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Items
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 bg-gray-50"
                    onClick={() => handleSort("total")}
                  >
                    <div className="flex items-center">
                      Total
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 bg-gray-50"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 bg-gray-50"
                    onClick={() => handleSort("orderDate")}
                  >
                    <div className="flex items-center">
                      Order Date
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </div>
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
              onScroll={handleScroll}
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
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Loading indicator */}
              {isLoadingMore && (
                <div className="flex justify-center items-center py-4 bg-white">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    Loading more orders...
                  </span>
                </div>
              )}

              {/* End of results indicator */}
              {displayedCount >= allFilteredAndSortedOrders.length &&
                allFilteredAndSortedOrders.length > 0 &&
                !isLoadingMore && (
                  <div className="text-center py-4 bg-gray-50">
                    <span className="text-sm text-gray-500">
                      All orders loaded ({allFilteredAndSortedOrders.length}{" "}
                      total)
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* No results message */}
          {allFilteredAndSortedOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders found
                </h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            </div>
          )}

          {/* Results summary */}
          {allFilteredAndSortedOrders.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {displayedCount} of {allFilteredAndSortedOrders.length}{" "}
                filtered orders ({orders.length} total)
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
    </AdminGuard>
  );
}
