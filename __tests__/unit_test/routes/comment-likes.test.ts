import { expect } from '@jest/globals';
import {
    POST as CommentLikePOST,
    DELETE as CommentLikeDELETE,
} from '@/app/api/comments/[commentId]/like/route';
import { Session } from 'next-auth';

let mockedSession: Session | null = null;

// Mock authOptions
jest.mock('@/pages/api/auth/[...nextauth].ts', () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));

// Mock getServerSession
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => {
        return Promise.resolve(mockedSession);
    }),
}));

// Mock prisma
jest.mock('@/app/lib/prismadb', () => ({
    comment: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
}));

// Mock getCurrentUser
jest.mock('@/app/actions/getCurrentUser', () =>
    jest.fn(() => {
        if (!mockedSession) return Promise.resolve(null);
        return Promise.resolve({
            id: 'test-user-id',
            name: mockedSession.user?.name,
            email: mockedSession.user?.email,
        });
    })
);

// Mock redis
jest.mock('@/app/lib/redis', () => ({
    redisCache: {
        del: jest.fn(() => Promise.resolve()),
    },
}));

import prisma from '@/app/lib/prismadb';

describe('Comment Likes API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/comments/[commentId]/like', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const mockParams = {
                params: Promise.resolve({ commentId: 'comment-123' }),
            };

            const response = await CommentLikePOST({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to like comment'
            );
            expect(data.code).toBe('UNAUTHORIZED');
        });

        it('should return 400 when comment ID is invalid', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };

            const mockParams = {
                params: Promise.resolve({ commentId: '' }),
            };

            const response = await CommentLikePOST({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Comment ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
        });

        it('should return 404 when comment is not found', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };
            (prisma.comment.findUnique as jest.Mock).mockResolvedValueOnce(
                null
            );

            const mockParams = {
                params: Promise.resolve({ commentId: 'comment-notFound' }),
            };

            const response = await CommentLikePOST({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toBe('Comment not found');
        });

        it('should like the comment when not already liked', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };

            const mockComment = {
                id: 'comment-123',
                comment: 'test comment',
                likedIds: ['other-user-id'],
                recipeId: 'recipe-123',
            };

            (prisma.comment.findUnique as jest.Mock).mockResolvedValueOnce(
                mockComment
            );
            (prisma.comment.update as jest.Mock).mockResolvedValueOnce({
                ...mockComment,
                likedIds: ['other-user-id', 'test-user-id'],
            });

            const mockParams = {
                params: Promise.resolve({ commentId: 'comment-123' }),
            };

            const response = await CommentLikePOST({} as Request, mockParams);
            const data = await response.json();

            expect(prisma.comment.update).toHaveBeenCalledWith({
                where: { id: 'comment-123' },
                data: { likedIds: ['other-user-id', 'test-user-id'] },
            });
            expect(response.status).toBe(200);
            expect(data.likedIds).toContain('test-user-id');
        });

        it('should return comment immediately if already liked', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };

            const mockComment = {
                id: 'comment-123',
                comment: 'test comment',
                likedIds: ['test-user-id'],
                recipeId: 'recipe-123',
            };

            (prisma.comment.findUnique as jest.Mock).mockResolvedValueOnce(
                mockComment
            );

            const mockParams = {
                params: Promise.resolve({ commentId: 'comment-123' }),
            };

            const response = await CommentLikePOST({} as Request, mockParams);
            const data = await response.json();

            expect(prisma.comment.update).not.toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(data.likedIds).toContain('test-user-id');
        });
    });

    describe('DELETE /api/comments/[commentId]/like', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const mockParams = {
                params: Promise.resolve({ commentId: 'comment-123' }),
            };

            const response = await CommentLikeDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to unlike comment'
            );
        });

        it('should unlike the comment when already liked', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };

            const mockComment = {
                id: 'comment-123',
                comment: 'test comment',
                likedIds: ['other-user-id', 'test-user-id'],
                recipeId: 'recipe-123',
            };

            (prisma.comment.findUnique as jest.Mock).mockResolvedValueOnce(
                mockComment
            );
            (prisma.comment.update as jest.Mock).mockResolvedValueOnce({
                ...mockComment,
                likedIds: ['other-user-id'],
            });

            const mockParams = {
                params: Promise.resolve({ commentId: 'comment-123' }),
            };

            const response = await CommentLikeDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(prisma.comment.update).toHaveBeenCalledWith({
                where: { id: 'comment-123' },
                data: { likedIds: ['other-user-id'] },
            });
            expect(response.status).toBe(200);
            expect(data.likedIds).not.toContain('test-user-id');
        });

        it('should return comment immediately if not liked yet', async () => {
            mockedSession = {
                expires: 'expires',
                user: { name: 'test', email: 'test@a.com' },
            };

            const mockComment = {
                id: 'comment-123',
                comment: 'test comment',
                likedIds: ['other-user-id'],
                recipeId: 'recipe-123',
            };

            (prisma.comment.findUnique as jest.Mock).mockResolvedValueOnce(
                mockComment
            );

            const mockParams = {
                params: Promise.resolve({ commentId: 'comment-123' }),
            };

            const response = await CommentLikeDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(prisma.comment.update).not.toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(data.likedIds).not.toContain('test-user-id');
        });
    });
});
