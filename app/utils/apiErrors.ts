import { NextResponse } from 'next/server';

export enum ApiErrorType {
    UNAUTHORIZED = 'UNAUTHORIZED',
    BAD_REQUEST = 'BAD_REQUEST',
    NOT_FOUND = 'NOT_FOUND',
    FORBIDDEN = 'FORBIDDEN',
    CONFLICT = 'CONFLICT',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INVALID_INPUT = 'INVALID_INPUT',
}

export interface ApiErrorResponse {
    error: string;
    code: string;
    timestamp: string;
}

export function createApiError(
    type: ApiErrorType,
    message?: string,
    details?: any
): NextResponse<ApiErrorResponse> {
    const errorMap = {
        [ApiErrorType.UNAUTHORIZED]: {
            status: 401,
            message: message || 'Authentication required',
        },
        [ApiErrorType.BAD_REQUEST]: {
            status: 400,
            message: message || 'Bad request',
        },
        [ApiErrorType.NOT_FOUND]: {
            status: 404,
            message: message || 'Resource not found',
        },
        [ApiErrorType.FORBIDDEN]: {
            status: 403,
            message: message || 'Access forbidden',
        },
        [ApiErrorType.CONFLICT]: {
            status: 409,
            message: message || 'Resource conflict',
        },
        [ApiErrorType.INTERNAL_SERVER_ERROR]: {
            status: 500,
            message: message || 'Internal server error',
        },
        [ApiErrorType.VALIDATION_ERROR]: {
            status: 400,
            message: message || 'Validation error',
        },
        [ApiErrorType.INVALID_INPUT]: {
            status: 400,
            message: message || 'Invalid input provided',
        },
    };

    const { status, message: defaultMessage } = errorMap[type];

    const errorResponse: ApiErrorResponse = {
        error: defaultMessage,
        code: type,
        timestamp: new Date().toISOString(),
    };

    // Add details if provided
    if (details) {
        (errorResponse as any).details = details;
    }

    return NextResponse.json(errorResponse, { status });
}

// Convenience functions for common errors
export const unauthorized = (message?: string) =>
    createApiError(ApiErrorType.UNAUTHORIZED, message);

export const badRequest = (message?: string) =>
    createApiError(ApiErrorType.BAD_REQUEST, message);

export const notFound = (message?: string) =>
    createApiError(ApiErrorType.NOT_FOUND, message);

export const forbidden = (message?: string) =>
    createApiError(ApiErrorType.FORBIDDEN, message);

export const conflict = (message?: string) =>
    createApiError(ApiErrorType.CONFLICT, message);

export const internalServerError = (message?: string) =>
    createApiError(ApiErrorType.INTERNAL_SERVER_ERROR, message);

export const validationError = (message?: string, details?: any) =>
    createApiError(ApiErrorType.VALIDATION_ERROR, message, details);

export const invalidInput = (message?: string) =>
    createApiError(ApiErrorType.INVALID_INPUT, message);
