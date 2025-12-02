"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductFilter from "@/components/ProductFilter";
import ProductGrid from "@/components/ProductGrid";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useInfiniteProductsForDisplay } from "@/hooks/useProducts";
import { useFilters, useSortBy, useFilterStore } from "@/stores/filterStore";
import { ProductsQueryParams } from "@/types/product.types";

// Using DisplayProduct from types instead of local interface

function ProductsPageContent() {
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";
  
  // Get filters and sort from Zustand store
  const filters = useFilters();
  const sortBy = useSortBy();
  const setFilter = useFilterStore((state) => state.setFilter);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize category filter from URL params
  useEffect(() => {
    if (categoryParam) {
      // Parse comma-separated categories if multiple are provided
      const categories = categoryParam.split(',').map(cat => cat.trim()).filter(Boolean);
      if (categories.length > 0) {
        setFilter('category', categories);
      }
    }
  }, [categoryParam, setFilter]);

  // Build query parameters for the API (excluding page since infinite query handles that)
  const queryParams = useMemo((): Omit<ProductsQueryParams, 'page'> => {
    const params: Omit<ProductsQueryParams, 'page'> = {
      limit: 10,
    };

    // Add search query from URL if present
    if (searchQuery) {
      params.search = searchQuery;
    }

    // Add category filter - send multiple categories as comma-separated string
    if (filters.category && filters.category.length > 0) {
      params.category = filters.category.join(',');
    }
    
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
  }, [filters, searchQuery]);

  // Fetch products using infinite query
  const { 
    allProducts: products = [], 
    isLoading, 
    isError, 
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteProductsForDisplay(queryParams);

  // Apply client-side filtering for features that don't have backend support
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply availability filter (client-side)
    if (filters.availability.length > 0) {
      filtered = filtered.filter((product) =>
        filters.availability.includes(product.availability)
      );
    }

    // Features and shape filters commented out - not in product model
    // if (filters.features.length > 0) {
    //   filtered = filtered.filter((product) =>
    //     filters.features.some((feature) => product.features.includes(feature))
    //   );
    // }

    // if (filters.shape.length > 0) {
    //   filtered = filtered.filter((product) =>
    //     filters.shape.includes(product.shape)
    //   );
    // }

    return filtered;
  }, [products, filters.availability]);

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


  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="mb-8">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
      {/* Search Results Header */}
      {searchQuery && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h2 className="text-lg font-medium text-gray-900">
            Search results for: <span className="text-gray-600">"{searchQuery}"</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Found {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>
      )}

      {/* Filter Component */}
      <ProductFilter productCount={sortedProducts.length} />

      {/* Product Grid */}
      <ProductGrid products={sortedProducts} />
      
      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Loading more...
              </div>
            ) : (
              'Load More Products'
            )}
          </button>
        </div>
      )}
      
      {/* No products message */}
      {sortedProducts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No products found matching your criteria.
          </p>
          <button
            onClick={() => {
              // This will be handled by the ProductFilter component's clear button
              window.location.reload();
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

function ProductsPageHeader() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-light tracking-[0.2em] text-gray-900 mb-4">
        {searchQuery ? "SEARCH RESULTS" : "ALL PRODUCTS"}
      </h1>
      <p className="text-gray-600 text-lg">
        {searchQuery
          ? `Searching for "${searchQuery}" in our furniture collection`
          : "Discover our complete collection of handcrafted furniture"}
      </p>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header - shown once for all states */}
        <Suspense
          fallback={
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-light tracking-[0.2em] text-gray-900 mb-4">
                ALL PRODUCTS
              </h1>
              <p className="text-gray-600 text-lg">
                Discover our complete collection of handcrafted furniture
              </p>
            </div>
          }
        >
          <ProductsPageHeader />
        </Suspense>

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
          <Suspense
            fallback={
              <div className="mb-8">
                <div className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded mb-8"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="bg-gray-200 h-80 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            }
          >
            <ProductsPageContent />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  );
}
