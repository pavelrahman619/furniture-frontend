import { useState, useEffect, useCallback } from 'react';
import { ProductService } from '@/services/product.service';
import { Product, ProductDetails, ProductImage, ProductVariant, StockResponse } from '@/types/product.types';

interface UseProductResult {
  productDetails: ProductDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing product data
 */
export const useProduct = (id: string): UseProductResult => {
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch product data and stock data in parallel
      const [productData, stockData] = await Promise.all([
        ProductService.getProduct(id),
        ProductService.getProductStock(id).catch(() => ({ locations: [] })) // Fallback if stock fails
      ]);

      // Transform backend product to frontend ProductDetails format
      const transformedProduct: ProductDetails = {
        id: productData._id,
        name: productData.name,
        sku: productData.sku,
        images: productData.images.map((img: ProductImage) => img.url),
        category: typeof productData.category_id === 'object' 
          ? productData.category_id.name 
          : 'Unknown Category',
        availability: productData.stock && productData.stock > 0 ? 'in-stock' : 'out-of-stock',
        // features: [], // Commented out - not available in backend
        // shape: 'rectangular', // Commented out - not available in backend
        price: productData.price,
        isFirstLook: productData.featured || false,
        stockInfo: stockData.locations.map((location: StockResponse['locations'][0]) => ({
          location: location.location,
          stock: location.stock,
          moreArriving: location.more_arriving ? 'Yes' : 'No'
        })),
        description: productData.description,
        note: "The color of the product might differ due to production and your monitor screen settings. It's essential to ensure proper color calibration to accurately represent our products.",
        variants: {
          size: {
            name: "Size",
            options: productData.variants
              .filter((v: ProductVariant) => v.size)
              .map((v: ProductVariant) => ({
                value: v.size || '',
                label: v.size || '',
                priceModifier: v.price - productData.price
              }))
              .filter((v: { value: string }, index: number, self: { value: string }[]) => 
                index === self.findIndex((t: { value: string }) => t.value === v.value)
              )
          },
          color: {
            name: "Color",
            options: productData.variants
              .filter((v: ProductVariant) => v.color)
              .map((v: ProductVariant) => ({
                value: v.color || '',
                label: v.color || '',
                colorCode: getColorCode(v.color || ''),
                priceModifier: v.price - productData.price
              }))
              .filter((v: { value: string }, index: number, self: { value: string }[]) => 
                index === self.findIndex((t: { value: string }) => t.value === v.value)
              )
          },
          finish: {
            name: "Material",
            options: productData.variants
              .filter((v: ProductVariant) => v.material)
              .map((v: ProductVariant) => ({
                value: v.material || '',
                label: v.material || '',
                priceModifier: v.price - productData.price
              }))
              .filter((v: { value: string }, index: number, self: { value: string }[]) => 
                index === self.findIndex((t: { value: string }) => t.value === v.value)
              )
          }
        }
      };

      setProductDetails(transformedProduct);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    productDetails,
    loading,
    error,
    refetch: fetchProduct
  };
};

/**
 * Helper function to get color codes for common colors
 */
const getColorCode = (color: string): string => {
  const colorMap: Record<string, string> = {
    'natural': '#D2B48C',
    'walnut': '#5D4037',
    'oak': '#DEB887',
    'mahogany': '#8B4513',
    'cherry': '#A0522D',
    'white': '#FFFFFF',
    'black': '#000000',
    'gray': '#9E9E9E',
    'brown': '#8B4513',
    'beige': '#F5F5DC'
  };

  const lowerColor = color.toLowerCase();
  return colorMap[lowerColor] || '#D2B48C'; // Default to natural wood color
};
