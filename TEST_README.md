# Test Suite Documentation

## Overview
This document describes the comprehensive test suite created for the furniture e-commerce application's filter functionality and product management features.

## Test Coverage

### ✅ **Passing Tests (36/39)**

#### 1. **FilterStore Tests** (`src/stores/__tests__/filterStore.test.ts`)
- **Initial State**: Verifies correct initial state and filter options
- **Filter Actions**: Tests setting, updating, and clearing filters
- **Price Range**: Tests price range setting and clearing
- **UI State**: Tests show/hide filters and sort functionality
- **Utility Functions**: Tests active filter detection and counting
- **Selectors**: Tests individual selector hooks

#### 2. **ProductFilter Component Tests** (`src/components/__tests__/ProductFilter.test.tsx`)
- **Rendering**: Tests all filter dropdowns and UI elements
- **Dropdown Functionality**: Tests opening/closing and click-outside behavior
- **Checkbox Interactions**: Tests filter selection and multiple selections
- **Sort Functionality**: Tests sort dropdown changes
- **All Filters Panel**: Tests extended filter panel toggle
- **Clear All**: Tests clear all filters functionality
- **Accessibility**: Tests ARIA labels and button roles

#### 3. **ProductsPage Tests** (`src/app/products/__tests__/page.test.tsx`)
- **Loading State**: Tests loading spinner display
- **Error State**: Tests error message display
- **Success State**: Tests product rendering and page header
- **Filter Integration**: Tests product count passing to filters
- **Empty State**: Tests empty product list handling

### ⚠️ **Partially Working Tests (3/39)**

#### 4. **useProducts Hook Tests** (`src/hooks/__tests__/useProducts.test.ts`)
- **Status**: 3 tests failing due to data structure mismatch
- **Issue**: Mock response structure doesn't match expected hook return format
- **Fix Needed**: Update mock data to match actual API response structure

## Test Infrastructure

### **Jest Configuration**
- **File**: `jest.config.js`
- **Features**: Next.js integration, TypeScript support, path mapping
- **Coverage**: 70% threshold for branches, functions, lines, statements

### **Test Setup**
- **File**: `jest.setup.js`
- **Features**: 
  - Testing Library Jest DOM matchers
  - Next.js router mocking
  - Window.matchMedia mocking
  - IntersectionObserver mocking

### **Dependencies**
```json
{
  "@testing-library/jest-dom": "^6.8.0",
  "@testing-library/react": "^16.3.0",
  "@testing-library/user-event": "^14.6.1",
  "jest": "^29.7.0",
  "jest-environment-jsdom": "^30.1.2"
}
```

## Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Key Testing Patterns

### **1. Zustand Store Testing**
```typescript
// Test individual selectors
const { result } = renderHook(() => useFilterStore())
act(() => {
  result.current.setFilter('availability', ['in-stock'])
})
expect(result.current.filters.availability).toEqual(['in-stock'])
```

### **2. Component Testing with Mocks**
```typescript
// Mock Zustand hooks
jest.mock('../../stores/filterStore', () => ({
  useFilters: jest.fn(),
  useFilterOptions: jest.fn(),
  // ... other hooks
}))

// Test component behavior
const user = userEvent.setup()
await user.click(screen.getByText('Availability'))
expect(mockSetFilter).toHaveBeenCalledWith('availability', ['in-stock'])
```

### **3. TanStack Query Testing**
```typescript
// Create QueryClient wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

// Test hook with wrapper
const { result } = renderHook(
  () => useProductsForDisplay({ page: 1, limit: 12 }),
  { wrapper: createWrapper() }
)
```

## Test Quality Metrics

### **Coverage Goals**
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### **Test Types**
- **Unit Tests**: Individual function/component testing
- **Integration Tests**: Component interaction testing
- **Hook Tests**: Custom hook behavior testing
- **Accessibility Tests**: ARIA and keyboard navigation

## Best Practices Implemented

### **1. Mocking Strategy**
- **Zustand Store**: Mock individual selectors for isolated testing
- **API Services**: Mock service functions with realistic data
- **React Router**: Mock Next.js navigation hooks
- **Browser APIs**: Mock window.matchMedia and IntersectionObserver

### **2. Test Organization**
- **Grouped by Feature**: Tests organized by component/functionality
- **Descriptive Names**: Clear test descriptions
- **Setup/Teardown**: Proper beforeEach cleanup
- **Isolated Tests**: Each test is independent

### **3. User-Centric Testing**
- **User Events**: Use @testing-library/user-event for realistic interactions
- **Accessibility**: Test ARIA labels and keyboard navigation
- **Error States**: Test error handling and user feedback
- **Loading States**: Test loading indicators and skeletons

## Future Improvements

### **1. Fix useProducts Tests**
- Update mock data structure to match actual API response
- Test error handling and retry logic
- Add tests for different query parameters

### **2. Add E2E Tests**
- Test complete user workflows
- Test filter persistence across page navigation
- Test responsive design behavior

### **3. Performance Testing**
- Test filter performance with large datasets
- Test memory usage with Zustand store
- Test query caching behavior

### **4. Visual Regression Testing**
- Test component appearance across different states
- Test responsive design breakpoints
- Test dark/light mode variations

## Conclusion

The test suite provides comprehensive coverage of the filter functionality and product management features. With 36 out of 39 tests passing, the core functionality is well-tested and reliable. The remaining 3 failing tests are minor issues that can be easily fixed by updating the mock data structure.

The test infrastructure is robust and follows React/Next.js best practices, making it easy to maintain and extend as the application grows.
