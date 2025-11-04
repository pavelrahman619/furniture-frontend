import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS, buildApiUrl, getApiHeaders } from '@/lib/api-config';
import { transformApiError } from '@/lib/error-utils';
import {
  Product,
  SingleProductResponse,
  ProductsResponse,
  ProductsQueryParams,
  StockResponse,
  DisplayProduct,
  CreateProductRequest,
  UpdateProductRequest,
  ProductVariant,
  ProductImage,
  StockInfo,
} from '@/types/product.types';

// Backend request types (different field names)
interface BackendCreateProductRequest extends Omit<CreateProductRequest, 'category_id'> {
  category: string;
}

interface BackendUpdateProductRequest extends Omit<UpdateProductRequest, 'category_id'> {
  category?: string;
}

// Backend response types for product operations
interface BackendProductResponse {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  description: string;
  variants: ProductVariant[];
  images: ProductImage[];
  featured: boolean;
  stock: number;
}

/**
 * Product service for API interactions
 */
export class ProductService {
  /**
   * Get a single product by ID
   */
  static async getProduct(id: string): Promise<Product> {
    try {
      const response = await apiService.get<SingleProductResponse>(API_ENDPOINTS.PRODUCTS.DETAIL(id));

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch product');
      }

      return response.data.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw transformApiError(error);
    }
  }

  /**
   * Get products with filtering and pagination
   */
  static async getProducts(params?: ProductsQueryParams): Promise<ProductsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Handle arrays (like categories) by joining them
            if (Array.isArray(value)) {
              queryParams.append(key, value.join(','));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const endpoint = `${API_ENDPOINTS.PRODUCTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<ProductsResponse>(endpoint);

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch products');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw transformApiError(error);
    }
  }

  /**
   * Get products transformed for UI display
   * Includes filter store updates and enhanced product transformation
   */
  static async getProductsForDisplay(params?: ProductsQueryParams): Promise<DisplayProduct[]> {
    const response = await this.getProducts(params);
    const { products, filters_available } = response;

    // Update filter store with dynamic category data if available
    if (filters_available?.categories) {
      try {
        const { useFilterStore } = await import('../stores/filterStore');
        const store = useFilterStore.getState();
        store.updateFilterOptions({
          categories: filters_available.categories.map(cat => ({
            value: cat.id,
            label: cat.name,
            slug: cat.name.toLowerCase().replace(/\s+/g, '-')
          }))
        });
      } catch (error) {
        console.warn('Failed to update filter store with category data:', error);
      }
    }

    const toDisplayProduct = (product: Product): DisplayProduct => {
      const images = product.images || [];
      // const primaryImage = images.find((img) => img.is_primary) || images[0];

      // Calculate total stock from variants and base stock
      const totalStock = typeof product.stock === 'number' && !Number.isNaN(product.stock)
        ? product.stock
        : (product.variants || []).reduce((sum, variant) => sum + (variant.stock || 0), 0);

      return {
        id: product._id,
        name: product.name,
        category_id: typeof product.category_id === 'string' ? product.category_id : product.category_id._id,
        price: product.price,
        featured: product.featured ?? false,
        sku: product.sku,
        description: product.description,
        variants: product.variants || [],
        images: images,
        stock: totalStock,
        availability: totalStock > 0 ? "in-stock" : "out-of-stock",
      };
    };

    return products.map(toDisplayProduct);
  }

  /**
   * Search products using dedicated search endpoint
   */
  static async searchProducts(query: string, filters?: Partial<ProductsQueryParams>): Promise<ProductsResponse> {
    try {
      const queryParams = new URLSearchParams({ q: query });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Handle arrays (like categories) by joining them
            if (Array.isArray(value)) {
              queryParams.append(key, value.join(','));
            } else {
              queryParams.append(key, String(value));
            }
          }
        });
      }

      const response = await apiService.get<ProductsResponse>(`${API_ENDPOINTS.PRODUCTS.SEARCH}?${queryParams.toString()}`);

      if (!response.success || !response.data) {
        throw new Error('Failed to search products');
      }

      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw transformApiError(error);
    }
  }

  /**
   * Get product stock information
   */
  static async getProductStock(id: string): Promise<StockResponse> {
    try {
      const response = await apiService.get<StockResponse>(API_ENDPOINTS.PRODUCTS.STOCK(id));

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch product stock');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching product stock:', error);
      throw transformApiError(error);
    }
  }

  /**
   * Create a new product (Admin only)
   */
  static async createProduct(productData: CreateProductRequest, token: string): Promise<Product> {
    try {
      // Backend expects `category` in the request body (controller maps it to category_id).
      // Map our frontend `category_id` field to `category` to satisfy the API shape.
      const payload: BackendCreateProductRequest = {
        ...productData,
        category: productData.category_id
      };

      const response = await apiService.post<{ product: Product }>(
        API_ENDPOINTS.PRODUCTS.CREATE,
        payload,
        token
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to create product');
      }

      return response.data.product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw transformApiError(error);
    }
  }

  /**
   * Update an existing product (Admin only)
   */
  static async updateProduct(id: string, productData: UpdateProductRequest, token: string): Promise<Product> {
    try {
      // Map `category_id` to `category` for backend update endpoint as well
      const payload: BackendUpdateProductRequest = {
        ...productData,
        ...(productData.category_id && { category: productData.category_id })
      };

      const response = await apiService.put<BackendProductResponse>(
        API_ENDPOINTS.PRODUCTS.UPDATE(id),
        payload,
        token
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to update product');
      }

      // Transform the flat response to match Product interface
      const updatedProduct: Product = {
        _id: response.data.id,
        name: response.data.name,
        sku: response.data.sku,
        category_id: response.data.category,
        price: response.data.price,
        description: response.data.description || '',
        variants: response.data.variants || [],
        images: response.data.images || [],
        stock: response.data.stock || 0,
        featured: response.data.featured || false,
        created_at: new Date().toISOString(), // We don't have this from response
        updated_at: new Date().toISOString(),
      };

      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw transformApiError(error);
    }
  }

  /**
   * Delete a product (Admin only)
   */
  static async deleteProduct(id: string, token: string): Promise<void> {
    try {
      const response = await apiService.delete<{ message: string }>(
        API_ENDPOINTS.PRODUCTS.DELETE(id),
        token
      );

      if (!response.success) {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw transformApiError(error);
    }
  }

  /**
   * Update product stock (Admin only)
   */
  static async updateProductStock(id: string, stockData: { stock: number }, token: string): Promise<StockInfo> {
    try {
      // Backend expects { locations: [{ stock: number }] }
      const payload = {
        locations: [{ stock: stockData.stock }]
      };

      const response = await apiService.put<StockInfo>(
        API_ENDPOINTS.PRODUCTS.UPDATE_STOCK(id),
        payload,
        token
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to update product stock');
      }

      return response.data;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw transformApiError(error);
    }
  }

  /**
   * Get products with admin-specific data and filters
   */
  static async getAdminProducts(params?: ProductsQueryParams, token?: string): Promise<ProductsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Handle arrays (like categories) by joining them
            if (Array.isArray(value)) {
              queryParams.append(key, value.join(','));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const endpoint = `${API_ENDPOINTS.PRODUCTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<ProductsResponse>(endpoint, token);

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch admin products');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching admin products:', error);
      throw transformApiError(error);
    }
  }

  /**
   * Export products to Excel file (Admin only)
   * Returns a Blob that can be downloaded
   */
  static async exportProductsToExcel(token: string): Promise<Blob> {
    try {
      const url = buildApiUrl(API_ENDPOINTS.ADMIN.PRODUCTS_EXPORT);
      const headers = getApiHeaders(token);

      // Override Accept header to expect binary response
      headers['Accept'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to export products';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting products to Excel:', error);
      throw transformApiError(error);
    }
  }
}

export default ProductService;