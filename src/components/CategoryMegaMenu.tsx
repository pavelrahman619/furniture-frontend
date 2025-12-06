"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  parent_id?: string;
  subcategories?: Category[];
}

interface CategoryMegaMenuProps {
  categories: Category[];
  onClose: () => void;
}

const CategoryMegaMenu = ({ categories, onClose }: CategoryMegaMenuProps) => {
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [displayImage, setDisplayImage] = useState<string | null>(null);

  // Categories are already organized in hierarchy from the backend
  const categoriesWithSubs = categories;

  // Set initial hovered category
  useEffect(() => {
    if (categoriesWithSubs.length > 0 && !hoveredCategory) {
      setHoveredCategory(categoriesWithSubs[0]);
    }
  }, [categoriesWithSubs, hoveredCategory]);

  // Update image when category is hovered
  useEffect(() => {
    if (hoveredCategory?.image_url) {
      setDisplayImage(hoveredCategory.image_url);
    } else {
      setDisplayImage(null);
    }
  }, [hoveredCategory]);

  const handleCategoryHover = (category: Category) => {
    setHoveredCategory(category);
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/products?category=${categoryId}`);
  };

  return (
    <div
      className="absolute left-0 right-0 top-full w-full bg-white border-t border-gray-200 shadow-2xl z-50"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Main Categories */}
          <div className="col-span-12 md:col-span-4">
            <div className="mb-6 pb-6 border-b border-gray-200">
              <Link
                href="/products"
                onClick={onClose}
                className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
              >
                All Shop by Category →
              </Link>
            </div>

            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Categories
            </h4>
            <ul className="space-y-3">
              {categoriesWithSubs.map((category) => (
                <li key={category.id}>
                  <div
                    onMouseEnter={() => handleCategoryHover(category)}
                    onMouseDown={() => handleCategoryClick(category.id)}
                    className={`text-left w-full text-base transition-all flex items-center justify-between group cursor-pointer ${
                      hoveredCategory?.id === category.id
                        ? "text-gray-900 font-medium"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    <span>{category.name}</span>
                    {category.subcategories &&
                      category.subcategories.length > 0 && (
                        <ChevronRight
                          className={`h-4 w-4 transition-opacity ${
                            hoveredCategory?.id === category.id
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        />
                      )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Middle Column - Subcategories */}
          {/* <div className="col-span-3">
            {hoveredCategory &&
              hoveredCategory.subcategories &&
              hoveredCategory.subcategories.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Shop by Type
                </h4>
                <ul className="space-y-3">
                  {hoveredCategory.subcategories.map((subcat) => (
                    <li key={subcat.id}>
                      <div className="text-gray-700 flex items-center">
                        <span className="text-sm">{subcat.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    href={`/products?category=${hoveredCategory.id}`}
                    onClick={onClose}
                    className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
                  >
                    View All {hoveredCategory.name} →
                  </Link>
                </div>
              </div>
            ) : hoveredCategory ? (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Shop by Type
                </h4>
                <p className="text-gray-500 text-sm italic">
                  No subcategories available
                </p>
                <Link
                  href={`/products?category=${hoveredCategory?.id}`}
                  onClick={onClose}
                  className="inline-block mt-4 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
                >
                  View All Products →
                </Link>
              </div>
            ) : null}
          </div> */}

          {/* Right Column - Featured Image */}
          <div className="hidden md:block md:col-span-8">
            <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={hoveredCategory?.name || "Category"}
                  fill
                  className="object-cover transition-opacity duration-300"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <svg
                      className="mx-auto h-24 w-24 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm">{hoveredCategory?.name}</p>
                  </div>
                </div>
              )}
              {hoveredCategory && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-white text-2xl font-light">
                    {hoveredCategory.name}
                  </h3>
                  <div
                    onMouseDown={() => handleCategoryClick(hoveredCategory.id)}
                    className="inline-block mt-2 text-white text-sm hover:underline cursor-pointer"
                  >
                    Shop All {hoveredCategory.name} →
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryMegaMenu;
