import { describe, it, expect, vi, beforeEach } from 'vitest';
import getPlannings from '@/app/actions/getPlannings';
import getPlanningById from '@/app/actions/getPlanningById';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

vi.mock('@/app/actions/getCurrentUser');
vi.mock('@/app/lib/prismadb', () => ({
    default: {
        planning: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
        },
    },
}));

describe('Plannings Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getPlannings', () => {
        it('should return empty myPlannings and public communityPlannings when guest (unauthenticated)', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue(null);

            const mockDbCommunityPlans = [
                {
                    id: 'plan-1',
                    name: 'Keto Week',
                    isPrivate: false,
                    userId: 'other-user',
                    createdAt: new Date('2026-05-25T18:00:00.000Z'),
                    updatedAt: new Date('2026-05-25T18:00:00.000Z'),
                    user: {
                        id: 'other-user',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        emailVerified: null,
                    },
                    meals: [],
                },
            ];
            vi.mocked(prisma.planning.findMany).mockResolvedValue(
                mockDbCommunityPlans as any
            );

            const result = await getPlannings();

            expect(getCurrentUser).toHaveBeenCalled();
            expect(result.myPlannings).toEqual([]);
            expect(result.communityPlannings.length).toBe(1);
            expect(result.communityPlannings[0].name).toBe('Keto Week');
        });

        it('should return user plans and community plans when authenticated', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);

            vi.mocked(prisma.planning.findMany)
                .mockResolvedValueOnce([
                    {
                        id: 'community-plan',
                        name: 'Public Salad Diet',
                        isPrivate: false,
                        userId: 'other-user',
                        createdAt: new Date('2026-05-25T18:00:00.000Z'),
                        updatedAt: new Date('2026-05-25T18:00:00.000Z'),
                        user: {
                            id: 'other-user',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                        meals: [],
                    },
                ] as any) // first call for communityPlannings
                .mockResolvedValueOnce([
                    {
                        id: 'my-plan',
                        name: 'My Personal Menu',
                        isPrivate: true,
                        userId: 'user-1',
                        createdAt: new Date('2026-05-25T18:00:00.000Z'),
                        updatedAt: new Date('2026-05-25T18:00:00.000Z'),
                        user: {
                            id: 'user-1',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                        meals: [],
                    },
                ] as any); // second call for myPlannings

            const result = await getPlannings();

            expect(result.myPlannings.length).toBe(1);
            expect(result.myPlannings[0].name).toBe('My Personal Menu');
            expect(result.communityPlannings.length).toBe(1);
            expect(result.communityPlannings[0].name).toBe('Public Salad Diet');
        });
    });

    describe('getPlanningById', () => {
        it('should return null when planningId is missing', async () => {
            const result = await getPlanningById({});
            expect(result).toBeNull();
        });

        it('should return null when planning is not found in database', async () => {
            vi.mocked(prisma.planning.findUnique).mockResolvedValue(null);
            const result = await getPlanningById({
                planningId: 'non-existent',
            });
            expect(result).toBeNull();
        });

        it('should return mapped safe planning details when found', async () => {
            const mockDbPlan = {
                id: 'plan-1',
                name: 'Mediterranean Week',
                description: 'Yummy and healthy',
                isPrivate: false,
                userId: 'user-1',
                createdAt: new Date('2026-05-25T18:00:00.000Z'),
                updatedAt: new Date('2026-05-25T18:00:00.000Z'),
                user: {
                    id: 'user-1',
                    name: 'Chef Jordi',
                    image: null,
                    verified: true,
                    level: 5,
                    badges: [],
                    createdAt: new Date('2026-05-01T00:00:00.000Z'),
                    updatedAt: new Date('2026-05-01T00:00:00.000Z'),
                    emailVerified: null,
                },
                meals: [
                    {
                        id: 'meal-1',
                        day: 'monday',
                        mealType: 'dinner',
                        recipeId: 'recipe-1',
                        recipe: {
                            id: 'recipe-1',
                            title: 'Paella',
                            createdAt: new Date('2026-05-20T00:00:00.000Z'),
                            user: {
                                id: 'user-1',
                                name: 'Chef Jordi',
                                createdAt: new Date('2026-05-01T00:00:00.000Z'),
                                updatedAt: new Date('2026-05-01T00:00:00.000Z'),
                            },
                        },
                    },
                ],
            };
            vi.mocked(prisma.planning.findUnique).mockResolvedValue(
                mockDbPlan as any
            );

            const result = await getPlanningById({ planningId: 'plan-1' });

            expect(result).not.toBeNull();
            expect(result?.name).toBe('Mediterranean Week');
            expect(result?.meals?.[0].recipe?.title).toBe('Paella');
        });
    });
});
