import { GET, POST } from '@/app/api/lists/route';
import { PATCH, DELETE } from '@/app/api/lists/[listId]/route';
import {
    POST as POST_RECIPE,
    DELETE as DELETE_RECIPE,
} from '@/app/api/lists/[listId]/recipes/[recipeId]/route';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';

jest.mock('@/app/actions/getCurrentUser');
jest.mock('@/app/lib/prismadb', () => ({
    list: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
    },
    recipe: {
        findUnique: jest.fn(),
    },
}));

const mockGetCurrentUser = getCurrentUser as jest.Mock;

describe('Lists API Endpoints - Error Cases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/lists', () => {
        it('should return 401 if user is not authenticated', async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            const request = new Request('http://localhost/api/lists');
            const response = await GET(request);
            expect(response.status).toBe(401);
        });

        it('should return 500 on internal error', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
            (prisma.list.findMany as jest.Mock).mockRejectedValue(
                new Error('DB Error')
            );
            const request = new Request('http://localhost/api/lists');
            const response = await GET(request);
            expect(response.status).toBe(500);
        });
    });

    describe('POST /api/lists', () => {
        it('should return 401 if user is not authenticated', async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            const request = new Request('http://localhost/api/lists', {
                method: 'POST',
                body: JSON.stringify({ name: 'My List' }),
            });
            const response = await POST(request);
            expect(response.status).toBe(401);
        });

        it('should return 400 if name is missing', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
            const request = new Request('http://localhost/api/lists', {
                method: 'POST',
                body: JSON.stringify({ isPrivate: true }),
            });
            const response = await POST(request);
            expect(response.status).toBe(400);
        });

        it('should successfully create a list', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
            const mockList = {
                id: 'list-id',
                name: 'My List',
                isDefault: false,
                isPrivate: true,
                userId: 'user-id',
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                    id: 'user-id',
                    name: 'User',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            };
            (prisma.list.create as jest.Mock).mockResolvedValue(mockList);

            const request = new Request('http://localhost/api/lists', {
                method: 'POST',
                body: JSON.stringify({ name: 'My List' }),
            });
            const response = await POST(request);
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.name).toBe('My List');
            expect(data.isDefault).toBe(false);
        });

        it('should successfully create a default list and handle parallel creation gracefully', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
            const mockList = {
                id: 'list-id',
                name: 'to cook later',
                isDefault: true,
                isPrivate: true,
                userId: 'user-id',
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                    id: 'user-id',
                    name: 'User',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            };
            (prisma.list.create as jest.Mock).mockRejectedValue(
                new Error('Unique constraint failed')
            );
            (prisma.list.findFirst as jest.Mock).mockResolvedValue(mockList);

            const request = new Request('http://localhost/api/lists', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'to cook later',
                    isDefault: true,
                }),
            });
            const response = await POST(request);
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.name).toBe('to cook later');
            expect(data.isDefault).toBe(true);
        });
    });

    describe('PATCH /api/lists/[listId]', () => {
        it('should return 401 if user is not authenticated', async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            const request = new Request('http://localhost/api/lists/list-id', {
                method: 'PATCH',
                body: JSON.stringify({ name: 'Updated' }),
            });
            const response = await PATCH(request, {
                params: Promise.resolve({ listId: 'list-id' }),
            });
            expect(response.status).toBe(401);
        });

        it('should return 404 if list not found', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
            (prisma.list.findUnique as jest.Mock).mockResolvedValue(null);
            const request = new Request('http://localhost/api/lists/list-id', {
                method: 'PATCH',
                body: JSON.stringify({ name: 'Updated' }),
            });
            const response = await PATCH(request, {
                params: Promise.resolve({ listId: 'list-id' }),
            });
            expect(response.status).toBe(404);
        });

        it('should return 404 if user is not list owner', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
            (prisma.list.findUnique as jest.Mock).mockResolvedValue({
                userId: 'other-user-id',
            });
            const request = new Request('http://localhost/api/lists/list-id', {
                method: 'PATCH',
                body: JSON.stringify({ name: 'Updated' }),
            });
            const response = await PATCH(request, {
                params: Promise.resolve({ listId: 'list-id' }),
            });
            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/lists/[listId]', () => {
        it('should return 401 if user is not authenticated', async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            const request = new Request('http://localhost/api/lists/list-id', {
                method: 'DELETE',
            });
            const response = await DELETE(request, {
                params: Promise.resolve({ listId: 'list-id' }),
            });
            expect(response.status).toBe(401);
        });

        it('should return 400 if trying to delete default list', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
            (prisma.list.findUnique as jest.Mock).mockResolvedValue({
                userId: 'user-id',
                isDefault: true,
            });
            const request = new Request('http://localhost/api/lists/list-id', {
                method: 'DELETE',
            });
            const response = await DELETE(request, {
                params: Promise.resolve({ listId: 'list-id' }),
            });
            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/lists/[listId]/recipes/[recipeId]', () => {
        it('should return 401 if user is not authenticated', async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            const request = new Request('http://localhost');
            const response = await POST_RECIPE(request, {
                params: Promise.resolve({
                    listId: 'list-id',
                    recipeId: 'recipe-id',
                }),
            });
            expect(response.status).toBe(401);
        });

        it('should return 404 if recipe not found', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-id' });
            (prisma.list.findUnique as jest.Mock).mockResolvedValue({
                userId: 'user-id',
            });
            (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(null);
            const request = new Request('http://localhost');
            const response = await POST_RECIPE(request, {
                params: Promise.resolve({
                    listId: 'list-id',
                    recipeId: 'recipe-id',
                }),
            });
            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/lists/[listId]/recipes/[recipeId]', () => {
        it('should return 401 if user is not authenticated', async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            const request = new Request('http://localhost');
            const response = await DELETE_RECIPE(request, {
                params: Promise.resolve({
                    listId: 'list-id',
                    recipeId: 'recipe-id',
                }),
            });
            expect(response.status).toBe(401);
        });
    });
});
