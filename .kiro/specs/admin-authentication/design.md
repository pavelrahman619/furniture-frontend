# Design Document

## Overview

The admin authentication system provides secure access control for administrative functions in the furniture e-commerce platform. This design integrates with the existing Next.js App Router structure, leverages React Context for state management, and follows established patterns from the existing authentication and cart systems. The system ensures that only authenticated administrators can access admin routes and provides a seamless user experience with persistent sessions.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Login Page                         │
│                 (/admin/login/page.tsx)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Admin Context Provider                       │
│              (src/contexts/AdminContext.tsx)               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Admin Service Layer                          │
│              (src/services/admin.service.ts)               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  API Configuration                          │
│               (src/lib/api-config.ts)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Backend API Endpoints                       │
│              (/api/admin/*, Express.js)                    │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
Admin Authentication System
├── AdminContext Provider
│   ├── Authentication State Management
│   ├── Token Storage & Retrieval
│   └── Session Persistence
├── Admin Login Page
│   ├── Login Form Component
│   ├── Credential Validation
│   └── Error Handling
├── Admin Route Protection
│   ├── AdminGuard Component
│   ├── Route Middleware
│   └── Redirect Logic
└── Enhanced Navbar
    ├── Admin Menu Items
    ├── User Info Display
    └── Logout Functionality
```

## Components and Interfaces

### Admin Service Layer

The `AdminService` will be created in `src/services/admin.service.ts` following established patterns:

```typescript
interface AdminService {
  // Authentication operations
  login(credentials: AdminLoginRequest): Promise<ApiResponse<AdminLoginResponse>>
  logout(): Promise<ApiResponse<void>>
  refreshToken(): Promise<ApiResponse<AdminTokenResponse>>
  
  // Session management
  getCurrentAdmin(): Promise<ApiResponse<AdminUser>>
  verifyToken(token: string): Promise<ApiResponse<boolean>>
}

interface AdminLoginRequest {
  email: string
  password: string
}

interface AdminLoginResponse {
  token: string
  refreshToken: string
  admin: AdminUser
  expiresIn: number
}

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'super_admin'
  permissions: string[]
  lastLogin: string
}
```

### Admin Context Implementation

Following the existing `CartContext` pattern, create admin state management:

```typescript
interface AdminContextType {
  // State
  admin: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (credentials: AdminLoginRequest) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  
  // Utilities
  hasPermission: (permission: string) => boolean
  getToken: () => string | null
}
```

### API Integration Points

Addition to existing `api-config.ts`:

```typescript
// Addition to existing API_ENDPOINTS in api-config.ts
ADMIN: {
  LOGIN: '/admin/login',
  LOGOUT: '/admin/logout',
  REFRESH: '/admin/refresh',
  PROFILE: '/admin/profile',
  VERIFY: '/admin/verify',
}
```

### Route Protection Strategy

#### AdminGuard Component
- Higher-order component for protecting admin routes
- Checks authentication status before rendering protected content
- Handles redirects for unauthenticated access
- Integrates with loading states during authentication checks

#### Implementation Pattern
```typescript
const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdmin()
  
  if (isLoading) return <AdminLoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/admin/login" />
  
  return <>{children}</>
}
```

### Enhanced Navbar Design

#### Dynamic Menu System
- Conditional rendering based on admin authentication state
- Admin-specific menu items: Products, Orders, Content Management
- User info dropdown with logout option
- Seamless transition between authenticated and non-authenticated states

#### Admin Menu Structure
```typescript
const adminMenuItems = [
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Content", href: "/admin/content", icon: Settings },
]
```

## Data Models

### TypeScript Interfaces

```typescript
interface AdminAuthState {
  admin: AdminUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  lastActivity: number
}

interface AdminSession {
  token: string
  refreshToken: string
  expiresAt: number
  admin: AdminUser
}

interface AdminPermissions {
  products: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  orders: {
    read: boolean
    update: boolean
    cancel: boolean
  }
  content: {
    read: boolean
    update: boolean
  }
}
```

## Security Considerations

### Token Management
1. **Secure Storage**: Use localStorage for token persistence with encryption
2. **Token Expiration**: Implement automatic token refresh before expiration
3. **Session Timeout**: Auto-logout after period of inactivity
4. **Cross-tab Synchronization**: Sync authentication state across browser tabs

### Route Protection
1. **Server-side Validation**: Verify tokens on backend for all admin API calls
2. **Client-side Guards**: Prevent unauthorized route access
3. **Permission Checks**: Granular permission verification for admin actions
4. **Audit Logging**: Track admin actions for security monitoring

### Error Handling Strategy

#### Authentication Errors
1. **Invalid Credentials**: Clear error messages without revealing system details
2. **Token Expiration**: Automatic refresh with fallback to login
3. **Network Failures**: Retry mechanisms with exponential backoff
4. **Session Conflicts**: Handle multiple admin sessions gracefully

#### User Experience
- Loading states during authentication checks
- Smooth transitions between authenticated/unauthenticated states
- Persistent form data during authentication errors
- Clear feedback for all authentication operations

## Integration with Existing Systems

### Cart Context Integration
- Maintain existing cart functionality during admin sessions
- Separate admin context from user authentication
- Ensure cart persistence across admin login/logout

### Product Service Integration
- Enhance existing ProductService with admin authentication headers
- Add admin-specific product operations (bulk operations, advanced filtering)
- Maintain backward compatibility with existing product functionality

### Toast Notifications
- Integrate with existing ToastContext for authentication feedback
- Consistent notification patterns for login/logout operations
- Error handling with user-friendly messages

## Performance Considerations

### Authentication Optimization
1. **Token Caching**: Cache valid tokens to reduce API calls
2. **Lazy Loading**: Load admin components only when needed
3. **Session Persistence**: Minimize authentication checks on route changes
4. **Background Refresh**: Refresh tokens in background to maintain sessions

### State Management
1. **Context Optimization**: Prevent unnecessary re-renders with proper context structure
2. **Local Storage**: Efficient token storage and retrieval
3. **Memory Management**: Clean up authentication state on logout

## Testing Strategy

### Authentication Flow Testing
1. **Login/Logout Workflows**: Complete authentication cycles
2. **Route Protection**: Verify access control for all admin routes
3. **Token Management**: Test token refresh and expiration scenarios
4. **Error Scenarios**: Network failures, invalid credentials, expired sessions

### Integration Testing
1. **Navbar Updates**: Dynamic menu rendering based on auth state
2. **Product Page Access**: Admin products page functionality
3. **Cross-component Communication**: Context state propagation
4. **Browser Persistence**: Session restoration across page refreshes