import { apiService } from "@/lib/api-service";
import { API_ENDPOINTS } from "@/lib/api-config";

/**
 * Contact form request interface
 */
export interface ContactFormRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
}

/**
 * Contact form response interface
 */
export interface ContactFormResponse {
  success: boolean;
  message?: string;
}

/**
 * Contact form entry interface (for admin view)
 */
export interface ContactFormEntry {
  _id: string;
  id?: string; // For backward compatibility
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  message: string;
  created_at: string;
  updated_at?: string;
  __v?: number;
}

/**
 * Pagination interface
 */
export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Contact forms API response interface (matches actual API structure)
 */
export interface ContactFormsApiResponse {
  contacts: ContactFormEntry[];
  pagination: PaginationInfo;
}

/**
 * Contact forms list response interface
 */
export interface ContactFormsListResponse {
  success: boolean;
  data?: ContactFormEntry[];
  message?: string;
}

/**
 * Contact service error class
 */
export class ContactServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ContactServiceError";
  }
}

/**
 * API request body interface (snake_case for backend)
 */
interface ContactApiRequest {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  message: string;
}

/**
 * Transform frontend form data to API format
 */
const transformToApiFormat = (
  formData: ContactFormRequest
): ContactApiRequest => {
  return {
    first_name: formData.firstName,
    last_name: formData.lastName,
    phone_number: formData.phone,
    email: formData.email,
    message: formData.message,
  };
};

/**
 * Contact Service Class
 */
export class ContactService {
  /**
   * Submit contact form
   * @param formData - Contact form data
   * @returns Promise with response
   */
  static async submitContactForm(
    formData: ContactFormRequest
  ): Promise<ContactFormResponse> {
    try {
      // Transform camelCase to snake_case for API
      const apiPayload = transformToApiFormat(formData);

      const response = await apiService.post<ContactFormResponse>(
        API_ENDPOINTS.CONTACT.SUBMIT,
        apiPayload
      );

      if (!response.success) {
        throw new ContactServiceError(
          response.message || "Failed to submit contact form",
          "SUBMIT_ERROR",
          undefined
        );
      }

      return response;
    } catch (error) {
      console.error("Error submitting contact form:", error);

      if (error instanceof ContactServiceError) {
        throw error;
      }

      // Handle different error types
      if (error instanceof Error) {
        if (
          error.message.includes("Network Error") ||
          error.message.includes("fetch")
        ) {
          throw new ContactServiceError(
            "Network error. Please check your connection and try again.",
            "NETWORK_ERROR",
            undefined
          );
        }

        if (
          error.message.includes("400") ||
          error.message.includes("Bad Request")
        ) {
          throw new ContactServiceError(
            "Invalid form data. Please check your inputs.",
            "VALIDATION_ERROR",
            400
          );
        }

        if (error.message.includes("500")) {
          throw new ContactServiceError(
            "Server error. Please try again later.",
            "SERVER_ERROR",
            500
          );
        }
      }

      throw new ContactServiceError(
        "An unexpected error occurred. Please try again.",
        "UNKNOWN_ERROR",
        undefined
      );
    }
  }

  /**
   * Get all contact form submissions (admin only)
   * @param token - Admin authentication token
   * @returns Promise with list of contact forms
   */
  static async getAllContactForms(
    token?: string
  ): Promise<ContactFormsListResponse> {
    try {
      const response = await apiService.get<ContactFormsApiResponse>(
        API_ENDPOINTS.CONTACT.SUBMIT,
        token
      );

      if (!response.success) {
        throw new ContactServiceError(
          response.message || "Failed to fetch contact forms",
          "FETCH_ERROR",
          undefined
        );
      }

      // Extract contacts array from the API response
      // The API returns { contacts: [...], pagination: {...} }
      const contacts = response.data?.contacts || [];

      return {
        success: true,
        data: contacts,
      };
    } catch (error) {
      console.error("Error fetching contact forms:", error);

      if (error instanceof ContactServiceError) {
        throw error;
      }

      // Handle different error types
      if (error instanceof Error) {
        if (
          error.message.includes("Network Error") ||
          error.message.includes("fetch")
        ) {
          throw new ContactServiceError(
            "Network error. Please check your connection and try again.",
            "NETWORK_ERROR",
            undefined
          );
        }

        if (
          error.message.includes("401") ||
          error.message.includes("Unauthorized")
        ) {
          throw new ContactServiceError(
            "Authentication required. Please log in again.",
            "AUTH_ERROR",
            401
          );
        }

        if (
          error.message.includes("403") ||
          error.message.includes("Forbidden")
        ) {
          throw new ContactServiceError(
            "You do not have permission to view contact forms.",
            "PERMISSION_ERROR",
            403
          );
        }

        if (error.message.includes("500")) {
          throw new ContactServiceError(
            "Server error. Please try again later.",
            "SERVER_ERROR",
            500
          );
        }
      }

      throw new ContactServiceError(
        "An unexpected error occurred. Please try again.",
        "UNKNOWN_ERROR",
        undefined
      );
    }
  }
}

export default ContactService;
