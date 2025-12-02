"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Shield, Loader2 } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

const AdminLoginPage = () => {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, admin } = useAdmin();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && admin) {
      // Admin is already logged in, redirect to admin dashboard
      router.replace("/admin/products");
    }
  }, [isAuthenticated, isLoading, admin, router]);

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
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-600 mr-3" />
              <span className="text-lg font-medium text-gray-900">
                Checking authentication...
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Please wait while we verify your admin session.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Show "already logged in" message if authenticated (will redirect above)
  if (isAuthenticated && admin) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Already Logged In
            </h2>
            <p className="text-gray-600 mb-4">
              Welcome back, {admin.name}! You are already authenticated as an administrator.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to admin dashboard...
            </p>
            <button
              onClick={() => router.push("/admin/products")}
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Go to Admin Dashboard
            </button>
          </div>
        </div>
      </main>
    );
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
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors({});

    try {
      await login(formData);
      // Redirect to admin products page after successful login
      router.push("/admin/products");
    } catch (error) {
      console.error("Admin login error:", error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("Invalid credentials")) {
          setErrors({
            general: "Invalid email or password. Please check your admin credentials.",
          });
        } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
          setErrors({
            general: "Access denied. You do not have admin privileges.",
          });
        } else if (error.message.includes("Network") || error.message.includes("fetch")) {
          setErrors({
            general: "Network error. Please check your connection and try again.",
          });
        } else {
          setErrors({
            general: error.message || "Login failed. Please try again.",
          });
        }
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again later.",
        });
      }
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
            ADMIN LOGIN
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access the administrative dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-gray-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2"
              >
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400`}
                  placeholder="Enter your admin email"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-400`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-4 px-4 border border-transparent font-medium tracking-wider text-white ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-gray-800"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    SIGNING IN...
                  </div>
                ) : (
                  "ADMIN SIGN IN"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 border border-amber-200 p-6 text-center">
          <div className="flex justify-center mb-3">
            <Shield className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-sm font-medium text-amber-800 mb-2">
            SECURE ADMIN ACCESS
          </h3>
          <p className="text-xs text-amber-700">
            This is a restricted area for authorized administrators only. 
            All login attempts are monitored and logged for security purposes.
          </p>
        </div>

        {/* Footer Links */}
        <div className="text-center">
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <Link
              href="/"
              className="hover:text-gray-700 transition-colors"
            >
              Back to Store
            </Link>
            <Link
              href="/help"
              className="hover:text-gray-700 transition-colors"
            >
              Need Help?
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminLoginPage;