import { expect } from '@jest/globals';

// Mock dependencies before importing route handlers

// Mock authOptions (required transitively by getCurrentUser)
jest.mock('@/pages/api/auth/[...nextauth].ts', () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));

jest.mock('@/app/lib/prismadb', () => ({
    comment: { findUnique: jest.fn(), update: jest.fn() },
    recipe: { findUnique: jest.fn(), update: jest.fn() },
    workshop: { findUnique: jest.fn() },
    workshopParticipant: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
    quest: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    user: { findFirst: jest.fn(), update: jest.fn() },
    recipeVote: { findUnique: jest.fn() },
}));

jest.mock('@/app/actions/getCurrentUser');
jest.mock('@/app/actions/sendNotification');
jest.mock('@/app/actions/updateUserLevel');
jest.mock('@/app/actions/getRecipeById');

jest.mock('@/app/lib/redis', () => ({
    redisCache: {
        del: jest.fn(() => Promise.resolve()),
        get: jest.fn(() => Promise.resolve(null)),
        set: jest.fn(() => Promise.resolve()),
        incr: jest.fn(() => Promise.resolve(1)),
    },
}));

jest.mock('@/app/lib/axiom/server', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('@/app/utils/cloudinary', () => ({
    deleteFromCloudinary: jest.fn(),
    deleteMultipleFromCloudinary: jest.fn(),
    isCloudinaryUrl: jest.fn(),
}));

jest.mock('@/app/utils/recipeValidation', () => ({
    validateRecipeCreateData: jest.fn(),
    validateRecipeUpdateData: jest.fn(),
}));

jest.mock('@/app/lib/top-recipe-vote', () => ({
    getActiveSession: jest.fn(),
    getSessionDetails: jest.fn(),
    openVoteSession: jest.fn(),
    closeVoteSession: jest.fn(),
    castVote: jest.fn(),
}));

jest.mock('@/app/lib/ratelimit', () => ({
    authenticatedRatelimit: { limit: jest.fn() },
    unauthenticatedRatelimit: { limit: jest.fn() },
    registrationRatelimit: { limit: jest.fn() },
    passwordResetRatelimit: { limit: jest.fn() },
    contentCreationRatelimit: { limit: jest.fn() },
    recipeBookRatelimit: { limit: jest.fn() },
}));

// Import route handlers after mocks are set up
import { POST as CommentLikePOST } from '@/app/api/comments/[commentId]/like/route';
import { POST as RecipePOST } from '@/app/api/recipe/[recipeId]/route';
import { POST as WorkshopJoinPOST } from '@/app/api/workshop/[workshopId]/join/route';
import { POST as QuestsPOST } from '@/app/api/quests/route';
import { PATCH as QuestPATCH } from '@/app/api/quest/[questId]/route';
import { PATCH as UserNamePATCH } from '@/app/api/userName/[userId]/route';
import { PATCH as UserImagePATCH } from '@/app/api/userImage/[userId]/route';
import { POST as TopRecipeVotePOST } from '@/app/api/top-recipe-vote/route';
import { GET as SearchGET } from '@/app/api/search/route';

import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    authenticatedRatelimit,
    contentCreationRatelimit,
} from '@/app/lib/ratelimit';

