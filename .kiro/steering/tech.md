# Technology Stack

## Core Framework
- **Next.js 15.5.0** with App Router and Turbopack for development
- **React 19.1.0** with modern hooks and patterns
- **TypeScript 5** for type safety across the entire codebase

## State Management & Data Fetching
- **TanStack Query (React Query) 5.89.0** for server state management and caching
- **Zustand 5.0.8** for client-side state management
- **React Context** for cart state and authentication

## Styling & UI
- **Tailwind CSS 4** for utility-first styling
- **Lucide React** for consistent iconography
- **Responsive Design** with mobile-first approach

## Backend Integration
- **REST APIs** with structured endpoints
- **MongoDB** integration via backend services
- **Cloudinary** for image management and optimization

## Development Tools
- **ESLint 9** with Next.js and TypeScript configurations
- **Jest 30** with React Testing Library for unit testing
- **PostCSS** with Tailwind integration

## Common Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm start            # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

## Architecture Patterns

### File Organization
- **Feature-based structure** with clear separation of concerns
- **Custom hooks** for business logic and API interactions
- **Service layer** for API communication
- **Type definitions** in dedicated types directory

### API Integration
- **Structured query keys** for TanStack Query
- **Error boundaries** for graceful error handling
- **Loading states** with skeleton components
- **Optimistic updates** where appropriate

### Code Standards
- **TypeScript strict mode** enabled
- **Path aliases** using `@/*` for src directory
- **Component composition** over inheritance
- **Custom hooks** for reusable logic