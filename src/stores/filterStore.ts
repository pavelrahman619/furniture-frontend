import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ProductFilters } from '@/types/product.types';
import { fetchCategories, transformCategoriesToFilterOptions } from '@/services/category.service';

// Filter state interface
interface FilterState {
  // Active filters
  filters: ProductFilters;
  
  // Filter options (dynamic from backend)
  filterOptions: {
    availability: Array<{ value: string; label: string }>;
    categories: Array<{ value: string; label: string; slug: string }>;
    colors: Array<{ value: string; label: string }>;
    materials: Array<{ value: string; label: string }>;
    // features: Array<{ value: string; label: string }>; // Commented out - not in product model
    // shapes: Array<{ value: string; label: string }>; // Commented out - not in product model
  };
  
  // UI state
  showAllFilters: boolean;
  sortBy: string;
  
  // Loading states
  isLoading: boolean;
  isCategoriesLoading: boolean;
  error: string | null;
  categoriesError: string | null;
}

// Filter actions interface
interface FilterActions {
  // Filter management
  setFilter: (filterType: keyof ProductFilters, values: string[]) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  clearFilter: (filterType: keyof ProductFilters) => void;
  clearAllFilters: () => void;
  
  // Filter options management
  updateFilterOptions: (options: Partial<FilterState['filterOptions']>) => void;
  fetchCategoriesFromBackend: () => Promise<void>;
  
  // UI management
  setShowAllFilters: (show: boolean) => void;
  setSortBy: (sortBy: string) => void;
  
  // Utility functions
  hasActiveFilters: () => boolean;
  getActiveFilterCount: () => number;
  
  // Reset
  reset: () => void;
}

// Combined store type
type FilterStore = FilterState & FilterActions;

