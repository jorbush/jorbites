import { expect } from '@jest/globals';
import { DELETE as CommentDELETE } from '@/app/api/comments/[commentId]/route';

// Mock the user and comment actions
jest.mock('@/app/actions/getCurrentUser', () => jest.fn());
jest.mock('@/app/actions/getCommentById', () => jest.fn());

// Mock prisma
jest.mock('@/app/libs/prismadb', () => ({
    comment: {
        delete: jest.fn(),
    },
}));

import getCurrentUser from '@/app/actions/getCurrentUser';
import getCommentById from '@/app/actions/getCommentById';
import prisma from '@/app/lib/prismadb';

describe('Comment Delete API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('DELETE /api/comments/[commentId]', () => {
        it('should return 401 when user is not authenticated', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValueOnce(null);

            const mockParams = {
                params: Promise.resolve({ commentId: 'test-comment-id' }),
            };

            const response = await CommentDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to delete comment'
            );
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when comment ID is invalid', async () => {
            const mockUser = { id: 'test-user-id', email: 'test@example.com' };
            (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

            const mockParams = {
                params: Promise.resolve({ commentId: '' }),
            };

            const response = await CommentDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Comment ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when comment ID is not a string', async () => {
            const mockUser = { id: 'test-user-id', email: 'test@example.com' };
            (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

            const mockParams = {
                params: Promise.resolve({ commentId: undefined }),
            };

            const response = await CommentDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Comment ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 404 when comment is not found', async () => {
            const mockUser = { id: 'test-user-id', email: 'test@example.com' };
            (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);
            (getCommentById as jest.Mock).mockResolvedValueOnce(null);

            const mockParams = {
                params: Promise.resolve({ commentId: 'non-existent-id' }),
            };

            const response = await CommentDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toBe('Comment not found');
            expect(data.code).toBe('NOT_FOUND');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 403 when user is not the comment owner', async () => {
            const mockUser = { id: 'test-user-id', email: 'test@example.com' };
            (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

            const mockComment = {
                id: 'comment-id',
                userId: 'different-user-id',
                comment: 'Test comment',
                recipeId: 'recipe-id',
            };
            (getCommentById as jest.Mock).mockResolvedValueOnce(mockComment);

            const mockParams = {
                params: Promise.resolve({ commentId: 'comment-id' }),
            };

            const response = await CommentDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data.error).toBe('You can only delete your own comments');
            expect(data.code).toBe('FORBIDDEN');
            expect(data.timestamp).toBeDefined();
        });

        it('should delete comment successfully when user is the owner', async () => {
            const mockUser = { id: 'test-user-id', email: 'test@example.com' };
            (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

            const mockComment = {
                id: 'comment-id',
                userId: 'test-user-id',
                comment: 'Test comment',
                recipeId: 'recipe-id',
            };
            (getCommentById as jest.Mock).mockResolvedValueOnce(mockComment);
            (prisma.comment.delete as jest.Mock).mockResolvedValueOnce(
                mockComment
            );

            const mockParams = {
                params: Promise.resolve({ commentId: 'comment-id' }),
            };

            const response = await CommentDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockComment);
            expect(prisma.comment.delete).toHaveBeenCalledWith({
                where: { id: 'comment-id' },
            });
        });

        it('should return 500 when database operation fails', async () => {
            const mockUser = { id: 'test-user-id', email: 'test@example.com' };
            (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);
            (getCommentById as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            const mockParams = {
                params: Promise.resolve({ commentId: 'comment-id' }),
            };

            const response = await CommentDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to delete comment');
            expect(data.code).toBe('INTERNAL_SERVER_ERROR');
            expect(data.timestamp).toBeDefined();
        });
    });
});
