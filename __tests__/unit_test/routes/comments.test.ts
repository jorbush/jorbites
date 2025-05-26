import { expect } from '@jest/globals';
import { POST as CommentPOST } from '@/app/api/comments/route';
import { Session } from 'next-auth';
import { COMMENT_MAX_LENGTH } from '@/app/utils/constants';

let mockedSession: Session | null = null;

// This mocks our custom helper function to avoid passing authOptions around
jest.mock('@/pages/api/auth/[...nextauth].ts', () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));

// This mocks calls to getServerSession
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => {
        return Promise.resolve(mockedSession);
    }),
}));

describe('Comments API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/comments', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    recipeId: 'test-recipe-id',
                    comment: 'Great recipe!',
                }),
            } as unknown as Request;

            const response = await CommentPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to post comment'
            );
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when recipe ID is missing', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    comment: 'Great recipe!',
                }),
            } as unknown as Request;

            const response = await CommentPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Recipe ID and comment content are required'
            );
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when comment is missing', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    recipeId: 'test-recipe-id',
                }),
            } as unknown as Request;

            const response = await CommentPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Recipe ID and comment content are required'
            );
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when comment exceeds max length', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    recipeId: 'test-recipe-id',
                    comment: 'a'.repeat(COMMENT_MAX_LENGTH + 1),
                }),
            } as unknown as Request;

            const response = await CommentPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                `Comment must be ${COMMENT_MAX_LENGTH} characters or less`
            );
            expect(data.code).toBe('VALIDATION_ERROR');
            expect(data.timestamp).toBeDefined();
        });
    });
});
