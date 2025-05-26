import { expect } from '@jest/globals';
import { NextRequest } from 'next/server';
import { Session } from 'next-auth';

import { POST as CommentPOST } from '@/app/api/comments/route';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { COMMENT_MAX_LENGTH } from '@/app/utils/constants';

// Mock session for authentication
let mockedSession: Session | null = null;

// Mock getCurrentUser
jest.mock('@/app/actions/getCurrentUser');
const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<
    typeof getCurrentUser
>;

// Mock next-auth
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => Promise.resolve(mockedSession)),
}));

describe('Comments API Route - POST Error Handling', () => {
    beforeEach(() => {
        // Reset mocks before each test
        mockedGetCurrentUser.mockClear();
        mockedSession = {
            expires: 'expires',
            user: {
                name: 'testuser',
                email: 'testuser@example.com',
                id: 'testuserid', // Add id to the user object
            },
        };
        mockedGetCurrentUser.mockResolvedValue(mockedSession.user as any); // Default to authenticated user
    });

    it('should return 401 if user is not authenticated', async () => {
        mockedGetCurrentUser.mockResolvedValue(null); // Simulate no user logged in

        const requestBody = {
            recipeId: 'testRecipeId',
            comment: 'This is a test comment.',
        };
        const request = new NextRequest('http://localhost/api/comments', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        const response = await CommentPOST(request);
        const responseBody = await response.json();

        expect(response.status).toBe(401);
        expect(responseBody).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 if recipeId is missing', async () => {
        const requestBody = {
            comment: 'This is a test comment.',
            // recipeId is missing
        };
        const request = new NextRequest('http://localhost/api/comments', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        const response = await CommentPOST(request);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody).toEqual({ error: 'Missing required fields' });
    });

    it('should return 400 if comment is missing', async () => {
        const requestBody = {
            recipeId: 'testRecipeId',
            // comment is missing
        };
        const request = new NextRequest('http://localhost/api/comments', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        const response = await CommentPOST(request);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody).toEqual({ error: 'Missing required fields' });
    });

    it('should return 400 if comment is too long', async () => {
        const longComment = 'a'.repeat(COMMENT_MAX_LENGTH + 1);
        const requestBody = {
            recipeId: 'testRecipeId',
            comment: longComment,
        };
        const request = new NextRequest('http://localhost/api/comments', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        const response = await CommentPOST(request);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody).toEqual({
            error: `Comment must be ${COMMENT_MAX_LENGTH} characters or less`,
        });
    });
});
