"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

// Extended Product interface for single product page
interface ProductDetails {
  id: string;
  name: string;
  sku: string;
  images: string[];
  category: string;
  // availability: "in-stock" | "out-of-stock" | "on-order"; // Not available in backend model
  // features: string[]; // Not available in backend model
  // shape: string; // Not available in backend model
  price: number;
  // isFirstLook?: boolean; // Not available in backend model
  // stockInfo: { // Not available in backend model - only simple stock field exists
  //   location: string;
  //   stock: number;
  //   moreArriving: string;
  // }[];
  description?: string;
  // note?: string; // Not available in backend model
  variants: {
    size: {
      name: string;
      options: { value: string; label: string; priceModifier?: number }[];
    };
    color: {
      name: string;
      options: {
        value: string;
        label: string;
        colorCode?: string;
        priceModifier?: number;
      }[];
    };
    finish: {
      name: string;
      options: { value: string; label: string; priceModifier?: number }[];
    };
  };
}

// Sample product data - In a real app, this would come from an API
const getProductById = (id: string): ProductDetails => {
  // This would typically be an API call using the id parameter
  // For demo purposes, returning static data regardless of id
  console.log(`Fetching product with ID: ${id}`);
  return {
    id: "59972101",
    name: "Mattai Reclaimed Wood 4Dwr Console",
    sku: "59972101",
    images: [
      "https://images.unsplash.com/photo-1494947665470-20322015e3a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    category: "Console Tables",
    // availability: "on-order", // Not available in backend model
    // features: ["reclaimed-wood", "four-drawer"], // Not available in backend model
    // shape: "rectangular", // Not available in backend model
    price: 1599,
    // isFirstLook: true, // Not available in backend model
    // stockInfo: [ // Not available in backend model - only simple stock field exists
    //   {
    //     location: "Los Angeles, CA",
    //     stock: 0,
    //     moreArriving: "On Order",
    //   },
    // ],
    // note: "The color of the product might differ due to production and your monitor screen settings. It's essential to ensure proper color calibration to accurately represent our products.", // Not available in backend model
    variants: {
      size: {
        name: "Size",
        options: [
          { value: "small", label: '48" W x 16" D x 32" H', priceModifier: 0 },
          {
            value: "medium",
            label: '60" W x 18" D x 32" H',
            priceModifier: 200,
          },
          {
            value: "large",
            label: '72" W x 20" D x 32" H',
            priceModifier: 400,
          },
        ],
      },
      color: {
        name: "Wood Color",
        options: [
          {
            value: "natural",
            label: "Natural Reclaimed",
            colorCode: "#D2B48C",
          },
          {
            value: "dark-walnut",
            label: "Dark Walnut",
            colorCode: "#5D4037",
            priceModifier: 100,
          },
          {
            value: "weathered-gray",
            label: "Weathered Gray",
            colorCode: "#9E9E9E",
            priceModifier: 150,
          },
        ],
      },
      finish: {
        name: "Finish",
        options: [
          { value: "matte", label: "Matte Protective", priceModifier: 0 },
          { value: "satin", label: "Satin", priceModifier: 75 },
          { value: "distressed", label: "Distressed", priceModifier: 125 },
        ],
      },
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
  const product = getProductById(resolvedParams.id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({
    size: product.variants.size.options[0].value,
    color: product.variants.color.options[0].value,
    finish: product.variants.finish.options[0].value,
  });
  const { addToCart } = useCart();

  // Calculate total price including variant modifiers
  const calculateTotalPrice = () => {
    let totalPrice = product.price;

    const selectedSize = product.variants.size.options.find(
      (option) => option.value === selectedVariants.size
    );
    const selectedColor = product.variants.color.options.find(
      (option) => option.value === selectedVariants.color
    );
    const selectedFinish = product.variants.finish.options.find(
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
    { name: "Artisan House", href: "/" },
    { name: "Reclaimed & Reframed", href: "/collections/reclaimed" },
    { name: "Console Tables", href: "/products?category=console" },
    { name: product.name, href: "#" },
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
                src={product.images[selectedImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
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
                    alt={`${product.name} view ${index + 1}`}
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
            {/* {product.isFirstLook && (
              <div className="inline-block">
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  First Look
                </span>
              </div>
            )} */}

            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-sm text-gray-500">SKU {product.sku}</p>
            </div>

            {/* Status */}
            {/* <div>
              <span className="text-lg font-medium text-gray-900">
                {product.availability === "on-order" && "On Order"}
                {product.availability === "in-stock" && "In Stock"}
                {product.availability === "out-of-stock" && "Out of Stock"}
              </span>
            </div> */}

            {/* Variant Selection */}
            <div className="space-y-6">
              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {product.variants.size.name}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {product.variants.size.options.map((option) => (
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

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {product.variants.color.name}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {product.variants.color.options.map((option) => (
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

              {/* Finish Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {product.variants.finish.name}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {product.variants.finish.options.map((option) => (
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
                  {product.stockInfo.map((info, index) => (
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

            {/* Add to Cart Button */}
            <button
              onClick={() => {
                // Get selected variant details for display
                const selectedSizeOption = product.variants.size.options.find(
                  (option) => option.value === selectedVariants.size
                );
                const selectedColorOption = product.variants.color.options.find(
                  (option) => option.value === selectedVariants.color
                );
                const selectedFinishOption =
                  product.variants.finish.options.find(
                    (option) => option.value === selectedVariants.finish
                  );

                const variantDescription = [
                  selectedSizeOption?.label,
                  selectedColorOption?.label,
                  selectedFinishOption?.label,
                ].join(", ");

                addToCart(
                  {
                    id: `${product.id}-${selectedVariants.size}-${selectedVariants.color}-${selectedVariants.finish}`,
                    name: `${product.name} (${variantDescription})`,
                    image: product.images[0],
                    price: calculateTotalPrice(),
                    sku: product.sku,
                    category: product.category,
                    // availability: product.availability, // availability not available in backend
                  },
                  quantity
                );
                setShowAddedMessage(true);
                setTimeout(() => setShowAddedMessage(false), 3000);
              }}
              className="w-full bg-gray-900 text-white py-4 px-8 font-medium tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              // disabled={product.availability === "out-of-stock"} // availability not available in backend
            >
              {/* {product.availability === "out-of-stock"
                ? "Out of Stock"
                : "Add to Cart"} */}
              Add to Cart
            </button>

            {/* Added to Cart Message */}
            {showAddedMessage && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm text-center">
                ✓ Added to cart successfully!
              </div>
            )}

            {/* Price Display */}
            <div className="border-t border-gray-200 pt-6">
              <div className="text-2xl font-light text-gray-900">
                ${calculateTotalPrice().toLocaleString()}
              </div>
              {calculateTotalPrice() !== product.price && (
                <div className="text-sm text-gray-500 mt-1">
                  Base price: ${product.price.toLocaleString()}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Price shown is per item
              </p>
            </div>

            {/* Product Note */}
            {/* {product.note && (
              <div className="border-t border-gray-200 pt-8">
                <p className="text-sm text-gray-600 leading-relaxed">
                  <strong>Note:</strong> {product.note}
                </p>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </main>
  );
}
