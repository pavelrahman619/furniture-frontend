import { apiService, ApiException } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/lib/api-config';

/**
 * Types for delivery service
 */
export interface AddressData {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface ValidationResponse {
  isValid: boolean;
  distance_miles: number;
  message?: string;
  within_delivery_zone: boolean;
}

export interface CostCalculationResponse {
  delivery_cost: number;
  is_free_delivery: boolean;
  distance_miles: number;
  message?: string;
}

const DEFAULT_RETRY_COUNT = 2;

/**
 * DeliveryService - wrapper around backend delivery APIs
 */
export class DeliveryService {
  static async validateAddress(address: AddressData, retry = DEFAULT_RETRY_COUNT): Promise<ValidationResponse> {
    try {
      const response = await apiService.post<ValidationResponse>(API_ENDPOINTS.TEST.HEALTH.replace('/test/health', '/delivery/validate-address'), address);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Address validation failed');
      }

      return response.data;
    } catch (err) {
      // Retry logic for network / transient errors
      const status = err && typeof err === 'object' && 'status' in err ? (err as any).status : undefined;
      const isTransient = err instanceof ApiException || status === 0 || (typeof status === 'number' && status >= 500);

      if (retry > 0 && isTransient) {
        return this.validateAddress(address, retry - 1);
      }

      // Re-throw so callers can handle UI state
      throw err;
    }
  }

  static async calculateDeliveryCost(address: AddressData, orderTotal: number, retry = DEFAULT_RETRY_COUNT): Promise<CostCalculationResponse> {
    try {
      const payload = { address, order_total: orderTotal };
      const response = await apiService.post<CostCalculationResponse>(API_ENDPOINTS.TEST.HEALTH.replace('/test/health', '/delivery/calculate-cost'), payload);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Delivery cost calculation failed');
      }

      return response.data;
    } catch (err) {
      const status = err && typeof err === 'object' && 'status' in err ? (err as any).status : undefined;
      const isTransient = err instanceof ApiException || status === 0 || (typeof status === 'number' && status >= 500);

      if (retry > 0 && isTransient) {
        return this.calculateDeliveryCost(address, orderTotal, retry - 1);
      }

      throw err;
    }
  }
}

export default DeliveryService;


