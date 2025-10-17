# Implementation Plan

- [x] 1. Create delivery service layer
  - Create `src/services/delivery.service.ts` with DeliveryService class
  - Implement `validateAddress()` method calling `/delivery/validate-address` endpoint
  - Implement `calculateDeliveryCost()` method calling `/delivery/calculate-cost` endpoint
  - Add proper TypeScript interfaces for request/response data
  - Include error handling with retry logic for network failures
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 1.1 Write basic service tests
  - Create simple test for DeliveryService.validateAddress method
  - Mock API responses and verify correct data transformation
  - _Requirements: 6.1, 6.2_

- [x] 2. Add delivery zone notice to checkout page
  - Update `src/app/checkout/page.tsx` to include delivery notice banner
  - Add prominent notice "🚚 We currently deliver only to Los Angeles, CA"
  - Include "Free delivery for orders over $1,000 within 5-10 miles" message
  - Style as blue/gray info banner positioned at top of checkout form
  - Ensure responsive design for mobile devices
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Implement checkout address validation
  - Modify `handleContinueToPayment` function in checkout page
  - Call DeliveryService.validateAddress when form is submitted
  - Show loading state on submit button during validation
  - Display success message with distance if address is valid
  - Show error message and highlight address fields if invalid
  - Prevent order submission if address validation fails
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Add dynamic delivery cost calculation
  - Update checkout page to call DeliveryService.calculateDeliveryCost after successful validation
  - Replace hardcoded `shipping = 0` with dynamic delivery cost
  - Update order summary sidebar to show calculated delivery cost
  - Display "Free Delivery! Your order qualifies" message when applicable
  - Update total calculation to include delivery cost
  - Show updated order summary before proceeding to payment
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.1 Add real-time shipping estimation to checkout (pre-submit)
  - Calculate shipping estimate when ZIP code is entered (primary trigger)
  - Show estimated shipping in order summary before submission
  - Update estimate when ZIP code changes (debounced to limit API calls)
  - Display "Free Delivery! Your order qualifies" when applicable
  - Show "Delivery not available for this location" for invalid ZIP codes
  - Show fallback estimate only for network/API errors (not location errors)
  - _Notes_: UX enhancement beyond validation-on-submit