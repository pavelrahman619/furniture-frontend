"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  User,
  Plus,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAdmin } from "@/contexts/AdminContext";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { getTotalItems } = useCart();
  const { admin, isAuthenticated, logout } = useAdmin();
  const cartItemCount = getTotalItems();

  const mainNavItems = [
    { name: "ALL PRODUCTS", href: "/products" },
  //   { name: "SHOP BY CATEGORY", href: "#" },
  //   { name: "ROOMS", href: "#" },
  //   { name: "MADE TO ORDER", href: "#" },
  //   { name: "VILLA TEXTILES & RUGS", href: "#" },
  //   { name: "IN STOCK", href: "#" },
  ];
  // const mainNavItems = [
    // { name: "", href: "#" },
    // { name: "TEST1", href: "#" },
    // { name: "TEST2", href: "#" },
    // { name: "TEST3", href: "#" },
  // ];

  const adminMenuItems = [
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Content", href: "/admin/content", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setShowAdminDropdown(false);
      // Redirect to home page after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAdminDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 py-2">
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity duration-200"
            >
              <img
                src="/furniture/logo.svg"
                alt="PALACIOS HOME"
                className="h-14 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                placeholder="Search by item number or keyword"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-6">
            {/* Admin Menu Items - Only show when authenticated */}
            {isAuthenticated && (
              <>
                {adminMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <IconComponent className="h-4 w-4 mr-1" />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}

            {/* Track Order */}
            {/* <Link
              href="/track"
              className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Package className="h-4 w-4 mr-1" />
              Track Order
            </Link> */}

            {/* Become A Member */}
            {/* <button className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors">
              <Plus className="h-4 w-4 mr-1" />
              Become A Member
            </button> */}

            {/* Admin User Info & Logout OR Sign In */}
            {isAuthenticated && admin ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <User className="h-4 w-4 mr-1" />
                  {admin.name}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </button>
                
                {/* Admin Dropdown */}
                {showAdminDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        <div className="font-medium text-gray-900">{admin.name}</div>
                        <div className="text-xs">{admin.email}</div>
                        <div className="text-xs capitalize">{admin.role.replace('_', ' ')}</div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                <User className="h-4 w-4 mr-1" />
                Sign In
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors relative"
            >
              <ShoppingBag className="h-4 w-4 mr-1" />
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 h-12">
            {mainNavItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors tracking-wide"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
