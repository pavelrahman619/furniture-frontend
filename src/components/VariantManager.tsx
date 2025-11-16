"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Plus, X, Edit2, Check, AlertCircle, Upload, Loader2 } from "lucide-react";
import { ProductVariant, ProductImage, VARIATION_TYPES } from "@/types/product.types";
import { uploadImageToCloudinary, validateImageFile } from "@/lib/cloudinary-utils";

interface VariantManagerProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  selectedVariation?: string;
  onVariationChange?: (variation: string) => void;
  isEditing?: boolean;
  errors?: Record<string, string>;
}

interface VariantFormData {
  color?: string;
  material?: string;
  size?: string;
  attribute?: string; // Replaces size - dynamic attribute based on variation type
  price: number;
  stock: number;
  sku: string;
  images?: ProductImage[];
}

interface VariantErrors {
  color?: string;
  material?: string;
  size?: string;
  attribute?: string;
  price?: string;
  stock?: string;
  sku?: string;
  images?: string;
}

const initialVariantData: VariantFormData = {
  color: "",
  material: "",
  size: "",
  attribute: "",
  price: 0,
  stock: 0,
  sku: "",
  images: [],
};

export default function VariantManager({
  variants,
  onVariantsChange,
  selectedVariation,
  onVariationChange,
  isEditing = true,
  errors = {},
}: VariantManagerProps) {
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newVariant, setNewVariant] = useState<VariantFormData>(initialVariantData);
  const [editingVariant, setEditingVariant] = useState<VariantFormData>(initialVariantData);
  const [variantErrors, setVariantErrors] = useState<VariantErrors>({});
  const [uploadingImageCount, setUploadingImageCount] = useState(0);

  // Generate unique SKU for variant
  const generateVariantSku = useCallback((baseVariant: VariantFormData): string => {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, "0");
    
    // Create SKU based on variant properties (use attribute instead of size/color/material)
    const parts = [];
    if (baseVariant.attribute) parts.push(baseVariant.attribute.substring(0, 3).toUpperCase());
    
    const prefix = parts.length > 0 ? parts.join("-") : "VAR";
    return `${prefix}-${timestamp}${randomNum}`;
  }, []);

  // Validate variant data
  const validateVariant = useCallback((variant: VariantFormData, existingVariants: ProductVariant[] = [], skipIndex?: number): VariantErrors => {
    const errors: VariantErrors = {};

    // SKU validation
    if (!variant.sku.trim()) {
      errors.sku = "SKU is required";
    } else {
      // Check for duplicate SKUs
      const isDuplicate = existingVariants.some((v, index) => 
        v.sku === variant.sku && index !== skipIndex
      );
      if (isDuplicate) {
        errors.sku = "SKU must be unique across all variants";
      }
    }

    // Price validation
    if (variant.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    // Stock validation
    if (variant.stock < 0) {
      errors.stock = "Stock cannot be negative";
    }

    // Variant properties are optional (color/material UI hidden but still in data)
    // No validation needed for optional fields

    return errors;
  }, []);

  // Handle field changes for new variant
  const handleNewVariantChange = useCallback((field: keyof VariantFormData, value: string | number) => {
    setNewVariant(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate SKU when variant attribute changes
      if (field === 'attribute') {
        updated.sku = generateVariantSku(updated);
      }
      
      return updated;
    });

    // Clear field error
    if (variantErrors[field]) {
      setVariantErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [generateVariantSku, variantErrors]);

  // Handle field changes for editing variant
  const handleEditingVariantChange = useCallback((field: keyof VariantFormData, value: string | number) => {
    setEditingVariant(prev => ({ ...prev, [field]: value }));

    // Clear field error
    if (variantErrors[field]) {
      setVariantErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [variantErrors]);

  // Add new variant
  const handleAddVariant = useCallback(() => {
    const errors = validateVariant(newVariant, variants);
    
    if (Object.keys(errors).length > 0) {
      setVariantErrors(errors);
      return;
    }

    const variant: ProductVariant = {
      color: newVariant.color || undefined,
      material: newVariant.material || undefined,
      size: newVariant.size || undefined,
      attribute: newVariant.attribute || undefined,
      price: newVariant.price,
      stock: newVariant.stock,
      sku: newVariant.sku,
      images: newVariant.images || [],
    };

    onVariantsChange([...variants, variant]);
    setNewVariant(initialVariantData);
    setIsAddingVariant(false);
    setVariantErrors({});
  }, [newVariant, variants, validateVariant, onVariantsChange]);

  // Start editing variant
  const handleEditVariant = useCallback((index: number) => {
    const variant = variants[index];
    setEditingVariant({
      color: variant.color || "",
      material: variant.material || "",
      size: variant.size || "",
      attribute: variant.attribute || "",
      price: variant.price,
      stock: variant.stock,
      sku: variant.sku,
      images: variant.images || [],
    });
    setEditingIndex(index);
    setVariantErrors({});
  }, [variants]);

  // Save edited variant
  const handleSaveVariant = useCallback((index: number) => {
    const errors = validateVariant(editingVariant, variants, index);
    
    if (Object.keys(errors).length > 0) {
      setVariantErrors(errors);
      return;
    }

    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...variants[index],
      color: editingVariant.color || undefined,
      material: editingVariant.material || undefined,
      size: editingVariant.size || undefined,
      attribute: editingVariant.attribute || undefined,
      price: editingVariant.price,
      stock: editingVariant.stock,
      sku: editingVariant.sku,
      images: editingVariant.images || [],
    };

    onVariantsChange(updatedVariants);
    setEditingIndex(null);
    setEditingVariant(initialVariantData);
    setVariantErrors({});
  }, [editingVariant, variants, validateVariant, onVariantsChange]);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditingVariant(initialVariantData);
    setVariantErrors({});
  }, []);

  // Remove variant
  const handleRemoveVariant = useCallback((index: number) => {
    // Prevent removing the last variant
    if (variants.length <= 1) {
      return;
    }
    const updatedVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(updatedVariants);
  }, [variants, onVariantsChange]);

  // Cancel adding new variant
  const handleCancelAdd = useCallback(() => {
    setIsAddingVariant(false);
    setNewVariant(initialVariantData);
    setVariantErrors({});
  }, []);

  // Handle image upload for new variant
  const handleNewVariantImageUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Validate all files first
    const validationErrors: string[] = [];
    files.forEach((file, index) => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        validationErrors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      setVariantErrors((prev) => ({ 
        ...prev, 
        images: validationErrors.join(', ') 
      }));
      return;
    }

    setUploadingImageCount(files.length);
    
    try {
      // Upload all files in parallel
      const uploadPromises = files.map(file => 
        uploadImageToCloudinary(file, {
          folder: 'PRODUCT_IMAGES',
          tags: ['product', 'variant', 'admin'],
        })
      );

      const results = await Promise.allSettled(uploadPromises);
      
      const successfulUploads: ProductImage[] = [];
      const uploadErrors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.url) {
          const isFirstImage = (newVariant.images?.length || 0) === 0 && successfulUploads.length === 0;
          successfulUploads.push({
            url: result.value.url,
            alt: newVariant.attribute || 'Variant image',
            is_primary: isFirstImage,
          });
        } else {
          const errorMessage = result.status === 'fulfilled' 
            ? result.value.error || 'Upload failed'
            : 'Upload failed';
          uploadErrors.push(`File ${index + 1}: ${errorMessage}`);
        }
      });

      // Add successful uploads to variant
      if (successfulUploads.length > 0) {
        setNewVariant((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...successfulUploads],
        }));
      }

      // Set errors if any uploads failed
      if (uploadErrors.length > 0) {
        const errorMessage = uploadErrors.length === files.length
          ? `All uploads failed: ${uploadErrors.join(', ')}`
          : `Some uploads failed: ${uploadErrors.join(', ')}`;
        setVariantErrors((prev) => ({ ...prev, images: errorMessage }));
      } else {
        setVariantErrors((prev) => ({ ...prev, images: undefined }));
      }
    } catch (error) {
      setVariantErrors((prev) => ({ ...prev, images: 'Failed to upload images' }));
    } finally {
      setUploadingImageCount(0);
    }
  }, [newVariant]);

  // Handle image upload for editing variant
  const handleEditingVariantImageUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Validate all files first
    const validationErrors: string[] = [];
    files.forEach((file, index) => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        validationErrors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      setVariantErrors((prev) => ({ 
        ...prev, 
        images: validationErrors.join(', ') 
      }));
      return;
    }

    setUploadingImageCount(files.length);
    
    try {
      // Upload all files in parallel
      const uploadPromises = files.map(file => 
        uploadImageToCloudinary(file, {
          folder: 'PRODUCT_IMAGES',
          tags: ['product', 'variant', 'admin'],
        })
      );

      const results = await Promise.allSettled(uploadPromises);
      
      const successfulUploads: ProductImage[] = [];
      const uploadErrors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.url) {
          const isFirstImage = (editingVariant.images?.length || 0) === 0 && successfulUploads.length === 0;
          successfulUploads.push({
            url: result.value.url,
            alt: editingVariant.attribute || 'Variant image',
            is_primary: isFirstImage,
          });
        } else {
          const errorMessage = result.status === 'fulfilled' 
            ? result.value.error || 'Upload failed'
            : 'Upload failed';
          uploadErrors.push(`File ${index + 1}: ${errorMessage}`);
        }
      });

      // Add successful uploads to variant
      if (successfulUploads.length > 0) {
        setEditingVariant((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...successfulUploads],
        }));
      }

      // Set errors if any uploads failed
      if (uploadErrors.length > 0) {
        const errorMessage = uploadErrors.length === files.length
          ? `All uploads failed: ${uploadErrors.join(', ')}`
          : `Some uploads failed: ${uploadErrors.join(', ')}`;
        setVariantErrors((prev) => ({ ...prev, images: errorMessage }));
      } else {
        setVariantErrors((prev) => ({ ...prev, images: undefined }));
      }
    } catch (error) {
      setVariantErrors((prev) => ({ ...prev, images: 'Failed to upload images' }));
    } finally {
      setUploadingImageCount(0);
    }
  }, [editingVariant]);

  // Remove image from new variant
  const handleRemoveNewVariantImage = useCallback((index: number) => {
    setNewVariant((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  // Remove image from editing variant
  const handleRemoveEditingVariantImage = useCallback((index: number) => {
    setEditingVariant((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  // Set primary image for new variant
  const handleSetNewVariantPrimaryImage = useCallback((index: number) => {
    setNewVariant((prev) => ({
      ...prev,
      images: prev.images?.map((img, i) => ({ ...img, is_primary: i === index })) || [],
    }));
  }, []);

  // Set primary image for editing variant
  const handleSetEditingVariantPrimaryImage = useCallback((index: number) => {
    setEditingVariant((prev) => ({
      ...prev,
      images: prev.images?.map((img, i) => ({ ...img, is_primary: i === index })) || [],
    }));
  }, []);

  if (!isEditing) {
    // Read-only view
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
          <span className="text-sm text-gray-500">
            {variants.length} variant{variants.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {variants.length === 0 ? (
          <p className="text-gray-500 text-sm">No variants defined for this product.</p>
        ) : (
          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                  {/* Color/Material display hidden - UI only */}
                  {/* {variant.color && (
                    <div>
                      <span className="font-medium text-gray-700">Color:</span>
                      <p className="text-gray-900">{variant.color}</p>
                    </div>
                  )}
                  {variant.material && (
                    <div>
                      <span className="font-medium text-gray-700">Material:</span>
                      <p className="text-gray-900">{variant.material}</p>
                    </div>
                  )} */}
                  {/* Size field is deprecated - using attribute instead */}
                  {/* {variant.size && (
                    <div>
                      <span className="font-medium text-gray-700">Size:</span>
                      <p className="text-gray-900">{variant.size}</p>
                    </div>
                  )} */}
                  {variant.attribute && (
                    <div>
                      <span className="font-medium text-gray-700">Attribute:</span>
                      <p className="text-gray-900">{variant.attribute}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Price:</span>
                    <p className="text-gray-900">${variant.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Stock:</span>
                    <p className="text-gray-900">{variant.stock}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">SKU:</span>
                    <p className="text-gray-900 font-mono text-xs">{variant.sku}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
      </div>

      {/* Variation Type Selector */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Variation Type *
        </label>
        <p className="text-xs text-gray-600 mb-3">
          Select the type of variation for this product (e.g., Size, Dimensions). This determines what attribute your variants will represent.
        </p>
        <select
          value={selectedVariation || ""}
          onChange={(e) => onVariationChange?.(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          disabled={!onVariationChange}
        >
          <option value="">Select variation type...</option>
          {VARIATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {!selectedVariation && variants.length === 0 && (
          <p className="mt-2 text-sm text-orange-600">
            ⚠️ Please select a variation type before adding variants.
          </p>
        )}
      </div>

      {/* Add Variant Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {selectedVariation ? `Add ${selectedVariation.toLowerCase()} variants for this product` : 'Select a variation type to add variants'}
        </p>
        <button
          type="button"
          onClick={() => setIsAddingVariant(true)}
          disabled={!selectedVariation}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          title={!selectedVariation ? 'Select a variation type first' : 'Add new variant'}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </button>
      </div>

      {/* General errors */}
      {errors.variants && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <p className="text-sm text-red-600">{errors.variants}</p>
          </div>
        </div>
      )}

      {/* Existing variants */}
      {variants.length > 0 && (
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              {editingIndex === index ? (
                // Editing mode
                <VariantForm
                  variant={editingVariant}
                  onChange={handleEditingVariantChange}
                  errors={variantErrors}
                  onSave={() => handleSaveVariant(index)}
                  onCancel={handleCancelEdit}
                  isEditing={true}
                  onImageUpload={handleEditingVariantImageUpload}
                  onRemoveImage={handleRemoveEditingVariantImage}
                  onSetPrimaryImage={handleSetEditingVariantPrimaryImage}
                  uploadingImageCount={uploadingImageCount}
                />
              ) : (
                // Display mode
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm flex-1">
                    {/* Color/Material display hidden - UI only */}
                    {/* {variant.color && (
                      <div>
                        <span className="font-medium text-gray-700">Color:</span>
                        <p className="text-gray-900">{variant.color}</p>
                      </div>
                    )}
                    {variant.material && (
                      <div>
                        <span className="font-medium text-gray-700">Material:</span>
                        <p className="text-gray-900">{variant.material}</p>
                      </div>
                    )} */}
                    {/* Size field is deprecated - using attribute instead */}
                    {/* {variant.size && (
                      <div>
                        <span className="font-medium text-gray-700">Size:</span>
                        <p className="text-gray-900">{variant.size}</p>
                      </div>
                    )} */}
                    {variant.attribute && (
                      <div>
                        <span className="font-medium text-gray-700">Attribute:</span>
                        <p className="text-gray-900">{variant.attribute}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700">Price:</span>
                      <p className="text-gray-900">${variant.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Stock:</span>
                      <p className="text-gray-900">{variant.stock}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">SKU:</span>
                      <p className="text-gray-900 font-mono text-xs">{variant.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleEditVariant(index)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      title="Edit variant"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      disabled={variants.length <= 1}
                      className={`p-2 rounded-md transition-colors ${
                        variants.length <= 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={variants.length <= 1 ? 'At least one variant is required' : 'Remove variant'}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new variant form */}
      {isAddingVariant && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Variant</h4>
          <VariantForm
            variant={newVariant}
            onChange={handleNewVariantChange}
            errors={variantErrors}
            onSave={handleAddVariant}
            onCancel={handleCancelAdd}
            isEditing={false}
            onImageUpload={handleNewVariantImageUpload}
            onRemoveImage={handleRemoveNewVariantImage}
            onSetPrimaryImage={handleSetNewVariantPrimaryImage}
            uploadingImageCount={uploadingImageCount}
          />
        </div>
      )}

      {variants.length === 0 && !isAddingVariant && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No variants added yet.</p>
          <p className="text-xs mt-1">Click "Add Variant" to create product variations.</p>
        </div>
      )}
    </div>
  );
}

// Variant form component
interface VariantFormProps {
  variant: VariantFormData;
  onChange: (field: keyof VariantFormData, value: string | number) => void;
  errors: VariantErrors;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
  onImageUpload: (files: File[]) => Promise<void>;
  onRemoveImage: (index: number) => void;
  onSetPrimaryImage: (index: number) => void;
  uploadingImageCount: number;
}

function VariantForm({ variant, onChange, errors, onSave, onCancel, isEditing, onImageUpload, onRemoveImage, onSetPrimaryImage, uploadingImageCount }: VariantFormProps) {
  return (
    <div className="space-y-4">
      {/* Variant properties */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {/* Color and Material input fields hidden - UI only (logic kept) */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <input
            type="text"
            value={variant.color || ""}
            onChange={(e) => onChange("color", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.color ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Red, Blue"
          />
          {errors.color && (
            <p className="mt-1 text-sm text-red-600">{errors.color}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material
          </label>
          <input
            type="text"
            value={variant.material || ""}
            onChange={(e) => onChange("material", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.material ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Wood, Metal"
          />
          {errors.material && (
            <p className="mt-1 text-sm text-red-600">{errors.material}</p>
          )}
        </div> */}

        {/* Size field is deprecated - replaced with attribute field */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Size
          </label>
          <input
            type="text"
            value={variant.size || ""}
            onChange={(e) => onChange("size", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.size ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Small, Large"
          />
          {errors.size && (
            <p className="mt-1 text-sm text-red-600">{errors.size}</p>
          )}
        </div> */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attribute *
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Enter the specific value for this variant (e.g., "Small", "Large", "48x24", etc.)
          </p>
          <input
            type="text"
            value={variant.attribute || ""}
            onChange={(e) => onChange("attribute", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.attribute ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Small, Medium, Large"
          />
          {errors.attribute && (
            <p className="mt-1 text-sm text-red-600">{errors.attribute}</p>
          )}
        </div>
      </div>

      {/* Variant Images */}
      <div className="border-t border-gray-200 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Variant Images
        </label>
        
        {errors.images && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.images}</p>
          </div>
        )}

        {(!variant.images || variant.images.length === 0) && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700">⚠️ No images added for this variant. Images are recommended for better customer experience.</p>
          </div>
        )}

        <div className="space-y-3">
          {variant.images && variant.images.length > 0 && (
            <div className="space-y-2">
              {variant.images.map((image, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-md bg-white">
                  <div className="w-16 h-16 border border-gray-300 rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                    <Image
                      src={image.url}
                      alt={image.alt || `Variant image ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 truncate">{image.alt || 'No description'}</p>
                    <label className="flex items-center mt-1">
                      <input
                        type="radio"
                        name={`primary-${isEditing ? 'edit' : 'new'}`}
                        checked={image.is_primary || false}
                        onChange={() => onSetPrimaryImage(index)}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-1 text-xs text-gray-600">Primary</span>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <label
            htmlFor={`variant-image-upload-${isEditing ? 'edit' : 'new'}`}
            className={`block border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors text-center ${
              uploadingImageCount > 0 ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <div className="flex flex-col items-center">
              {uploadingImageCount > 0 ? (
                <>
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                  <span className="text-sm text-gray-600">
                    Uploading {uploadingImageCount} {uploadingImageCount === 1 ? 'image' : 'images'}...
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Upload images</span>
                  <span className="text-xs text-gray-500 mt-1">Select one or multiple images • PNG, JPG, WebP up to 10MB each</span>
                </>
              )}
            </div>
            <input
              id={`variant-image-upload-${isEditing ? 'edit' : 'new'}`}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  const fileArray = Array.from(files);
                  onImageUpload(fileArray);
                  e.target.value = ''; // Reset input
                }
              }}
              className="sr-only"
              disabled={uploadingImageCount > 0}
            />
          </label>
        </div>
      </div>

      {/* Price, Stock, and SKU */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price *
          </label>
          <input
            type="number"
            value={variant.price || ""}
            onChange={(e) => onChange("price", Number(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.price ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock *
          </label>
          <input
            type="number"
            value={variant.stock || ""}
            onChange={(e) => onChange("stock", Number(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.stock ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0"
            min="0"
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU *
          </label>
          <input
            type="text"
            value={variant.sku}
            onChange={(e) => onChange("sku", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
              errors.sku ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Unique SKU"
          />
          {errors.sku && (
            <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Check className="h-4 w-4 mr-2" />
          {isEditing ? 'Save Changes' : 'Add Variant'}
        </button>
      </div>
    </div>
  );
}