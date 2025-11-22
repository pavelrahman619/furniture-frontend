import { apiService, ApiResponse } from '../lib/api-service';
import { API_ENDPOINTS } from '../lib/api-config';

/**
 * Admin Authentication Request/Response Types
 */
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  refreshToken: string;
  admin: AdminUser;
  expiresIn: number;
}

/**
 * Backend user format (different from AdminUser)
 */
interface BackendUser {
  _id?: string;
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  permissions?: string[];
}

/**
 * Backend login response format (before mapping)
 */
interface BackendLoginResponse {
  token: string;
  refreshToken?: string;
  user?: BackendUser;
  admin?: BackendUser;
  expires_in?: number;
  expiresIn?: number;
}

/**
 * Backend verify token response format
 */
interface BackendVerifyResponse {
  valid: boolean;
  user?: BackendUser;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  lastLogin: string;
}

export interface AdminSession {
  token: string;
  refreshToken: string;
  expiresAt: number;
  admin: AdminUser;
}

export interface AdminTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Token Storage Keys
 */
const STORAGE_KEYS = {
  ADMIN_TOKEN: 'admin_token',
  ADMIN_REFRESH_TOKEN: 'admin_refresh_token',
  ADMIN_USER: 'admin_user',
  ADMIN_EXPIRES_AT: 'admin_expires_at',
} as const;

/**
 * Token Storage Utilities
 */
export const tokenStorage = {
  /**
   * Store admin session data
   */
  setSession: (session: AdminSession): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, session.token);
      localStorage.setItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN, session.refreshToken);
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(session.admin));
      localStorage.setItem(STORAGE_KEYS.ADMIN_EXPIRES_AT, session.expiresAt.toString());
    } catch (error) {
      console.error('Failed to store admin session:', error);
    }
  },

  /**
   * Get stored admin token
   */
  getToken: (): string | null => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      // Check for null, empty string, or the literal string "undefined"
      if (!token || token === 'undefined' || token === 'null') {
        return null;
      }
      return token;
    } catch (error) {
      console.error('Failed to get admin token:', error);
      return null;
    }
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken: (): string | null => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
      // Check for null, empty string, or the literal string "undefined"
      if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') {
        return null;
      }
      return refreshToken;
    } catch (error) {
      console.error('Failed to get admin refresh token:', error);
      return null;
    }
  },

  /**
   * Get stored admin user
   */
  getUser: (): AdminUser | null => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
      // Check for null, empty string, or the literal string "undefined"
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Failed to get admin user:', error);
      return null;
    }
  },

  /**
   * Get token expiration time
   */
  getExpiresAt: (): number | null => {
    try {
      const expiresStr = localStorage.getItem(STORAGE_KEYS.ADMIN_EXPIRES_AT);
      // Check for null, empty string, or the literal string "undefined"
      if (!expiresStr || expiresStr === 'undefined' || expiresStr === 'null') {
        return null;
      }
      const parsed = parseInt(expiresStr, 10);
      return isNaN(parsed) ? null : parsed;
    } catch (error) {
      console.error('Failed to get admin token expiration:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: (): boolean => {
    const expiresAt = tokenStorage.getExpiresAt();
    if (!expiresAt) return true;
    
    // Add 5 minute buffer before actual expiration
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() >= (expiresAt - bufferTime);
  },

  /**
   * Clear all admin session data
   */
  clearSession: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_EXPIRES_AT);
    } catch (error) {
      console.error('Failed to clear admin session:', error);
    }
  },

  /**
   * Get complete session if valid
   */
  getSession: (): AdminSession | null => {
    const token = tokenStorage.getToken();
    const refreshToken = tokenStorage.getRefreshToken();
    const admin = tokenStorage.getUser();
    const expiresAt = tokenStorage.getExpiresAt();

    if (!token || !refreshToken || !admin || !expiresAt) {
      return null;
    }

    return {
      token,
      refreshToken,
      admin,
      expiresAt,
    };
  },
};

/**
 * Admin Service Class
 */
export class AdminService {
  /**
   * Admin login
   */
  static async login(credentials: AdminLoginRequest): Promise<ApiResponse<AdminLoginResponse>> {
    try {
      const response = await apiService.post<BackendLoginResponse>(
        API_ENDPOINTS.ADMIN.LOGIN,
        credentials
      );

      // Store session if login successful
      if (response.success && response.data) {
        // Backend returns: { token, user: {...}, expires_in }
        // We need to map it to our AdminLoginResponse format
        const backendData = response.data;
        const token = backendData.token;
        const refreshToken: string = backendData.refreshToken || backendData.token; // Use token as refreshToken if not provided
        const expiresIn = backendData.expires_in || backendData.expiresIn || 3600;

        // Map user to admin format
        const user = backendData.user || backendData.admin;
        if (!user || !token) {
          throw new Error('Invalid login response format');
        }

        // Check if user has admin role
        if (user.role !== 'admin' && user.role !== 'super_admin') {
          throw new Error('Access denied. You do not have admin privileges.');
        }

        const admin: AdminUser = {
          id: user.id || user._id || 'unknown',
          email: user.email || credentials.email,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Admin User',
          role: user.role as 'admin' | 'super_admin',
          permissions: user.permissions || ['*'], // Grant all permissions by default
          lastLogin: new Date().toISOString(),
        };

        const expiresAt = Date.now() + (expiresIn * 1000);

        tokenStorage.setSession({
          token,
          refreshToken,
          admin,
          expiresAt,
        });

        // Return in expected format
        return {
          success: true,
          data: {
            token,
            refreshToken,
            admin,
            expiresIn,
          },
        };
      }

      return response as ApiResponse<AdminLoginResponse>;
    } catch (error) {
      // Clear any existing session on login failure
      tokenStorage.clearSession();
      throw error;
    }
  }

