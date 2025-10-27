// API Configuration
export { default as API_CONFIG, API_ENDPOINTS, buildApiUrl, getApiHeaders } from '../lib/api-config';

// API Service
export { default as apiService, ApiException } from '../lib/api-service';
export type { ApiResponse, ApiError, RequestOptions } from '../lib/api-service';

// Error utilities
export { 
  transformApiError, 
  getUserFriendlyErrorMessage, 
  extractValidationErrors, 
  isRetryableError,
  ProductServiceException,
  ProductErrorCode
} from '../lib/error-utils';
export type { ProductError } from '../lib/error-utils';

// Service modules
export { default as authService } from './auth.service';
export type { 
  LoginRequest, 
  RegisterRequest, 
  User, 
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest 
} from './auth.service';

export { default as AdminService, tokenStorage } from './admin.service';
export type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminUser,
  AdminSession,
  AdminTokenResponse
} from './admin.service';

export { default as ProductService } from './product.service';
export type { 
  ProductsQueryParams,
  ProductsResponse,
  SingleProductResponse,
  ProductSearchResponse,
  StockResponse,
  DisplayProduct,
  CreateProductRequest,
  UpdateProductRequest,
  StockInfo,
  ProductValidationError,
  AdminProductsResponse
} from '../types/product.types';

export { default as cartService } from './cart.service';
export type { 
  CartItem, 
  Cart, 
  AddToCartRequest, 
  UpdateCartItemRequest 
} from './cart.service';

// Delivery service
export { default as DeliveryService } from './delivery.service';
export type { AddressData, ValidationResponse, CostCalculationResponse } from './delivery.service';

// Content service
export { default as ContentService, ContentServiceError } from './content.service';
export type { 
  HeroContent, 
  SaleSectionContent, 
  BannerContent, 
  SaleSection,
  BannerApiRequest,
  SaleSectionApiRequest,
  BannerApiResponse,
  SaleSectionApiResponse
} from './content.service';
export { 
  validateCloudinaryUrl,
  transformBannerToHero,
  transformHeroToBanner,
  transformSaleSectionToLocal,
  transformLocalToSaleSection
} from './content.service';