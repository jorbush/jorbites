# API Error Handling System

## Overview

This document explains the comprehensive error handling system implemented across the Jorbites application. The system provides structured, meaningful error responses with consistent formatting, proper HTTP status codes, and comprehensive test coverage.

## How It Works

### Architecture

The error handling system is built around a centralized utility module that provides:
1. **Standardized Error Types** - Predefined error categories with appropriate HTTP status codes
2. **Consistent Response Format** - All errors follow the same JSON structure
3. **Type Safety** - TypeScript interfaces ensure correct usage
4. **Logging Integration** - Contextual error logging for debugging

### Error Flow

```
API Request → Input Validation → Business Logic → Error Occurs → Error Utility → Structured Response
```

1. **Request Processing**: API routes handle incoming requests
2. **Validation**: Input validation checks for required fields and formats
3. **Authentication/Authorization**: User permissions and authentication status
4. **Business Logic**: Core application functionality
5. **Error Handling**: When errors occur, they're processed through the error utility system
6. **Response**: Structured error response sent to client

## Error Utility System

### Location
`app/utils/apiErrors.ts`

### Core Components

#### Error Types and Status Codes
- `UNAUTHORIZED` (401) - Authentication required
- `BAD_REQUEST` (400) - Invalid request data
- `NOT_FOUND` (404) - Resource not found
- `FORBIDDEN` (403) - Access denied
- `CONFLICT` (409) - Resource conflict (e.g., duplicate email)
- `INTERNAL_SERVER_ERROR` (500) - Server errors
- `VALIDATION_ERROR` (400) - Data validation failures
- `INVALID_INPUT` (400) - Invalid input parameters

#### Helper Functions
The system provides convenient helper functions for each error type:

```typescript
// Authentication errors
unauthorized(message?) → 401 response

// Validation errors
badRequest(message?) → 400 response
validationError(message?) → 400 response
invalidInput(message?) → 400 response

// Resource errors
notFound(message?) → 404 response
forbidden(message?) → 403 response
conflict(message?) → 409 response

// Server errors
internalServerError(message?) → 500 response
```

#### Response Structure
All errors return a consistent JSON structure:

```json
{
    "error": "Human-readable error message",
    "code": "ERROR_TYPE_CODE",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Implementation Pattern

#### Basic Usage
```typescript
import { unauthorized, badRequest, internalServerError } from '@/app/utils/apiErrors';

export async function POST(request: Request) {
    try {
        // Authentication check
        const user = await getCurrentUser();
        if (!user) {
            return unauthorized('Authentication required');
        }

        // Input validation
        const body = await request.json();
        if (!body.email) {
            return badRequest('Email is required');
        }

        // Business logic
        const result = await processRequest(body);
        return NextResponse.json(result);

    } catch (error) {
        // Error logging and response
        console.error('Error in API:', error);
        return internalServerError('Failed to process request');
    }
}
```

#### Context-Specific Errors
```typescript
// Resource ownership validation
if (comment.userId !== currentUser.id) {
    return forbidden('You can only delete your own comments');
}

// Duplicate resource handling
if (existingUser) {
    return conflict('Email already exists');
}

// Input format validation
if (password.length < 6) {
    return badRequest('Password must be at least 6 characters long');
}
```

## Implemented Routes

### Authentication & Security
- `/api/register/route.ts` - User registration with validation
- `/api/password-reset/request/route.ts` - Password reset initiation
- `/api/password-reset/reset/route.ts` - Password reset execution
- `/api/password-reset/validate/[token]/route.ts` - Token validation

### Content Management
- `/api/recipes/route.ts` - Recipe CRUD operations
- `/api/recipe/[recipeId]/route.ts` - Individual recipe management
- `/api/comments/route.ts` - Comment creation
- `/api/comments/[commentId]/route.ts` - Comment operations
- `/api/favorites/[recipeId]/route.ts` - Favorites management
- `/api/draft/route.ts` - Draft management

### Data & Media
- `/api/search/route.ts` - Search functionality
- `/api/events/route.ts` - Events listing
- `/api/events/[slug]/route.ts` - Event details
- `/api/image-proxy/route.ts` - Image processing
- `/api/users/multiple/route.ts` - Batch user operations
- `/api/userImage/[userId]/route.ts` - User images
- `/api/emailNotifications/[userId]/route.ts` - Notification settings

## Error Handling Strategies

### 1. Input Validation
```typescript
// Required field validation
if (!email || !name || !password) {
    return badRequest('Email, name, and password are required');
}

