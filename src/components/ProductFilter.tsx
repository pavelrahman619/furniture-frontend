"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { ProductFilters } from "@/types/product.types";

interface FilterProps {
  onFilterChange: (filters: ProductFilters) => void;
  onSortChange: (sortBy: string) => void;
  productCount: number;
  sortBy: string;
}

interface DropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const Dropdown = ({ label, options, selected, onChange }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between min-w-[120px] px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        <span>{label}</span>
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 min-w-[200px] bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="py-1">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => handleOptionToggle(option.value)}
                  className="mr-3 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProductFilter = ({
  onFilterChange,
  onSortChange,
  productCount,
  sortBy,
}: FilterProps) => {
  const [filters, setFilters] = useState<ProductFilters>({
    availability: [],
    category: [],
    features: [],
    shape: [],
    colors: [],
    materials: [],
  });

  const [showAllFilters, setShowAllFilters] = useState(false);

  const availabilityOptions = [
    { value: "in-stock", label: "In Stock" },
    { value: "out-of-stock", label: "Out of Stock" },
    { value: "pre-order", label: "Pre-Order" },
  ];

  const categoryOptions = [
    { value: "console", label: "Console Tables" },
    { value: "table", label: "Dining Tables" },
    { value: "chair", label: "Chairs" },
    { value: "bench", label: "Benches" },
    { value: "storage", label: "Storage" },
  ];

  const featureOptions = [
    { value: "reclaimed-wood", label: "Reclaimed Wood" },
    { value: "handcrafted", label: "Handcrafted" },
    { value: "solid-wood", label: "Solid Wood" },
    { value: "leather", label: "Leather" },
    { value: "metal", label: "Metal" },
    { value: "modern", label: "Modern" },
    { value: "industrial", label: "Industrial" },
  ];

  const colorOptions = [
    { value: "brown", label: "Brown" },
    { value: "black", label: "Black" },
    { value: "white", label: "White" },
    { value: "gray", label: "Gray" },
    { value: "natural", label: "Natural" },
  ];

  const materialOptions = [
    { value: "wood", label: "Wood" },
    { value: "metal", label: "Metal" },
    { value: "leather", label: "Leather" },
    { value: "fabric", label: "Fabric" },
    { value: "glass", label: "Glass" },
  ];

  const shapeOptions = [
    { value: "rectangular", label: "Rectangular" },
    { value: "curved", label: "Curved" },
    { value: "linear", label: "Linear" },
    { value: "round", label: "Round" },
  ];

  const sortOptions = [
    { value: "new", label: "New" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Name: A to Z" },
  ];

  const handleFilterUpdate = (
    filterType: keyof typeof filters,
    newValues: string[]
  ) => {
    const newFilters = { ...filters, [filterType]: newValues };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: ProductFilters = {
      availability: [],
      category: [],
      features: [],
      shape: [],
      colors: [],
      materials: [],
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (filterArray) => filterArray.length > 0
  );

  return (
    <div className="mb-8">
      {/* Main Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown
            label="Availability"
            options={availabilityOptions}
            selected={filters.availability}
            onChange={(selected) =>
              handleFilterUpdate("availability", selected)
            }
          />

          <Dropdown
            label="Category"
            options={categoryOptions}
            selected={filters.category}
            onChange={(selected) => handleFilterUpdate("category", selected)}
          />

          <Dropdown
            label="Features"
            options={featureOptions}
            selected={filters.features}
            onChange={(selected) => handleFilterUpdate("features", selected)}
          />

          <Dropdown
            label="Shape"
            options={shapeOptions}
            selected={filters.shape}
            onChange={(selected) => handleFilterUpdate("shape", selected)}
          />

          <Dropdown
            label="Colors"
            options={colorOptions}
            selected={filters.colors || []}
            onChange={(selected) => handleFilterUpdate("colors", selected)}
          />

          <Dropdown
            label="Materials"
            options={materialOptions}
            selected={filters.materials || []}
            onChange={(selected) => handleFilterUpdate("materials", selected)}
          />

          {/* All Filters Button */}
          <button
            onClick={() => setShowAllFilters(!showAllFilters)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            All Filters
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Right Side - Product Count & Sort */}
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-gray-700">
            {productCount} Products
          </span>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Extended Filters Panel */}
      {showAllFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Availability
              </h4>
              <div className="space-y-2">
                {availabilityOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={filters.availability.includes(option.value)}
                      onChange={() => {
                        const newSelected = filters.availability.includes(
                          option.value
                        )
                          ? filters.availability.filter(
                              (item) => item !== option.value
                            )
                          : [...filters.availability, option.value];
                        handleFilterUpdate("availability", newSelected);
                      }}
                      className="mr-2 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Category
              </h4>
              <div className="space-y-2">
                {categoryOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={filters.category.includes(option.value)}
                      onChange={() => {
                        const newSelected = filters.category.includes(
                          option.value
                        )
                          ? filters.category.filter(
                              (item) => item !== option.value
                            )
                          : [...filters.category, option.value];
                        handleFilterUpdate("category", newSelected);
                      }}
                      className="mr-2 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Features
              </h4>
              <div className="space-y-2">
                {featureOptions.slice(0, 4).map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={filters.features.includes(option.value)}
                      onChange={() => {
                        const newSelected = filters.features.includes(
                          option.value
                        )
                          ? filters.features.filter(
                              (item) => item !== option.value
                            )
                          : [...filters.features, option.value];
                        handleFilterUpdate("features", newSelected);
                      }}
                      className="mr-2 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Shape</h4>
              <div className="space-y-2">
                {shapeOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={filters.shape.includes(option.value)}
                      onChange={() => {
                        const newSelected = filters.shape.includes(option.value)
                          ? filters.shape.filter(
                              (item) => item !== option.value
                            )
                          : [...filters.shape, option.value];
                        handleFilterUpdate("shape", newSelected);
                      }}
                      className="mr-2 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;
