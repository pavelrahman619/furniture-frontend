# Implementation Plan

- [x] 1. Create content service with API integration





  - Create `src/services/content.service.ts` with API methods for banner and sale section endpoints
  - Implement data transformation functions to convert between frontend and backend data structures
  - Add proper TypeScript interfaces for API requests and responses
  - Integrate with existing API configuration and authentication patterns
  - Add Cloudinary URL validation for image fields
  - _Requirements: 1.1, 1.2_

- [x] 2. Configure and integrate Cloudinary into the project





  - Install Cloudinary SDK (`npm install cloudinary @cloudinary/react @cloudinary/url-gen`)
  - Create Cloudinary configuration file `src/lib/cloudinary-config.ts`
  - Add Cloudinary environment variables to `.env.local` (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
  - Create image upload utility functions for admin content management
  - Add image upload component for background image selection in admin panel
  - _Requirements: 1.1, 1.2_

- [ ] 3. Update API configuration for content endpoints
  - Add content endpoints to `src/lib/api-config.ts` API_ENDPOINTS configuration
  - Ensure proper endpoint paths match Postman collection (`/api/content/banner`, `/api/content/sale-section`)
  - _Requirements: 1.1, 1.2_

- [ ] 4. Replace localStorage with API calls in admin content page
  - Update `src/app/admin/content/page.tsx` to use content service instead of localStorage
  - Replace `useEffect` localStorage loading with API fetch calls
  - Replace `handleSave` localStorage operations with API PUT calls
  - Maintain existing component state structure and UI behavior
  - Ensure Cloudinary image URLs are properly handled in image inputs
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5. Add loading states and error handling
  - Implement loading indicators for initial content fetch and save operations
  - Add error state management with user-friendly error messages
  - Implement retry mechanisms for failed API operations
  - Add success notifications for completed operations
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 6. Add content service to services index
  - Export content service and types from `src/services/index.ts`
  - Ensure proper TypeScript type exports for content interfaces
  - _Requirements: 1.1_

- [ ]* 7. Write unit tests for content service
  - Create test file for content service API integration
  - Test data transformation functions
  - Test error handling scenarios
  - _Requirements: 1.1, 2.3_