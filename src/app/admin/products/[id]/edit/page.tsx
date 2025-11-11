"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { X, Save, ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useUpdateProduct } from "@/hooks/useAdminProducts";
import AdminGuard from "@/components/AdminGuard";
import { ProductService } from "@/services/product.service";
import { uploadImageToCloudinary, validateImageFile } from "@/lib/cloudinary-utils";
import { UpdateProductRequest, ProductImage, ProductVariant } from "@/types/product.types";
import { useToast } from "@/contexts/ToastContext";
import VariantManager from "@/components/VariantManager";
import { fetchCategories } from "@/services/category.service";
import { useQuery } from "@tanstack/react-query";

// Product interface for form data
interface ProductFormData {
  name: string;
  sku: string;
  category_id: string;
  price: number;
  description: string;
  images: ProductImage[];
  featured: boolean;
  stock: number;
  variants: ProductVariant[];
}

// Form validation errors
interface FormErrors {
  name?: string;
  sku?: string;
  category_id?: string;
  price?: string;
  description?: string;
  images?: string;
  stock?: string;
  featured?: string;
  variants?: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { getToken, isAuthenticated } = useAdmin();
  const token = getToken();
  const updateProductMutation = useUpdateProduct();
  const { success, error } = useToast();

  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Load product data on mount
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId || !token) return;

      try {
        setIsLoading(true);
        setLoadError(null);

        const product = await ProductService.getProduct(productId);

        // Transform product data to form format
        const categoryId = typeof product.category_id === 'string'
          ? product.category_id
          : product.category_id._id;

        setFormData({
          name: product.name,
          sku: product.sku,
          category_id: categoryId,
          price: 0, // Price is set at variant level only
          description: product.description || "",
          images: product.images || [],
          featured: product.featured || false,
          stock: product.stock || 0,
          variants: product.variants || [],
        });
      } catch (error) {
        console.error('Failed to load product:', error);
        setLoadError('Failed to load product data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId, token]);

  // Handle basic field changes
  const handleFieldChange = (
    field: keyof ProductFormData,
    value: string | number | boolean | ProductVariant[]
  ) => {
    if (!formData) return;

    setFormData((prev) => prev ? ({
      ...prev,
      [field]: value,
    }) : null);

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Handle variant changes
  const handleVariantsChange = (variants: ProductVariant[]) => {
    handleFieldChange("variants", variants);
  };

  // Handle image upload
  const handleImageUpload = async (file: File, index?: number) => {
    if (!formData) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrors((prev) => ({
        ...prev,
        images: validation.error,
      }));
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadImageToCloudinary(file, {
        folder: 'PRODUCT_IMAGES',
        tags: ['product', 'admin'],
      });

      if (result.success && result.url) {
        const newImage: ProductImage = {
          url: result.url,
          alt: formData.name || 'Product image',
          is_primary: formData.images.length === 0, // First image is primary
        };

        if (index !== undefined) {
          // Replace existing image
          setFormData((prev) => prev ? ({
            ...prev,
            images: prev.images.map((img, i) => (i === index ? newImage : img)),
          }) : null);
        } else {
          // Add new image
          setFormData((prev) => prev ? ({
            ...prev,
            images: [...prev.images, newImage],
          }) : null);
        }

        // Clear any image errors
        setErrors((prev) => ({
          ...prev,
          images: undefined,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          images: result.error || 'Failed to upload image',
        }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        images: 'Failed to upload image',
      }));
    } finally {
      setIsUploading(false);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    if (!formData) return;

    setFormData((prev) => prev ? ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }) : null);
  };

  // Set primary image
  const setPrimaryImage = (index: number) => {
    if (!formData) return;

    setFormData((prev) => prev ? ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        is_primary: i === index,
      })),
    }) : null);
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!formData) return false;

    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    // Require at least one variant
    if (formData.variants.length === 0) {
      newErrors.variants = 'At least one product variant is required';
    } else {
      // Validate variants if any exist
      const variantSkus = formData.variants.map(v => v.sku);
      const duplicateSkus = variantSkus.filter((sku, index) => variantSkus.indexOf(sku) !== index);

      if (duplicateSkus.length > 0) {
        newErrors.variants = 'Variant SKUs must be unique';
      }

      // Check for variants with invalid data
      const invalidVariants = formData.variants.some(variant =>
        !variant.sku.trim() ||
        variant.price <= 0 ||
        variant.stock < 0
      );

      if (invalidVariants) {
        newErrors.variants = 'All variants must have valid SKU, price, and non-negative stock';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !token || !formData) {
      setErrors({ name: 'You must be logged in to update products' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const productData: UpdateProductRequest = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category_id: formData.category_id,
        price: 0, // Price is set at variant level only
        description: formData.description.trim(),
        images: formData.images,
        featured: formData.featured,
        stock: formData.stock,
        variants: formData.variants,
      };

      await updateProductMutation.mutateAsync({
        id: productId,
        productData,
        token,
      });

      // Success - show notification and redirect to products list
      success(
        'Product Updated Successfully',
        `${formData.name} has been updated in your product catalog.`
      );

      router.push('/admin/products');
    } catch (err) {
      console.error('Failed to update product:', err);
      error(
        'Failed to Update Product',
        'There was an error updating the product. Please try again.'
      );
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading Product Data
              </h3>
              <p className="text-gray-600">
                Please wait while we fetch the product information...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Show error state
  if (loadError || !formData) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error Loading Product
              </h3>
              <p className="text-gray-600 mb-6">
                {loadError || 'Product not found or failed to load.'}
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <Link
                  href="/admin/products"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AdminGuard>
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
                  Edit Product
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  form="product-form"
                  disabled={updateProductMutation.isPending || isUploading}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updateProductMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </div>
          </div>

          <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleFieldChange("sku", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.sku ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Enter SKU"
                  />
                  {errors.sku && (
                    <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleFieldChange("category_id", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    disabled={isCategoriesLoading}
                  >
                    <option value="">
                      {isCategoriesLoading ? "Loading categories..." : "Select category"}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleFieldChange("stock", Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.stock ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                  )}
                </div>
              </div>

              {/* <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleFieldChange("featured", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Mark as Featured Product
                  </label>
                </div>
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Enter product description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Product Images *
              </h2>

              {errors.images && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.images}</p>
                </div>
              )}

              <div className="space-y-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 border border-gray-300 rounded-md overflow-hidden bg-gray-50">
                        <Image
                          src={image.url}
                          alt={image.alt || `Product image ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alt Text
                          </label>
                          <input
                            type="text"
                            value={image.alt || ''}
                            onChange={(e) => {
                              const newImages = [...formData.images];
                              newImages[index] = { ...image, alt: e.target.value };
                              setFormData(prev => prev ? ({ ...prev, images: newImages }) : null);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe the image"
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="primaryImage"
                              checked={image.is_primary || false}
                              onChange={() => setPrimaryImage(index)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Primary Image</span>
                          </label>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload new image */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload product image
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          PNG, JPG, WebP up to 10MB
                        </span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                        className="sr-only"
                        disabled={isUploading}
                      />
                    </div>
                    {isUploading && (
                      <div className="mt-4 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Variants */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <VariantManager
                variants={formData.variants}
                onVariantsChange={handleVariantsChange}
                isEditing={true}
                errors={errors.variants ? { variants: errors.variants } : {}}
              />
            </div>
          </form>
        </div>
      </main>
    </AdminGuard>
  );
}