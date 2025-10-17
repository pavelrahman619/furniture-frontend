# Design Document

## Overview

The delivery zone management system will provide customers with clear delivery information, validate addresses during checkout, and calculate accurate delivery costs. The system follows a validation-on-submit approach to minimize API calls while ensuring accurate delivery information before order processing.

## Architecture

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Components                       │
├─────────────────────────────────────────────────────────────┤
│  CheckoutPage           │  CartPage                         │
│  - Delivery Notice      │  - Delivery Estimator            │
│  - Address Validation   │  - ZIP Code Check                │
│  - Cost Display         │  - Cost Preview                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│  DeliveryService                                            │
│  - validateAddress()                                        │
│  - calculateDeliveryCost()                                  │
│  - Error handling & retry logic                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend APIs                             │
├─────────────────────────────────────────────────────────────┤
│  POST /delivery/validate-address                            │
│  POST /delivery/calculate-cost                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Checkout Process**: User fills form → submits → validation → cost calculation → order processing
2. **Cart Estimation**: User enters ZIP → validation → cost preview → continue shopping
3. **Error Handling**: API failure → retry logic → fallback messaging → user guidance

## Components and Interfaces

### DeliveryService Class

```typescript
interface AddressData {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

interface ValidationResponse {
  isValid: boolean;
  distance_miles: number;
  message: string;
  within_delivery_zone: boolean;
}

interface CostCalculationResponse {
  delivery_cost: number;
  is_free_delivery: boolean;
  distance_miles: number;
  message: string;
}

class DeliveryService {
  static async validateAddress(address: AddressData): Promise<ValidationResponse>
  static async calculateDeliveryCost(address: AddressData, orderTotal: number): Promise<CostCalculationResponse>
}
```

### UI Components

#### Delivery Notice Component
- **Location**: Top of checkout form
- **Content**: Static delivery zone information
- **Styling**: Blue/gray info banner with truck icon
- **Responsive**: Mobile-friendly layout

#### Address Validation Feedback
- **Trigger**: Form submission
- **Success State**: Green checkmark with distance info
- **Error State**: Red warning with clear message
- **Loading State**: Spinner on submit button

#### Dynamic Cost Display
- **Location**: Order summary sidebar
- **Updates**: After successful validation
- **Free Delivery**: Special messaging for qualifying orders
- **Fallback**: Default cost if API fails

#### Cart Delivery Estimator
- **Location**: Below cart items
- **Input**: ZIP code field with validation
- **Output**: Cost estimate and delivery eligibility
- **Progressive Enhancement**: Works without JavaScript

## Data Models

### Address Validation Request
```typescript
interface AddressValidationRequest {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}
```

### Cost Calculation Request
```typescript
interface CostCalculationRequest {
  address: AddressData;
  order_total: number;
  items_count?: number;
}
```

### Delivery Information
```typescript
interface DeliveryInfo {
  cost: number;
  is_free: boolean;
  distance_miles: number;
  estimated_days: string;
  zone: 'within' | 'outside';
}
```

### Order Integration
```typescript
interface OrderDataWithDelivery extends CreateOrderData {
  delivery_cost: number;
  distance_miles: number;
  delivery_zone_validated: boolean;
}
```

## Error Handling

### Error Categories

1. **Network Errors**
   - Connection timeout
   - Server unavailable
   - DNS resolution failure

2. **Validation Errors**
   - Invalid address format
   - Address outside delivery zone
   - Incomplete address data

3. **Business Logic Errors**
   - Cost calculation failure
   - Distance service unavailable
   - Rate limiting exceeded

### Error Handling Strategy

```typescript
interface DeliveryError {
  type: 'network' | 'validation' | 'business';
  code: string;
  message: string;
  retryable: boolean;
}

class ErrorHandler {
  static handleDeliveryError(error: DeliveryError): {
    userMessage: string;
    shouldRetry: boolean;
    fallbackAction?: string;
  }
}
```

### Retry Logic
- **Network errors**: 2 automatic retries with exponential backoff
- **Validation errors**: No retry, immediate user feedback
- **Rate limiting**: Exponential backoff with user notification

### Fallback Strategies
- **API unavailable**: Show estimated cost based on ZIP code
- **Validation failure**: Allow order with manual review flag
- **Cost calculation failure**: Use default shipping rates

## Testing Strategy

### Basic Testing
- **DeliveryService validation**: Simple test to verify address validation returns expected response format
- **Component rendering**: Basic test to ensure delivery notice displays correctly

## Implementation Phases

### Phase 1: Core Service Layer
- Create DeliveryService class
- Implement API integration
- Add error handling and retry logic
- Unit tests for service methods

### Phase 2: Checkout Integration
- Add delivery notice to checkout page
- Implement validation on form submission
- Update order summary with dynamic costs
- Integration tests for checkout flow

### Phase 3: Cart Enhancement
- Add delivery estimator to cart page
- Implement ZIP code validation
- Show cost preview and eligibility
- Component tests for cart features

### Phase 4: Error Handling & Polish
- Comprehensive error handling
- User-friendly error messages
- Fallback strategies
- Performance optimization

## Security Considerations

- **Input Validation**: Sanitize all address inputs
- **Rate Limiting**: Implement client-side throttling
- **Error Information**: Don't expose internal system details
- **API Keys**: Secure delivery service credentials

## Performance Considerations

- **Caching**: Cache validation results for repeated addresses
- **Debouncing**: Prevent rapid API calls during typing
- **Lazy Loading**: Load delivery service only when needed
- **Compression**: Minimize API payload sizes

## Accessibility

- **Screen Readers**: Proper ARIA labels for delivery information
- **Keyboard Navigation**: All interactive elements accessible
- **Color Contrast**: Error states meet WCAG guidelines
- **Focus Management**: Clear focus indicators for form validation