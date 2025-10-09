/**
 * Categories Integration Example Component
 * Demonstrates how to use the categories backend integration with the filter store
 */

import React from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useSetFilter, useFilters } from '@/stores/filterStore';

const CategoriesExample: React.FC = () => {
  const { categories, isLoading, error, refetch } = useCategories();
  const setFilter = useSetFilter();
  const filters = useFilters();

  const handleCategorySelect = (categoryValue: string) => {
    const currentCategories = filters.category || [];
    const isSelected = currentCategories.includes(categoryValue);
    
    if (isSelected) {
      // Remove category from filter
      setFilter('category', currentCategories.filter(cat => cat !== categoryValue));
    } else {
      // Add category to filter
      setFilter('category', [...currentCategories, categoryValue]);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="animate-pulse">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">Error loading categories: {error}</p>
          <button 
            onClick={refetch}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      
      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {categories.map((category) => {
          const isSelected = filters.category?.includes(category.value) || false;
          
          return (
            <button
              key={category.value}
              onClick={() => handleCategorySelect(category.value)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <h3 className="font-medium">{category.label}</h3>
              <p className="text-sm text-gray-500 mt-1">Slug: {category.slug}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Categories Display */}
      {filters.category && filters.category.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Selected Categories:</h3>
          <div className="flex flex-wrap gap-2">
            {filters.category.map((categoryValue) => {
              const category = categories.find(cat => cat.value === categoryValue);
              return (
                <span
                  key={categoryValue}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {category?.label || categoryValue}
                  <button
                    onClick={() => handleCategorySelect(categoryValue)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Debug Info:</h3>
        <p className="text-sm text-gray-600">
          Total categories loaded: {categories.length}
        </p>
        <p className="text-sm text-gray-600">
          Selected categories: {filters.category?.length || 0}
        </p>
        <button 
          onClick={refetch}
          className="mt-2 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
        >
          Refresh Categories
        </button>
      </div>
    </div>
  );
};

export default CategoriesExample;

