"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
// import { Heart } from "lucide-react";
import { DisplayProduct } from "@/types/product.types";

interface ProductCardProps {
  product: DisplayProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group cursor-pointer block"
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-white border border-gray-200 rounded-none mb-4">
        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-4 right-4 z-10 p-2 bg-transparent hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          {/* <Heart
            className={`h-5 w-5 transition-colors ${
              isWishlisted
                ? "fill-gray-800 text-gray-800"
                : "text-gray-400 hover:text-gray-800"
            }`}
            strokeWidth={1.5}
          /> */}
        </button>

        {/* Product Image */}
        <div className="aspect-square relative">
          <Image
            src={
              product.images && product.images.length > 0 && product.images[0]?.url
                ? product.images[0].url
                : "https://placehold.co/300x300"
            }
            alt={product.name}
            fill
            className={`object-cover transition-all duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)} // Handle image load errors gracefully
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />

          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
        </div>

        {/* QUICKVIEW Button */}
        <div className="absolute bottom-0 left-0 right-0">
          <button className="w-full py-3 bg-white text-gray-900 text-sm font-medium uppercase tracking-wider border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200">
            QUICKVIEW
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        {/* Product Name */}
        <h3 className="text-sm font-normal text-gray-900 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Category & Features */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{product.category_name || product.category_id}</span>
          {product.featured && (
            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
              First Look
            </span>
          )}
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-900">
            ${product.price.toLocaleString()}
          </span>
          
          {/* Stock Status */}
          <div className="flex items-center">
            <div 
              className={`w-2 h-2 rounded-full mr-2 ${
                product.stock > 0 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}
            />
            <span className={`text-xs ${
              product.stock > 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {product.stock > 0 
                ? 'In Stock' 
                : 'Out of Stock'
              }
            </span>
          </div>
        </div>
        
        {/* Features Preview */}
        {/* {product.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.features.slice(0, 2).map((feature) => (
              <span 
                key={feature}
                className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded capitalize"
              >
                {feature.replace('-', ' ')}
              </span>
            ))}
            {product.features.length > 2 && (
              <span className="text-xs text-gray-400">
                +{product.features.length - 2} more
              </span>
            )}
          </div>
        )} */}
      </div>
    </Link>
  );
};

export default ProductCard;
