"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { Product } from "@/types/product.types";

interface SearchDropdownProps {
  products: Product[];
  isLoading: boolean;
  searchQuery: string;
  totalCount?: number;
  onClose: () => void;
  onSeeAllResults: () => void;
}

const SearchDropdown = ({
  products,
  isLoading,
  searchQuery,
  totalCount,
  onClose,
  onSeeAllResults,
}: SearchDropdownProps) => {
  // Limit to 6 products for preview
  const previewProducts = products.slice(0, 6);
  const hasMoreResults = products.length > 6 || (totalCount && totalCount > 6);

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-w-2xl mx-auto">
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-600">Searching...</span>
        </div>
      </div>
    );
  }

  if (!searchQuery) {
    return null;
  }

  if (products.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-w-2xl mx-auto">
        <div className="p-8 text-center">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No results found
          </h3>
          <p className="text-sm text-gray-500">
            Try searching with different keywords
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-w-2xl mx-auto">
      {/* Search Results List */}
      <div className="max-h-96 overflow-y-auto">
        {previewProducts.map((product) => (
          <SearchResultItem
            key={product._id}
            product={product}
            onClose={onClose}
          />
        ))}
      </div>

      {/* Footer with "See all results" button */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <button
          onClick={onSeeAllResults}
          className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          See all {totalCount || products.length} results for "{searchQuery}"
        </button>
      </div>
    </div>
  );
};

interface SearchResultItemProps {
  product: Product;
  onClose: () => void;
}

const SearchResultItem = ({ product, onClose }: SearchResultItemProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const primaryImage =
    product.images?.find((img) => img.is_primary) || product.images?.[0];

  return (
    <Link
      href={`/products/${product._id}`}
      onClick={onClose}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      {/* Product Image */}
      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
        {primaryImage?.url ? (
          <>
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              className={`object-cover transition-opacity duration-200 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
              sizes="64px"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
          {product.name}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">SKU: {product.sku}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium text-gray-900">
            ${product.price.toLocaleString()}
          </span>
          {product.stock !== undefined && product.stock > 0 ? (
            <span className="text-xs text-green-600">In Stock</span>
          ) : (
            <span className="text-xs text-red-600">Out of Stock</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SearchDropdown;

