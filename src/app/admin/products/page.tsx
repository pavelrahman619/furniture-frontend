"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  Minus,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminProducts, useUpdateProductStock, useDeleteProduct } from "@/hooks/useAdminProducts";
import { ProductTableSkeleton } from "@/components/ProductTableSkeleton";
import { ProductsError } from "@/components/ProductsError";
import { Product as ApiProduct, ProductsQueryParams } from "@/types/product.types";

// Product interface for table display (transformed from API data)
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  availability: "in-stock" | "out-of-stock" | "on-order";
  totalStock: number;
  image: string;
  isFirstLook: boolean;
  createdAt: string;
}

// Transform API product to display product
const transformApiProduct = (apiProduct: ApiProduct): Product => {
  const totalStock = typeof apiProduct.stock === 'number' && !Number.isNaN(apiProduct.stock)
    ? apiProduct.stock
    : (apiProduct.variants || []).reduce((sum, variant) => sum + (variant.stock || 0), 0);

  const primaryImage = apiProduct.images?.find(img => img.is_primary) || apiProduct.images?.[0];
  const imageUrl = primaryImage?.url || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

  const categoryName = typeof apiProduct.category_id === 'object' && apiProduct.category_id?.name
    ? apiProduct.category_id.name
    : 'Uncategorized';

  return {
    id: apiProduct._id,
    name: apiProduct.name,
    sku: apiProduct.sku,
    category: categoryName,
    price: apiProduct.price,
    availability: totalStock > 0 ? "in-stock" : "out-of-stock",
    totalStock,
    image: imageUrl,
    isFirstLook: apiProduct.featured || false,
    createdAt: apiProduct.created_at || new Date().toISOString(),
  };
};

type SortField = keyof Product;
type SortDirection = "asc" | "desc";

const PRODUCTS_PER_BATCH = 10;
const TABLE_HEIGHT = "calc(100vh - 400px)"; // Adjust based on header/filter heights

