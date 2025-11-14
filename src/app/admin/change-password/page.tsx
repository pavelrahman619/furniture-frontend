"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import AdminService from "@/services/admin.service";

const ChangePasswordPage = () => {
  const router = useRouter();
  const { admin, isAuthenticated, isLoading } = useAdmin();
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-900 p-3 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-3"></div>
              <span className="text-lg font-medium text-gray-900">
                Loading...
              </span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Don't render form if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await AdminService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (response.success) {
        setSuccessMessage(response.message || "Password changed successfully!");
        // Clear form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        
        // Redirect to admin dashboard after 2 seconds
        setTimeout(() => {
          router.push("/admin/products");
        }, 2000);
      } else {
        setErrors({
          general: response.error || "Failed to change password. Please try again.",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("incorrect")) {
          setErrors({
            currentPassword: "Current password is incorrect",
          });
        } else if (error.message.includes("Unauthorized")) {
          setErrors({
            general: "Your session has expired. Please login again.",
          });
          setTimeout(() => {
            router.push("/admin/login");
          }, 2000);
        } else {
          setErrors({
            general: error.message || "An error occurred. Please try again.",
          });
        }
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again later.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="text-3xl font-light tracking-wider text-gray-900 hover:text-gray-700 transition-colors"
          >
            CLASSIC HOME
          </Link>
          <div className="mt-6 flex justify-center">
            <div className="bg-gray-900 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-light text-gray-900 tracking-wider">
            CHANGE PASSWORD
          </h2>
          {admin && (
            <p className="mt-2 text-sm text-gray-600">
              Logged in as: <span className="font-medium">{admin.email}</span>
            </p>
          )}
        </div>

        {/* Change Password Form */}
        <div className="bg-white border border-gray-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-md flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-600">{successMessage}</p>
                  <p className="text-xs text-green-500 mt-1">
                    Redirecting to dashboard...
                  </p>
                </div>
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Current Password Field */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2"
              >
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  disabled={isSubmitting || !!successMessage}
                  className={`block w-full pl-10 pr-12 py-3 border ${
                    errors.currentPassword ? "border-red-300" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 disabled:bg-gray-100`}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                  }
                  disabled={isSubmitting || !!successMessage}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password Field */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  disabled={isSubmitting || !!successMessage}
                  className={`block w-full pl-10 pr-12 py-3 border ${
                    errors.newPassword ? "border-red-300" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 disabled:bg-gray-100`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                  }
                  disabled={isSubmitting || !!successMessage}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
              )}
              {!errors.newPassword && formData.newPassword && (
                <p className="mt-2 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isSubmitting || !!successMessage}
                  className={`block w-full pl-10 pr-12 py-3 border ${
                    errors.confirmPassword ? "border-red-300" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400 disabled:bg-gray-100`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                  }
                  disabled={isSubmitting || !!successMessage}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting || !!successMessage}
                className={`w-full flex justify-center py-4 px-4 border border-transparent font-medium tracking-wider text-white ${
                  isSubmitting || successMessage
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-gray-800"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    CHANGING PASSWORD...
                  </div>
                ) : successMessage ? (
                  "PASSWORD CHANGED"
                ) : (
                  "CHANGE PASSWORD"
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                disabled={isSubmitting}
                className="w-full flex justify-center py-4 px-4 border border-gray-300 font-medium tracking-wider text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 p-6 text-center">
          <div className="flex justify-center mb-3">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            PASSWORD SECURITY TIPS
          </h3>
          <ul className="text-xs text-blue-700 text-left space-y-1">
            <li>• Use a strong, unique password</li>
            <li>• Include a mix of letters, numbers, and symbols</li>
            <li>• Avoid using personal information</li>
            <li>• Change your password regularly</li>
          </ul>
        </div>

        {/* Footer Links */}
        <div className="text-center">
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <Link
              href="/admin/products"
              className="hover:text-gray-700 transition-colors"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/"
              className="hover:text-gray-700 transition-colors"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChangePasswordPage;

