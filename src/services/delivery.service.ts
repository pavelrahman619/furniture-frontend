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
      const payload = { address };
      const response = await apiService.post<{ is_valid: boolean; distance_miles: number; message?: string; is_in_zone: boolean }>(
        API_ENDPOINTS.DELIVERY.VALIDATE_ADDRESS,
        payload
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Address validation failed');
      }

      // Map backend response field to frontend interface
      return {
        isValid: response.data.is_valid,
        distance_miles: response.data.distance_miles,
        message: response.data.message,
        within_delivery_zone: response.data.is_in_zone
      };
    } catch (err) {
      // Retry logic for network / transient errors
      const status = err instanceof ApiException ? err.status : undefined;
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

      const response = await apiService.post<{
        address: any;
        order_total: number;
        distance_miles: number;
        delivery_cost: number;
        is_free: boolean;
        reason: string;
        tier: string;
      }>(API_ENDPOINTS.DELIVERY.CALCULATE_COST, payload);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Delivery cost calculation failed');
      }

      const backendData = response.data;

      return {
        delivery_cost: backendData.delivery_cost,
        is_free_delivery: backendData.is_free,
        distance_miles: backendData.distance_miles,
        message: backendData.reason,
      };
    } catch (err) {
      const status = err instanceof ApiException ? err.status : undefined;
      const isTransient = err instanceof ApiException || status === 0 || (typeof status === 'number' && status >= 500);

      if (retry > 0 && isTransient) {
        return this.calculateDeliveryCost(address, orderTotal, retry - 1);
      }

      throw err;
    }
  }
}

export default DeliveryService;


