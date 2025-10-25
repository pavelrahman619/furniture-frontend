// API Configuration
export { default as API_CONFIG, API_ENDPOINTS, buildApiUrl, getApiHeaders } from '../lib/api-config';

// API Service
export { default as apiService, ApiException } from '../lib/api-service';
export type { ApiResponse, ApiError, RequestOptions } from '../lib/api-service';

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

export { default as ProductService } from './product.service';
export type { 
  ProductsQueryParams,
  ProductsResponse,
  SingleProductResponse,
  ProductSearchResponse,
  StockResponse,
  DisplayProduct
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