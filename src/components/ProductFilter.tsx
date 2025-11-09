"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { 
  useFilters, 
  useFilterOptions, 
  useShowAllFilters, 
  useSortBy, 
  useHasActiveFilters,
  useSetFilter,
  useSetShowAllFilters,
  useSetSortBy,
  useClearAllFilters
} from "@/stores/filterStore";

interface FilterProps {
  productCount: number;
}

interface DropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const Dropdown = ({ label, options, selected, onChange }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOptionToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
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

const ProductFilter = ({ productCount }: FilterProps) => {
  const [isClient, setIsClient] = useState(false);
  
  // Get state and actions from Zustand
  const filters = useFilters();
  const filterOptions = useFilterOptions();
  const showAllFilters = useShowAllFilters();
  const sortBy = useSortBy();
  const hasActiveFilters = useHasActiveFilters();
  
  // Individual action selectors
  const setFilter = useSetFilter();
  const setShowAllFilters = useSetShowAllFilters();
  const setSortBy = useSetSortBy();
  const clearAllFilters = useClearAllFilters();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    setFilter(filterType, newValues);
  };

  const handleSortChange = (sortOption: string) => {
    setSortBy(sortOption);
  };

  const handleClearAllFilters = () => {
    clearAllFilters();
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Main Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown
            label="Availability"
            options={filterOptions.availability}
            selected={filters.availability}
            onChange={(selected) =>
              handleFilterUpdate("availability", selected)
            }
          />

          <Dropdown
            label="Category"
            options={filterOptions.categories}
            selected={filters.category}
            onChange={(selected) => handleFilterUpdate("category", selected)}
          />

          {/* Features and Shape filters commented out - not in product model */}
          {/* <Dropdown
            label="Features"
            options={filterOptions.features}
            selected={filters.features}
            onChange={(selected) => handleFilterUpdate("features", selected)}
          />

          <Dropdown
            label="Shape"
            options={filterOptions.shapes}
            selected={filters.shape}
            onChange={(selected) => handleFilterUpdate("shape", selected)}
          /> */}

          {/* Colors and Materials filters - UI hidden (logic kept intact) */}
          {/* <Dropdown
            label="Colors"
            options={filterOptions.colors}
            selected={filters.colors || []}
            onChange={(selected) => handleFilterUpdate("colors", selected)}
          />

          <Dropdown
            label="Materials"
            options={filterOptions.materials}
            selected={filters.materials || []}
            onChange={(selected) => handleFilterUpdate("materials", selected)}
          /> */}

          {/* All Filters Button */}
          <button
            onClick={() => setShowAllFilters(!showAllFilters)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            All Filters
          </button>
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
              onChange={(e) => handleSortChange(e.target.value)}
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

      {/* Clear Filters - Separate Row */}
      {hasActiveFilters() && (
        <div className="flex justify-end mt-2">
          <button
            onClick={handleClearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-800 underline cursor-pointer hover:no-underline hover:bg-gray-100 px-2 py-1 rounded transition-colors duration-200"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Extended Filters Panel */}
      {showAllFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Availability
              </h4>
              <div className="space-y-2">
                {filterOptions.availability.map((option) => (
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
                {filterOptions.categories.map((option) => (
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

            {/* Features and Shape sections commented out - not in product model */}
            {/* <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Features
              </h4>
              <div className="space-y-2">
                {filterOptions.features.slice(0, 4).map((option) => (
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
                {filterOptions.shapes.map((option) => (
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
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;
