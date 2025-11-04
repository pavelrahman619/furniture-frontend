"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  category?: string; // Optional for display purposes
  price: number;
  image: string;
  totalStock: number;
}

interface DeleteProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (productId: string) => Promise<void>;
}

export function DeleteProductDialog({
  product,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteProductDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen || !product) return null;

  const handleConfirm = async () => {
    if (confirmText.toLowerCase() === "delete") {
      await onConfirm(product.id);
      setConfirmText("");
      onClose();
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Product
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>

            {/* Product Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    SKU: {product.sku}
                  </p>
                  <p className="text-sm text-gray-500">
                    Category: {product.category || 'Uncategorized'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Price: ${product.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stock: {product.totalStock} units
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-semibold text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={isDeleting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Type DELETE to confirm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting || confirmText.toLowerCase() !== "delete"}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}