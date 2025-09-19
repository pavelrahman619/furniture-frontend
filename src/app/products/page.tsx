"use client";

import { useState, useMemo } from "react";
import ProductFilter from "@/components/ProductFilter";
import ProductGrid from "@/components/ProductGrid";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useProductsForDisplay } from "@/hooks/useProducts";
import { ProductsQueryParams, ProductFilters } from "@/types/product.types";

// Using DisplayProduct from types instead of local interface

function ProductsPageContent() {
  // State for filters and sorting
  const [filters, setFilters] = useState<ProductFilters>({
    availability: [],
    category: [],
    features: [],
    shape: [],
    colors: [],
    materials: [],
  });
  const [sortBy, setSortBy] = useState<string>("new");
  const [currentPage, setCurrentPage] = useState(1);

  // Build query parameters for the API
  const queryParams = useMemo((): ProductsQueryParams => {
    const params: ProductsQueryParams = {
      page: currentPage,
      limit: 12,
    };

    // Category filtering is now handled server-side with proper ObjectIds
    // Note: Frontend filtering by category name would need category mapping
    // For now, skip category filtering until we implement proper category selection UI 
    
    // Add color filter
    if (filters.colors && filters.colors.length > 0) {
      params.color = filters.colors[0]; // Backend expects single color
    }

    // Add material filter
    if (filters.materials && filters.materials.length > 0) {
      params.material = filters.materials[0]; // Backend expects single material
    }

    // Add price range if available
    if (filters.price_min) {
      params.price_min = filters.price_min;
    }
    if (filters.price_max) {
      params.price_max = filters.price_max;
    }

    return params;
  }, [filters, currentPage]);

  // Fetch products using TanStack Query
  const { 
    data: products = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useProductsForDisplay(queryParams);

  // Apply client-side filtering for features that don't have backend support
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply availability filter (client-side)
    if (filters.availability.length > 0) {
      filtered = filtered.filter((product) =>
        filters.availability.includes(product.availability)
      );
    }

    // Apply features filter (client-side)
    if (filters.features.length > 0) {
      filtered = filtered.filter((product) =>
        filters.features.some((feature) => product.features.includes(feature))
      );
    }

    // Apply shape filter (client-side)
    if (filters.shape.length > 0) {
      filtered = filtered.filter((product) =>
        filters.shape.includes(product.shape)
      );
    }

    return filtered;
  }, [products, filters]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "new":
      default:
        // Keep original order for "new"
        break;
    }

    return sorted;
  }, [filteredProducts, sortBy]);

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (sortOption: string) => {
    setSortBy(sortOption);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mb-8">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Loading spinner for better UX */}
        <div className="flex justify-center mt-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="mb-8">
        {/* Error message */}
        <ErrorMessage
          title="Unable to Load Products"
          message={error instanceof Error ? error.message : 'Something went wrong while loading products.'}
          onRetry={() => refetch()}
          retryLabel="Try Again"
        />
      </div>
    );
  }

  return (
    <>
      {/* Filter Component */}
      <ProductFilter
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        productCount={sortedProducts.length}
        sortBy={sortBy}
      />

      {/* Product Grid */}
      <ProductGrid products={sortedProducts} />
      
      {/* No products message */}
      {sortedProducts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No products found matching your criteria.
          </p>
          <button
            onClick={() => {
              setFilters({
                availability: [],
                category: [],
                features: [],
                shape: [],
                colors: [],
                materials: [],
              });
              setSortBy("new");
            }}
            className="mt-4 text-blue-600 hover:text-blue-800 underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header - shown once for all states */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light tracking-[0.2em] text-gray-900 mb-4">
            ALL PRODUCTS
          </h1>
          <p className="text-gray-600 text-lg">
            Discover our complete collection of handcrafted furniture
          </p>
        </div>

        {/* Content with Error Boundary */}
        <ErrorBoundary
          fallback={
            <ErrorMessage
              title="Application Error"
              message="Something went wrong with the products page. Please refresh the page to try again."
              onRetry={() => window.location.reload()}
              retryLabel="Reload Page"
            />
          }
        >
          <ProductsPageContent />
        </ErrorBoundary>
      </div>
    </main>
  );
}
