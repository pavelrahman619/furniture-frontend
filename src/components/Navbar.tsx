"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  User,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  ChevronDown,
  Key,
  Menu,
  X,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useDebounce } from "@/hooks/useDebounce";
import SearchDropdown from "./SearchDropdown";
import CategoryMegaMenu from "./CategoryMegaMenu";
import { ProductService } from "@/services/product.service";
import { Product } from "@/types/product.types";
import { CategoryResponse } from "@/services/category.service";
import { transformToMegaMenuFormat } from "@/data/featured-categories";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCategoryMegaMenu, setShowCategoryMegaMenu] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalSearchCount, setTotalSearchCount] = useState(0);
  const [hierarchicalCategories] = useState<CategoryResponse[]>(
    transformToMegaMenuFormat()
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const categoryMegaMenuRef = useRef<HTMLDivElement>(null);

  const { getTotalItems } = useCart();
  const { admin, isAuthenticated, logout } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const cartItemCount = getTotalItems();

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const mainNavItems = [
    { name: "ALL PRODUCTS", href: "/products", hasDropdown: true },
    { name: "IN STOCK", href: "/products", hasDropdown: false },
    { name: "TRACK ORDER", href: "/track", hasDropdown: false },
    { name: "CONTACT US", href: "#", hasDropdown: false },
    { name: "ABOUT US", href: "#", hasDropdown: false },
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

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
      setSearchResults([]);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigateToSearchResults();
    } else if (e.key === "Escape") {
      setShowSearchDropdown(false);
      searchInputRef.current?.blur();
    }
  };

  const navigateToSearchResults = () => {
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const closeSearchDropdown = () => {
    setShowSearchDropdown(false);
  };

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await ProductService.searchProducts(
          debouncedSearchQuery
        );
        setSearchResults(response.products);
        setTotalSearchCount(
          response.pagination?.total_count || response.products.length
        );
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  // Clear search when navigating away
  useEffect(() => {
    setSearchQuery("");
    setShowSearchDropdown(false);
    setShowMobileMenu(false);
    setShowCategoryMegaMenu(false);
  }, [pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowAdminDropdown(false);
      }
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setShowMobileMenu(false);
      }
      if (
        categoryMegaMenuRef.current &&
        !categoryMegaMenuRef.current.contains(event.target as Node)
      ) {
        setShowCategoryMegaMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showMobileMenu]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile: Burger Menu */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-700 hover:text-gray-900 transition-colors p-2"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Logo - Desktop: Left, Mobile: Center */}
          <div className="flex-shrink-0 py-2 lg:mr-0 absolute left-1/2 transform -translate-x-1/2 lg:static lg:transform-none">
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

          {/* Desktop: Expandable Search Bar */}
          <div className="hidden lg:flex items-center" ref={searchDropdownRef}>
            <div
              className={`relative transition-all duration-300 ${
                searchQuery ? "w-[500px]" : "w-96"
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                className="block w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-900 focus:placeholder-gray-500 sm:text-sm transition-all duration-200"
                placeholder="Search products..."
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchDropdown(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Search Dropdown */}
              {showSearchDropdown && (
                <SearchDropdown
                  products={searchResults}
                  isLoading={isSearching}
                  searchQuery={searchQuery}
                  totalCount={totalSearchCount}
                  onClose={closeSearchDropdown}
                  onSeeAllResults={navigateToSearchResults}
                />
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center lg:space-x-6 space-x-2">
            {/* Desktop: Admin Menu Items - Only show when authenticated */}
            {isAuthenticated && (
              <>
                {adminMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="hidden lg:flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <IconComponent className="h-4 w-4 mr-1" />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}

            {/* Desktop: Admin User Info & Logout OR Sign In */}
            {isAuthenticated && admin ? (
              <div className="hidden lg:block relative" ref={dropdownRef}>
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
                        <div className="font-medium text-gray-900">
                          {admin.name}
                        </div>
                        <div className="text-xs">{admin.email}</div>
                        <div className="text-xs capitalize">
                          {admin.role.replace("_", " ")}
                        </div>
                      </div>
                      <Link
                        href="/admin/change-password"
                        onClick={() => setShowAdminDropdown(false)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </Link>
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
                className="hidden lg:flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                {/* <User className="h-4 w-4 mr-1" />
                Sign In */}
              </Link>
            )}

            {/* Cart - Only show when admin is not logged in */}
            {!isAuthenticated && (
              <Link
                href="/cart"
                className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors relative"
              >
                <ShoppingBag className="h-5 w-5 lg:h-4 lg:w-4 lg:mr-1" />
                <span className="hidden lg:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden fixed inset-0 top-20 bg-white z-40 overflow-y-auto"
        >
          <div className="px-4 py-6 space-y-6">
            {/* Mobile: Admin Menu Items */}
            {isAuthenticated && admin && (
              <div className="border-b border-gray-200 pb-4">
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-900">
                    {admin.name}
                  </div>
                  <div className="text-xs text-gray-500">{admin.email}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {admin.role.replace("_", " ")}
                  </div>
                </div>
                {adminMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center py-3 text-base text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
                <Link
                  href="/admin/change-password"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center py-3 text-base text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <Key className="h-5 w-5 mr-3" />
                  Change Password
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center py-3 text-base text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </button>
              </div>
            )}

            {/* Mobile: Main Nav Items */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              {mainNavItems.map((item, index) => {
                if (item.hasDropdown) {
                  return (
                    <div key={index} className="space-y-2">
                      <div className="py-3 text-base font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="pl-4 space-y-2">
                        <Link
                          href="/products"
                          onClick={() => setShowMobileMenu(false)}
                          className="block py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                        >
                          View all categories
                        </Link>
                        {hierarchicalCategories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/products?category=${category.id}`}
                            onClick={() => setShowMobileMenu(false)}
                            className="block py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className="block py-3 text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Secondary Navigation */}
      <div className="hidden lg:block bg-gray-50 border-t border-gray-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center md:space-x-14 sm:space-x-6 space-x-3 h-12">
            {mainNavItems.map((item, index) => (
              <div
                key={index}
                className="relative"
                ref={item.hasDropdown ? categoryMegaMenuRef : undefined}
              >
                {item.hasDropdown ? (
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowCategoryMegaMenu(true)}
                      className="flex items-center md:text-sm text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors tracking-wide whitespace-nowrap"
                    >
                      {item.name}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="md:text-sm text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors tracking-wide whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Category Mega Menu - Desktop Only */}
        {showCategoryMegaMenu && (
          <CategoryMegaMenu
            categories={hierarchicalCategories}
            onClose={() => setShowCategoryMegaMenu(false)}
          />
        )}
      </div>

      {/* Mobile: Secondary Navigation with Search */}
      <div className="lg:hidden bg-gray-50 border-t border-gray-200">
        <div className="px-4 py-3">
          <div className="relative" ref={searchDropdownRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              className="block w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-900 focus:placeholder-gray-500 text-sm transition-all duration-200"
              placeholder="Search products..."
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchDropdown(false);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <SearchDropdown
                products={searchResults}
                isLoading={isSearching}
                searchQuery={searchQuery}
                totalCount={totalSearchCount}
                onClose={closeSearchDropdown}
                onSeeAllResults={navigateToSearchResults}
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
