import { expect } from '@jest/globals';
import { Session } from 'next-auth';
import { POST as QuestPOST } from '@/app/api/quests/route';
import {
    GET as QuestGET,
    PATCH as QuestPATCH,
    DELETE as QuestDELETE,
} from '@/app/api/quest/[questId]/route';
import { NextRequest } from 'next/server';

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

import {
    QUEST_DESCRIPTION_MAX_LENGTH,
    QUEST_TITLE_MAX_LENGTH,
} from '@/app/utils/constants';

describe('Quests API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 when user is not authenticated on POST', async () => {
        mockedSession = null;

        const request = new NextRequest('http://localhost:3000/api/quests', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Test Quest',
                description: 'Test description',
            }),
        });

        const response = await QuestPOST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('User authentication required to create quest');
        expect(data.code).toBe('UNAUTHORIZED');
        expect(data.timestamp).toBeDefined();
    });

    it('should return 400 when required fields are missing on POST', async () => {
        mockedSession = {
            expires: 'expires',
            user: {
                name: 'test',
                email: 'test@a.com',
            },
        };

        const request = new NextRequest('http://localhost:3000/api/quests', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Test Quest',
                // description missing
            }),
        });

        const response = await QuestPOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            'Missing required fields: title and description are required'
        );
        expect(data.code).toBe('BAD_REQUEST');
        expect(data.timestamp).toBeDefined();
    });

    it('should return 400 when title exceeds max length on POST', async () => {
        mockedSession = {
            expires: 'expires',
            user: {
                name: 'test',
                email: 'test@a.com',
            },
        };

        const request = new NextRequest('http://localhost:3000/api/quests', {
            method: 'POST',
            body: JSON.stringify({
                title: 'a'.repeat(QUEST_TITLE_MAX_LENGTH + 1),
                description: 'Test description',
            }),
        });

        const response = await QuestPOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            `Title must be ${QUEST_TITLE_MAX_LENGTH} characters or less`
        );
        expect(data.code).toBe('VALIDATION_ERROR');
        expect(data.timestamp).toBeDefined();
    });

    it('should return 400 when description exceeds max length on POST', async () => {
        mockedSession = {
            expires: 'expires',
            user: {
                name: 'test',
                email: 'test@a.com',
            },
        };

        const request = new NextRequest('http://localhost:3000/api/quests', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Test Quest',
                description: 'a'.repeat(QUEST_DESCRIPTION_MAX_LENGTH + 1),
            }),
        });

        const response = await QuestPOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
            `Description must be ${QUEST_DESCRIPTION_MAX_LENGTH} characters or less`
        );
        expect(data.code).toBe('VALIDATION_ERROR');
        expect(data.timestamp).toBeDefined();
    });

    it('should return 400 when questId is invalid on GET', async () => {
        const mockParams = {
            params: Promise.resolve({ questId: '' }),
        };

        const response = await QuestGET({} as unknown as Request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid quest ID');
        expect(data.code).toBe('BAD_REQUEST');
        expect(data.timestamp).toBeDefined();
    });

    it('should return 401 when user is not authenticated on PATCH', async () => {
        mockedSession = null;

        const mockParams = {
            params: Promise.resolve({ questId: 'test-id' }),
        };

        const request = new NextRequest(
            'http://localhost:3000/api/quest/test-id',
            {
                method: 'PATCH',
                body: JSON.stringify({
                    title: 'Updated Title',
                }),
            }
        );

        const response = await QuestPATCH(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('User authentication required to update quest');
        expect(data.code).toBe('UNAUTHORIZED');
        expect(data.timestamp).toBeDefined();
    });

    it('should return 400 when questId is invalid on PATCH', async () => {
        mockedSession = {
            expires: 'expires',
            user: {
                name: 'test',
                email: 'test@a.com',
            },
        };

        const mockParams = {
            params: Promise.resolve({ questId: '' }),
        };

        const request = new NextRequest('http://localhost:3000/api/quest/', {
            method: 'PATCH',
            body: JSON.stringify({
                title: 'Updated Title',
            }),
        });

        const response = await QuestPATCH(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid quest ID');
        expect(data.code).toBe('BAD_REQUEST');
        expect(data.timestamp).toBeDefined();
    });

    it('should return 400 when questId is invalid on DELETE', async () => {
        mockedSession = {
            expires: 'expires',
            user: {
                name: 'test',
                email: 'test@a.com',
            },
        };

        const mockParams = {
            params: Promise.resolve({ questId: '' }),
        };

        const request = new NextRequest('http://localhost:3000/api/quest/', {
            method: 'DELETE',
        });

        const response = await QuestDELETE(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid quest ID');
        expect(data.code).toBe('BAD_REQUEST');
        expect(data.timestamp).toBeDefined();
    });

    it('should return 401 when user is not authenticated on DELETE', async () => {
        mockedSession = null;

        const mockParams = {
            params: Promise.resolve({ questId: 'test-id' }),
        };

        const response = await QuestDELETE(
            {} as unknown as Request,
            mockParams
        );
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('User authentication required to delete quest');
        expect(data.code).toBe('UNAUTHORIZED');
        expect(data.timestamp).toBeDefined();
    });
});