  /**
   * Admin logout
   */
  static async logout(): Promise<ApiResponse<void>> {
    const token = tokenStorage.getToken();
    
    try {
      // Call logout endpoint if token exists
      if (token) {
        await apiService.post(API_ENDPOINTS.ADMIN.LOGOUT, {}, token);
      }
    } catch (error) {
      // Log error but don't throw - we still want to clear local session
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local session
      tokenStorage.clearSession();
    }

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * Change admin password
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    const token = tokenStorage.getToken();

    if (!token) {
      return {
        success: false,
        error: 'No authentication token found. Please login again.',
      };
    }

    try {
      const response = await apiService.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.ADMIN.CHANGE_PASSWORD,
        {
          currentPassword,
          newPassword,
        },
        token
      );

      if (response.success) {
        // Backend returns { success: true, message: "..." } directly
        // apiService wraps it, so response.data might be { success: true, message: "..." }
        // or response.message might be set directly
        const message = response.data?.message || response.message || 'Password changed successfully';
        
        return {
          success: true,
          data: { message },
          message,
        };
      }

      return {
        success: false,
        error: response.error || response.data?.message || response.message || 'Failed to change password',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh admin token
   * NOTE: Backend doesn't support refresh tokens, so this always fails and clears the session
   */
  static async refreshToken(): Promise<ApiResponse<AdminTokenResponse>> {
    console.log('[AdminService] Refresh token attempted, but backend does not support refresh tokens');

    // Backend doesn't support refresh tokens, so always fail and clear session
    tokenStorage.clearSession();

    return {
      success: false,
      error: 'Refresh tokens not supported by backend',
    };
  }

  /**
   * Get current admin user
   */
  static async getCurrentAdmin(): Promise<ApiResponse<AdminUser>> {
    const token = tokenStorage.getToken();
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    // Check if token is expired and try to refresh
    if (tokenStorage.isTokenExpired()) {
      try {
        await AdminService.refreshToken();
        // Get updated token after refresh
        const newToken = tokenStorage.getToken();
        if (!newToken) {
          throw new Error('Token refresh failed');
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        return {
          success: false,
          error: 'Authentication token expired and refresh failed',
        };
      }
    }

    try {
      const currentToken = tokenStorage.getToken();
      if (!currentToken) {
        throw new Error('No authentication token available');
      }

      const response = await apiService.get<AdminUser>(
        API_ENDPOINTS.ADMIN.PROFILE,
        currentToken
      );

      // Update stored user data if successful
      if (response.success && response.data) {
        const session = tokenStorage.getSession();
        if (session) {
          tokenStorage.setSession({
            ...session,
            admin: response.data,
          });
        }
      }

      return response;
    } catch (error) {
      // If profile fetch fails with auth error, clear session
      if (error instanceof Error && error.message.includes('401')) {
        tokenStorage.clearSession();
      }
      throw error;
    }
  }

  /**
   * Verify admin token
   */
  static async verifyToken(token?: string): Promise<ApiResponse<boolean>> {
    const tokenToVerify = token || tokenStorage.getToken();

    if (!tokenToVerify) {
      return {
        success: true,
        data: false,
      };
    }

    try {
      // Backend expects GET request with Authorization header, not POST with token in body
      const response = await apiService.get<BackendVerifyResponse>(
        API_ENDPOINTS.ADMIN.VERIFY,
        tokenToVerify
      );

      if (response.success && response.data) {
        // Backend returns { valid: boolean, user: {...} }
        const isValid = response.data.valid;
        const user = response.data.user;

        // Check if user has admin role
        if (isValid && user && (user.role === 'admin' || user.role === 'super_admin')) {
          // Update stored user data if verification returns user info
          const session = tokenStorage.getSession();
          if (session) {
            const updatedAdmin: AdminUser = {
              id: user.id || user._id || 'unknown',
              email: user.email || session.admin.email,
              name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || session.admin.name,
              role: user.role as 'admin' | 'super_admin',
              permissions: session.admin.permissions,
              lastLogin: session.admin.lastLogin,
            };

            tokenStorage.setSession({
              ...session,
              admin: updatedAdmin,
            });
          }

          return {
            success: true,
            data: true,
          };
        }

        return {
          success: true,
          data: false,
        };
      }

      return {
        success: true,
        data: false,
      };
    } catch (error) {
      // If verification fails, consider token invalid
      console.error('Token verification failed:', error);
      return {
        success: true,
        data: false,
      };
    }
  }

  /**
   * Check if admin is currently authenticated
   */
  static isAuthenticated(): boolean {
    const session = tokenStorage.getSession();
    return session !== null && !tokenStorage.isTokenExpired();
  }

  /**
   * Get current admin user from storage (synchronous)
   */
  static getCurrentAdminSync(): AdminUser | null {
    return tokenStorage.getUser();
  }

  /**
   * Get current admin token from storage (synchronous)
   */
  static getCurrentToken(): string | null {
    return tokenStorage.getToken();
  }

  /**
   * Initialize admin session from storage
   */
  static initializeSession(): AdminSession | null {
    const session = tokenStorage.getSession();
    
    // Clear session if expired
    if (session && tokenStorage.isTokenExpired()) {
      tokenStorage.clearSession();
      return null;
    }
    
    return session;
  }
}

/**
 * Default export for backward compatibility
 */
export default AdminService;