# Frontend Environment Setup Guide

This guide explains how to set up and use environment variables to connect the frontend to the backend API.

## Environment Variables

### Required Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_VERSION=api

# Environment
NODE_ENV=development

# Optional: Socket.IO Configuration (if needed)
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

### Production Variables

For production deployment, update the values:

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com
NEXT_PUBLIC_API_VERSION=api

# Environment
NODE_ENV=production

# Optional: Socket.IO Configuration (if needed)
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
```

## API Configuration

### Core Files

1. **`src/lib/api-config.ts`** - Central API configuration and endpoints
2. **`src/lib/api-service.ts`** - HTTP client service with error handling
3. **`src/services/`** - Domain-specific API services (auth, products, cart, etc.)
4. **`src/hooks/useApi.ts`** - React hook for API calls with loading states
5. **`src/hooks/useAuth.ts`** - Authentication hook with login/logout functionality

### Usage Examples

#### Basic API Call

```typescript
import { ProductService } from '../services';

// Get all products
const products = await ProductService.getProducts();

// Get products with filters
const filteredProducts = await ProductService.getProducts({
  category: 'furniture',
  minPrice: 100,
  maxPrice: 1000,
  page: 1,
  limit: 20
});
```

#### Using the API Hook

```typescript
import { useApi } from '../hooks/useApi';
import { ProductService } from '../services';

function ProductsList() {
  const { data: products, loading, error, execute } = useApi(
    ProductService.getProducts
  );

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {products?.data?.products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

#### Authentication

```typescript
import { useAuth } from '../hooks/useAuth';

function LoginForm() {
  const { login, loading, error } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      // Redirect to dashboard or home page
      router.push('/');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## API Endpoints

All endpoints are configured in `src/lib/api-config.ts`:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-token` - Verify auth token

### Products
- `GET /api/product/list` - Get products list
- `GET /api/product/{id}` - Get single product
- `GET /api/product/search` - Search products
- `GET /api/product/featured` - Get featured products

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove cart item

### Orders
- `POST /api/order/create` - Create new order
- `GET /api/order/list` - Get user's orders
- `GET /api/order/{id}` - Get single order
- `GET /api/order/track/{id}` - Track order

## Testing API Connection

Use the `ApiTest` component to verify the connection:

```typescript
import ApiTest from '../components/ApiTest';

// Add to any page for testing
<ApiTest />
```

## Error Handling

The API service includes comprehensive error handling:

- **Network errors** - Connection issues
- **HTTP errors** - 4xx, 5xx status codes
- **Timeout errors** - Request timeout (10s default)
- **Validation errors** - Invalid data format

Errors are returned as `ApiException` objects with:
- `message`: Human-readable error message
- `status`: HTTP status code
- `data`: Additional error details

## Security

- All authenticated requests include `Authorization: Bearer {token}` header
- Tokens are stored in localStorage
- API calls are made from client-side only (using `'use client'`)
- Environment variables are prefixed with `NEXT_PUBLIC_` for client access

## Development vs Production

The configuration automatically detects the environment:

```typescript
import { isDevelopment, isProduction } from '../lib/api-config';

if (isDevelopment) {
  console.log('Development mode - verbose logging enabled');
}
```

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure backend allows frontend origin
2. **404 errors**: Check API endpoints match backend routes
3. **Authentication errors**: Verify token format and expiration
4. **Environment variables**: Ensure `.env.local` exists and variables are prefixed with `NEXT_PUBLIC_`

### Debug Mode

Set environment variable for debugging:

```env
DEBUG_API=true
```

This will enable console logging of all API requests and responses.

## Next Steps

1. Copy `.env.example` to `.env.local`
2. Update API base URL to match your backend
3. Test connection using the `ApiTest` component
4. Integrate API services into your components
5. Handle loading states and errors appropriately
