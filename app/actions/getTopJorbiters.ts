import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import { logger } from '@/app/lib/axiom/server';

export type Timeframe = 'week' | 'month' | 'all';

export default async function getTopJorbiters(timeframe: Timeframe = 'all') {
    try {
        const cacheKey =
            timeframe === 'all'
                ? 'top_jorbiters'
                : `top_jorbiters_${timeframe}`;

        try {
            const cachedData = await redisCache.get(cacheKey);

            if (cachedData) {
                logger.info('getTopJorbiters - cache hit', { timeframe });
                return JSON.parse(cachedData);
            }
        } catch (error: any) {
            logger.error('getTopJorbiters - cache get error', {
                error: error.message,
                timeframe,
            });
        }

        logger.info('getTopJorbiters - start', { timeframe });

        if (timeframe === 'all') {
            const users = await prisma.user.findMany({
                orderBy: {
                    level: 'desc',
                },
                take: 10,
                select: {
                    id: true,
                    name: true,
                    image: true,
                    level: true,
                    verified: true,
                    createdAt: true,
                    updatedAt: true,
                    badges: true,
                },
            });

            if (!users) {
                return null;
            }

            const usersWithDetails = await Promise.all(
                users.map(async (user) => {
                    const userRecipes = await prisma.recipe.findMany({
                        where: {
                            userId: user.id,
                        },
                    });

                    const totalLikes = userRecipes.reduce(
                        (total, recipe) => total + (recipe.numLikes || 0),
                        0
                    );

                    return {
                        ...user,
                        createdAt: user.createdAt.toISOString(),
                        updatedAt: user.updatedAt.toISOString(),
                        recipeCount: userRecipes.length,
                        likesReceived: totalLikes,
                        levelDelta: 0,
                    };
                })
            );

            try {
                await redisCache.set(
                    cacheKey,
                    JSON.stringify(usersWithDetails),
                    'EX',
                    86400
                );
            } catch (error: any) {
                logger.error('getTopJorbiters - cache set error', {
                    error: error.message,
                });
            }

            return usersWithDetails;
        }

        // Compute startDate for week or month
        const now = new Date();
        const startDate = new Date(now);
        if (timeframe === 'week') {
            const day = startDate.getDay();
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0);
        } else if (timeframe === 'month') {
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        }

        // 1. Find candidate user IDs: users who gained snapshots or registered after startDate,
        // plus top level users as fallback candidates.
        const [recentSnapshots, newUsers, topUsersFallback] = await Promise.all([
            prisma.levelSnapshot.findMany({
                where: { createdAt: { gte: startDate } },
                select: { userId: true },
                distinct: ['userId'],
            }),
            prisma.user.findMany({
                where: { createdAt: { gte: startDate } },
                select: { id: true },
            }),
            prisma.user.findMany({
                orderBy: { level: 'desc' },
                take: 20,
                select: { id: true },
            }),
        ]);

        const candidateUserIdsSet = new Set<string>();
        recentSnapshots.forEach((s) => candidateUserIdsSet.add(s.userId));
        newUsers.forEach((u) => candidateUserIdsSet.add(u.id));
        topUsersFallback.forEach((u) => candidateUserIdsSet.add(u.id));

        const candidateUserIds = Array.from(candidateUserIdsSet);

        if (candidateUserIds.length === 0) {
            return [];
        }

        // 2. Fetch user profiles, recipes, and snapshots for candidates in bulk
        const [users, allCandidateRecipes, snapshotsBeforeStart, snapshotsInPeriod] =
            await Promise.all([
                prisma.user.findMany({
                    where: { id: { in: candidateUserIds } },
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        level: true,
                        verified: true,
                        createdAt: true,
                        updatedAt: true,
                        badges: true,
                    },
                }),
                prisma.recipe.findMany({
                    where: { userId: { in: candidateUserIds } },
                    select: { userId: true, numLikes: true },
                }),
                prisma.levelSnapshot.findMany({
                    where: {
                        userId: { in: candidateUserIds },
                        createdAt: { lte: startDate },
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.levelSnapshot.findMany({
                    where: {
                        userId: { in: candidateUserIds },
                        createdAt: { gte: startDate },
                    },
                    orderBy: { createdAt: 'asc' },
                }),
            ]);

        // Map recipes per user
        const recipesMap = new Map<string, { count: number; likes: number }>();
        allCandidateRecipes.forEach((r) => {
            const current = recipesMap.get(r.userId) || { count: 0, likes: 0 };
            recipesMap.set(r.userId, {
                count: current.count + 1,
                likes: current.likes + (r.numLikes || 0),
            });
        });

        // Map latest snapshot before start per user
        const latestSnapshotBeforeMap = new Map<string, number>();
        snapshotsBeforeStart.forEach((s) => {
            if (!latestSnapshotBeforeMap.has(s.userId)) {
                latestSnapshotBeforeMap.set(s.userId, s.level);
            }
        });

        // Map earliest snapshot in period per user
        const earliestSnapshotInPeriodMap = new Map<string, number>();
        snapshotsInPeriod.forEach((s) => {
            if (!earliestSnapshotInPeriodMap.has(s.userId)) {
                earliestSnapshotInPeriodMap.set(s.userId, s.level);
            }
        });

        const usersWithDetails = users.map((user) => {
            const recipeData = recipesMap.get(user.id) || { count: 0, likes: 0 };
            let levelDelta = 0;

            if (latestSnapshotBeforeMap.has(user.id)) {
                const baselineLevel = latestSnapshotBeforeMap.get(user.id)!;
                levelDelta = Math.max(0, user.level - baselineLevel);
            } else if (user.createdAt >= startDate) {
                levelDelta = user.level;
            } else if (earliestSnapshotInPeriodMap.has(user.id)) {
                const baselineLevel = earliestSnapshotInPeriodMap.get(user.id)!;
                levelDelta = Math.max(0, user.level - baselineLevel);
            }

            return {
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
                recipeCount: recipeData.count,
                likesReceived: recipeData.likes,
                levelDelta,
            };
        });

        usersWithDetails.sort((a, b) => {
            if (b.levelDelta !== a.levelDelta) {
                return b.levelDelta - a.levelDelta;
            }
            if (b.level !== a.level) {
                return b.level - a.level;
            }
            return b.likesReceived - a.likesReceived;
        });

        const top10 = usersWithDetails.slice(0, 10);

        logger.info('getTopJorbiters - success', {
            timeframe,
            count: top10.length,
        });

        try {
            await redisCache.set(cacheKey, JSON.stringify(top10), 'EX', 86400);
        } catch (error: any) {
            logger.error('getTopJorbiters - cache set error', {
                error: error.message,
            });
        }

        return top10;
    } catch (error: any) {
        logger.error('getTopJorbiters - error', { error: error.message });
        return null;
    }
}
