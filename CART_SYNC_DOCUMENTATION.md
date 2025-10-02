# Cart Synchronization Documentation

## Overview

This document describes the comprehensive cart synchronization system implemented between the frontend (localStorage) and backend (MongoDB) for the furniture e-commerce application.

## Architecture

### System Components

1. **Frontend**
   - `CartContext.tsx` - Manages local cart state and localStorage persistence
   - `cart.service.ts` - API service for backend cart operations
   - `useAuth.ts` - Authentication hook with integrated cart sync
   - Local Storage - Browser-based cart persistence

2. **Backend**
   - `cart.controller.ts` - Cart API endpoints and business logic
   - `cart.model.ts` - MongoDB cart schema
   - `cart.router.ts` - Express routes for cart operations

## Features Implemented

### ✅ Local Storage Persistence
- Cart automatically saves to localStorage on every change
- Cart loads from localStorage on page load/refresh
- Survives browser sessions and page refreshes

### ✅ Backend Synchronization
- **Merge Strategy**: Combines local and backend carts on login
- **Full Sync**: Replaces backend cart with local cart
- **Automatic Sync**: Triggers on login and registration
- **Error Resilience**: Cart continues to work even if sync fails

### ✅ Guest to Authenticated Flow
- Guest users can add items to cart (stored in localStorage)
- On login/registration, guest cart merges with backend cart
- No cart items are lost during authentication

## API Endpoints

### Backend Endpoints

#### 1. Merge Cart
**POST** `/api/cart/merge`

Merges local cart items with backend cart. For duplicate items (same product + variant), uses the maximum quantity.

**Request:**
```json
{
  "user_id": "user_mongodb_id",
  "local_items": [
    {
      "product_id": "product_mongodb_id",
      "variant_id": "size-color-finish",
      "quantity": 2,
      "price": 1299
    }
  ]
}
```

**Response:**
```json
{
  "message": "Cart merged successfully",
  "cart": {
    "items": [...],
    "total": 2598,
    "item_count": 1
  }
}
```

#### 2. Sync Cart
**POST** `/api/cart/sync`

Replaces entire backend cart with local cart items.

**Request:**
```json
{
  "user_id": "user_mongodb_id",
  "items": [
    {
      "product_id": "product_mongodb_id",
      "variant_id": "size-color-finish",
      "quantity": 1,
      "price": 1299
    }
  ]
}
```

**Response:**
```json
{
  "message": "Cart synced successfully",
  "cart": {
    "items": [...],
    "total": 1299,
    "item_count": 1
  }
}
```

#### 3. Clear Cart
**DELETE** `/api/cart/clear`

Removes all items from user's cart.

**Request Body:**
```json
{
  "user_id": "user_mongodb_id"
}
```

## Frontend Usage

### Using Cart Context

```typescript
import { useCart } from '@/contexts/CartContext';

function MyComponent() {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    // Sync methods
    mergeWithBackend,
    syncWithBackend,
    isLoading,
    syncError
  } = useCart();

  // Add item to cart
  const handleAddToCart = () => {
    addToCart({
      id: 'product_id',
      cartId: 'unique_cart_id',
      name: 'Product Name',
      image: '/image.jpg',
      price: 1299,
      sku: 'SKU123',
      category: 'Furniture',
      availability: 'in-stock',
      variants: {
        size: 'Large',
        color: 'Blue',
        finish: 'Matte'
      }
    }, 1);
  };

  // Manual sync (usually automatic on login)
  const handleSync = async () => {
    const token = localStorage.getItem('auth-token');
    const user = JSON.parse(localStorage.getItem('auth-user') || '{}');
    
    if (token && user.id) {
      await mergeWithBackend(user.id, token);
    }
  };

  return (
    <div>
      {isLoading && <p>Syncing cart...</p>}
      {syncError && <p>Error: {syncError}</p>}
      <p>Total Items: {getTotalItems()}</p>
      <p>Total Price: ${getTotalPrice()}</p>
    </div>
  );
}
```

### Authentication Flow

Cart sync is automatically triggered during authentication:

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginComponent() {
  const { login, loading, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    // Login automatically triggers cart merge
    const success = await login(email, password);
    
    if (success) {
      // User is logged in
      // Local cart has been merged with backend cart
      console.log('Login successful, cart synced');
    }
  };

  return (
    // Login form JSX
  );
}
```

## Sync Strategy

### Merge Strategy (Recommended for Login)

When a user logs in with items in their local cart:

1. **Load Backend Cart**: Fetch existing cart from backend for the user
2. **Process Local Items**: Iterate through local cart items
3. **Merge Logic**:
   - If item exists in both carts → Use **maximum quantity**
   - If item only in local cart → Add to backend cart
   - If item only in backend cart → Keep in backend cart
4. **Save**: Persist merged cart to backend
5. **Continue**: Local cart continues working as is

**Example:**
```
Local Cart:     Product A (qty: 3), Product B (qty: 2)
Backend Cart:   Product A (qty: 1), Product C (qty: 1)

