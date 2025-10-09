# Categories Backend Integration

This document explains how the categories backend integration has been implemented in the filter store using best practices.

## Overview

The categories integration allows the frontend to dynamically fetch and use categories from the backend API instead of relying on static data. This ensures that the filter options are always up-to-date with the backend data.

## Architecture

### 1. Service Layer (`/src/services/category.service.ts`)

The service layer handles all API communication:

- **`fetchCategories()`**: Fetches all categories from the backend
- **`fetchCategoryProducts()`**: Fetches products for a specific category with filtering support
- **Transformation utilities**: Convert backend data to frontend format

```typescript
// Example usage
const categories = await fetchCategories();
const products = await fetchCategoryProducts('category-id', {
  page: 1,
  limit: 12,
  filters: { price_min: 100, price_max: 500 }
});
```

### 2. Store Integration (`/src/stores/filterStore.ts`)

The Zustand store has been enhanced with:

- **Dynamic categories loading**: `fetchCategoriesFromBackend()` action
- **Loading states**: `isCategoriesLoading` for UI feedback
- **Error handling**: `categoriesError` for error display
- **Fallback support**: Static categories as fallback during loading

#### New Store Features

```typescript
// New actions
fetchCategoriesFromBackend: () => Promise<void>

// New state
isCategoriesLoading: boolean
categoriesError: string | null

// New selectors
useIsCategoriesLoading()
useCategoriesError()
useFetchCategoriesFromBackend()
```

### 3. Custom Hook (`/src/hooks/useCategories.ts`)

Provides a convenient interface for components:

- **Auto-fetching**: Automatically loads categories on mount
- **Smart loading**: Only fetches if needed (no categories or only static fallback)
- **Helper methods**: Find categories by value/slug, get options format

```typescript
const { categories, isLoading, error, refetch } = useCategories();
```

### 4. Example Component (`/src/components/CategoriesExample.tsx`)

Demonstrates proper usage patterns:

- Loading states with skeleton UI
- Error handling with retry functionality
- Category selection/deselection
- Visual feedback for selected categories

## Usage Patterns

### Basic Category Display

```typescript
import { useCategories } from '@/hooks/useCategories';

const CategoryList = () => {
  const { categories, isLoading, error } = useCategories();
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {categories.map(category => (
        <div key={category.value}>{category.label}</div>
      ))}
    </div>
  );
};
```

### Category Filtering

```typescript
import { useSetFilter, useFilters } from '@/stores/filterStore';

const CategoryFilter = () => {
  const setFilter = useSetFilter();
  const filters = useFilters();
  const { categories } = useCategories();
  
  const toggleCategory = (categoryValue: string) => {
    const current = filters.category || [];
    const isSelected = current.includes(categoryValue);
    
    setFilter('category', isSelected 
      ? current.filter(c => c !== categoryValue)
      : [...current, categoryValue]
    );
  };
  
  return (
    <div>
      {categories.map(category => (
        <button
          key={category.value}
          onClick={() => toggleCategory(category.value)}
          className={filters.category?.includes(category.value) ? 'selected' : ''}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};
```

### Manual Refresh

```typescript
const { refetch } = useCategories();

// Refresh categories (useful for admin interfaces)
const handleRefresh = () => {
  refetch();
};
```

## Backend API Integration

### Endpoints Used

- **GET `/api/category/list`**: Fetch all categories
- **GET `/api/category/:id/products`**: Fetch category products with filters

### Expected Response Format

```typescript
// Categories list response
{
  categories: [
    {
      id: "category-id",
      name: "Category Name",
      slug: "category-slug",
      image_url?: "https://...",
      parent_id?: "parent-id"
    }
  ]
}
```

## Error Handling

The integration includes comprehensive error handling:

1. **Network errors**: Caught and displayed to user
2. **API errors**: HTTP status codes handled appropriately
3. **Fallback data**: Static categories used when backend is unavailable
4. **Retry mechanism**: Users can retry failed requests

## Performance Considerations

1. **Smart fetching**: Only fetches when needed
2. **Caching**: Categories cached in Zustand store
3. **Selective re-renders**: Granular selectors prevent unnecessary updates
4. **Loading states**: Skeleton UI prevents layout shifts

## Testing

To test the integration:

1. **Import the example component**:
   ```typescript
   import CategoriesExample from '@/components/CategoriesExample';
   ```

2. **Add to your page**:
   ```typescript
   <CategoriesExample />
   ```

3. **Verify functionality**:
   - Categories load from backend
   - Loading states work correctly
   - Error handling displays properly
   - Category selection updates filters

## Migration from Static Categories

If you were using static categories before:

1. **No breaking changes**: Static categories remain as fallback
2. **Gradual migration**: Categories will automatically switch to backend data
3. **Same interface**: All existing category-related code continues to work

## Best Practices

1. **Always handle loading states**: Provide skeleton UI during loading
2. **Handle errors gracefully**: Show error messages with retry options
3. **Use the custom hook**: Prefer `useCategories()` over direct store access
4. **Optimize selectors**: Use specific selectors to prevent unnecessary re-renders
5. **Test offline behavior**: Ensure fallback categories work when backend is down

## Future Enhancements

Potential improvements for the future:

1. **Category hierarchies**: Support for parent/child category relationships
2. **Category images**: Display category images in filters
3. **Category counts**: Show product counts per category
4. **Real-time updates**: WebSocket integration for live category updates
5. **Caching strategies**: Implement more sophisticated caching (localStorage, etc.)

