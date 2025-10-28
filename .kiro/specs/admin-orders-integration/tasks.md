# Implementation Plan

- [] 1. Create API service methods for orders in src/services/order.service.ts
  - Add method to fetch orders list with filtering (page, limit, status, customer, date_from, date_to)
  - Ensure existing updateOrderStatus method works with backend API
  - Add data transformation to match frontend Order interface
  - _Requirements: 1.1, 1.2, 3.1, 5.1_

- [] 2. Replace sample data in /admin/orders/page.tsx with API calls
  - Remove sample orders array and replace with API calls using React Query
  - Update component to handle loading and error states
  - Keep existing filtering UI but connect to backend parameters
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 5.2_

- [] 3. Connect order details page to GET /api/orders/:id
  - Update order details page to fetch real data from backend
  - Handle cases where order structure differs from sample data
  - Add loading and error handling for order details
  - _Requirements: 2.1, 2.2, 2.4, 4.1_

- [ ] 4. Connect status dropdown to PUT /api/orders/:id/status
  - Integrate existing status dropdown with backend API
  - Add loading state during status updates
  - Show success/error feedback for status changes
  - _Requirements: 3.1, 3.2, 3.3, 4.2_

- [ ] 5. Add loading states and error handling
  - Add loading indicators for data fetching and status updates
  - Implement error messages with retry functionality
  - Handle network errors and API failures gracefully
  - _Requirements: 4.1, 4.2, 4.3, 4.4_