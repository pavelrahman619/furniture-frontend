"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  AdminService,
  AdminUser,
  AdminLoginRequest,
  tokenStorage,
} from "@/services";

interface AdminContextType {
  // State
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (credentials: AdminLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;

  // Utilities
  hasPermission: (permission: string) => boolean;
  getToken: () => string | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Session timeout handling
  const [sessionTimeoutId, setSessionTimeoutId] =
    useState<NodeJS.Timeout | null>(null);

  // Initialize admin session on mount
  useEffect(() => {
    const initializeSession = async () => {
      setIsLoading(true);

      try {
        const session = AdminService.initializeSession();

        if (session) {
          // Trust the stored session initially to avoid unnecessary redirects on page refresh
          // The token will be validated on first API call if it's truly expired
          setAdmin(session.admin);
          setIsAuthenticated(true);
          setupSessionTimeout(session.expiresAt);

          // Optionally verify in the background (don't block UI or cause redirects)
          AdminService.verifyToken(session.token)
            .then((isValid) => {
              if (!isValid.success || !isValid.data) {
                // Session invalid, clear it
                tokenStorage.clearSession();
                setAdmin(null);
                setIsAuthenticated(false);
              }
            })
            .catch((error) => {
              console.error("Failed to verify admin session:", error);
              // Don't clear session on verification error - API might be down
              // The token will fail on next API call if truly invalid
            });
        } else {
          setAdmin(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Failed to initialize admin session:", error);
        setAdmin(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup session timeout warning and auto-logout
  const setupSessionTimeout = useCallback(
    (expiresAt: number) => {
      // Clear existing timeout
      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
      }

      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // Set timeout for 5 minutes before expiry to show warning
      const warningTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);

      const timeoutId = setTimeout(() => {
        // Show session timeout warning (could integrate with toast system)
        console.warn("Admin session will expire in 5 minutes");

        // Set another timeout for actual logout
        const logoutTimeoutId = setTimeout(() => {
          logout();
        }, 5 * 60 * 1000); // 5 minutes

        setSessionTimeoutId(logoutTimeoutId);
      }, warningTime);

      setSessionTimeoutId(timeoutId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionTimeoutId]
  );

  // Login function
  const login = useCallback(
    async (credentials: AdminLoginRequest) => {
      setIsLoading(true);

      try {
        const response = await AdminService.login(credentials);

        if (response.success && response.data) {
          const { admin: adminUser, expiresIn } = response.data;
          const expiresAt = Date.now() + expiresIn * 1000;

          setAdmin(adminUser);
          setIsAuthenticated(true);
          setupSessionTimeout(expiresAt);
        } else {
          throw new Error(response.error || "Login failed");
        }
      } catch (error) {
        setAdmin(null);
        setIsAuthenticated(false);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setupSessionTimeout]
  );

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await AdminService.logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if API call fails
    } finally {
      // Clear session timeout
      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
        setSessionTimeoutId(null);
      }

      setAdmin(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [sessionTimeoutId]);

  // Refresh session function (disabled since backend doesn't support refresh tokens)
  const refreshSession = useCallback(async () => {
    console.log(
      "[AdminContext] Refresh session attempted, but backend does not support refresh tokens"
    );

    // Backend doesn't support refresh tokens, so just logout
    await logout();
  }, [logout]);

  // Permission checking utility
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!admin || !admin.permissions) {
        return false;
      }

      // Check if admin has the specific permission
      return (
        admin.permissions.includes(permission) ||
        admin.permissions.includes("*")
      );
    },
    [admin]
  );

  // Get current token
  const getToken = useCallback((): string | null => {
    return AdminService.getCurrentToken();
  }, []);

  // Auto-refresh token when it's about to expire (disabled since backend doesn't support refresh)
  // Instead, tokens will expire naturally and users will be redirected to login

  // Handle browser tab visibility change (disabled since refresh not supported)
  // Users will need to login again if their session expires

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
      }
    };
  }, [sessionTimeoutId]);

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshSession,
        hasPermission,
        getToken,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
