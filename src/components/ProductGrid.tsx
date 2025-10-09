"use client";

import ProductCard from "./ProductCard";
import { DisplayProduct } from "@/types/product.types";

interface ProductGridProps {
  products: DisplayProduct[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-light text-gray-600 mb-2">
          No products found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters to see more results
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
