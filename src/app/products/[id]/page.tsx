"use client";

import { useState, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useProduct } from "@/hooks/useProduct";
import { ProductDetails } from "@/types/product.types";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";

// Static fallback data for when API is not available
const getFallbackProduct = (id: string): ProductDetails => {
  return {
    id: id || "fallback",
    name: "Product Not Found",
    sku: "N/A",
    images: ["/placeholder-image.jpg"],
    category: "Unknown",
    availability: "out-of-stock", // Required for CartItem compatibility
    // features: [], // Not available in backend model
    // shape: "rectangular", // Not available in backend model
    price: 0,
    // isFirstLook: false, // Not available in backend model
    stockInfo: [], // Required for ProductDetails compatibility
    description: "Product information is not available.",
    // note: "Please try refreshing the page or contact support if the problem persists.", // Not available in backend model
    variants: {
      size: { name: "Size", options: [] },
      color: { name: "Color", options: [] },
      finish: { name: "Material", options: [] },
    },
  };
};


interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const { productDetails, loading, error, refetch } = useProduct(resolvedParams.id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const { addToCart } = useCart();

  // Use productDetails if available, otherwise fallback
  const displayProduct = productDetails || getFallbackProduct(resolvedParams.id);
  
  const [selectedVariants, setSelectedVariants] = useState({
    size: displayProduct.variants.size.options[0]?.value || '',
    color: displayProduct.variants.color.options[0]?.value || '',
    finish: displayProduct.variants.finish.options[0]?.value || '',
  });

  // Update selected variants when product data loads
  useEffect(() => {
    if (productDetails) {
      setSelectedVariants({
        size: productDetails.variants.size.options[0]?.value || '',
        color: productDetails.variants.color.options[0]?.value || '',
        finish: productDetails.variants.finish.options[0]?.value || '',
      });
    }
  }, [productDetails]);

  // Show loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <ErrorMessage 
          message={error} 
          onRetry={refetch}
          retryLabel="Try Again"
        />
      </main>
    );
  }

  // Calculate total price including variant modifiers
  const calculateTotalPrice = () => {
    let totalPrice = displayProduct.price;

    const selectedSize = displayProduct.variants.size.options.find(
      (option) => option.value === selectedVariants.size
    );
    const selectedColor = displayProduct.variants.color.options.find(
      (option) => option.value === selectedVariants.color
    );
    const selectedFinish = displayProduct.variants.finish.options.find(
      (option) => option.value === selectedVariants.finish
    );

    if (selectedSize?.priceModifier) totalPrice += selectedSize.priceModifier;
    if (selectedColor?.priceModifier) totalPrice += selectedColor.priceModifier;
    if (selectedFinish?.priceModifier)
      totalPrice += selectedFinish.priceModifier;

    return totalPrice;
  };

  const handleVariantChange = (
    variantType: keyof typeof selectedVariants,
    value: string
  ) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantType]: value,
    }));
  };

  const breadcrumbs = [
    { name: "PALACIOS HOME CO.", href: "/" },
    { name: "Products", href: "/products" },
    { name: displayProduct.category, href: `/products?category=${displayProduct.category.toLowerCase().replace(/\s+/g, '-')}` },
    { name: displayProduct.name, href: "#" },
  ];

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-400">{crumb.name}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-900 transition-colors"
                >
                  {crumb.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[4/3] relative bg-gray-50 border border-gray-200">
              <Image
                src={displayProduct.images[selectedImageIndex] || "/placeholder-image.jpg"}
                alt={displayProduct.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-5 gap-2">
              {displayProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square relative bg-gray-50 border-2 transition-all ${
                    selectedImageIndex === index
                      ? "border-gray-900"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${displayProduct.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="20vw"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* First Look Badge */}
            {/* {displayProduct.isFirstLook && (
              <div className="inline-block">
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  First Look
                </span>
              </div>
            )} */}

            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2">
                {displayProduct.name}
              </h1>
              <p className="text-sm text-gray-500">SKU {displayProduct.sku}</p>
            </div>

            {/* Status */}
            {/* <div>
              <span className="text-lg font-medium text-gray-900">
                {displayProduct.availability === "on-order" && "On Order"}
                {displayProduct.availability === "in-stock" && "In Stock"}
                {displayProduct.availability === "out-of-stock" && "Out of Stock"}
              </span>
            </div> */}

            {/* Variant Selection */}
            <div className="space-y-6">
              {/* Size Selection */}
              {displayProduct.variants.size.options.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {displayProduct.variants.size.name}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {displayProduct.variants.size.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleVariantChange("size", option.value)}
                        className={`text-left p-3 border border-gray-300 hover:border-gray-400 transition-all ${
                          selectedVariants.size === option.value
                            ? "border-gray-900 bg-gray-50"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-900">
                            {option.label}
                          </span>
                          {option.priceModifier && option.priceModifier > 0 && (
                            <span className="text-sm text-green-600">
                              +${option.priceModifier}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection - UI hidden (logic kept) */}
              {/* {displayProduct.variants.color.options.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {displayProduct.variants.color.name}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {displayProduct.variants.color.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleVariantChange("color", option.value)}
                        className={`text-left p-3 border border-gray-300 hover:border-gray-400 transition-all ${
                          selectedVariants.color === option.value
                            ? "border-gray-900 bg-gray-50"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            {option.colorCode && (
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: option.colorCode }}
                              />
                            )}
                            <span className="text-sm text-gray-900">
                              {option.label}
                            </span>
                          </div>
                          {option.priceModifier && option.priceModifier > 0 && (
                            <span className="text-sm text-green-600">
                              +${option.priceModifier}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Material Selection (renamed from Finish) - UI hidden (logic kept) */}
              {/* {displayProduct.variants.finish.options.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {displayProduct.variants.finish.name}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {displayProduct.variants.finish.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleVariantChange("finish", option.value)
                        }
                        className={`text-left p-3 border border-gray-300 hover:border-gray-400 transition-all ${
                          selectedVariants.finish === option.value
                            ? "border-gray-900 bg-gray-50"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-900">
                            {option.label}
                          </span>
                          {option.priceModifier && option.priceModifier > 0 && (
                            <span className="text-sm text-green-600">
                              +${option.priceModifier}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )} */}
            </div>

            {/* Stock Information Table */}
            {/* <div className="border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      More Arriving
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {displayProduct.stockInfo.map((info, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {info.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {info.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {info.moreArriving}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> */}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-sm font-medium text-gray-700">
                Quantity:
              </span>
              <div className="flex items-center border border-gray-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4 text-gray-600" />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center border-x border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  // Get selected variant details for display
                  const selectedSizeOption = displayProduct.variants.size.options.find(
                    (option) => option.value === selectedVariants.size
                  );
                  const selectedColorOption = displayProduct.variants.color.options.find(
                    (option) => option.value === selectedVariants.color
                  );
                  const selectedFinishOption =
                    displayProduct.variants.finish.options.find(
                      (option) => option.value === selectedVariants.finish
                    );

                  const variantDescription = [
                    selectedSizeOption?.label,
                    selectedColorOption?.label,
                    selectedFinishOption?.label,
                  ].filter(Boolean).join(", ");

                  addToCart(
                    {
                      id: displayProduct.id,
                      cartId: `${displayProduct.id}-${selectedVariants.size}-${selectedVariants.color}-${selectedVariants.finish}`,
                      name: `${displayProduct.name}${variantDescription ? ` (${variantDescription})` : ''}`,
                      image: displayProduct.images[0] || "/placeholder-image.jpg",
                      price: calculateTotalPrice(),
                      sku: displayProduct.sku,
                      category: displayProduct.category,
                      availability: displayProduct.availability,
                      variants: {
                        size: selectedVariants.size,
                        color: selectedVariants.color,
                        finish: selectedVariants.finish,
                      },
                    },
                    quantity
                  );
                  setShowAddedMessage(true);
                  setTimeout(() => setShowAddedMessage(false), 3000);
                }}
                className="flex-1 bg-gray-900 text-white py-4 px-8 font-medium tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
             
              
              <a
                href="mailto:info@palacioshomeco.com"
                className="flex-1 bg-gray-900 text-white py-4 px-8 font-medium tracking-wider hover:bg-gray-800 transition-colors text-center"
              >
                Contact us to order
              </a>
            </div>

            {/* Added to Cart Message */}
            {showAddedMessage && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm text-center">
                ✓ Added to cart successfully!
              </div>
            )}

            {/* Price Display */}
            {/* <div className="border-t border-gray-200 pt-6">
              <div className="text-2xl font-light text-gray-900">
                ${calculateTotalPrice().toLocaleString()}
              </div>
              {calculateTotalPrice() !== displayProduct.price && (
                <div className="text-sm text-gray-500 mt-1">
                  Base price: ${displayProduct.price.toLocaleString()}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Price shown is per item
              </p>
            </div> */}

            {/* Product Description */}
            {displayProduct.description && (
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {displayProduct.description}
                </p>
              </div>
            )}

            {/* Product Note */}
            {/* {displayProduct.note && (
              <div className="border-t border-gray-200 pt-8">
                <p className="text-sm text-gray-600 leading-relaxed">
                  <strong>Note:</strong> {displayProduct.note}
                </p>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </main>
  );
}
