# Design Document

## Overview

The admin products integration feature transforms the existing admin products page from using sample data to a fully functional product management system connected to the backend API. This design leverages the existing Next.js App Router structure, TanStack Query for state management, and follows the established patterns from other integrated features like cart synchronization and order tracking.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Products Page                      │
│                 (/admin/products/page.tsx)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Product Service Layer                        │
│              (src/services/product.service.ts)             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  API Configuration                          │
│               (src/lib/api-config.ts)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Backend API Endpoints                       │
│              (/api/products/*, Express.js)                 │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
Admin Products Page
├── ProductsList Component
│   ├── ProductCard Component
│   │   ├── Stock Management
│   │   ├── Edit Button
│   │   └── Delete Button
│   └── Create Product Button
├── ProductForm Component (Create/Edit)
│   ├── Form Validation
│   ├── Image Upload Integration
│   └── Submit Handling
└── Error/Loading States
    ├── LoadingSpinner
    ├── ErrorMessage
    └── SuccessNotification
```

## Components and Interfaces

### Product Service Layer

The `ProductService` will be created in `src/services/product.service.ts` following the established patterns from `cart.service.ts` and other existing services:

```typescript
interface ProductService {
  // Core CRUD operations
  getProducts(params?: ProductFilters): Promise<ApiResponse<Product[]>>
  getProduct(id: string): Promise<ApiResponse<Product>>
  createProduct(productData: CreateProductRequest): Promise<ApiResponse<Product>>
  updateProduct(id: string, productData: UpdateProductRequest): Promise<ApiResponse<Product>>
  deleteProduct(id: string): Promise<ApiResponse<void>>
  
  // Stock management
  getProductStock(id: string): Promise<ApiResponse<StockInfo>>
  updateProductStock(id: string, stockData: UpdateStockRequest): Promise<ApiResponse<StockInfo>>
}
```

### API Integration Points

Based on the existing `api-config.ts` pattern, new endpoints will be added:

```typescript
// Addition to existing API_ENDPOINTS in api-config.ts
PRODUCTS: {
  LIST: '/products',
  DETAIL: (id: string) => `/products/${id}`,
  CREATE: '/products',
  UPDATE: (id: string) => `/products/${id}`,
  DELETE: (id: string) => `/products/${id}`,
  STOCK: (id: string) => `/products/${id}/stock`,
}
```

### Page Structure Updates

#### Main Products Page (`/admin/products/page.tsx`)
- Replace sample data loading with TanStack Query hooks
- Implement product list display with real-time data
- Add create product functionality
- Integrate loading states and error handling

#### Product Edit Page (`/admin/products/[id]/edit/page.tsx`)
- New page following Next.js App Router conventions
- Pre-populate form with existing product data
- Handle form submission with API integration
- Implement navigation back to products list

### Custom Hooks Integration

Following the pattern established in `useProducts.ts`, create admin-specific hooks:

```typescript
// Custom hooks for admin product operations
export const useAdminProducts = () => {
  // TanStack Query integration for product list
}

export const useProductMutations = () => {
  // Mutations for create, update, delete operations
}

export const useProductStock = (productId: string) => {
  // Stock management operations
}
```

## Data Models

### TypeScript Interfaces

Based on the backend API structure and existing type patterns:

```typescript
interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  stock: number
  status: 'active' | 'inactive' | 'discontinued'
  createdAt: string
  updatedAt: string
}

interface CreateProductRequest {
  name: string
  description: string
  price: number
  category: string
  images: string[]
  stock: number
}

interface UpdateProductRequest extends Partial<CreateProductRequest> {}

interface ProductFilters {
  category?: string
  status?: string
  page?: number
  limit?: number
  search?: string
}

interface StockInfo {
  productId: string
  currentStock: number
  reservedStock: number
  availableStock: number
}
```

## Error Handling

### Error Categories and Responses

1. **Network Errors**: Connection failures, timeouts
   - Display retry mechanism with exponential backoff
   - Maintain form state during retry attempts

2. **Validation Errors**: Invalid product data, missing required fields
   - Show field-specific error messages
   - Highlight problematic form fields
   - Prevent form submission until resolved

3. **Authorization Errors**: Insufficient permissions
   - Redirect to login if token expired
   - Display permission denied message for insufficient access

4. **Server Errors**: Backend processing failures
   - Display generic error message with support contact
   - Log detailed error information for debugging

### Error UI Components

Reuse existing error handling components from other integrated features:
- `ErrorBoundary.tsx` for component-level error catching
- `ErrorMessage.tsx` for user-friendly error display
- Toast notifications for operation feedback

## Testing Strategy

### Integration Testing Focus

1. **End-to-end Workflows**
   - Complete product management workflows
   - API integration with real backend endpoints
   - Error recovery scenarios

## Performance Considerations

### Optimization Strategies

1. **TanStack Query Caching**
   - Implement proper cache invalidation on mutations
   - Use optimistic updates for better UX
   - Configure appropriate stale times for product data

2. **Image Handling**
   - Integrate with existing Cloudinary setup
   - Implement image optimization and lazy loading
   - Handle multiple image uploads efficiently

3. **Pagination and Filtering**
   - Server-side pagination for large product catalogs
   - Debounced search functionality
   - Efficient filtering with query parameter management

## Security Considerations

### Authentication and Authorization

1. **Admin Access Control**
   - Verify admin permissions before allowing product operations
   - Implement role-based access control (RBAC)
   - Secure API endpoints with proper authentication

2. **Data Validation**
   - Client-side validation for immediate feedback
   - Server-side validation for security
   - Sanitize user inputs to prevent XSS attacks

3. **File Upload Security**
   - Validate image file types and sizes
   - Use Cloudinary's security features
   - Implement proper error handling for upload failures