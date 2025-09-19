import { apiService, ApiResponse } from '../lib/api-service';
import { API_ENDPOINTS } from '../lib/api-config';
import { mockProducts, getMockProducts } from '../lib/mock-data';
import { 
  Product, 
  ProductsResponse, 
  SingleProductResponse, 
  ProductSearchResponse, 
  ProductsQueryParams,
  StockResponse,
  DisplayProduct 
} from '../types/product.types';


/**
 * Product API service
 */
export const productService = {
  /**
   * Get products list with optional filters
   */
  getProducts: async (params?: ProductsQueryParams): Promise<ApiResponse<ProductsResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`
      : API_ENDPOINTS.PRODUCTS.LIST;
    
    return apiService.get<ProductsResponse>(endpoint);
  },

  /**
   * Get single product by ID
   */
  getProduct: async (id: string): Promise<ApiResponse<SingleProductResponse>> => {
    return apiService.get<SingleProductResponse>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  },

  /**
   * Search products
   */
  searchProducts: async (query: string, filters?: Partial<ProductsQueryParams>): Promise<ApiResponse<ProductSearchResponse>> => {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'search') {
          params.append(key, String(value));
        }
      });
    }
    
    const endpoint = `${API_ENDPOINTS.PRODUCTS.SEARCH}?${params.toString()}`;
    return apiService.get<ProductSearchResponse>(endpoint);
  },

  /**
   * Get product stock information
   */
  getProductStock: async (id: string): Promise<ApiResponse<StockResponse>> => {
    return apiService.get<StockResponse>(API_ENDPOINTS.PRODUCTS.STOCK(id));
  },

  /**
   * Get products for display (transformed)
   * Falls back to mock data if backend returns empty results in development
   */
  getProductsForDisplay: async (params?: ProductsQueryParams): Promise<DisplayProduct[]> => {
    try {
      const response = await productService.getProducts(params);
      
      if (response.success && response.data && response.data.products && response.data.products.length > 0) {
        // Get category mapping from the API response
        const categoryMap = new Map<string, string>();
        if (response.data.filters_available?.categories) {
          response.data.filters_available.categories.forEach(cat => {
            categoryMap.set(cat.id, cat.name);
          });
        }

        return response.data.products.map(product => {
          const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
          const categoryName = categoryMap.get(product.category_id as string) || product.category_id as string;

          // Determine availability based on stock
          let availability: "in-stock" | "out-of-stock" | "pre-order" = "out-of-stock";
          const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);

          if (totalStock > 0) {
            availability = "in-stock";
          } else if (product.stock && product.stock > 0) {
            availability = "in-stock";
          }

          // Extract features from variants
          const features: string[] = [];
          const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))] as string[];
          const materials = [...new Set(product.variants.map(v => v.material).filter(Boolean))] as string[];
          const sizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))] as string[];

          features.push(...colors, ...materials, ...sizes);

          return {
            id: product._id,
            name: product.name,
            image: primaryImage?.url || '/placeholder-product.jpg',
            category: categoryName,
            availability,
            features: features.filter(Boolean),
            shape: 'rectangular', // Default shape
            price: product.price,
            isFirstLook: product.featured,
            sku: product.sku,
            description: product.description,
            variants: product.variants,
            images: product.images,
            stock: totalStock || product.stock || 0,
          };
        });
      }
      
      // Optional fallback to mock data (only if NEXT_PUBLIC_USE_MOCK_FALLBACK=true)
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK === 'true') {
        return getMockProducts({
          category: params?.category,
          price_min: params?.price_min,
          price_max: params?.price_max,
          search: params?.search,
        });
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Optional fallback to mock data on API error (only if NEXT_PUBLIC_USE_MOCK_FALLBACK=true)
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK === 'true') {
        return getMockProducts({
          category: params?.category,
          price_min: params?.price_min,
          price_max: params?.price_max,
          search: params?.search,
        });
      }
      
      throw error;
    }
  },
};

export default productService;