// Static filter options (easily maintainable)
const STATIC_FILTER_OPTIONS = {
  availability: [
    { value: "in-stock", label: "In Stock" },
    { value: "out-of-stock", label: "Out of Stock" },
    // { value: "pre-order", label: "Pre-Order" },
  ],
  
  categories: [
    // Static fallback categories - will be replaced by backend data
    { value: "console", label: "Console Tables", slug: "console" },
    { value: "table", label: "Dining Tables", slug: "table" },
    { value: "chair", label: "Chairs", slug: "chair" },
    { value: "bench", label: "Benches", slug: "bench" },
    { value: "storage", label: "Storage", slug: "storage" },
  ],
  
  colors: [
    { value: "brown", label: "Brown" },
    { value: "black", label: "Black" },
    { value: "white", label: "White" },
    { value: "gray", label: "Gray" },
    { value: "natural", label: "Natural" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
  ],
  
  materials: [
    { value: "wood", label: "Wood" },
    { value: "metal", label: "Metal" },
    { value: "leather", label: "Leather" },
    { value: "fabric", label: "Fabric" },
    { value: "glass", label: "Glass" },
    { value: "plastic", label: "Plastic" },
    { value: "marble", label: "Marble" },
  ],
  
  // features: [
  //   { value: "reclaimed-wood", label: "Reclaimed Wood" },
  //   { value: "handcrafted", label: "Handcrafted" },
  //   { value: "solid-wood", label: "Solid Wood" },
  //   { value: "modern", label: "Modern" },
  //   { value: "industrial", label: "Industrial" },
  //   { value: "vintage", label: "Vintage" },
  //   { value: "rustic", label: "Rustic" },
  //   { value: "minimalist", label: "Minimalist" },
  // ],
  
  // shapes: [
  //   { value: "rectangular", label: "Rectangular" },
  //   { value: "curved", label: "Curved" },
  //   { value: "linear", label: "Linear" },
  //   { value: "round", label: "Round" },
  //   { value: "oval", label: "Oval" },
  //   { value: "square", label: "Square" },
  // ],
};

// Initial state
const initialState: FilterState = {
  filters: {
    availability: [],
    category: [],
    // features: [], // Commented out - not in product model
    // shape: [], // Commented out - not in product model
    colors: [],
    materials: [],
  },
  filterOptions: STATIC_FILTER_OPTIONS,
  showAllFilters: false,
  sortBy: "new",
  isLoading: false,
  isCategoriesLoading: false,
  error: null,
  categoriesError: null,
};

// Create the store
export const useFilterStore = create<FilterStore>()(
  devtools(
    (set, get) => ({
        ...initialState,
        
        // Filter management actions
        setFilter: (filterType, values) => {
          set(
            (state) => ({
              filters: {
                ...state.filters,
                [filterType]: values,
              },
              error: null,
            }),
            false,
            `setFilter/${filterType}`
          );
        },
        
        setPriceRange: (min, max) => {
          set(
            (state) => ({
              filters: {
                ...state.filters,
                price_min: min ?? undefined,
                price_max: max ?? undefined,
              },
              error: null,
            }),
            false,
            'setPriceRange'
          );
        },
        
        clearFilter: (filterType) => {
          set(
            (state) => ({
              filters: {
                ...state.filters,
                [filterType]: [],
              },
              error: null,
            }),
            false,
            `clearFilter/${filterType}`
          );
        },
        
        clearAllFilters: () => {
          set(
            {
              filters: {
                availability: [],
                category: [],
                // features: [], // Commented out - not in product model
                // shape: [], // Commented out - not in product model
                colors: [],
                materials: [],
                price_min: undefined,
                price_max: undefined,
              },
              error: null,
            },
            false,
            'clearAllFilters'
          );
        },
        
        // UI management actions
        setShowAllFilters: (show) => {
          set({ showAllFilters: show }, false, 'setShowAllFilters');
        },
        
        setSortBy: (sortBy) => {
          set({ sortBy }, false, 'setSortBy');
        },
        
        // Filter options management
        updateFilterOptions: (options) => {
          set(
            (state) => ({
              filterOptions: {
                ...state.filterOptions,
                ...options,
              },
            }),
            false,
            'updateFilterOptions'
          );
        },
        
        // Fetch categories from backend
        fetchCategoriesFromBackend: async () => {
          set({ isCategoriesLoading: true, categoriesError: null }, false, 'fetchCategoriesStart');
          
          try {
            const categories = await fetchCategories();
            const categoriesOptions = transformCategoriesToFilterOptions(categories);
            
            set(
              (state) => ({
                filterOptions: {
                  ...state.filterOptions,
                  categories: categoriesOptions,
                },
                isCategoriesLoading: false,
                categoriesError: null,
              }),
              false,
              'fetchCategoriesSuccess'
            );
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
            set(
              {
                isCategoriesLoading: false,
                categoriesError: errorMessage,
              },
              false,
              'fetchCategoriesError'
            );
            console.error('Failed to fetch categories:', error);
          }
        },
        
        // Utility functions
        hasActiveFilters: () => {
          const { filters } = get();
          return Object.values(filters).some(
            (filterArray) => Array.isArray(filterArray) && filterArray.length > 0
          ) || filters.price_min !== undefined || filters.price_max !== undefined;
        },
        
        getActiveFilterCount: () => {
          const { filters } = get();
          let count = 0;
          
          Object.values(filters).forEach((filterArray) => {
            if (Array.isArray(filterArray)) {
              count += filterArray.length;
            }
          });
          
          if (filters.price_min !== undefined || filters.price_max !== undefined) {
            count += 1;
          }
          
          return count;
        },
        
        // Reset function
        reset: () => {
          set(initialState, false, 'reset');
        },
      }),
    {
      name: 'filter-store',
    }
  )
);

// Selectors for better performance
export const useFilters = () => useFilterStore((state) => state.filters);
export const useFilterOptions = () => useFilterStore((state) => state.filterOptions);
export const useShowAllFilters = () => useFilterStore((state) => state.showAllFilters);
export const useSortBy = () => useFilterStore((state) => state.sortBy);
// Individual action selectors for better performance
export const useSetFilter = () => useFilterStore((state) => state.setFilter);
export const useSetPriceRange = () => useFilterStore((state) => state.setPriceRange);
export const useClearFilter = () => useFilterStore((state) => state.clearFilter);
export const useClearAllFilters = () => useFilterStore((state) => state.clearAllFilters);
export const useSetShowAllFilters = () => useFilterStore((state) => state.setShowAllFilters);
export const useSetSortBy = () => useFilterStore((state) => state.setSortBy);
export const useUpdateFilterOptions = () => useFilterStore((state) => state.updateFilterOptions);
export const useReset = () => useFilterStore((state) => state.reset);

// Additional selectors for better performance
export const useHasActiveFilters = () => useFilterStore((state) => state.hasActiveFilters);
export const useGetActiveFilterCount = () => useFilterStore((state) => state.getActiveFilterCount);
export const useIsLoading = () => useFilterStore((state) => state.isLoading);
export const useError = () => useFilterStore((state) => state.error);

// Categories-specific selectors
export const useIsCategoriesLoading = () => useFilterStore((state) => state.isCategoriesLoading);
export const useCategoriesError = () => useFilterStore((state) => state.categoriesError);
export const useFetchCategoriesFromBackend = () => useFilterStore((state) => state.fetchCategoriesFromBackend);
