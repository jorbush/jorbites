import { expect } from '@jest/globals';
import {
    POST as RecipePOST,
    DELETE as RecipeDELETE,
    PATCH as RecipePATCH,
} from '@/app/api/recipe/[recipeId]/route';
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

describe('Recipe API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/recipe/[recipeId]', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    operation: 'increment',
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'test-recipe-id' }),
            };

            const response = await RecipePOST(mockRequest, mockParams);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to interact with recipe'
            );
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when recipe ID is invalid', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    operation: 'increment',
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: '' }),
            };

            const response = await RecipePOST(mockRequest, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Recipe ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when operation is invalid', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    operation: 'invalid',
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'test-recipe-id' }),
            };

            const response = await RecipePOST(mockRequest, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Operation must be either "increment" or "decrement"'
            );
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });
    });

    describe('DELETE /api/recipe/[recipeId]', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'test-recipe-id' }),
            };

            const response = await RecipeDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to delete recipe'
            );
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when recipe ID is invalid', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const mockParams = {
                params: Promise.resolve({ recipeId: '' }),
            };

            const response = await RecipeDELETE({} as Request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Recipe ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
            expect(data.timestamp).toBeDefined();
        });
    });

    describe('PATCH /api/recipe/[recipeId]', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockedSession = null;

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    title: 'Updated Recipe',
                    description: 'Updated description',
                    category: 'Dinner',
                    method: 'Baking',
                    imageSrc: 'http://test.jpg',
                    ingredients: ['Ingredient 1'],
                    steps: ['Step 1'],
                    minutes: 30,
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'test-recipe-id' }),
            };

            const response = await RecipePATCH(mockRequest, mockParams);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe(
                'User authentication required to edit recipe'
            );
            expect(data.code).toBe('UNAUTHORIZED');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when recipe ID is invalid', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    title: 'Updated Recipe',
                    description: 'Updated description',
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: '' }),
            };

            const response = await RecipePATCH(mockRequest, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Recipe ID is required and must be a valid string'
            );
            expect(data.code).toBe('INVALID_INPUT');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 400 when required fields are missing', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    // Missing title and description
                    category: 'Dinner',
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'test-recipe-id' }),
            };

            const response = await RecipePATCH(mockRequest, mockParams);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe(
                'Missing required fields: title and description are required'
            );
            expect(data.code).toBe('BAD_REQUEST');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 422 when title is too long', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const longTitle = 'a'.repeat(101); // Assuming max length is 100

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    title: longTitle,
                    description: 'Valid description',
                    category: 'Dinner',
                    method: 'Baking',
                    imageSrc: 'http://test.jpg',
                    ingredients: ['Ingredient 1'],
                    steps: ['Step 1'],
                    minutes: 30,
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'test-recipe-id' }),
            };

            const response = await RecipePATCH(mockRequest, mockParams);
            const data = await response.json();

            expect(response.status).toBe(422);
            expect(data.error).toContain('Title must be');
            expect(data.code).toBe('VALIDATION_ERROR');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 422 when ingredients array is too long', async () => {
            mockedSession = {
                expires: 'expires',
                user: {
                    name: 'test',
                    email: 'test@a.com',
                },
            };

            const tooManyIngredients = Array(31).fill('Ingredient'); // Assuming max is 30

            const mockRequest = {
                json: jest.fn().mockResolvedValue({
                    title: 'Valid title',
                    description: 'Valid description',
                    category: 'Dinner',
                    method: 'Baking',
                    imageSrc: 'http://test.jpg',
                    ingredients: tooManyIngredients,
                    steps: ['Step 1'],
                    minutes: 30,
                }),
            } as unknown as Request;

            const mockParams = {
                params: Promise.resolve({ recipeId: 'test-recipe-id' }),
            };

            const response = await RecipePATCH(mockRequest, mockParams);
            const data = await response.json();

            expect(response.status).toBe(422);
            expect(data.error).toContain('cannot have more than');
            expect(data.code).toBe('VALIDATION_ERROR');
            expect(data.timestamp).toBeDefined();
        });
    });
});
