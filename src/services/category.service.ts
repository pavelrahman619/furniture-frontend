/**
 * Category Service
 * Handles all category-related API calls
 */

import { API_ENDPOINTS, buildApiUrl, getApiHeaders } from '@/lib/api-config';

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  parent_id?: string;
  subcategories?: CategoryResponse[];
}

export interface CategoriesListResponse {
  categories: CategoryResponse[];
}

export interface CategoryProductsResponse {
  products: unknown[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Fetch all categories from the backend
 */
export const fetchCategories = async (): Promise<CategoryResponse[]> => {
  try {
    const url = buildApiUrl(API_ENDPOINTS.CATEGORIES.LIST);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }

    const data: CategoriesListResponse = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Fetch categories with hierarchy (parent-child relationships)
 */
export const fetchCategoriesWithHierarchy = async (): Promise<CategoryResponse[]> => {
  try {
    const categories = await fetchCategories();
    
    // Organize into parent-child structure
    const categoryMap = new Map<string, CategoryResponse>();
    const rootCategories: CategoryResponse[] = [];
    
    // First pass: create map of all categories
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, subcategories: [] });
    });
    
    // Second pass: organize into hierarchy
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (!category) return;
      
      if (cat.parent_id) {
        // This is a child category
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.subcategories = parent.subcategories || [];
          parent.subcategories.push(category);
        }
      } else {
        // This is a root category
        rootCategories.push(category);
      }
    });
    
    return rootCategories;
  } catch (error) {
    console.error('Error fetching categories with hierarchy:', error);
    throw error;
  }
};

/**
 * Fetch products for a specific category
 */
export const fetchCategoryProducts = async (
  categoryId: string,
  options?: {
    page?: number;
    limit?: number;
    filters?: Record<string, unknown>;
  }
): Promise<CategoryProductsResponse> => {
  try {
    const { page = 1, limit = 12, filters } = options || {};
    
    const url = new URL(buildApiUrl(API_ENDPOINTS.CATEGORIES.DETAIL(categoryId) + '/products'));
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    
    if (filters) {
      url.searchParams.append('filters', JSON.stringify(filters));
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch category products: ${response.status} ${response.statusText}`);
    }

    const data: CategoryProductsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching category products:', error);
    throw error;
  }
};

/**
 * Transform backend category to filter option format
 */
export const transformCategoryToFilterOption = (category: CategoryResponse) => ({
  value: category.id,
  label: category.name,
  slug: category.slug,
});

/**
 * Transform categories list to filter options
 */
export const transformCategoriesToFilterOptions = (categories: CategoryResponse[]) => {
  return categories.map(transformCategoryToFilterOption);
};

