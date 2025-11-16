"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/contexts/AdminContext";
import { Loader2, Shield } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard Component
 * 
 * Protects admin routes by checking authentication status and redirecting
 * unauthenticated users to the admin login page.
 * 
 * Features:
 * - Authentication verification on mount and route changes
 * - Loading states during authentication checks
 * - Automatic redirect to /admin/login for unauthenticated access
 * - Token expiration handling with redirect
 * - Graceful error handling
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, admin, getToken } = useAdmin();

  useEffect(() => {
    // Only redirect if we're not loading and not authenticated
    if (!isLoading && !isAuthenticated) {
      // Check if we have a token but are not authenticated (expired token case)
      const token = getToken();
      if (token) {
        // Token exists but authentication failed - likely expired
        console.warn("Admin token expired, redirecting to login");
      }

      // Redirect to admin login page
      router.replace("/admin/login");
      return;
    }

    // Additional check for token expiration
    if (isAuthenticated && admin) {
      const token = getToken();
      if (!token) {
        // Authenticated state but no token - inconsistent state
        console.warn("Admin authenticated but no token found, redirecting to login");
        router.replace("/admin/login");
        return;
      }
    }
  }, [isAuthenticated, isLoading, admin, router, getToken]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-900 p-3 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-600 mr-3" />
              <span className="text-lg font-medium text-gray-900">
                Verifying admin access...
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Please wait while we authenticate your admin credentials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated (fallback - should redirect above)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in as an administrator to access this page.
            </p>
            <button
              onClick={() => router.push("/admin/login")}
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Go to Admin Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render protected content if authenticated
  return <>{children}</>;
};

export default AdminGuard;