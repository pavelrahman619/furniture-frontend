# Design Document

## Overview

This design outlines the enhancement of the existing ProductFilter component by adding search functionality and price range inputs. The implementation will extract the relevant patterns from the admin products page and adapt them for the customer interface while maintaining the current visual design and state management approach.

## Architecture

### Current State
- **ProductFilter Component**: Located at `/src/components/ProductFilter.tsx` with dropdown-based filters
- **Filter Store**: Zustand store at `/src/stores/filterStore.ts` managing filter state
- **Products Page**: Uses the ProductFilter component and handles backend integration

### Proposed Changes
- **Enhanced ProductFilter Component**: Add search input and price range inputs to existing component
- **Extended Filter Store**: Add search state management (price range already supported)
- **Fixed Dynamic Filter Options**: Update colors and materials from API response (currently broken)
- **Improved Backend Integration**: Ensure search parameter is properly sent to API

## Components and Interfaces

### Enhanced ProductFilter Component

#### New Props Interface
```typescript
interface FilterProps {
  productCount: number;
  // Existing props remain unchanged
}
```

#### New Internal State
```typescript
// Add to existing component state
const [searchTerm, setSearchTerm] = useState("");
const [priceMin, setPriceMin] = useState("");
const [priceMax, setPriceMax] = useState("");
```

#### Component Structure
```
ProductFilter
├── Search Section (NEW)
│   └── Search Input with icon
├── Main Filter Bar (EXISTING)
│   ├── Availability Dropdown
│   ├── Category Dropdown  
│   ├── Colors Dropdown
│   ├── Materials Dropdown
│   └── All Filters Button
├── Right Side (EXISTING)
│   ├── Product Count
│   └── Sort Dropdown
├── Clear Filters Row (EXISTING)
└── Extended Filters Panel (EXISTING + ENHANCED)
    ├── Availability Section
    ├── Category Section
    └── Price Range Section (NEW)
        ├── Min Price Input
        └── Max Price Input
```

### Filter Store Enhancements

#### New State Properties
```typescript
interface FilterState {
  // Add search to existing filters
  filters: ProductFilters & {
    search?: string; // NEW
  };
  // ... existing properties remain unchanged
}
```

#### New Actions
```typescript
interface FilterActions {
  // Add search-specific actions
  setSearch: (searchTerm: string) => void; // NEW
  // ... existing actions remain unchanged
}
```

#### Fixed Dynamic Filter Options
Currently, the `useInfiniteProductsForDisplay` hook only updates categories from the API response but ignores colors and materials. This needs to be fixed to populate dynamic filter options:

```typescript
// Current (broken) - only updates categories
store.updateFilterOptions({
  categories: filters_available.categories.map(cat => ({
    value: cat.id,
    label: cat.name,
    slug: cat.name.toLowerCase().replace(/\s+/g, '-')
  }))
});

// Fixed - update all available filter options
store.updateFilterOptions({
  categories: filters_available.categories?.map(cat => ({
    value: cat.id,
    label: cat.name,
    slug: cat.name.toLowerCase().replace(/\s+/g, '-')
  })) || [],
  colors: filters_available.colors?.map(color => ({
    value: color,
    label: color
  })) || [],
  materials: filters_available.materials?.map(material => ({
    value: material,
    label: material
  })) || []
});
```

## Data Models

### Search Integration
- **Input**: User types in search field
- **Debouncing**: 300ms delay to prevent excessive API calls
- **API Parameter**: `search` parameter sent to backend
- **State Management**: Stored in filter store and synced with component

### Price Range Integration
- **Input**: Numeric inputs for min/max price
- **Validation**: Ensure min ≤ max, handle empty values
- **API Parameters**: `price_min` and `price_max` (already supported)
- **State Management**: Use existing `price_min`/`price_max` in filter store

## Implementation Details

### Search Input Component
```typescript
// Search section to be added at the top of ProductFilter
<div className="mb-4">
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
    <input
      type="text"
      placeholder="Search products..."
      value={searchTerm}
      onChange={handleSearchChange}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
    />
  </div>
</div>
```

### Price Range Inputs Component
```typescript
// To be added in the Extended Filters Panel
<div>
  <h4 className="text-sm font-medium text-gray-900 mb-2">Price Range</h4>
  <div className="grid grid-cols-2 gap-2">
    <input
      type="number"
      placeholder="Min"
      value={priceMin}
      onChange={handlePriceMinChange}
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
    />
    <input
      type="number"
      placeholder="Max"
      value={priceMax}
      onChange={handlePriceMaxChange}
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
    />
  </div>
</div>
```

### Debounced Search Handler
```typescript
const handleSearchChange = useDebouncedCallback(
  (value: string) => {
    setFilter('search', value ? [value] : []);
  },
  300
);
```

## Error Handling

### Search Input
- **Empty State**: Handle gracefully, clear search filter
- **API Errors**: Display error message if search fails
- **Loading State**: Show loading indicator during search

### Price Range Inputs
- **Invalid Values**: Validate numeric input, show error for invalid ranges
- **Empty Values**: Handle gracefully, clear price filters
- **Range Validation**: Ensure min ≤ max, show warning if invalid

## Testing Strategy

### Unit Tests
- **Search Input**: Test debouncing, state updates, API integration
- **Price Range**: Test validation, state updates, edge cases
- **Filter Store**: Test new search actions and state management

### Integration Tests
- **Component Integration**: Test search and price filters with existing filters
- **API Integration**: Test that search and price parameters are sent correctly
- **User Interactions**: Test combined filter scenarios

### Visual Regression Tests
- **Layout**: Ensure new components don't break existing layout
- **Responsive**: Test on mobile and desktop breakpoints
- **Accessibility**: Ensure proper focus management and screen reader support

## Migration Strategy

### Phase 1: Fix Dynamic Filter Options
1. Update `useInfiniteProductsForDisplay` hook to populate colors and materials from API
2. Test that color and material filters now show real database data
3. Verify existing functionality still works

### Phase 2: Add Search Input
1. Add search state to filter store
2. Add search input to ProductFilter component
3. Implement debounced search handling
4. Test search functionality

### Phase 3: Add Price Range Inputs
1. Add price range inputs to extended filters panel
2. Implement price validation logic
3. Connect to existing price_min/price_max state
4. Test price filtering functionality

### Phase 4: Integration and Testing
1. Test combined search and price filtering with fixed dynamic options
2. Ensure backward compatibility
3. Update documentation
4. Deploy and monitor

## Backward Compatibility

- **Existing Filters**: All current filter functionality remains unchanged
- **API Compatibility**: Uses existing API parameters (`search`, `price_min`, `price_max`)
- **State Management**: Extends existing filter store without breaking changes
- **Component Interface**: ProductFilter props remain the same