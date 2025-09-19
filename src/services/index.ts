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

export { default as productService, transformProductForDisplay } from './product.service';
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
