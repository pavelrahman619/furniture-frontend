---
description: mern stack projects
alwaysApply: false
---
Coding standards, domain knowledge, and preferences that AI should follow.

# GitHub Copilot Instructions for Shongi Project

## Code Quality & Best Practices

### TypeScript Standards
- Always use TypeScript interfaces for data structures
- Use proper type annotations for function parameters and return types
- Avoid `any` types - use specific interfaces or unions
- Use optional chaining (`?.`) for potentially undefined properties

### Error Handling
- Wrap all async operations in try-catch blocks
- Use proper HTTP status codes (200, 201, 400, 404, 500)
- Log errors with context: `console.error('Context:', error)`
- Return user-friendly error messages in responses

### Security & Validation
- Validate user inputs on both frontend and backend
- Use authentication middleware for protected routes
- Ensure users can only access their own data
- Sanitize database inputs and validate ObjectIds

### Database Operations
- Use `populate()` for related data fetching
- Always validate ObjectIds before queries
- Use proper error handling for database operations
- Follow the existing model structure and naming conventions

### API Design
- Follow RESTful conventions
- Use consistent response format: `{ success: boolean, data?: any, message?: string }`
- Include proper request/response validation
- Use middleware for common operations (auth, validation)

### Frontend Best Practices
- Show loading states for async operations
- Handle error states gracefully with user-friendly messages
- Use proper TypeScript interfaces for component props
- Extract reusable logic into custom hooks
- Keep components focused and single-responsibility

### Performance Considerations
- Implement pagination for large data sets
- Use optimistic updates where appropriate
- Add search/filter functionality for lists
- Limit database queries and use efficient queries

## Project Structure

### File Organization
- Controllers handle business logic and return responses
- Services contain reusable business logic
- Models define database schemas
- Types define TypeScript interfaces
- Middleware handles cross-cutting concerns

### Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for interfaces and types
- Use kebab-case for file names
- Use descriptive names that explain purpose

## Common Patterns

### Controller Pattern
```typescript
export const controllerName = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validation
    // Business logic
    // Database operations
    // Response
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Controller context:', error);
    next(error);
  }
};
```

### Error Response Pattern
```typescript
return res.status(400).json({
  success: false,
  message: "User-friendly error message"
});
```

### Authentication Check Pattern
```typescript
const { user_id } = req.body; // From authMiddleware
if (!user_id) {
  return res.status(401).json({ success: false, message: "Unauthorized" });
}
```

## Testing Considerations
- Ensure backward compatibility with existing flows
- Test both authenticated and unauthenticated scenarios
- Validate edge cases and error conditions
- Test with valid and invalid data inputs

Always prioritize code readability, maintainability, and security in suggestions.