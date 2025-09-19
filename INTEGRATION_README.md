# Furniture E-commerce Frontend - TanStack Query Integration

This document describes the TanStack Query integration for the furniture e-commerce frontend application.

## Features Implemented

### 🚀 TanStack Query Integration
- **Query Provider**: Configured with optimal defaults for caching and error handling
- **Custom Hooks**: Modular hooks for different product operations
- **Error Handling**: Comprehensive error boundary and user-friendly error messages
- **Loading States**: Skeleton loaders and spinners for better UX

### 📊 Product Management
- **Dynamic Product Fetching**: Real-time data from backend API
- **Advanced Filtering**: Server-side and client-side filtering
- **Pagination Support**: Infinite scroll capability
- **Search Functionality**: Integrated product search
- **Stock Management**: Real-time stock status display

### 🛠 Architecture
- **Modular Design**: Separated concerns with hooks, services, and components
- **Type Safety**: Full TypeScript integration with backend models
- **Error Boundaries**: Graceful error handling at component level
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## File Structure

```
src/
├── providers/
│   └── QueryProvider.tsx          # TanStack Query provider configuration
├── hooks/
│   └── useProducts.ts             # Custom product hooks
├── services/
│   └── product.service.ts         # API service layer
├── types/
│   └── product.types.ts           # TypeScript type definitions
├── components/
│   ├── ErrorBoundary.tsx          # Error boundary component
│   ├── ErrorMessage.tsx           # Error display component
│   ├── LoadingSpinner.tsx         # Loading spinner component
│   ├── ProductCard.tsx            # Enhanced product card
│   ├── ProductFilter.tsx          # Advanced filtering component
│   └── ProductGrid.tsx            # Product grid layout
├── lib/
│   ├── api-config.ts              # API configuration
│   ├── api-service.ts             # Core API service
│   └── error-utils.ts             # Error handling utilities
└── app/
    └── products/
        └── page.tsx               # Main products page
```

## Environment Setup

Create a `.env.local` file in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_VERSION=api

# Socket Configuration (if using real-time features)
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080

# Environment
NODE_ENV=development

# Optional: Enable React Query DevTools
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
```

## Usage Examples

### Using Product Hooks

```tsx
import { useProductsForDisplay, useProduct, useProductSearch } from '@/hooks/useProducts';

// Fetch products with filters
const { data: products, isLoading, error } = useProductsForDisplay({
  page: 1,
  limit: 12,
  category: 'furniture',
  price_min: 100,
  price_max: 1000
});

// Fetch single product
const { data: product } = useProduct('product-id');

// Search products
const { data: searchResults } = useProductSearch('wooden table', {
  category: 'furniture'
});
```

### Error Handling

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorMessage } from '@/components/ErrorMessage';

// Component-level error boundary
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Manual error display
<ErrorMessage
  title="Failed to load products"
  message={error.message}
  onRetry={() => refetch()}
/>
```

## API Integration

### Backend Endpoints
- `GET /api/product` - Get products with filtering and pagination
- `GET /api/product/:id` - Get single product
- `GET /api/product/search` - Search products
- `GET /api/product/:id/stock` - Get product stock information

### Query Keys
The application uses a structured query key system:

```typescript
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (params) => [...productKeys.lists(), params],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
  search: (query, filters) => [...productKeys.all, 'search', query, filters],
};
```

## Performance Optimizations

1. **Intelligent Caching**: 5-minute stale time for product lists, 10 minutes for individual products
2. **Background Refetching**: Automatic updates when window regains focus
3. **Retry Logic**: Smart retry with exponential backoff
4. **Prefetching**: Product prefetching on hover (can be implemented)
5. **Pagination**: Infinite scroll support for large product catalogs

## Error Handling Strategy

1. **Network Errors**: Automatic retry with backoff
2. **4xx Errors**: No retry, user-friendly messages
3. **5xx Errors**: Retry up to 3 times
4. **Component Errors**: Error boundaries prevent crashes
5. **User Feedback**: Loading states and error messages

## Filtering & Search

### Server-side Filters (Backend)
- Category filtering
- Price range filtering
- Color filtering
- Material filtering
- Text search

### Client-side Filters (Frontend)
- Availability status
- Product features
- Shape filtering

## Development Tools

- **React Query DevTools**: Available in development mode
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Error Logging**: Development-only error logging

## Best Practices

1. **Query Keys**: Use structured, consistent query keys
2. **Error Handling**: Always handle loading and error states
3. **Type Safety**: Leverage TypeScript for API contracts
4. **Caching**: Configure appropriate stale times
5. **User Experience**: Show loading states and provide retry options

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for your frontend URL
2. **Network Errors**: Check if backend server is running
3. **Type Errors**: Verify backend API response matches TypeScript types
4. **Caching Issues**: Use React Query DevTools to inspect cache state

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` and check browser console for detailed error information.

## Future Enhancements

1. **Infinite Scrolling**: Implement infinite product loading
2. **Real-time Updates**: WebSocket integration for stock updates
3. **Optimistic Updates**: For cart and wishlist operations
4. **Background Sync**: Sync data when connection is restored
5. **Advanced Caching**: Implement cache persistence across sessions
