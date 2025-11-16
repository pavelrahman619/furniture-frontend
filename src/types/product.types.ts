/**
 * Product types matching backend API structure
 */

// Variation type constants
export const VARIATION_TYPES = ['Size', 'Dimensions', 'Weight', 'Color', 'Material', 'Style'] as const;
export type VariationType = typeof VARIATION_TYPES[number];

export interface ProductVariant {
  _id?: string;
  color?: string;
  material?: string;
  size?: string;
  attribute?: string; // Dynamic attribute value for the product's variation type
  price: number;
  stock: number;
  sku: string;
  images?: ProductImage[];
}

export interface ProductImage {
  url: string;
  alt?: string;
  is_primary?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  category_id: string | Category; // Can be populated or not
  price: number;
  description?: string;
  variation?: string; // Type of variation (e.g., Size, Dimensions, Color)
  variants: ProductVariant[];
  images: ProductImage[];
  featured?: boolean;
  stock?: number;
  created_at?: string;
  updated_at?: string;
}

// API Response types - matching actual backend response
export interface ProductsResponse {
  products: Product[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_available: {
    colors: string[];
    materials: string[];
    price_range: {
      min: number;
      max: number;
    };
    categories: Array<{
      id: string;
      name: string;
      count: number;
    }>;
  };
}

export interface SingleProductResponse {
  product: Product & {
    category: Category;
    stock: number;
  };
}

export interface ProductSearchResponse {
  products: Product[];
  suggestions: string[];
}

// Query parameters for products API
export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  price_min?: number;
  price_max?: number;
  color?: string;
  material?: string;
  search?: string;
  // Additional filters that could be supported
  featured?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Filter types for frontend
export interface ProductFilters {
  availability: string[];
  category: string[];
  // features: string[]; // Commented out - not in product model
  // shape: string[]; // Commented out - not in product model
  colors?: string[];
  materials?: string[];
  price_min?: number;
  price_max?: number;
}

// Stock location type
export interface StockLocation {
  location: string;
  stock: number;
  more_arriving?: boolean;
}

export interface StockResponse {
  locations: StockLocation[];
}

// Frontend display product type (transformed from backend)
export interface DisplayProduct {
  id: string;
  name: string;
  category_id: string;
  category_name?: string;
  price: number;
  featured: boolean;
  sku: string;
  description?: string;
  variants: ProductVariant[];
  images: ProductImage[];
  stock: number;
  availability: "in-stock" | "out-of-stock";
}

// Extended Product interface for single product page (keeping some frontend-specific features)
export interface ProductDetails {
  id: string;
  name: string;
  sku: string;
  images: string[];
  category: string;
  availability: "in-stock" | "out-of-stock" | "on-order";
  // features: string[]; // Commented out - not available in backend
  // shape: string; // Commented out - not available in backend
  price: number;
  isFirstLook?: boolean;
  stockInfo: {
    location: string;
    stock: number;
    moreArriving: string;
  }[];
  description?: string;
  note?: string;
  rawVariants?: ProductVariant[]; // Raw variant data for variant-specific image selection
  productLevelImages?: string[]; // Product-level images as fallback
  variationName?: string; // Dynamic variation name (e.g., "Size", "Dimensions", "Color")
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

// Admin-specific types for product management
export interface CreateProductRequest {
  name: string;
  sku: string;
  category_id: string;
  price: number;
  description?: string;
  variation?: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
  featured?: boolean;
  stock?: number;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface StockInfo {
  productId: string;
  currentStock: number;
  reservedStock?: number;
  availableStock: number;
  locations?: StockLocation[];
}

export interface UpdateStockRequest {
  stock: number;
  location?: string;
}

// Error types for better error handling
export interface ProductError {
  field?: string;
  message: string;
  code?: string;
}

export interface ProductValidationError {
  errors: ProductError[];
  message: string;
}

// Admin product list response (may differ from public product list)
export interface AdminProductsResponse extends ProductsResponse {
  products: Product[];
}