Merged Result:  Product A (qty: 3), Product B (qty: 2), Product C (qty: 1)
```

### Full Sync Strategy (Alternative)

Replaces backend cart entirely with local cart:

1. **Clear Backend Cart**: Remove all existing items
2. **Upload Local Cart**: Add all local items to backend
3. **Replace**: Backend cart now matches local cart exactly

**Use Case**: When local cart is the definitive source of truth.

## Error Handling

The system is designed to be resilient to errors:

### Frontend Error Handling

```typescript
// Cart operations never throw to the user
try {
  await mergeWithBackend(userId, token);
} catch (error) {
  // Error is logged but doesn't disrupt user experience
  console.error('Cart sync failed:', error);
  // Local cart continues to work
}
```

### Backend Error Handling

- **Invalid Product IDs**: Skips non-existent products
- **Missing Data**: Validates all required fields
- **Database Errors**: Returns proper error responses
- **Network Issues**: Frontend retries or continues with local cart

## Data Flow Diagrams

### Guest User Flow
```
1. User adds items to cart
   ↓
2. Items saved to localStorage
   ↓
3. User continues shopping (all local)
```

### Login Flow
```
1. User logs in
   ↓
2. useAuth.login() called
   ↓
3. Authentication successful
   ↓
4. mergeWithBackend() triggered
   ↓
5. Local cart items sent to backend
   ↓
6. Backend merges with existing cart
   ↓
7. User continues with synced cart
```

### Logout Flow
```
1. User logs out
   ↓
2. Auth state cleared
   ↓
3. Local cart remains (persists in localStorage)
   ↓
4. User can continue as guest
```

## Testing

### Manual Testing Steps

1. **Test Guest Cart**
   - Add items to cart without logging in
   - Verify items persist in localStorage
   - Refresh page, verify items still present

2. **Test Login Sync**
   - Add items to cart as guest
   - Log in
   - Verify cart items still present after login
   - Check backend cart has been updated

3. **Test Cart Merge**
   - Log in to account with existing cart items
   - Add items to cart in another browser/device
   - Log in again, verify both carts are merged

4. **Test Error Resilience**
   - Simulate network error
   - Verify cart still works locally
   - Verify no data loss

### Unit Test Examples

```typescript
// Example test for cart merge
describe('Cart Merge', () => {
  it('should merge local and backend carts correctly', async () => {
    const localItems = [
      { product_id: 'A', quantity: 3 },
      { product_id: 'B', quantity: 2 }
    ];
    
    const backendItems = [
      { product_id: 'A', quantity: 1 },
      { product_id: 'C', quantity: 1 }
    ];
    
    const result = await mergeCart(userId, localItems);
    
    expect(result.items).toContainEqual({ product_id: 'A', quantity: 3 });
    expect(result.items).toContainEqual({ product_id: 'B', quantity: 2 });
    expect(result.items).toContainEqual({ product_id: 'C', quantity: 1 });
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **Debouncing**: Cart syncs are debounced to avoid excessive API calls
2. **Background Sync**: Sync happens asynchronously, doesn't block UI
3. **Error Recovery**: Failed syncs don't interrupt user experience
4. **Caching**: Local cart serves as fast cache

### Best Practices

- **Sync on Login Only**: Don't sync on every cart change (too expensive)
- **Use Local Cart as Source**: Always trust local cart for immediate updates
- **Backend as Backup**: Backend cart is for persistence and cross-device sync
- **Graceful Degradation**: If backend fails, local cart still works

## Security Considerations

1. **Authentication Required**: All backend cart operations require valid token
2. **User Isolation**: Users can only access their own carts
3. **Input Validation**: All cart items validated before saving
4. **Price Verification**: Backend re-verifies prices from product database
5. **SQL Injection Protection**: MongoDB with Mongoose provides built-in protection

## Future Enhancements

### Potential Improvements

1. **Real-time Sync**: Use WebSockets for instant cross-device sync
2. **Conflict Resolution**: More sophisticated merge strategies
3. **Cart History**: Track cart changes over time
4. **Abandoned Cart**: Email reminders for incomplete purchases
5. **Cart Sharing**: Share cart with others
6. **Cart Templates**: Save favorite carts for quick reorder

## Troubleshooting

### Common Issues

**Issue**: Cart items disappear after login
- **Cause**: Sync error or backend cart overwrite
- **Solution**: Check browser console for errors, verify merge endpoint

**Issue**: Cart not syncing
- **Cause**: Network error, auth token expired
- **Solution**: Verify token validity, check network connectivity

**Issue**: Duplicate items in cart
- **Cause**: Variant ID mismatch
- **Solution**: Ensure consistent variant ID format

**Issue**: Price mismatch
- **Cause**: Price changed since item added
- **Solution**: Backend refreshes price from product database

## Support

For issues or questions about cart synchronization:

1. Check browser console for error messages
2. Verify auth token is valid
3. Check network tab for failed API requests
4. Review backend logs for sync errors

## Changelog

### Version 1.0.0 (Current)
- ✅ Local cart with localStorage persistence
- ✅ Backend cart API endpoints
- ✅ Merge cart functionality
- ✅ Full sync functionality
- ✅ Automatic sync on login/registration
- ✅ Error resilience and graceful degradation
- ✅ Comprehensive documentation

---

**Last Updated**: October 2, 2025
**Author**: Development Team
**Status**: Production Ready