describe('L-4 Rate Limiting Audit Fixes', () => {
    const originalEnv = process.env.ENV;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.ENV = 'production';
        (getCurrentUser as jest.Mock).mockResolvedValue({
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
        });
    });

    afterEach(() => {
        process.env.ENV = originalEnv;
    });

    it('POST /api/comments/[commentId]/like should enforce rate limit', async () => {
        (authenticatedRatelimit.limit as jest.Mock).mockResolvedValueOnce({
            success: false,
            reset: Date.now() + 10000,
        });

        const req = new Request('http://localhost/api/comments/c1/like', {
            method: 'POST',
        });
        const res = await CommentLikePOST(req, {
            params: Promise.resolve({ commentId: 'c1' }),
        });
        const data = await res.json();

        expect(res.status).toBe(429);
        expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(authenticatedRatelimit.limit).toHaveBeenCalledWith('user-123');
    });

    it('POST /api/recipe/[recipeId] should enforce rate limit', async () => {
        (authenticatedRatelimit.limit as jest.Mock).mockResolvedValueOnce({
            success: false,
            reset: Date.now() + 10000,
        });

        const req = new Request('http://localhost/api/recipe/r1', {
            method: 'POST',
            body: JSON.stringify({ operation: 'increment' }),
        });
        const res = await RecipePOST(req, {
            params: Promise.resolve({ recipeId: 'r1' }),
        });
        const data = await res.json();

        expect(res.status).toBe(429);
        expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(authenticatedRatelimit.limit).toHaveBeenCalledWith('user-123');
    });

    it('POST /api/workshop/[workshopId]/join should enforce rate limit', async () => {
        (authenticatedRatelimit.limit as jest.Mock).mockResolvedValueOnce({
            success: false,
            reset: Date.now() + 10000,
        });

        const req = new Request('http://localhost/api/workshop/w1/join', {
            method: 'POST',
            body: JSON.stringify({ action: 'join' }),
        });
        const res = await WorkshopJoinPOST(req, {
            params: Promise.resolve({ workshopId: 'w1' }),
        });
        const data = await res.json();

        expect(res.status).toBe(429);
        expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(authenticatedRatelimit.limit).toHaveBeenCalledWith('user-123');
    });

    it('POST /api/quests should enforce content creation rate limit', async () => {
        (contentCreationRatelimit.limit as jest.Mock).mockResolvedValueOnce({
            success: false,
            reset: Date.now() + 10000,
        });

        const req = new Request('http://localhost/api/quests', {
            method: 'POST',
            body: JSON.stringify({ title: 'New Quest', description: 'Desc' }),
        });
        const res = await QuestsPOST(req);
        const data = await res.json();

        expect(res.status).toBe(429);
        expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(contentCreationRatelimit.limit).toHaveBeenCalledWith('user-123');
    });

    it('PATCH /api/quest/[questId] should enforce rate limit', async () => {
        (authenticatedRatelimit.limit as jest.Mock).mockResolvedValueOnce({
            success: false,
            reset: Date.now() + 10000,
        });

        const req = new Request('http://localhost/api/quest/q1', {
            method: 'PATCH',
            body: JSON.stringify({ title: 'Updated Title' }),
        });
        const res = await QuestPATCH(req, {
            params: Promise.resolve({ questId: 'q1' }),
        });
        const data = await res.json();

        expect(res.status).toBe(429);
        expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(authenticatedRatelimit.limit).toHaveBeenCalledWith('user-123');
    });

    it('PATCH /api/userName/[userId] should enforce rate limit', async () => {
        (authenticatedRatelimit.limit as jest.Mock).mockResolvedValueOnce({
            success: false,
            reset: Date.now() + 10000,
        });

        const req = new Request('http://localhost/api/userName/user-123', {
            method: 'PATCH',
            body: JSON.stringify({ userName: 'newname' }),
        });
        const res = await UserNamePATCH(req);
        const data = await res.json();

        expect(res.status).toBe(429);
        expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(authenticatedRatelimit.limit).toHaveBeenCalledWith('user-123');
    });

    it('PATCH /api/userImage/[userId] should enforce rate limit', async () => {
        (authenticatedRatelimit.limit as jest.Mock).mockResolvedValueOnce({
            success: false,
            reset: Date.now() + 10000,
        });

        const req = new Request('http://localhost/api/userImage/user-123', {
            method: 'PATCH',
            body: JSON.stringify({ userImage: 'https://example.com/img.jpg' }),
        });
        const res = await UserImagePATCH(req);
        const data = await res.json();

        expect(res.status).toBe(429);
        expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(authenticatedRatelimit.limit).toHaveBeenCalledWith('user-123');
    });

    it('POST /api/top-recipe-vote should enforce rate limit for user votes', async () => {
        (authenticatedRatelimit.limit as jest.Mock).mockResolvedValueOnce({
            success: false,
            reset: Date.now() + 10000,
        });

        const req = new Request('http://localhost/api/top-recipe-vote', {
            method: 'POST',
            body: JSON.stringify({ sessionId: 's1', recipeId: 'r1' }),
        });
        const res = await TopRecipeVotePOST(req);
        const data = await res.json();

        expect(res.status).toBe(429);
        expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(authenticatedRatelimit.limit).toHaveBeenCalledWith('user-123');
    });

    it('GET /api/search should enforce rate limit', async () => {
        (authenticatedRatelimit.limit as jest.Mock).mockResolvedValueOnce({
            success: false,
            reset: Date.now() + 10000,
        });

        const req = new Request('http://localhost/api/search?q=recipes', {
            method: 'GET',
        });
        const res = await SearchGET(req);
        const data = await res.json();

        expect(res.status).toBe(429);
        expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(authenticatedRatelimit.limit).toHaveBeenCalledWith('user-123');
    });
});
