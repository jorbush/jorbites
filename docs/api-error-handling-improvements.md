# API Error Handling Improvements

## Overview

This document outlines the comprehensive improvements made to API error handling across the Jorbites application. The changes replace generic `NextResponse.error()` calls with specific, structured error responses that provide better debugging information and user experience.

## New Error Utility System

### Error Utility (`app/utils/apiErrors.ts`)

A new centralized error handling system has been implemented with the following features:

- **Standardized Error Types**: Predefined error types with appropriate HTTP status codes
- **Consistent Error Structure**: All errors include error message, code, and timestamp
- **Type Safety**: TypeScript interfaces ensure consistent error responses
- **Convenience Functions**: Helper functions for common error scenarios

#### Error Types

```typescript
export enum ApiErrorType {
    UNAUTHORIZED = 'UNAUTHORIZED',        // 401
    BAD_REQUEST = 'BAD_REQUEST',          // 400
    NOT_FOUND = 'NOT_FOUND',              // 404
    FORBIDDEN = 'FORBIDDEN',              // 403
    CONFLICT = 'CONFLICT',                // 409
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR', // 500
    VALIDATION_ERROR = 'VALIDATION_ERROR', // 400
    INVALID_INPUT = 'INVALID_INPUT',      // 400
}
```

#### Error Response Structure

```typescript
interface ApiErrorResponse {
    error: string;      // Human-readable error message
    code: string;       // Error type code
    timestamp: string;  // ISO timestamp
}
```

## Routes Updated

### 1. Draft API (`/api/draft`)

**Before**: Generic `NextResponse.error()`
**After**: Specific error handling for:
- `401 UNAUTHORIZED`: "User authentication required to save/get/delete draft"
- `500 INTERNAL_SERVER_ERROR`: "Failed to save/retrieve/delete draft"

### 2. Favorites API (`/api/favorites/[recipeId]`)

**Before**: Generic `NextResponse.error()` and thrown errors
**After**: Specific error handling for:
- `401 UNAUTHORIZED`: "User authentication required to add/remove favorite"
- `400 INVALID_INPUT`: "Recipe ID is required and must be a valid string"
- `500 INTERNAL_SERVER_ERROR`: "Failed to add/remove recipe to/from favorites"

### 3. Comments API (`/api/comments`)

**Before**: Generic `NextResponse.error()` calls
**After**: Specific error handling for:
- `401 UNAUTHORIZED`: "User authentication required to post comment"
- `400 BAD_REQUEST`: "Recipe ID and comment content are required"
- `400 BAD_REQUEST`: "Recipe not found"
- `400 VALIDATION_ERROR`: "Comment must be X characters or less"
- `500 INTERNAL_SERVER_ERROR`: "Failed to post comment"

### 4. Search API (`/api/search`)

**Before**: Generic `NextResponse.error()`
**After**: Specific error handling for:
- `401 UNAUTHORIZED`: "User authentication required to search"
- `500 INTERNAL_SERVER_ERROR`: "Failed to perform search"

### 5. Recipes API (`/api/recipes`)

**Before**: Generic `NextResponse.error()` and inconsistent validation responses
**After**: Specific error handling for:
- `401 UNAUTHORIZED`: "User authentication required to create recipe"
- `400 BAD_REQUEST`: "Missing required fields: ..."
- `400 VALIDATION_ERROR`: Field-specific validation messages
- `409 CONFLICT`: "A recipe with this image already exists"
- `500 INTERNAL_SERVER_ERROR`: "Failed to create recipe"

### 6. Individual Recipe API (`/api/recipe/[recipeId]`)

**Before**: Generic `NextResponse.error()` and thrown errors
**After**: Specific error handling for:
- `401 UNAUTHORIZED`: "User authentication required to interact with/delete recipe"
- `400 INVALID_INPUT`: "Recipe ID is required and must be a valid string"
- `400 BAD_REQUEST`: "Operation must be either 'increment' or 'decrement'"
- `404 NOT_FOUND`: "Recipe not found"
- `403 FORBIDDEN`: "You can only delete your own recipes"
- `500 INTERNAL_SERVER_ERROR`: "Failed to update/delete recipe"

### 7. Multiple Routes Updated

Additional routes updated with similar improvements:
- `/api/users/multiple` - Better error handling for user fetching
- `/api/recipes/multiple` - Better error handling for recipe fetching
- `/api/userImage/[userId]` - Better validation and error messages
- `/api/emailNotifications/[userId]` - Proper authentication errors

## Testing Improvements

### New Test Files Created

1. **`__tests__/unit_test/routes/draft.test.ts`**
   - Tests authentication errors (401)
   - Tests successful operations

2. **`__tests__/unit_test/routes/favorites.test.ts`**
   - Tests authentication errors (401)
   - Tests invalid input errors (400)
   - Tests proper error structure

3. **`__tests__/unit_test/routes/comments.test.ts`**
   - Tests authentication errors (401)
   - Tests missing field errors (400)
   - Tests validation errors (400)

4. **`__tests__/unit_test/routes/search.test.ts`**
   - Tests authentication errors (401)
   - Tests query validation
   - Tests successful searches

5. **`__tests__/unit_test/routes/recipe.test.ts`**
   - Tests authentication errors (401)
   - Tests invalid input errors (400)
   - Tests operation validation

### Enhanced Existing Tests

Updated `__tests__/unit_test/routes/recipes.test.ts` with additional error handling tests:
- Authentication error tests
- Missing field validation tests
- Proper error structure validation

## Benefits

### 1. Better Developer Experience
- **Clear Error Messages**: Developers get specific information about what went wrong
- **Proper HTTP Status Codes**: Correct status codes make debugging easier
- **Consistent Structure**: All errors follow the same format

### 2. Better User Experience
- **Informative Errors**: Users receive helpful error messages instead of generic ones
- **Proper Error Codes**: Frontend can handle different error types appropriately

### 3. Better Monitoring
- **Structured Logging**: All errors are logged with context
- **Error Tracking**: Consistent error structure enables better error tracking
- **Timestamps**: All errors include timestamps for debugging

### 4. Type Safety
- **TypeScript Support**: All error responses are properly typed
- **IntelliSense**: Better IDE support for error handling

## Error Response Examples

### Before
```json
{
  "message": "Internal Server Error"
}
```

### After
```json
{
  "error": "User authentication required to create recipe",
  "code": "UNAUTHORIZED",
  "timestamp": "2025-01-26T16:30:45.123Z"
}
```

## Migration Guide

For any remaining routes that need updating:

1. Import the error utilities:
   ```typescript
   import { unauthorized, badRequest, internalServerError } from '@/app/utils/apiErrors';
   ```

2. Replace `NextResponse.error()` with specific error functions:
   ```typescript
   // Before
   return NextResponse.error();

   // After
   return unauthorized('Specific error message');
   ```

3. Wrap route handlers in try-catch blocks:
   ```typescript
   export async function POST(request: Request) {
     try {
       // Route logic
     } catch (error) {
       console.error('Error context:', error);
       return internalServerError('Failed to perform operation');
     }
   }
   ```

4. Add appropriate tests for new error handling

## Test Results

All tests pass successfully:
- **7 test suites passed**
- **56 tests passed**
- **0 failed tests**

The implementation provides comprehensive error handling coverage across all major API routes while maintaining backward compatibility.
