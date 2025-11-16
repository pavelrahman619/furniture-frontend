# Design Document

## Overview

The Content Management Integration feature transforms the existing admin content page from localStorage-based storage to API-driven content management. This design focuses on replacing the current localStorage implementation with proper API calls to the backend content endpoints, ensuring data persistence and synchronization across admin sessions.

## Architecture

### Current State
- Admin content page located at `/admin/content/page.tsx`
- Uses localStorage for content persistence
- Manages hero section and sale section content
- No real-time synchronization between admin sessions

### Target State
- Same admin interface with API integration
- Content service layer for API communication
- Real-time content synchronization
- Proper error handling and loading states

## Components and Interfaces

### 1. Content Service Layer

**File:** `src/services/content.service.ts`

```typescript
// Frontend interfaces (current structure)
interface HeroContent {
  backgroundImage: string;
  title: string;
  buttonText: string;
}

interface SaleSectionContent {
  backgroundImage: string;
  title: string;
  buttonText: string;
}

// Backend API interfaces (from Postman collection)
interface BannerContent {
  image_url: string;
  title: string;
  button_text: string;
  button_link: string;
}

interface SaleSection {
  title: string;
  description: string;
  discount_text: string;
  products: string[];
}

interface ContentService {
  // Banner/Hero Section
  getBannerContent(): Promise<BannerContent>;
  updateBannerContent(content: BannerContent): Promise<BannerContent>;
  
  // Sale Section
  getSaleSectionContent(): Promise<SaleSection>;
  updateSaleSectionContent(content: SaleSection): Promise<SaleSection>;
  
  // Data transformation helpers
  transformBannerToHero(banner: BannerContent): HeroContent;
  transformHeroToBanner(hero: HeroContent): BannerContent;
  transformSaleSectionToLocal(saleSection: SaleSection): SaleSectionContent;
  transformLocalToSaleSection(local: SaleSectionContent): SaleSection;
}
```

**API Endpoints (from Postman collection):**
- `GET /api/content/banner` - Fetch hero/banner content
- `PUT /api/content/banner` - Update hero/banner content (requires auth)
- `GET /api/content/sale-section` - Fetch sale section content  
- `PUT /api/content/sale-section` - Update sale section content (requires auth)

### 2. Updated Admin Content Page

**File:** `src/app/admin/content/page.tsx`

**Key Changes:**
- Replace localStorage operations with API calls
- Add loading states for fetch and save operations
- Implement error handling with user feedback
- Add retry mechanisms for failed operations
- Maintain existing UI/UX while adding API integration
- Support Cloudinary image URLs for background images

### 3. API Integration Points

**Initialization:**
- Replace `useEffect` localStorage loading with API fetch
- Handle loading states during initial content fetch
- Provide fallback to default content if API fails

**Content Updates:**
- Replace localStorage save operations with API PUT calls
- Add optimistic updates for better UX
- Implement proper error handling with rollback capability
- Show loading indicators during save operations

## Data Models

### Content Data Structure

```typescript
// Current structure (maintained for compatibility)
interface ContentData {
  hero: HeroContent;
  saleSection: SaleSectionContent;
}

// API Request/Response structures (from Postman collection)
interface BannerApiRequest {
  image_url: string;
  title: string;
  button_text: string;
  button_link: string;
}

interface SaleSectionApiRequest {
  title: string;
  description: string;
  discount_text: string;
  products: string[];
}

// Note: Response structures need to be confirmed with backend team
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

### State Management

```typescript
// Component state structure
interface ContentPageState {
  content: ContentData;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  showPreview: boolean;
}

// Loading states for individual sections
interface LoadingStates {
  hero: {
    loading: boolean;
    saving: boolean;
  };
  saleSection: {
    loading: boolean;
    saving: boolean;
  };
}
```

## Error Handling

### Error Types
1. **Network Errors**: Connection failures, timeouts
2. **API Errors**: Server errors, validation failures
3. **Data Errors**: Invalid response format, missing fields

### Error Handling Strategy
1. **Graceful Degradation**: Show cached/default content if API fails
2. **User Feedback**: Clear error messages with actionable guidance
3. **Retry Mechanisms**: Allow users to retry failed operations
4. **Fallback Behavior**: Maintain functionality even with API issues

### Error UI Components
- Toast notifications for success/error feedback
- Inline error messages for form validation
- Retry buttons for failed operations
- Loading spinners with timeout handling

## Testing Strategy

### Unit Tests
- Content service API integration
- Error handling scenarios
- Data transformation logic
- Loading state management

### Integration Tests
- Admin page API integration
- End-to-end content update flow
- Error recovery scenarios
- Cross-browser compatibility

### API Testing
- Content endpoint validation
- Error response handling
- Network failure simulation
- Authentication integration

## Implementation Approach

### Phase 1: Service Layer
1. Create content service with API integration
2. Implement error handling and retry logic
3. Add TypeScript interfaces and types
4. Write unit tests for service layer

### Phase 2: Admin Page Integration
1. Replace localStorage with service calls
2. Add loading states and error handling
3. Implement optimistic updates
4. Maintain existing UI/UX patterns

### Phase 3: Enhancement
1. Add success/error notifications
2. Implement retry mechanisms
3. Add form validation
4. Optimize performance and caching

## Technical Considerations

### Data Transformation
The backend API structure differs slightly from the current frontend structure:
- Backend uses `image_url` vs frontend `backgroundImage`
- Backend uses `button_text` vs frontend `buttonText`
- Sale section has additional fields (`description`, `discount_text`, `products`) in backend
- Transformation layer needed to maintain frontend compatibility

### API Configuration
- Utilize existing `API_CONFIG` and `buildApiUrl` utilities
- Leverage `getApiHeaders` for authentication
- Follow existing service patterns from other modules
- Base URL: `http://localhost:8080` (from Postman environment)

### Image Management with Cloudinary
- **Image Upload**: Use Cloudinary for image upload and optimization
- **Image URLs**: Store Cloudinary URLs in content data (`image_url` field)
- **Image Validation**: Validate image URLs and handle Cloudinary transformations
- **Existing Integration**: Leverage existing Cloudinary configuration from the project

### Performance
- Implement caching for frequently accessed content
- Use optimistic updates for better perceived performance
- Add debouncing for rapid content changes
- Minimize API calls through intelligent state management

### Security
- Ensure proper authentication for admin operations
- Validate content before sending to API
- Sanitize user inputs to prevent XSS
- Follow existing security patterns in the application

### Backward Compatibility
- Maintain existing component interfaces
- Preserve current UI/UX behavior
- Ensure smooth migration from localStorage
- Support graceful fallback to default content