export default function ProductsPage() {
  // Authentication
  const { token, isAuthenticated } = useAuth();
  
  // Local state for filters and UI
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_BATCH);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Build query parameters for API
  const queryParams = useMemo((): ProductsQueryParams => {
    const params: ProductsQueryParams = {
      limit: 100, // Get more products for client-side filtering/sorting
    };

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    if (categoryFilter) {
      params.category = categoryFilter;
    }

    if (priceRange.min) {
      params.price_min = Number(priceRange.min);
    }

    if (priceRange.max) {
      params.price_max = Number(priceRange.max);
    }

    return params;
  }, [searchTerm, categoryFilter, priceRange]);

  // Fetch products from API
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAdminProducts(queryParams, token);

  // Mutations for product operations
  const updateStockMutation = useUpdateProductStock();
  const deleteProductMutation = useDeleteProduct();

  // Transform API products to display format
  const products = useMemo(() => {
    if (!apiResponse?.products) return [];
    return apiResponse.products.map(transformApiProduct);
  }, [apiResponse]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    if (apiResponse?.filters_available?.categories) {
      return apiResponse.filters_available.categories.map(cat => cat.name);
    }
    return Array.from(new Set(products.map((p) => p.category)));
  }, [apiResponse, products]);

  // Handle stock changes
  const updateStock = useCallback(async (productId: string, change: number) => {
    if (!token) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.totalStock + change);

    try {
      await updateStockMutation.mutateAsync({
        id: productId,
        stockData: { stock: newStock },
        token,
      });
    } catch (error) {
      console.error('Failed to update stock:', error);
      // Error handling is done by the mutation hook
    }
  }, [products, token, updateStockMutation]);

  // Handle product deletion
  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (!token) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteProductMutation.mutateAsync({
          id: productId,
          token,
        });
      } catch (error) {
        console.error('Failed to delete product:', error);
        // Error handling is done by the mutation hook
      }
    }
  }, [products, token, deleteProductMutation]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort all products
  const allFilteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !categoryFilter || product.category === categoryFilter;
      const matchesAvailability =
        !availabilityFilter || product.availability === availabilityFilter;
      const matchesPrice =
        (!priceRange.min || product.price >= Number(priceRange.min)) &&
        (!priceRange.max || product.price <= Number(priceRange.max));

      return (
        matchesSearch && matchesCategory && matchesAvailability && matchesPrice
      );
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    products,
    searchTerm,
    categoryFilter,
    availabilityFilter,
    priceRange,
    sortField,
    sortDirection,
  ]);

  // Get displayed products (for infinite scroll)
  const displayedProducts = useMemo(() => {
    return allFilteredAndSortedProducts.slice(0, displayedCount);
  }, [allFilteredAndSortedProducts, displayedCount]);

  // Load more products
  const loadMoreProducts = useCallback(() => {
    if (
      displayedCount >= allFilteredAndSortedProducts.length ||
      isLoadingMore
    ) {
      return;
    }

    setIsLoadingMore(true);
    // Simulate loading delay
    setTimeout(() => {
      setDisplayedCount((prev) =>
        Math.min(prev + PRODUCTS_PER_BATCH, allFilteredAndSortedProducts.length)
      );
      setIsLoadingMore(false);
    }, 300);
  }, [displayedCount, allFilteredAndSortedProducts.length, isLoadingMore]);

  // Handle scroll event
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 100; // Load more when 100px from bottom

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMoreProducts();
    }
  }, [loadMoreProducts]);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(PRODUCTS_PER_BATCH);
  }, [
    searchTerm,
    categoryFilter,
    availabilityFilter,
    priceRange,
    sortField,
    sortDirection,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setAvailabilityFilter("");
    setPriceRange({ min: "", max: "" });
    setDisplayedCount(PRODUCTS_PER_BATCH);
  };

  // Show loading skeleton while fetching data
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                <p className="text-gray-600 mt-1">
                  Manage your product inventory and stock levels
                </p>
              </div>
              <Link
                href="/admin/products/create"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </div>
          </div>

          {/* Loading skeleton */}
          <ProductTableSkeleton />
        </div>
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                <p className="text-gray-600 mt-1">
                  Manage your product inventory and stock levels
                </p>
              </div>
              <Link
                href="/admin/products/create"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </div>
          </div>

          {/* Error component */}
          <ProductsError 
            error={error} 
            onRetry={refetch} 
            isRetrying={isRefetching}
          />
        </div>
      </main>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Authentication Required
              </h3>
              <p className="text-gray-600 mb-6">
                Please log in to access the admin products page.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                {isRefetching && (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 ml-3" />
                )}
              </div>
              <p className="text-gray-600 mt-1">
                Manage your product inventory and stock levels
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Refresh products"
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/admin/products/create"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
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
                  placeholder="Search products by name or SKU..."
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="in-stock">In Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                    <option value="on-order">On Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    placeholder="$0"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    placeholder="$10000"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
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

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {/* Fixed Header */}
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Product
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 bg-gray-50"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center">
                      Category
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 bg-gray-50"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center">
                      Price
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 bg-gray-50"
                    onClick={() => handleSort("availability")}
                  >
                    <div className="flex items-center">
                      Status
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 bg-gray-50"
                    onClick={() => handleSort("totalStock")}
                  >
                    <div className="flex items-center">
                      Stock
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Stock Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Actions
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
                  {displayedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                              {product.isFirstLook && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  First Look
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.availability === "in-stock"
                              ? "bg-green-100 text-green-800"
                              : product.availability === "out-of-stock"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {product.availability === "in-stock" && "In Stock"}
                          {product.availability === "out-of-stock" &&
                            "Out of Stock"}
                          {product.availability === "on-order" && "On Order"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {product.totalStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateStock(product.id, -1)}
                            disabled={product.totalStock === 0 || updateStockMutation.isPending}
                            className="p-1 rounded-md text-red-600 hover:bg-red-50 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
                          >
                            {updateStockMutation.isPending && updateStockMutation.variables?.id === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Minus className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => updateStock(product.id, 1)}
                            disabled={updateStockMutation.isPending}
                            className="p-1 rounded-md text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {updateStockMutation.isPending && updateStockMutation.variables?.id === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="p-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Product"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            className="p-1 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteProductMutation.isPending}
                            className="p-1 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Delete Product"
                          >
                            {deleteProductMutation.isPending && deleteProductMutation.variables?.id === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Loading indicator */}
              {isLoadingMore && (
                <div className="flex justify-center items-center py-4 bg-white">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    Loading more products...
                  </span>
                </div>
              )}

              {/* End of results indicator */}
              {displayedCount >= allFilteredAndSortedProducts.length &&
                allFilteredAndSortedProducts.length > 0 &&
                !isLoadingMore && (
                  <div className="text-center py-4 bg-gray-50">
                    <span className="text-sm text-gray-500">
                      All products loaded ({allFilteredAndSortedProducts.length}{" "}
                      total)
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* No results message */}
          {allFilteredAndSortedProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            </div>
          )}

          {/* Results summary */}
          {allFilteredAndSortedProducts.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {displayedCount} of{" "}
                {allFilteredAndSortedProducts.length} filtered products (
                {products.length} total)
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
