"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, X, Save, ArrowLeft, Eye } from "lucide-react";

// Product interface matching the existing product structure
interface ProductFormData {
  id: string;
  name: string;
  sku: string;
  images: string[];
  category: string;
  availability: "in-stock" | "out-of-stock" | "on-order";
  features: string[];
  shape: string;
  price: number;
  isFirstLook: boolean;
  stockInfo: {
    location: string;
    stock: number;
    moreArriving: string;
  }[];
  description: string;
  note: string;
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

// Initial form state
const initialFormData: ProductFormData = {
  id: "",
  name: "",
  sku: "",
  images: [""],
  category: "",
  availability: "in-stock",
  features: [""],
  shape: "",
  price: 0,
  isFirstLook: false,
  stockInfo: [
    {
      location: "",
      stock: 0,
      moreArriving: "",
    },
  ],
  description: "",
  note: "",
  variants: {
    size: {
      name: "Size",
      options: [{ value: "", label: "", priceModifier: 0 }],
    },
    color: {
      name: "Color",
      options: [{ value: "", label: "", colorCode: "", priceModifier: 0 }],
    },
    finish: {
      name: "Finish",
      options: [{ value: "", label: "", priceModifier: 0 }],
    },
  },
};

export default function CreateProductPage() {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [previewMode, setPreviewMode] = useState(false);

  // Generate unique ID and SKU
  const generateIdAndSku = () => {
    const timestamp = Date.now().toString().slice(-8);
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const newId = `${timestamp}${randomNum}`;

    setFormData((prev) => ({
      ...prev,
      id: newId,
      sku: newId,
    }));
  };

  // Handle basic field changes
  const handleFieldChange = (
    field: keyof ProductFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle array field changes (images, features)
  const handleArrayFieldChange = (
    field: "images" | "features",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  // Add array item
  const addArrayItem = (field: "images" | "features") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  // Remove array item
  const removeArrayItem = (field: "images" | "features", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Handle stock info changes
  const handleStockInfoChange = (
    index: number,
    field: keyof ProductFormData["stockInfo"][0],
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      stockInfo: prev.stockInfo.map((stock, i) =>
        i === index ? { ...stock, [field]: value } : stock
      ),
    }));
  };

  // Add stock location
  const addStockLocation = () => {
    setFormData((prev) => ({
      ...prev,
      stockInfo: [
        ...prev.stockInfo,
        { location: "", stock: 0, moreArriving: "" },
      ],
    }));
  };

  // Remove stock location
  const removeStockLocation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      stockInfo: prev.stockInfo.filter((_, i) => i !== index),
    }));
  };

  // Handle variant changes
  const handleVariantOptionChange = (
    variantType: keyof ProductFormData["variants"],
    optionIndex: number,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: {
        ...prev.variants,
        [variantType]: {
          ...prev.variants[variantType],
          options: prev.variants[variantType].options.map((option, i) =>
            i === optionIndex ? { ...option, [field]: value } : option
          ),
        },
      },
    }));
  };

  // Add variant option
  const addVariantOption = (variantType: keyof ProductFormData["variants"]) => {
    const newOption =
      variantType === "color"
        ? { value: "", label: "", colorCode: "", priceModifier: 0 }
        : { value: "", label: "", priceModifier: 0 };

    setFormData((prev) => ({
      ...prev,
      variants: {
        ...prev.variants,
        [variantType]: {
          ...prev.variants[variantType],
          options: [...prev.variants[variantType].options, newOption],
        },
      },
    }));
  };

  // Remove variant option
  const removeVariantOption = (
    variantType: keyof ProductFormData["variants"],
    optionIndex: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: {
        ...prev.variants,
        [variantType]: {
          ...prev.variants[variantType],
          options: prev.variants[variantType].options.filter(
            (_, i) => i !== optionIndex
          ),
        },
      },
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Product data:", formData);
    // Here you would typically send the data to your API
    alert("Product created successfully! Check console for data.");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/products"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Products
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Product
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? "Edit" : "Preview"}
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Product
              </button>
            </div>
          </div>
        </div>

        {!previewMode ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
                <button
                  type="button"
                  onClick={generateIdAndSku}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate ID & SKU
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => handleFieldChange("id", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Auto-generated or custom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleFieldChange("sku", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter SKU"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleFieldChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Dining Room">Dining Room</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Office">Office</option>
                    <option value="Entry & Decor">Entry & Decor</option>
                    {/* <option value="Console Tables">Console Tables</option>
                    <option value="Dining Tables">Dining Tables</option>
                    <option value="Coffee Tables">Coffee Tables</option>
                    <option value="Chairs">Chairs</option>
                    <option value="Storage">Storage</option> */}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      handleFieldChange("price", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) =>
                      handleFieldChange(
                        "availability",
                        e.target.value as ProductFormData["availability"]
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="in-stock">In Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                    <option value="on-order">On Order</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shape
                  </label>
                  <input
                    type="text"
                    value={formData.shape}
                    onChange={(e) => handleFieldChange("shape", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., rectangular, round, square"
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="firstLook"
                    checked={formData.isFirstLook}
                    onChange={(e) =>
                      handleFieldChange("isFirstLook", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="firstLook"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Mark as First Look
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => handleFieldChange("note", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes about the product"
                />
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Product Images
              </h2>
              <div className="space-y-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            "images",
                            index,
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter image URL"
                      />
                    </div>
                    {image && (
                      <div className="w-16 h-16 border border-gray-300 rounded-md overflow-hidden">
                        <Image
                          src={image}
                          alt={`Preview ${index + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          onError={() => {}}
                        />
                      </div>
                    )}
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("images", index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("images")}
                  className="flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Features
              </h2>
              <div className="space-y-4">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            "features",
                            index,
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter feature (e.g., reclaimed-wood, four-drawer)"
                      />
                    </div>
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("features", index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("features")}
                  className="flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </button>
              </div>
            </div>

            {/* Stock Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Stock Information
              </h2>
              <div className="space-y-6">
                {formData.stockInfo.map((stock, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        Location {index + 1}
                      </h3>
                      {formData.stockInfo.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStockLocation(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={stock.location}
                          onChange={(e) =>
                            handleStockInfoChange(
                              index,
                              "location",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Los Angeles, CA"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock Quantity
                        </label>
                        <input
                          type="number"
                          value={stock.stock}
                          onChange={(e) =>
                            handleStockInfoChange(
                              index,
                              "stock",
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          More Arriving
                        </label>
                        <input
                          type="text"
                          value={stock.moreArriving}
                          onChange={(e) =>
                            handleStockInfoChange(
                              index,
                              "moreArriving",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., On Order, Next Week"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStockLocation}
                  className="flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock Location
                </button>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Product Variants
              </h2>

              {/* Size Variants */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900">
                    Size Variants
                  </h3>
                  <input
                    type="text"
                    value={formData.variants.size.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        variants: {
                          ...prev.variants,
                          size: { ...prev.variants.size, name: e.target.value },
                        },
                      }))
                    }
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    placeholder="Variant name"
                  />
                </div>
                <div className="space-y-4">
                  {formData.variants.size.options.map((option, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Value
                          </label>
                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) =>
                              handleVariantOptionChange(
                                "size",
                                index,
                                "value",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., small, medium, large"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Label
                          </label>
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) =>
                              handleVariantOptionChange(
                                "size",
                                index,
                                "label",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder='e.g., 48" W x 16" D x 32" H'
                          />
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Price Modifier ($)
                            </label>
                            <input
                              type="number"
                              value={option.priceModifier || 0}
                              onChange={(e) =>
                                handleVariantOptionChange(
                                  "size",
                                  index,
                                  "priceModifier",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          {formData.variants.size.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariantOption("size", index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addVariantOption("size")}
                    className="flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size Option
                  </button>
                </div>
              </div>

              {/* Color Variants */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900">
                    Color Variants
                  </h3>
                  <input
                    type="text"
                    value={formData.variants.color.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        variants: {
                          ...prev.variants,
                          color: {
                            ...prev.variants.color,
                            name: e.target.value,
                          },
                        },
                      }))
                    }
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    placeholder="Variant name"
                  />
                </div>
                <div className="space-y-4">
                  {formData.variants.color.options.map((option, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Value
                          </label>
                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) =>
                              handleVariantOptionChange(
                                "color",
                                index,
                                "value",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., natural, walnut"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Label
                          </label>
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) =>
                              handleVariantOptionChange(
                                "color",
                                index,
                                "label",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Natural Reclaimed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color Code
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={option.colorCode || "#000000"}
                              onChange={(e) =>
                                handleVariantOptionChange(
                                  "color",
                                  index,
                                  "colorCode",
                                  e.target.value
                                )
                              }
                              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                            />
                            <input
                              type="text"
                              value={option.colorCode || ""}
                              onChange={(e) =>
                                handleVariantOptionChange(
                                  "color",
                                  index,
                                  "colorCode",
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="#D2B48C"
                            />
                          </div>
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Price Modifier ($)
                            </label>
                            <input
                              type="number"
                              value={option.priceModifier || 0}
                              onChange={(e) =>
                                handleVariantOptionChange(
                                  "color",
                                  index,
                                  "priceModifier",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          {formData.variants.color.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeVariantOption("color", index)
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addVariantOption("color")}
                    className="flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Color Option
                  </button>
                </div>
              </div>

              {/* Finish Variants */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900">
                    Finish Variants
                  </h3>
                  <input
                    type="text"
                    value={formData.variants.finish.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        variants: {
                          ...prev.variants,
                          finish: {
                            ...prev.variants.finish,
                            name: e.target.value,
                          },
                        },
                      }))
                    }
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    placeholder="Variant name"
                  />
                </div>
                <div className="space-y-4">
                  {formData.variants.finish.options.map((option, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Value
                          </label>
                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) =>
                              handleVariantOptionChange(
                                "finish",
                                index,
                                "value",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., matte, satin, gloss"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Label
                          </label>
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) =>
                              handleVariantOptionChange(
                                "finish",
                                index,
                                "label",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Matte Protective"
                          />
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Price Modifier ($)
                            </label>
                            <input
                              type="number"
                              value={option.priceModifier || 0}
                              onChange={(e) =>
                                handleVariantOptionChange(
                                  "finish",
                                  index,
                                  "priceModifier",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          {formData.variants.finish.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeVariantOption("finish", index)
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addVariantOption("finish")}
                    className="flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Finish Option
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Create Product
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Product Preview
            </h2>
            <div className="text-gray-600">
              Preview functionality will be implemented here...
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
