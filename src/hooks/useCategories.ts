/**
 * Categories Hook
 * Custom hook for managing categories data and integration with filter store
 */

import { useEffect, useRef } from 'react';
import { 
  useFilterOptions, 
  useIsCategoriesLoading, 
  useCategoriesError, 
  useFetchCategoriesFromBackend 
} from '@/stores/filterStore';

/**
 * Hook to manage categories data
 * Automatically fetches categories on mount and provides loading/error states
 */
export const useCategories = () => {
  const categories = useFilterOptions().categories;
  const isLoading = useIsCategoriesLoading();
  const error = useCategoriesError();
  const fetchCategories = useFetchCategoriesFromBackend();
  const hasFetchedRef = useRef(false);

  // Auto-fetch categories on mount
  useEffect(() => {
    // Only fetch once on mount if we don't have categories or if we only have the static fallback
    if (!hasFetchedRef.current) {
      const hasOnlyStaticCategories = categories.length <= 5 &&
        categories.some(cat => cat.value === 'console' || cat.value === 'table');

      if (categories.length === 0 || hasOnlyStaticCategories) {
        fetchCategories();
        hasFetchedRef.current = true;
      }
    }
  }, [fetchCategories, categories]);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    hasCategories: categories.length > 0,
  };
};

/**
 * Hook to get categories for display purposes (with loading states)
 */
export const useCategoriesWithStatus = () => {
  const { categories, isLoading, error, refetch, hasCategories } = useCategories();

  return {
    categories,
    isLoading,
    error,
    refetch,
    hasCategories,
    // Helper methods
    getCategoryByValue: (value: string) => categories.find(cat => cat.value === value),
    getCategoryBySlug: (slug: string) => categories.find(cat => cat.slug === slug),
    getCategoryOptions: () => categories.map(cat => ({
      value: cat.value,
      label: cat.label,
    })),
  };
};

export default useCategories;

