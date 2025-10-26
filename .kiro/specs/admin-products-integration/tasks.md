# Implementation Plan

- [x] 1. Create product service with API integration





  - Create `src/services/product.service.ts` with ProductService class
  - Implement `getProducts()`, `getProduct()`, `createProduct()`, `updateProduct()`, `deleteProduct()` methods
  - Implement `getProductStock()` and `updateProductStock()` methods for inventory management
  - Add proper TypeScript interfaces for API requests and responses (Product, CreateProductRequest, UpdateProductRequest, ProductFilters, StockInfo)
  - Integrate with existing API configuration and authentication patterns from `src/lib/api-config.ts`
  - Add comprehensive error handling with specific error types for different failure scenarios
  - git add and commit with message

  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.4, 3.2, 3.4, 4.3, 5.2, 5.3_

- [x] 2. Update API configuration for product endpoints





  - Add product endpoints to `src/lib/api-config.ts` API_ENDPOINTS configuration
  - Ensure proper endpoint paths match backend routes (`/api/products`, `/api/products/:id`, `/api/products/:id/stock`)
  - Follow existing patterns from cart and auth endpoint configurations
  - git add and commit with message
  - _Requirements: 1.1, 2.2, 3.2, 4.3, 5.3_
-

- [x] 3. Replace sample data with API calls in admin products page




  - Update `src/app/admin/products/page.tsx` to use ProductService instead of sample data
  - Replace any hardcoded product data with API fetch calls using TanStack Query patterns
  - Implement product list display with real-time data from `getProducts()` method
  - Add loading states with skeleton components during data fetching
  - Implement error handling with user-friendly error messages and retry mechanisms
  - Maintain existing UI layout and styling while connecting to real data
  - git add and commit with message
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 6.5_
-

- [x] 4. Implement product creation functionality




  - Add product creation form to admin products page or create dedicated creation modal
  - Connect form submission to `ProductService.createProduct()` method
  - Implement form validation for required fields (name, description, price, category)
  - Add loading state on submit button during creation process
  - Display success notification and refresh product list after successful creation
  - Handle creation errors with specific field-level error messages
  - Integrate with existing Cloudinary setup for product image uploads
  - git add and commit with message
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.4, 6.5_

- [x] 5. Create product edit page and functionality







  - Create new page `src/app/admin/products/[id]/edit/page.tsx` following Next.js App Router conventions
  - Implement product data fetching using `ProductService.getProduct()` for form pre-population
  - Create edit form component with all product fields (name, description, price, category, images, stock)
  - Connect form submission to `ProductService.updateProduct()` method
  - Add navigation back to products list after successful update
  - Implement loading states for initial data fetch and form submission
  - Handle update errors with appropriate user feedback
  - git add and commit with message
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.4, 6.5_

- [x] 6. Implement product deletion functionality







  - Add delete button/action to each product in the admin products list
  - Implement confirmation dialog with product details before deletion
  - Connect delete action to `ProductService.deleteProduct()` method
  - Remove deleted product from list immediately after successful API response
  - Display success message after successful deletion
  - Handle deletion errors with appropriate error messages while maintaining product in list
  - Add loading state during deletion process
  - git add and commit with message
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.5_

- [x] 7. Implement stock management functionality







  - Add stock display to product list showing current inventory levels
  - Implement inline stock editing or dedicated stock management interface
  - Connect stock updates to `ProductService.updateProductStock()` method
  - Add validation for stock quantities (non-negative numbers)
  - Display updated stock levels immediately after successful updates
  - Handle stock update errors with appropriate user feedback
  - Add loading indicators during stock update operations
  - git add and commit with message

  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.5_
-

- [-] 8. Add product service to services index




  - Export ProductService and related types from `src/services/index.ts`
  - Ensure proper TypeScript type exports for all product interfaces
  - Follow existing patterns from other service exports
  - git add and commit with message

  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ]* 9. Write unit tests for product service
  - Create test file `src/services/__tests__/product.service.test.ts`
  - Test all CRUD operations with mocked API responses
  - Test error handling scenarios for network failures and validation errors
  - Test data transformation functions between frontend and backend formats
  - _Requirements: 1.1, 2.2, 3.2, 4.3, 5.3, 6.2_