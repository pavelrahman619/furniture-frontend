# Implementation Plan

- [x] 1. Create admin service with authentication API integration





  - Create `src/services/admin.service.ts` with AdminService class
  - Implement `login()`, `logout()`, `refreshToken()`, `getCurrentAdmin()`, `verifyToken()` methods
  - Add proper TypeScript interfaces for API requests and responses (AdminLoginRequest, AdminLoginResponse, AdminUser, AdminSession)
  - Integrate with existing API configuration patterns from `src/lib/api-config.ts`
  - Add comprehensive error handling for authentication failures, network errors, and token expiration
  - Implement secure token storage utilities with localStorage integration
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 3.2, 3.3, 6.1, 6.2, 6.3_

- [x] 2. Update API configuration for admin endpoints





  - Add admin authentication endpoints to `src/lib/api-config.ts` API_ENDPOINTS configuration
  - Ensure proper endpoint paths match backend routes (`/api/admin/login`, `/api/admin/logout`, `/api/admin/refresh`)
  - Follow existing patterns from cart and auth endpoint configurations
  - _Requirements: 1.2, 3.2, 6.2_
-

- [x] 3. Create admin context for state management




  - Create `src/contexts/AdminContext.tsx` following existing CartContext patterns
  - Implement AdminProvider with authentication state management (admin, isAuthenticated, isLoading)
  - Add login, logout, and refreshSession action methods
  - Implement token persistence and session restoration on app load
  - Add permission checking utilities and session timeout handling
  - Create custom `useAdmin()` hook for consuming admin context
  - _Requirements: 1.3, 2.5, 3.3, 4.4, 6.1, 6.2, 6.4, 6.5_

- [x] 4. Create admin login page





  - Create new page `src/app/admin/login/page.tsx` with dedicated admin login interface
  - Implement login form with email and password fields following existing login page patterns
  - Connect form submission to AdminService.login() method
  - Add form validation for required fields and email format
  - Implement loading states during authentication process
  - Handle login errors with specific error messages for invalid credentials
  - Add redirect to `/admin/products` after successful login
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 5. Implement admin route protection





  - Create `src/components/AdminGuard.tsx` component for protecting admin routes
  - Implement authentication checks and redirect logic for unauthenticated access
  - Add loading states during authentication verification
  - Protect all `/admin/*` routes except `/admin/login` using AdminGuard
  - Update admin pages to use AdminGuard wrapper component
  - Handle token expiration with automatic redirect to login page
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
-

- [x] 6. Update navbar with admin functionality




  - Modify `src/components/Navbar.tsx` to integrate with AdminContext
  - Add conditional rendering for admin menu items when authenticated
  - Implement admin menu items: Products (`/admin/products`), Orders (`/admin/orders`), Content (`/admin/content`)
  - Replace "Sign In" link with admin user info and logout option when authenticated
  - Add logout functionality connected to AdminService.logout() method
  - Ensure navbar updates immediately upon login/logout state changes
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.4, 3.5_
- [x] 7. Integrate admin context with root layout






- [ ] 7. Integrate admin context with root layout

  - Update `src/app/layout.tsx` to include AdminProvider wrapper
  - Ensure AdminProvider is properly positioned in the provider hierarchy
  - Follow existing patterns from CartProvider and ToastProvider integration
  - _Requirements: 2.5, 4.4, 6.1, 6.5_
-

- [x] 8. Update admin products page with authentication


  - Modify `src/app/admin/products/page.tsx` to use AdminGuard protection
  - Integrate with admin authentication state for proper access control
  - Ensure existing ProductService integration works with admin authentication headers
  - Add admin-specific UI elements and functionality indicators
  - Handle authentication errors gracefully with appropriate user feedback



  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
- [x] 9. Add admin service to services index




- [ ] 9. Add admin service to services index

  - Export AdminService and related types from `src/services/index.ts`
  - Ensure proper TypeScript type exports for all admin interfaces
  - Follow existing patterns from other service exports
  - _Requirements: 1.1, 3.1, 4.1, 5.1_

- [ ]* 10. Write unit tests for admin authentication
  - Create test file `src/services/__tests__/admin.service.test.ts`
  - Test all authentication operations with mocked API responses
  - Test error handling scenarios for network failures and invalid credentials
  - Create test file `src/contexts/__tests__/AdminContext.test.tsx`
  - Test admin context state management and authentication flows
  - Test route protection and redirect scenarios
  - _Requirements: 1.2, 1.5, 3.2, 4.2, 6.2_