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
   */
  static async getProductsForDisplay(params?: ProductsQueryParams): Promise<DisplayProduct[]> {
    const { products } = await this.getProducts(params);

    const toDisplayProduct = (product: Product): DisplayProduct => {
      const images = product.images || [];
      const primaryImage = images.find((img) => img.is_primary) || images[0];

      const categoryField = product.category_id as string | Category;
      const categoryName = typeof categoryField === 'object' && categoryField !== null
        ? categoryField.name
        : '';

      const totalStock = typeof product.stock === 'number' && !Number.isNaN(product.stock)
        ? product.stock
        : (product.variants || []).reduce((sum, variant) => sum + (variant.stock || 0), 0);

      const availability: DisplayProduct['availability'] = totalStock > 0
        ? 'in-stock'
        : 'out-of-stock';

      return {
        id: product._id,
        name: product.name,
        image: primaryImage?.url || '',
        category: categoryName,
        availability,
        features: [],
        price: product.price,
        isFirstLook: product.featured ?? false,
        sku: product.sku,
        description: product.description,
        variants: product.variants || [],
        images: images,
        stock: totalStock,
      } as DisplayProduct;
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