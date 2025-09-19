"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  User,
  Plus,
  ShoppingBag,
  Package,
  Settings,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { getTotalItems } = useCart();
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
            {/* Admin Panel */}
            {/* <Link
              href="/admin/content"
              className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Settings className="h-4 w-4 mr-1" />
              Admin
            </Link> */}
            {/* <Link 
              href="#"
              className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Settings className="h-4 w-4 mr-1" />
              Test1
            </Link> */}

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

            {/* Sign In */}
            {/* <Link
              href="/login"
              className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <User className="h-4 w-4 mr-1" />
              Sign In
            </Link> */}

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
