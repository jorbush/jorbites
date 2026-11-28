import { GET, POST } from '@/app/api/plannings/route';
import {
    GET as GET_DETAIL,
    PATCH,
    DELETE,
} from '@/app/api/plannings/[planningId]/route';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';

jest.mock('@/app/actions/getCurrentUser');
jest.mock('@/app/lib/prismadb', () => ({
    planning: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    planningMeal: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(prisma)),
}));

const mockGetCurrentUser = getCurrentUser as jest.Mock;

describe('Plannings API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/plannings', () => {
        it('should return 200 with list of public plannings', async () => {
            (prisma.planning.findMany as jest.Mock).mockResolvedValue([
                {
                    id: 'plan-1',
                    name: 'Plan 1',
                    createdAt: new Date('2026-05-25T18:00:00.000Z'),
                    updatedAt: new Date('2026-05-25T18:00:00.000Z'),
                    user: {
                        createdAt: new Date('2026-05-01T00:00:00.000Z'),
                        updatedAt: new Date('2026-05-01T00:00:00.000Z'),
                        emailVerified: null,
                    },
                    meals: [],
                },
            ]);

            const response = await GET();
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.length).toBe(1);
        });

        it('should return 500 on database error', async () => {
            (prisma.planning.findMany as jest.Mock).mockRejectedValue(
                new Error('Database error')
            );

            const response = await GET();
            expect(response.status).toBe(500);
        });
    });

    describe('POST /api/plannings', () => {
        it('should return 401 if unauthenticated', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new Request('http://localhost/api/plannings', {
                method: 'POST',
                body: JSON.stringify({ name: 'Diet Plan' }),
            });
            const response = await POST(request);

            expect(response.status).toBe(401);
        });

        it('should return 400 if name is missing or invalid', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });

            const request = new Request('http://localhost/api/plannings', {
                method: 'POST',
                body: JSON.stringify({ description: 'No Name Plan' }),
            });
            const response = await POST(request);

            expect(response.status).toBe(400);
        });

        it('should return 400 if more than 4 recipes are added to the same meal slot', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });

            const tooManyMeals = [
                { day: 'monday', mealType: 'breakfast', recipeId: 'r1' },
                { day: 'monday', mealType: 'breakfast', recipeId: 'r2' },
                { day: 'monday', mealType: 'breakfast', recipeId: 'r3' },
                { day: 'monday', mealType: 'breakfast', recipeId: 'r4' },
                { day: 'monday', mealType: 'breakfast', recipeId: 'r5' },
            ];

            const request = new Request('http://localhost/api/plannings', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Keto Diet',
                    meals: tooManyMeals,
                }),
            });
            const response = await POST(request);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toContain(
                'Maximum of 4 recipes allowed per meal'
            );
        });

        it('should create new plan on success', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
            (prisma.planning.create as jest.Mock).mockResolvedValue({
                id: 'plan-1',
                name: 'Keto Diet',
                description: 'Keto plan description',
                isPrivate: true,
                userId: 'user-1',
                createdAt: new Date('2026-05-25T18:00:00.000Z'),
                updatedAt: new Date('2026-05-25T18:00:00.000Z'),
                user: {
                    createdAt: new Date('2026-05-01T00:00:00.000Z'),
                    updatedAt: new Date('2026-05-01T00:00:00.000Z'),
                    emailVerified: null,
                },
            });

            const request = new Request('http://localhost/api/plannings', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Keto Diet',
                    description: 'Keto plan description',
                }),
            });
            const response = await POST(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.name).toBe('Keto Diet');
            expect(prisma.planning.create).toHaveBeenCalled();
        });

        it('should persist optional daily nutrition targets on POST', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
            (prisma.planning.create as jest.Mock).mockResolvedValue({
                id: 'plan-2',
                name: 'Lean Cut',
                description: null,
                isPrivate: true,
                targetCalories: 2000,
                targetProtein: 150,
                targetCarbohydrates: 180,
                targetFat: 65,
                userId: 'user-1',
                createdAt: new Date('2026-05-25T18:00:00.000Z'),
                updatedAt: new Date('2026-05-25T18:00:00.000Z'),
                user: {
                    createdAt: new Date('2026-05-01T00:00:00.000Z'),
                    updatedAt: new Date('2026-05-01T00:00:00.000Z'),
                    emailVerified: null,
                },
            });

            const request = new Request('http://localhost/api/plannings', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Lean Cut',
                    targetCalories: 2000,
                    targetProtein: 150,
                    targetCarbohydrates: 180,
                    targetFat: 65,
                }),
            });
            const response = await POST(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.targetCalories).toBe(2000);
            expect(data.targetProtein).toBe(150);
            expect(prisma.planning.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        targetCalories: 2000,
                        targetProtein: 150,
                        targetCarbohydrates: 180,
                        targetFat: 65,
                    }),
                })
            );
        });

        it('should return 400 when daily nutrition targets are invalid on POST', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });

            const request = new Request('http://localhost/api/plannings', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Bad Targets',
                    targetCalories: -500,
                }),
            });
            const response = await POST(request);

            expect(response.status).toBe(400);
            expect(prisma.planning.create).not.toHaveBeenCalled();
        });
    });

    describe('GET /api/plannings/[planningId]', () => {
        it('should return 404 if planning is not found', async () => {
            (prisma.planning.findUnique as jest.Mock).mockResolvedValue(null);

            const request = new Request(
                'http://localhost/api/plannings/plan-1'
            );
            const response = await GET_DETAIL(request, {
                params: Promise.resolve({ planningId: 'plan-1' }),
            });

            expect(response.status).toBe(404);
        });

        it('should return 200 with planning details if found', async () => {
            (prisma.planning.findUnique as jest.Mock).mockResolvedValue({
                id: 'plan-1',
                name: 'Plan 1',
                createdAt: new Date('2026-05-25T18:00:00.000Z'),
                updatedAt: new Date('2026-05-25T18:00:00.000Z'),
                meals: [],
            });

            const request = new Request(
                'http://localhost/api/plannings/plan-1'
            );
            const response = await GET_DETAIL(request, {
                params: Promise.resolve({ planningId: 'plan-1' }),
            });

            expect(response.status).toBe(200);
        });

        it('should return 404 if planning is private and user is not authenticated', async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            (prisma.planning.findUnique as jest.Mock).mockResolvedValue({
                id: 'plan-1',
                name: 'Plan 1',
                isPrivate: true,
                userId: 'user-1',
                createdAt: new Date('2026-05-25T18:00:00.000Z'),
                updatedAt: new Date('2026-05-25T18:00:00.000Z'),
                meals: [],
            });

            const request = new Request(
                'http://localhost/api/plannings/plan-1'
            );
            const response = await GET_DETAIL(request, {
                params: Promise.resolve({ planningId: 'plan-1' }),
            });

            expect(response.status).toBe(404);
        });

        it('should return 404 if planning is private and user is authenticated but not the owner', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-2' });
            (prisma.planning.findUnique as jest.Mock).mockResolvedValue({
                id: 'plan-1',
                name: 'Plan 1',
                isPrivate: true,
                userId: 'user-1',
                createdAt: new Date('2026-05-25T18:00:00.000Z'),
                updatedAt: new Date('2026-05-25T18:00:00.000Z'),
                meals: [],
            });

            const request = new Request(
                'http://localhost/api/plannings/plan-1'
            );
            const response = await GET_DETAIL(request, {
                params: Promise.resolve({ planningId: 'plan-1' }),
            });

            expect(response.status).toBe(404);
        });

        it('should return 200 with planning details if planning is private and user is authenticated as the owner', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
            (prisma.planning.findUnique as jest.Mock).mockResolvedValue({
                id: 'plan-1',
                name: 'Plan 1',
                isPrivate: true,
                userId: 'user-1',
                createdAt: new Date('2026-05-25T18:00:00.000Z'),
                updatedAt: new Date('2026-05-25T18:00:00.000Z'),
                meals: [],
            });

            const request = new Request(
                'http://localhost/api/plannings/plan-1'
            );
            const response = await GET_DETAIL(request, {
                params: Promise.resolve({ planningId: 'plan-1' }),
            });

            expect(response.status).toBe(200);
        });

        it('should return 200 with planning details if planning is public even if user is not authenticated', async () => {
            mockGetCurrentUser.mockResolvedValue(null);
            (prisma.planning.findUnique as jest.Mock).mockResolvedValue({
                id: 'plan-1',
                name: 'Plan 1',
                isPrivate: false,
                userId: 'user-1',
                createdAt: new Date('2026-05-25T18:00:00.000Z'),
                updatedAt: new Date('2026-05-25T18:00:00.000Z'),
                meals: [],
            });

            const request = new Request(
                'http://localhost/api/plannings/plan-1'
            );
            const response = await GET_DETAIL(request, {
                params: Promise.resolve({ planningId: 'plan-1' }),
            });

            expect(response.status).toBe(200);
        });
    });

    describe('PATCH /api/plannings/[planningId]', () => {
        it('should return 401 if unauthenticated', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new Request(
                'http://localhost/api/plannings/plan-1',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ name: 'Update name' }),
                }
            );
            const response = await PATCH(request, {
                params: Promise.resolve({ planningId: 'plan-1' }),
            });

            expect(response.status).toBe(401);
        });

        it('should return 404 if planning is not found or user is not the owner', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
            (prisma.planning.findUnique as jest.Mock).mockResolvedValue(null); // not found

            const request = new Request(
                'http://localhost/api/plannings/plan-1',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ name: 'Update name' }),
                }
            );
            const response = await PATCH(request, {
                params: Promise.resolve({ planningId: 'plan-1' }),
            });

            expect(response.status).toBe(404);
        });

        it('should return 400 if more than 4 recipes are added to the same meal slot', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
            (prisma.planning.findUnique as jest.Mock).mockResolvedValue({
                id: 'plan-1',
                userId: 'user-1',
            });

            const tooManyMeals = [
                { day: 'monday', mealType: 'breakfast', recipeId: 'r1' },
                { day: 'monday', mealType: 'breakfast', recipeId: 'r2' },
                { day: 'monday', mealType: 'breakfast', recipeId: 'r3' },
                { day: 'monday', mealType: 'breakfast', recipeId: 'r4' },
                { day: 'monday', mealType: 'breakfast', recipeId: 'r5' },
            ];

            const request = new Request(
                'http://localhost/api/plannings/plan-1',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ meals: tooManyMeals }),
                }
            );
            const response = await PATCH(request, {
                params: Promise.resolve({ planningId: 'plan-1' }),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toContain(
                'Maximum of 4 recipes allowed per meal'
            );
        });

        it('should update and clear daily nutrition targets on PATCH', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
            (prisma.planning.findUnique as jest.Mock)
                .mockResolvedValueOnce({
                    id: 'plan-1',
                    name: 'Plan 1',
                    description: 'Desc',
                    isPrivate: true,
                    targetCalories: 2200,
                    targetProtein: 140,
                    userId: 'user-1',
                    meals: [],
                })
                .mockResolvedValueOnce({
                    id: 'plan-1',
                    name: 'Plan 1',
                    description: 'Desc',
                    isPrivate: true,
                    targetCalories: 1900,
                    targetProtein: null,
                    userId: 'user-1',
                    createdAt: new Date('2026-05-25T18:00:00.000Z'),
                    updatedAt: new Date('2026-05-25T18:00:00.000Z'),
                    user: {
                        createdAt: new Date('2026-05-01T00:00:00.000Z'),
                        updatedAt: new Date('2026-05-01T00:00:00.000Z'),
                        emailVerified: null,
                    },
                    meals: [],
                });

            const request = new Request(
                'http://localhost/api/plannings/plan-1',
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        targetCalories: 1900,
                        targetProtein: null,
                    }),
                }
            );
            const response = await PATCH(request, {
                params: Promise.resolve({ planningId: 'plan-1' }),
            });

            expect(response.status).toBe(200);
            expect(prisma.planning.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        targetCalories: 1900,
                        targetProtein: null,
                    }),
                })
            );
        });

        it('should return 400 if daily nutrition targets are invalid on PATCH', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });

            const request = new Request(
                'http://localhost/api/plannings/plan-1',
                {
                    method: 'PATCH',
                    body: JSON.stringify({ targetProtein: 0 }),
                }
            );
            const response = await PATCH(request, {
                params: Promise.resolve({ planningId: 'plan-1' }),
            });

            expect(response.status).toBe(400);
            expect(prisma.planning.update).not.toHaveBeenCalled();
        });
    });

    describe('DELETE /api/plannings/[planningId]', () => {
        it('should return 401 if unauthenticated', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new Request(
                'http://localhost/api/plannings/plan-1',
                {
                    method: 'DELETE',
                }
            );
            const response = await DELETE(request, {
                params: Promise.resolve({ planningId: 'plan-1' }),
            });

            expect(response.status).toBe(401);
        });

        it('should delete successfully if user is the owner', async () => {
            mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
            (prisma.planning.findUnique as jest.Mock).mockResolvedValue({
                id: 'plan-1',
                userId: 'user-1',
            });

            const request = new Request(
                'http://localhost/api/plannings/plan-1',
                {
                    method: 'DELETE',
                }
            );
            const response = await DELETE(request, {
                params: Promise.resolve({ planningId: 'plan-1' }),
            });

            expect(response.status).toBe(200);
            expect(prisma.planning.delete).toHaveBeenCalledWith({
                where: { id: 'plan-1' },
            });
        });
    });
});
