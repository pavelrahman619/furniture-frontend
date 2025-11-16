# Project Structure

## Root Directory Organization

```
├── src/                    # Main source code
├── public/                 # Static assets (images, icons)
├── .kiro/                  # Kiro configuration and steering
├── .next/                  # Next.js build output
├── node_modules/           # Dependencies
└── [config files]          # Various configuration files
```

## Source Code Structure (`src/`)

### Core Directories

- **`app/`** - Next.js App Router pages and layouts
- **`components/`** - Reusable UI components
- **`hooks/`** - Custom React hooks for business logic
- **`services/`** - API service layer and external integrations
- **`types/`** - TypeScript type definitions
- **`lib/`** - Utility functions and configurations
- **`contexts/`** - React Context providers
- **`providers/`** - Third-party provider wrappers
- **`stores/`** - Zustand stores for client state

### App Router Structure (`src/app/`)

```
app/
├── layout.tsx              # Root layout
├── page.tsx               # Home page
├── globals.css            # Global styles
├── admin/                 # Admin panel routes
├── cart/                  # Shopping cart page
├── checkout/              # Checkout flow
├── login/                 # Authentication pages
├── orders/                # Order management
├── products/              # Product catalog
└── track/                 # Order tracking
```

### Component Organization (`src/components/`)

- **Flat structure** for shared components
- **Feature folders** for complex components (e.g., `OrderTracking/`)
- **Test files** in `__tests__/` subdirectories
- **Index files** for clean imports

### Service Layer (`src/services/`)

- **Domain-specific services**: `product.service.ts`, `cart.service.ts`, etc.
- **Centralized API configuration** in `lib/api-config.ts`
- **Error handling utilities** in `lib/error-utils.ts`

## Naming Conventions

### Files & Directories
- **PascalCase** for React components: `ProductCard.tsx`
- **camelCase** for utilities and services: `api-service.ts`
- **kebab-case** for pages and routes: `order-success/`
- **lowercase** for configuration files: `next.config.ts`

### Code Conventions
- **PascalCase** for component names and types
- **camelCase** for variables, functions, and props
- **UPPER_SNAKE_CASE** for constants and environment variables
- **Descriptive names** that clearly indicate purpose

## Import Organization

### Path Aliases
- Use `@/*` for all src imports: `import { ProductCard } from '@/components/ProductCard'`
- Relative imports only for same-directory files

### Import Order
1. External libraries (React, Next.js, etc.)
2. Internal utilities and configurations (`@/lib/*`)
3. Services and hooks (`@/services/*`, `@/hooks/*`)
4. Components (`@/components/*`)
5. Types (`@/types/*`)

## Architecture Patterns

### Separation of Concerns
- **Components**: Pure UI rendering and user interactions
- **Hooks**: Business logic and state management
- **Services**: API communication and data transformation
- **Types**: Data contracts and interfaces

### Data Flow
- **Server State**: Managed by TanStack Query
- **Client State**: Managed by Zustand stores or React Context
- **Form State**: Local component state or form libraries
- **URL State**: Next.js router and search params

### Error Handling
- **Error Boundaries**: Component-level error catching
- **Service Layer**: API error transformation
- **User Feedback**: Loading states and error messages
- **Graceful Degradation**: Fallback UI for failures