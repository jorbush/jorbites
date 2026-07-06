import { describe, it, expect, vi, beforeEach } from 'vitest';
import getLists from '@/app/actions/getLists';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

vi.mock('@/app/actions/getCurrentUser');
vi.mock('@/app/lib/prismadb', () => ({
    default: {
        list: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
    },
}));

describe('Lists Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getLists', () => {
        it('should return empty myLists and public communityLists when guest (unauthenticated)', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue(null);

            const mockDbCommunityLists = [
                {
                    id: 'list-1',
                    name: 'Best Desserts',
                    isPrivate: false,
                    isDefault: false,
                    userId: 'other-user',
                    recipeIds: ['recipe-1'],
                    createdAt: new Date('2026-06-01T10:00:00.000Z'),
                    updatedAt: new Date('2026-06-01T10:00:00.000Z'),
                    user: {
                        id: 'other-user',
                        createdAt: new Date('2026-05-01T00:00:00.000Z'),
                        updatedAt: new Date('2026-05-01T00:00:00.000Z'),
                        emailVerified: null,
                    },
                },
            ];

            vi.mocked(prisma.list.findMany).mockResolvedValue(
                mockDbCommunityLists as any
            );

            const result = await getLists();

            expect(getCurrentUser).toHaveBeenCalled();
            expect(result.myLists).toEqual([]);
            expect(result.communityLists.length).toBe(1);
            expect(result.communityLists[0].name).toBe('Best Desserts');
        });

        it('should return user lists and community lists when authenticated', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);

            vi.mocked(prisma.list.findMany)
                .mockResolvedValueOnce([
                    {
                        id: 'community-list',
                        name: 'Healthy Snacks',
                        isPrivate: false,
                        isDefault: false,
                        userId: 'other-user',
                        recipeIds: [],
                        createdAt: new Date('2026-06-01T10:00:00.000Z'),
                        updatedAt: new Date('2026-06-01T10:00:00.000Z'),
                        user: {
                            id: 'other-user',
                            createdAt: new Date('2026-05-01T00:00:00.000Z'),
                            updatedAt: new Date('2026-05-01T00:00:00.000Z'),
                        },
                    },
                ] as any) // first call: communityLists
                .mockResolvedValueOnce([
                    {
                        id: 'my-list',
                        name: 'My Custom List',
                        isPrivate: true,
                        isDefault: false,
                        userId: 'user-1',
                        recipeIds: [],
                        createdAt: new Date('2026-06-01T10:00:00.000Z'),
                        updatedAt: new Date('2026-06-01T10:00:00.000Z'),
                        user: {
                            id: 'user-1',
                            createdAt: new Date('2026-05-01T00:00:00.000Z'),
                            updatedAt: new Date('2026-05-01T00:00:00.000Z'),
                        },
                    },
                ] as any); // second call: myLists

            const result = await getLists();

            expect(result.myLists.length).toBe(1);
            expect(result.myLists[0].name).toBe('My Custom List');
            expect(result.communityLists.length).toBe(1);
            expect(result.communityLists[0].name).toBe('Healthy Snacks');
        });

        it('should create default list when authenticated user has no lists', async () => {
            vi.mocked(getCurrentUser).mockResolvedValue({
                id: 'user-1',
            } as any);

            vi.mocked(prisma.list.findMany)
                .mockResolvedValueOnce([]) // communityLists
                .mockResolvedValueOnce([]); // myLists (none found initially)

            const defaultList = {
                id: 'default-list-id',
                name: 'to cook later',
                isDefault: true,
                isPrivate: true,
                userId: 'user-1',
                recipeIds: [],
                createdAt: new Date('2026-06-01T12:00:00.000Z'),
                updatedAt: new Date('2026-06-01T12:00:00.000Z'),
                user: {
                    id: 'user-1',
                    createdAt: new Date('2026-05-01T00:00:00.000Z'),
                    updatedAt: new Date('2026-05-01T00:00:00.000Z'),
                },
            };

            vi.mocked(prisma.list.create).mockResolvedValue(defaultList as any);

            const result = await getLists();

            expect(prisma.list.create).toHaveBeenCalledWith({
                data: {
                    name: 'to cook later',
                    isDefault: true,
                    isPrivate: true,
                    userId: 'user-1',
                },
                include: {
                    user: {
                        select: expect.any(Object),
                    },
                },
            });
            expect(result.myLists.length).toBe(1);
            expect(result.myLists[0].name).toBe('to cook later');
            expect(result.myLists[0].isDefault).toBe(true);
        });
    });
});
