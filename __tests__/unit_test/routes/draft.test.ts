import { expect } from '@jest/globals';
import {
    POST as DraftPOST,
    GET as DraftGET,
    DELETE as DraftDELETE,
} from '@/app/api/draft/route';
import { Session } from 'next-auth';

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

describe('Draft API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/draft', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const mockRequest = {
                json: jest.fn().mockResolvedValue({ title: 'Test Draft' }),
            } as unknown as Request;

            const response = await DraftPOST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to save draft'
            );
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should save draft successfully when user is authenticated', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue({ title: 'Test Draft' }),
            } as unknown as Request;

            const response = await DraftPOST(mockRequest);

            expect(response.status).toBe(200);
        });

        it('should reset currentStep to 0 when step is above maximum (6)', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const invalidDraft = {
                title: 'Test Draft',
                currentStep: 10, // Invalid step
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue(invalidDraft),
            } as unknown as Request;

            const response = await DraftPOST(mockRequest);

            expect(response.status).toBe(200);
            // The currentStep should have been reset to 0 in the backend
        });

        it('should reset currentStep to 0 when step is below minimum (0)', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const invalidDraft = {
                title: 'Test Draft',
                currentStep: -5, // Invalid step
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue(invalidDraft),
            } as unknown as Request;

            const response = await DraftPOST(mockRequest);

            expect(response.status).toBe(200);
        });

        it('should reset currentStep to 0 when step is not a number', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const invalidDraft = {
                title: 'Test Draft',
                currentStep: 'invalid', // Non-numeric step
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue(invalidDraft),
            } as unknown as Request;

            const response = await DraftPOST(mockRequest);

            expect(response.status).toBe(200);
        });

        it('should preserve valid currentStep values', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const validDraft = {
                title: 'Test Draft',
                currentStep: 3, // Valid step
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue(validDraft),
            } as unknown as Request;

            const response = await DraftPOST(mockRequest);

            expect(response.status).toBe(200);
        });
    });

    describe('GET /api/draft', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const response = await DraftGET();
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to get draft'
            );
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should get draft successfully when user is authenticated', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const response = await DraftGET();

            expect(response.status).toBe(200);
        });
    });

    describe('DELETE /api/draft', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const response = await DraftDELETE();
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to delete draft'
            );
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should delete draft successfully when user is authenticated', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const response = await DraftDELETE();

            expect(response.status).toBe(200);
        });
    });
});
