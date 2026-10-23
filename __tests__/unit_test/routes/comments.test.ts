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

// Mock prisma
jest.mock('@/app/lib/prismadb', () => ({
    recipe: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    comment: {
        aggregate: jest.fn(),
    },
}));

// Mock sendNotification
jest.mock('@/app/actions/sendNotification', () => jest.fn());

// Mock badgeForge
jest.mock('@/app/lib/badgeForge', () => ({
    triggerBadgeForgeEvaluation: jest.fn().mockResolvedValue(true),
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

import prisma from '@/app/lib/prismadb';
import sendNotification from '@/app/actions/sendNotification';
import { triggerBadgeForgeEvaluation } from '@/app/lib/badgeForge';
import { NotificationType } from '@/app/types/notification';

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

        it('should return 400 when rating is less than 1', async () => {
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
                    comment: 'Good',
                    rating: 0,
                }),
            } as unknown as Request;

            const response = await CommentPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Rating must be an integer between 1 and 5'
            );
            expect(data.code).toBe('VALIDATION_ERROR');
        });

        it('should return 400 when rating is greater than 5', async () => {
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
                    comment: 'Good',
                    rating: 6,
                }),
            } as unknown as Request;

            const response = await CommentPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Rating must be an integer between 1 and 5'
            );
            expect(data.code).toBe('VALIDATION_ERROR');
        });

        it('should return 400 when rating is not an integer', async () => {
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
                    comment: 'Good',
                    rating: 4.5,
                }),
            } as unknown as Request;

            const response = await CommentPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Rating must be an integer between 1 and 5'
            );
            expect(data.code).toBe('VALIDATION_ERROR');
        });

        it('should return 400 when rating is a non-numeric value', async () => {
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
                    comment: 'Good',
                    rating: 'awesome',
                }),
            } as unknown as Request;

            const response = await CommentPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Rating must be an integer between 1 and 5'
            );
            expect(data.code).toBe('VALIDATION_ERROR');
        });

        it('should create comment successfully, compute rating aggregates, and update recipe metadata', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'Commenter',
                    email: 'commenter@example.com',
                },
            };

            const mockRecipe = {
                id: 'test-recipe-id',
                userId: 'owner-id',
                user: {
                    email: 'owner@example.com',
                },
            };

            const mockRecipeAndComment = {
                id: 'test-recipe-id',
                comments: [
                    {
                        id: 'comment-123',
                        userId: 'test-user-id',
                        comment: 'Great recipe!',
                        rating: 5,
                    },
                ],
            };

            const mockStats = {
                _avg: { rating: 5.0 },
                _count: { rating: 1 },
            };

            (prisma.recipe.findUnique as jest.Mock).mockResolvedValueOnce(
                mockRecipe
            );
            (prisma.recipe.update as jest.Mock).mockResolvedValueOnce(
                mockRecipeAndComment
            );
            (prisma.comment.aggregate as jest.Mock).mockResolvedValueOnce(
                mockStats
            );

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    recipeId: 'test-recipe-id',
                    comment: 'Great recipe!',
                    rating: 5,
                }),
            } as unknown as Request;

            const response = await CommentPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockRecipeAndComment);

            // Assert comment creation payload and recipe metadata update
            expect(prisma.recipe.update).toHaveBeenCalledWith({
                where: { id: 'test-recipe-id' },
                data: {
                    comments: {
                        create: {
                            userId: 'test-user-id',
                            comment: 'Great recipe!',
                            rating: 5,
                            isCooked: false,
                            imageSrc: null,
                        },
                    },
                    averageRating: 5.0,
                    ratingCount: 2,
                },
                include: {
                    comments: true,
                },
            });
            // Assert aggregate calculation query
            expect(prisma.comment.aggregate).toHaveBeenCalledWith({
                where: {
                    recipeId: 'test-recipe-id',
                    rating: { not: null },
                },
                _avg: { rating: true },
                _count: { rating: true },
            });
        });

        it('should create comment with isCooked true and imageSrc when provided', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'Cooker',
                    email: 'cooker@example.com',
                },
            };

            const mockRecipe = {
                id: 'recipe-cooked-id',
                userId: 'owner-id',
                user: { email: 'owner@example.com' },
            };

            const mockRecipeAndComment = {
                id: 'recipe-cooked-id',
                comments: [
                    {
                        id: 'comment-cooked-1',
                        userId: 'test-user-id',
                        comment: 'I cooked this!',
                        rating: 5,
                        isCooked: true,
                        imageSrc:
                            'https://images.jorbites.com/remakes/photo.webp',
                    },
                ],
            };

            (prisma.recipe.findUnique as jest.Mock).mockResolvedValueOnce(
                mockRecipe
            );
            (prisma.recipe.update as jest.Mock).mockResolvedValueOnce(
                mockRecipeAndComment
            );
            (prisma.comment.aggregate as jest.Mock).mockResolvedValueOnce({
                _avg: { rating: 5.0 },
                _count: { rating: 1 },
            });

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    recipeId: 'recipe-cooked-id',
                    comment: 'I cooked this!',
                    rating: 5,
                    isCooked: true,
                    imageSrc: 'https://images.jorbites.com/remakes/photo.webp',
                }),
            } as unknown as Request;

            const response = await CommentPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockRecipeAndComment);
            expect(prisma.recipe.update).toHaveBeenCalledWith({
                where: { id: 'recipe-cooked-id' },
                data: {
                    comments: {
                        create: {
                            userId: 'test-user-id',
                            comment: 'I cooked this!',
                            rating: 5,
                            isCooked: true,
                            imageSrc:
                                'https://images.jorbites.com/remakes/photo.webp',
                        },
                    },
                    averageRating: 5.0,
                    ratingCount: 2,
                },
                include: {
                    comments: true,
                },
            });
            expect(sendNotification).toHaveBeenCalledWith({
                type: NotificationType.NEW_COOKSNAP,
                userEmail: 'owner@example.com',
                params: {
                    userName: 'Cooker',
                    recipeId: 'recipe-cooked-id',
                    recipeName: undefined,
                },
            });
            expect(triggerBadgeForgeEvaluation).toHaveBeenCalledWith(
                'test-user-id',
                'COOKSNAP_POSTED'
            );
        });

        it('should create regular comment with imageSrc when isCooked is false, dispatching NEW_COMMENT and not triggering badge evaluation', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'Asker',
                    email: 'asker@example.com',
                },
            };

            const mockRecipe = {
                id: 'recipe-question-id',
                userId: 'owner-id',
                user: { email: 'owner@example.com' },
            };

            const mockRecipeAndComment = {
                id: 'recipe-question-id',
                comments: [
                    {
                        id: 'comment-q-1',
                        userId: 'test-user-id',
                        comment: 'Does this dough texture look right?',
                        rating: null,
                        isCooked: false,
                        imageSrc:
                            'https://images.jorbites.com/remakes/dough.webp',
                    },
                ],
            };

            (prisma.recipe.findUnique as jest.Mock).mockResolvedValueOnce(
                mockRecipe
            );
            (prisma.recipe.update as jest.Mock).mockResolvedValueOnce(
                mockRecipeAndComment
            );
            (prisma.comment.aggregate as jest.Mock).mockResolvedValueOnce({
                _avg: { rating: null },
                _count: { rating: 0 },
            });

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    recipeId: 'recipe-question-id',
                    comment: 'Does this dough texture look right?',
                    isCooked: false,
                    imageSrc: 'https://images.jorbites.com/remakes/dough.webp',
                }),
            } as unknown as Request;

            const response = await CommentPOST(mockRequest);
            expect(response.status).toBe(200);

            expect(prisma.recipe.update).toHaveBeenCalledWith({
                where: { id: 'recipe-question-id' },
                data: {
                    comments: {
                        create: {
                            userId: 'test-user-id',
                            comment: 'Does this dough texture look right?',
                            rating: null,
                            isCooked: false,
                            imageSrc:
                                'https://images.jorbites.com/remakes/dough.webp',
                        },
                    },
                    averageRating: 0,
                    ratingCount: 0,
                },
                include: {
                    comments: true,
                },
            });

            expect(sendNotification).toHaveBeenCalledWith({
                type: NotificationType.NEW_COMMENT,
                userEmail: 'owner@example.com',
                params: {
                    userName: 'Asker',
                    recipeId: 'recipe-question-id',
                    recipeName: undefined,
                },
            });
            expect(triggerBadgeForgeEvaluation).not.toHaveBeenCalledWith(
                'test-user-id',
                'COOKSNAP_POSTED'
            );
        });

        it('should not send notification when author posts a comment or cooksnap on their own recipe', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'AuthorUser',
                    email: 'author@example.com',
                },
            };

            const mockRecipe = {
                id: 'own-recipe-id',
                userId: 'test-user-id',
                title: 'My Own Recipe',
                user: {
                    email: 'author@example.com',
                },
            };

            const mockRecipeAndComment = {
                id: 'own-recipe-id',
                comments: [
                    {
                        id: 'comment-self-1',
                        userId: 'test-user-id',
                        comment: 'Cooked my own dish again!',
                        rating: 5,
                        isCooked: true,
                        imageSrc:
                            'https://images.jorbites.com/remakes/photo.webp',
                    },
                ],
            };

            (prisma.recipe.findUnique as jest.Mock).mockResolvedValueOnce(
                mockRecipe
            );
            (prisma.recipe.update as jest.Mock).mockResolvedValueOnce(
                mockRecipeAndComment
            );
            (prisma.comment.aggregate as jest.Mock).mockResolvedValueOnce({
                _avg: { rating: 5.0 },
                _count: { rating: 1 },
            });

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    recipeId: 'own-recipe-id',
                    comment: 'Cooked my own dish again!',
                    rating: 5,
                    isCooked: true,
                    imageSrc: 'https://images.jorbites.com/remakes/photo.webp',
                }),
            } as unknown as Request;

            const response = await CommentPOST(mockRequest);
            expect(response.status).toBe(200);

            expect(sendNotification).not.toHaveBeenCalled();
            expect(triggerBadgeForgeEvaluation).toHaveBeenCalledWith(
                'test-user-id',
                'COOKSNAP_POSTED'
            );
        });
    });
});
