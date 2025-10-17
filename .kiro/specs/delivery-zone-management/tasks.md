# Implementation Plan

- [ ] 1. Create delivery service layer


  - Create `src/services/delivery.service.ts` with DeliveryService class
  - Implement `validateAddress()` method calling `/delivery/validate-address` endpoint
  - Implement `calculateDeliveryCost()` method calling `/delivery/calculate-cost` endpoint
  - Add proper TypeScript interfaces for request/response data
  - Include error handling with retry logic for network failures
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 1.1 Write basic service tests



  - Create simple test for DeliveryService.validateAddress method
  - Mock API responses and verify correct data transformation
  - _Requirements: 6.1, 6.2_

- [ ] 2. Add delivery zone notice to checkout page
  - Update `src/app/checkout/page.tsx` to include delivery notice banner
  - Add prominent notice "🚚 We currently deliver only to Los Angeles, CA"
  - Include "Free delivery for orders over $1,000 within 5-10 miles" message
  - Style as blue/gray info banner positioned at top of checkout form
  - Ensure responsive design for mobile devices
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3. Implement checkout address validation
  - Modify `handleContinueToPayment` function in checkout page
  - Call DeliveryService.validateAddress when form is submitted
  - Show loading state on submit button during validation
  - Display success message with distance if address is valid
  - Show error message and highlight address fields if invalid
  - Prevent order submission if address validation fails
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4. Add dynamic delivery cost calculation
  - Update checkout page to call DeliveryService.calculateDeliveryCost after successful validation
  - Replace hardcoded `shipping = 0` with dynamic delivery cost
  - Update order summary sidebar to show calculated delivery cost
  - Display "Free Delivery! Your order qualifies" message when applicable
  - Update total calculation to include delivery cost
  - Show updated order summary before proceeding to payment
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Create cart delivery estimator
  - Update `src/app/cart/page.tsx` to add "Check Delivery" section
  - Add ZIP code input field with validation
  - Create button to trigger delivery availability check
  - Display delivery cost estimate for current cart total
  - Show distance from warehouse and free delivery eligibility
  - Include message about how much more needed for free delivery
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6. Update order submission with delivery data
  - Modify order creation in checkout to include `delivery_cost` field
  - Add `distance_miles` to order data sent to backend
  - Ensure delivery address validation is completed before order submission
  - Update OrderService types to include delivery information
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7. Implement comprehensive error handling
  - Add user-friendly error messages for API failures
  - Implement fallback messaging when distance calculation unavailable
  - Add retry logic for failed delivery service requests
  - Handle network timeouts gracefully
  - Log errors for debugging while showing simple messages to users
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 7.1 Add basic component tests
  - Write simple test to verify delivery notice renders correctly
  - Test that error messages display properly
  - _Requirements: 7.1, 7.2_