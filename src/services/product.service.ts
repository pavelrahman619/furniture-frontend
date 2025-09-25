import { apiService } from '@/lib/api-service';
import {
  Product,
  SingleProductResponse,
  ProductsResponse,
  ProductsQueryParams,
  StockResponse,
  DisplayProduct,
  Category,
} from '@/types/product.types';

/**
 * Product service for API interactions
 */
export class ProductService {
  /**
   * Get a single product by ID
   */
  static async getProduct(id: string): Promise<Product> {
    try {
      const response = await apiService.get<SingleProductResponse>(`/products/${id}`);

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch product');
      }

      return response.data.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
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
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get<ProductsResponse>(endpoint);

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch products');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
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

      // Handle category information
      const categoryField = product.category_id as string | Category;
      const categoryName = typeof categoryField === 'object' && categoryField !== null
        ? categoryField.name
        : '';

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
      };
    };

    return products.map(toDisplayProduct);
  }

  /**
   * Search products
   */
  static async searchProducts(query: string, filters?: Partial<ProductsQueryParams>): Promise<Product[]> {
    try {
      const queryParams = new URLSearchParams({ q: query });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await apiService.get<{ products: Product[] }>(`/products/search?${queryParams.toString()}`);

      if (!response.success || !response.data) {
        throw new Error('Failed to search products');
      }

      return response.data.products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get product stock information
   */
  static async getProductStock(id: string): Promise<StockResponse> {
    try {
      const response = await apiService.get<StockResponse>(`/products/${id}/stock`);

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch product stock');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching product stock:', error);
      throw error;
    }
  }
}

export default ProductService;