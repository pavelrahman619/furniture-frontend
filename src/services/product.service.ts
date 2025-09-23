import { apiService } from '@/lib/api-service';
import { 
  Product, 
  SingleProductResponse, 
  ProductsResponse, 
  ProductsQueryParams,
  StockResponse 
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
   * Search products
   */
  static async searchProducts(query: string, category?: string): Promise<Product[]> {
    try {
      const queryParams = new URLSearchParams({ q: query });
      if (category) {
        queryParams.append('category', category);
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