// Format validation
if (password.length < 6) {
    return badRequest('Password must be at least 6 characters long');
}
```

### 2. Authentication & Authorization
```typescript
// Authentication check
const user = await getCurrentUser();
if (!user) {
    return unauthorized('User authentication required');
}

// Resource ownership
if (resource.userId !== user.id) {
    return forbidden('You can only access your own resources');
}
```

### 3. Resource Management
```typescript
// Resource existence
const item = await getItemById(id);
if (!item) {
    return notFound('Item not found');
}

// Duplicate prevention
const existing = await findByEmail(email);
if (existing) {
    return conflict('Email already exists');
}
```

### 4. Database Operations
```typescript
try {
    const result = await prisma.model.create(data);
    return NextResponse.json(result);
} catch (error) {
    console.error('Database error:', error);
    return internalServerError('Failed to save data');
}
```

## Testing Framework

### Test Structure
Each API route has comprehensive test coverage focusing on:

1. **Error Scenarios** - All possible error conditions
2. **Success Cases** - Valid operations
3. **Edge Cases** - Boundary conditions
4. **Authentication** - User permission testing
5. **Validation** - Input validation testing

### Example Test Coverage
```typescript
describe('API Route Error Handling', () => {
    it('should return 401 when user not authenticated', async () => {
        // Test authentication requirement
    });

    it('should return 400 when required fields missing', async () => {
        // Test input validation
    });

    it('should return 404 when resource not found', async () => {
        // Test resource existence
    });

    it('should return 403 when access denied', async () => {
        // Test authorization
    });

    it('should return 500 when database fails', async () => {
        // Test error handling
    });
});
```

### Current Test Statistics
- **12 test suites**
- **97 tests total**
- **0 failures**
- **Complete error scenario coverage**

## Benefits

### For Developers
- **Consistency**: Uniform error handling across all routes
- **Type Safety**: TypeScript prevents error handling mistakes
- **Maintainability**: Centralized error logic
- **Debugging**: Enhanced logging with context

### For Frontend/API Consumers
- **Predictable**: Consistent error response format
- **Informative**: Descriptive error messages
- **Actionable**: Clear HTTP status codes
- **Structured**: Machine-readable error codes

### For Operations
- **Monitoring**: Structured error responses for alerting
- **Debugging**: Contextual error logging
- **Analytics**: Error tracking and analysis
- **Reliability**: Comprehensive test coverage

## Best Practices

### When to Use Each Error Type
- **401 Unauthorized**: Missing or invalid authentication
- **400 Bad Request**: Invalid input data or format
- **404 Not Found**: Resource doesn't exist
- **403 Forbidden**: Valid auth but insufficient permissions
- **409 Conflict**: Resource already exists or conflicts
- **500 Internal Server Error**: Unexpected server errors

### Error Message Guidelines
- Be specific and actionable
- Don't expose sensitive information
- Use consistent language and tone
- Include context when helpful

### Logging Best Practices
```typescript
// Good: Contextual logging
console.error('Error creating user:', error);

// Better: Structured logging
console.error('Database operation failed', {
    operation: 'user_creation',
    error: error.message,
    userId: user?.id
});
```

## Future Enhancements

1. **Error Monitoring**: Integration with error tracking services
2. **Internationalization**: Multi-language error messages
3. **Rate Limiting**: Specific handling for rate limit errors
4. **Structured Logging**: Enhanced logging with correlation IDs
5. **Error Analytics**: Error pattern analysis and alerting
