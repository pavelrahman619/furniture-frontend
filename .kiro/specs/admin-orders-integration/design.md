# Design Document

## Overview

The Admin Orders Integration design focuses on replacing the current sample data implementation with real backend API integration. The design maintains the existing UI/UX while adding robust data fetching, error handling, and loading states. The integration leverages the existing OrderService and extends it with admin-specific functionality.

## Architecture

### Component Architecture
```
AdminOrdersPage
├── OrdersTable (with real data)
├── OrderFilters (with API-driven filtering)
├── LoadingStates (skeleton loaders)
├── ErrorBoundary (error handling)
└── StatusUpdateDropdown (with API integration)
```

### Data Flow
```
UI Component → OrderService → Backend API → Response Processing → State Update → UI Render
```

### Service Layer Enhancement
The existing `OrderService` will be extended with admin-specific methods:
- `getOrdersForAdmin()` - Enhanced orders list with admin filters
- `updateOrderStatus()` - Already exists, needs integration
- `getOrderDetails()` - Enhanced order details for admin view

## Components and Interfaces

### Enhanced OrderService Methods

```typescript
// Extended interface for admin order listing
interface AdminOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  customer?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}

// Admin-specific order response
interface AdminOrderResponse {
  _id: string;
  orderNumber: string;
  customer_email: string;
  customer_phone?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  shipping_address: Address;
  timeline: TimelineEntry[];
}
```

### State Management Strategy

```typescript
// React Query for server state
const useOrders = (params: AdminOrdersParams) => {
  return useQuery({
    queryKey: ['admin-orders', params],
    queryFn: () => OrderService.getOrdersForAdmin(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};

// Local state for UI interactions
const [filters, setFilters] = useState<AdminOrdersParams>({});
const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
```

### Loading States Design

1. **Initial Load**: Full-page skeleton loader
2. **Filter Changes**: Table overlay with spinner
3. **Status Updates**: Inline loading on dropdown
4. **Pagination**: Loading indicator at bottom

### Error Handling Strategy

1. **Network Errors**: Retry button with exponential backoff
2. **API Errors**: Toast notifications with specific error messages
3. **Validation Errors**: Inline form validation
4. **Fallback UI**: Graceful degradation to cached data when possible

## Data Models

### Order Status Mapping
```typescript
// Backend status → Frontend display mapping
const statusMapping = {
  'pending': { label: 'Pending', icon: Clock, color: 'yellow' },
  'processing': { label: 'Processing', icon: Package, color: 'blue' },
  'shipped': { label: 'Shipped', icon: Truck, color: 'purple' },
  'delivered': { label: 'Delivered', icon: CheckCircle, color: 'green' },
  'cancelled': { label: 'Cancelled', icon: XCircle, color: 'red' },
};
```

### Data Transformation
```typescript
// Transform backend order to frontend format
const transformOrder = (backendOrder: BackendOrder): FrontendOrder => ({
  id: backendOrder._id,
  orderNumber: backendOrder.order_number || `ORD-${backendOrder._id.slice(-6)}`,
  customerName: backendOrder.customer_name || 'Guest Customer',
  customerEmail: backendOrder.customer_email,
  total: backendOrder.total,
  status: backendOrder.status,
  items: backendOrder.items,
  orderDate: backendOrder.created_at,
  estimatedDelivery: backendOrder.estimated_delivery,
  shippingAddress: formatAddress(backendOrder.shipping_address),
});
```

## Error Handling

### Error Types and Responses

1. **Network Timeout**: Show retry button with "Connection timeout" message
2. **Server Error (5xx)**: Display "Server temporarily unavailable" with retry
3. **Not Found (404)**: Show "Order not found" message
4. **Unauthorized (401)**: Redirect to admin login
5. **Validation Error (400)**: Display specific field errors

### Error Recovery Mechanisms

```typescript
// Retry logic with exponential backoff
const useRetryableQuery = (queryFn: () => Promise<any>, maxRetries = 3) => {
  const [retryCount, setRetryCount] = useState(0);
  
  return useQuery({
    queryFn,
    retry: (failureCount, error) => {
      if (failureCount < maxRetries && isRetryableError(error)) {
        setRetryCount(failureCount + 1);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

## Testing Strategy

### Unit Testing Focus
- OrderService method calls with correct parameters
- Data transformation functions
- Error handling logic
- Status update functionality

### Integration Testing
- API endpoint integration
- Error boundary behavior
- Loading state transitions
- Filter and search functionality

### Manual Testing Scenarios
1. Load orders page with various filter combinations
2. Update order status and verify backend sync
3. Test error scenarios (network offline, server errors)
4. Verify pagination and infinite scroll behavior
5. Test search functionality with different queries

## Performance Considerations

### Optimization Strategies
1. **React Query Caching**: Cache order data for 30 seconds
2. **Debounced Search**: 300ms delay for search input
3. **Virtual Scrolling**: For large order lists (if needed)
4. **Optimistic Updates**: Immediate UI updates for status changes
5. **Background Refetch**: Refresh data when tab becomes active

### Memory Management
- Limit cached queries to prevent memory leaks
- Clean up subscriptions and timers
- Use React.memo for expensive components

## Security Considerations

### Authentication
- Verify admin token on each API request
- Handle token expiration gracefully
- Redirect to login on authentication failures

### Data Validation
- Validate order status values before sending to API
- Sanitize search inputs to prevent injection
- Verify order ownership for sensitive operations

## Migration Strategy

### Phase 1: Service Layer Integration
1. Extend OrderService with admin methods
2. Add error handling and retry logic
3. Implement data transformation utilities

### Phase 2: UI Integration
1. Replace sample data with API calls
2. Add loading states and error handling
3. Integrate status update functionality

### Phase 3: Enhancement
1. Add advanced filtering capabilities
2. Implement real-time updates (if needed)
3. Add bulk operations support

## Monitoring and Logging

### Error Tracking
- Log API failures with context
- Track user actions for debugging
- Monitor performance metrics

### Analytics
- Track admin usage patterns
- Monitor API response times
- Measure error rates and recovery success