# Cart Sync Quick Start Guide

## Quick Overview

Cart synchronization is now automatically enabled! When users log in, their local cart (from localStorage) merges with their backend cart.

## Key Features

✅ **Automatic Sync on Login** - No manual intervention needed  
✅ **Guest Cart Preservation** - Items added before login are kept  
✅ **Merge Strategy** - Combines local + backend carts (uses max quantity for duplicates)  
✅ **Error Resilient** - Cart works even if sync fails  
✅ **Cross-Device** - Backend cart available on all devices

## How It Works

```
Guest User → Adds items to cart → Stored in localStorage
     ↓
User Logs In → Cart merges with backend → Both carts combined
     ↓
User Continues Shopping → All changes saved locally + synced to backend
```

## For Developers

### Using the Cart

```typescript
import { useCart } from '@/contexts/CartContext';

function MyComponent() {
  const { 
    cartItems,           // Current cart items
    addToCart,           // Add item to cart
    removeFromCart,      // Remove item
    updateQuantity,      // Update item quantity
    clearCart,           // Clear all items
    getTotalItems,       // Get total item count
    getTotalPrice,       // Get total price
    mergeWithBackend,    // Manual merge (auto on login)
    syncWithBackend,     // Manual full sync
    isLoading,           // Sync in progress?
    syncError            // Sync error message
  } = useCart();
}
```

### Add Item Example

```typescript
const handleAddToCart = () => {
  addToCart({
    id: 'product_mongodb_id',
    cartId: 'unique_cart_identifier',
    name: 'Luxury Sofa',
    image: '/images/sofa.jpg',
    price: 2999,
    sku: 'SOF-001',
    category: 'Living Room',
    availability: 'in-stock',
    variants: {
      size: 'Large',
      color: 'Navy Blue',
      finish: 'Velvet'
    }
  }, 1); // quantity
};
```

## Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/cart` | GET | Get user's cart |
| `/api/cart/add` | POST | Add item to cart |
| `/api/cart/update` | PUT | Update item quantity |
| `/api/cart/remove` | DELETE | Remove item |
| `/api/cart/clear` | DELETE | Clear all items |
| `/api/cart/merge` | POST | Merge local with backend |
| `/api/cart/sync` | POST | Full sync (replace backend) |

## Configuration

No configuration needed! Cart sync is automatically enabled when:
- CartProvider wraps your app (already done in layout.tsx)
- User logs in via useAuth hook

## Testing

### Test Guest Cart
1. Open app without logging in
2. Add items to cart
3. Refresh page → items should persist

### Test Login Sync
1. Add items as guest
2. Log in
3. Check cart → guest items should still be there

### Test Cross-Device (requires backend)
1. Log in on Device A, add items
2. Log in on Device B
3. Check cart → should have items from Device A

## Troubleshooting

**Q: Cart items disappeared after login**  
A: Check browser console for sync errors. Verify backend is running.

**Q: Sync is slow**  
A: Sync happens in background. Local cart updates immediately.

**Q: Getting sync errors**  
A: Cart will continue to work locally even if backend sync fails.

**Q: Need to force a sync**  
A: Use `mergeWithBackend(userId, token)` or `syncWithBackend(userId, token)` manually.

## Implementation Status

✅ **Backend**
- Merge cart endpoint
- Sync cart endpoint
- Clear cart endpoint
- Error handling
- Input validation

✅ **Frontend**
- CartContext with sync methods
- Auto-sync on login/register
- Error resilience
- localStorage persistence

✅ **Integration**
- useAuth hook integration
- Automatic merge on login
- Automatic merge on registration
- Error logging

## Need More Details?

See **CART_SYNC_DOCUMENTATION.md** for comprehensive documentation including:
- Architecture diagrams
- API specifications
- Error handling strategies
- Performance considerations
- Security details
- Testing guides

---

**Ready to Use!** Cart sync is production-ready and automatically enabled.

