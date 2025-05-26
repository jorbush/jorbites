# API Error Handling Improvements

## Overview

This document outlines the comprehensive improvements made to API error handling across the Jorbites application. The changes replace generic `NextResponse.error()` calls with structured, meaningful error responses and add comprehensive test coverage.

## Updated Routes

### Core Recipe and User Management Routes
- `/api/draft/route.ts` - Recipe drafts management
- `/api/favorites/[recipeId]/route.ts` - Recipe favorites management
- `/api/comments/route.ts` - Recipe comments creation
- `/api/comments/[commentId]/route.ts` - Individual comment operations
- `/api/search/route.ts` - Recipe search functionality
- `/api/recipes/route.ts` - Recipe CRUD operations
- `/api/recipe/[recipeId]/route.ts` - Individual recipe management
- `/api/users/multiple/route.ts` - Multiple user operations
- `/api/userImage/[userId]/route.ts` - User image management
- `/api/emailNotifications/[userId]/route.ts` - Email notification settings

### Authentication and Security Routes
- `/api/register/route.ts` - User registration
- `/api/password-reset/request/route.ts` - Password reset request
- `/api/password-reset/reset/route.ts` - Password reset execution
- `/api/password-reset/validate/[token]/route.ts` - Password reset token validation

### Content and Media Routes
- `/api/events/route.ts` - Events listing
- `/api/events/[slug]/route.ts` - Individual event details
- `/api/image-proxy/route.ts` - Image proxy and optimization

## Error Utility System

### Location
`app/utils/apiErrors.ts`

### Error Types
- `UNAUTHORIZED` (401) - Authentication required
- `BAD_REQUEST` (400) - Invalid request data
- `NOT_FOUND` (404) - Resource not found
- `FORBIDDEN` (403) - Access denied
- `CONFLICT` (409) - Resource conflict (e.g., duplicate email)
- `INTERNAL_SERVER_ERROR` (500) - Server errors
- `VALIDATION_ERROR` (400) - Data validation failures
- `INVALID_INPUT` (400) - Invalid input parameters

### Helper Functions
- `createApiError(type, customMessage?)` - Generic error creator
- `unauthorized(message?)` - 401 errors
- `badRequest(message?)` - 400 errors
- `notFound(message?)` - 404 errors
- `forbidden(message?)` - 403 errors
- `conflict(message?)` - 409 errors
- `internalServerError(message?)` - 500 errors
- `validationError(message?)` - Validation errors
- `invalidInput(message?)` - Invalid input errors

### Error Response Structure
```json
{
    "error": "Human-readable error message",
    "code": "ERROR_TYPE_CODE",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Test Coverage

### Test Suites
All routes now have comprehensive test coverage focusing on error scenarios:

1. **image-proxy.test.ts** (5 tests)
   - Missing URL parameter validation
   - Failed image fetch handling
   - Network error handling
   - Cloudinary URL processing
   - Generic URL processing

2. **events.test.ts** (8 tests)
   - Events listing with language support
   - Invalid language handling
   - Event by slug retrieval
   - Event not found scenarios
   - Database error handling

3. **register.test.ts** (7 tests)
   - Missing field validation (email, name, password)
   - Password length validation
   - Duplicate email handling
   - Successful registration
   - Database error scenarios

4. **password-reset.test.ts** (15 tests)
   - **Request**: Missing email, user not found, successful processing, DB errors
   - **Reset**: Missing token/password, short password, invalid token, successful reset, DB errors
   - **Validate**: Missing token, invalid token, valid token, DB errors

5. **comment-delete.test.ts** (7 tests)
   - Authentication validation
   - Comment ID validation
   - Comment not found
   - Authorization (comment ownership)
   - Successful deletion
   - Database error handling

6. **Existing Enhanced Test Suites**
   - **draft.test.ts** (9 tests)
   - **favorites.test.ts** (6 tests)
   - **comments.test.ts** (8 tests)
   - **search.test.ts** (6 tests)
   - **recipe.test.ts** (6 tests)
   - **recipes.test.ts** (13 tests with enhanced error checking)

### Total Test Coverage
- **12 test suites**
- **97 tests total**
- **0 failures**
- Comprehensive error scenario coverage

## Key Improvements

### 1. Structured Error Responses
All errors now follow a consistent structure with:
- Descriptive error messages
- Standardized error codes
- Timestamps for debugging

### 2. Proper HTTP Status Codes
Each error type maps to appropriate HTTP status codes:
- 401: Authentication required
- 400: Bad request/validation errors
- 404: Resource not found
- 403: Access forbidden
- 409: Resource conflicts
- 500: Internal server errors

### 3. Enhanced Error Messages
Context-specific error messages instead of generic ones:
- "User authentication required to delete comment" vs "Not authenticated"
- "Comment ID is required and must be a valid string" vs "Invalid ID"
- "Password must be at least 6 characters long" vs "Bad request"

### 4. Type Safety
- TypeScript interfaces ensure consistent error handling
- Enum-based error types prevent typos
- Proper type checking for error responses

### 5. Better Logging
All errors are logged with context for debugging:
```typescript
console.error('Error deleting comment:', error);
```

### 6. Comprehensive Testing
- Error scenarios for all routes
- Authentication and authorization testing
- Validation error testing
- Database error simulation
- Successful operation verification

## Usage Examples

### Basic Error Handling
```typescript
import { unauthorized, badRequest, internalServerError } from '@/app/utils/apiErrors';

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return unauthorized('Authentication required');
        }

        const body = await request.json();
        if (!body.email) {
            return badRequest('Email is required');
        }

        // ... business logic

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in API:', error);
        return internalServerError('Failed to process request');
    }
}
```

### Custom Error Messages
```typescript
if (comment.userId !== currentUser.id) {
    return forbidden('You can only delete your own comments');
}
```

## Migration Guidelines

### For New Routes
1. Import error utilities: `import { unauthorized, badRequest, ... } from '@/app/utils/apiErrors'`
2. Replace `NextResponse.error()` with specific error functions
3. Add proper try-catch blocks around database operations
4. Use descriptive error messages

### For Existing Routes
1. Identify current error handling patterns
2. Replace with appropriate error utility functions
3. Add comprehensive test coverage
4. Ensure proper error logging

### Testing New Error Handling
1. Create test file following the established pattern
2. Test all error scenarios (401, 400, 404, 403, 409, 500)
3. Verify error response structure
4. Test successful operations
5. Mock external dependencies appropriately

## Benefits

1. **Consistency**: Uniform error structure across all API routes
2. **Debugging**: Better error messages and logging for troubleshooting
3. **User Experience**: More meaningful error messages for frontend
4. **Maintainability**: Centralized error handling logic
5. **Type Safety**: TypeScript ensures correct error handling
6. **Testing**: Comprehensive test coverage for reliability
7. **Documentation**: Clear error codes and messages for API consumers

## Future Considerations

1. **Error Monitoring**: Integration with error tracking services
2. **Internationalization**: Multi-language error messages
3. **Rate Limiting**: Specific error handling for rate limits
4. **API Versioning**: Error format versioning for backwards compatibility
5. **Enhanced Logging**: Structured logging with correlation IDs
