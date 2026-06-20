import prisma from '@/app/lib/prismadb';
import {
    subWeeks,
    startOfWeek,
    endOfWeek,
    subMonths,
    startOfMonth,
    endOfMonth,
    subYears,
    startOfYear,
    endOfYear,
    getISOWeek,
    getISOWeekYear,
} from 'date-fns';
import { logger } from '@/app/lib/axiom/server';
import sendNotification from '@/app/actions/sendNotification';
import { NotificationType } from '@/app/types/notification';

function getTargetDate(category: string, referenceDate: Date): Date {
    switch (category) {
        case 'week':
            return subWeeks(referenceDate, 1);
        case 'month':
            return subMonths(referenceDate, 1);
        case 'year':
            return subYears(referenceDate, 1);
        default:
            throw new Error(`Invalid category: ${category}`);
    }
}

export function getPeriodKey(category: string, date: Date): string {
    switch (category) {
        case 'week': {
            const weekNumber = getISOWeek(date);
            const weekYear = getISOWeekYear(date);
            return `${weekYear}-W${String(weekNumber).padStart(2, '0')}`;
        }
        case 'month': {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            return `${year}-${String(month).padStart(2, '0')}`;
        }
        case 'year': {
            return `${date.getFullYear()}`;
        }
        default:
            throw new Error(`Invalid category: ${category}`);
    }
}

export function getVotingWindow(
    category: string,
    targetDate: Date
): { start: Date; end: Date } {
    switch (category) {
        case 'week': {
            return {
                start: startOfWeek(targetDate, { weekStartsOn: 1 }),
                end: endOfWeek(targetDate, { weekStartsOn: 1 }),
            };
        }
        case 'month': {
            return {
                start: startOfMonth(targetDate),
                end: endOfMonth(targetDate),
            };
        }
        case 'year': {
            return {
                start: startOfYear(targetDate),
                end: endOfYear(targetDate),
            };
        }
        default:
            throw new Error(`Invalid category: ${category}`);
    }
}

export async function getCandidates(
    category: string,
    referenceDate: Date = new Date()
) {
    const targetDate = getTargetDate(category, referenceDate);
    const { start, end } = getVotingWindow(category, targetDate);

    const candidates = await prisma.recipe.findMany({
        where: {
            createdAt: {
                gte: start,
                lte: end,
            },
        },
        orderBy: {
            numLikes: 'desc',
        },
        take: 10,
    });

    return candidates;
}

export async function openVoteSession(
    category: string,
    referenceDate: Date = new Date()
) {
    logger.info('lib/top-recipe-vote openVoteSession - start', {
        category,
        referenceDate,
    });

    const targetDate = getTargetDate(category, referenceDate);
    const periodKey = getPeriodKey(category, targetDate);

    const existingSession = await prisma.recipeVoteSession.findUnique({
        where: {
            category_periodKey: {
                category,
                periodKey,
            },
        },
    });

    if (existingSession) {
        logger.info(
            'lib/top-recipe-vote openVoteSession - session already exists',
            {
                sessionId: existingSession.id,
                category,
                periodKey,
            }
        );
        return existingSession;
    }

    const candidates = await getCandidates(category, referenceDate);

    if (candidates.length < 4) {
        logger.info(
            'lib/top-recipe-vote openVoteSession - not enough candidates',
            {
                category,
                periodKey,
                candidatesCount: candidates.length,
            }
        );
        return null;
    }

    const session = await prisma.recipeVoteSession.create({
        data: {
            category,
            periodKey,
            status: 'voting',
            candidates: candidates.map((c) => c.id),
            startedAt: new Date(),
        },
    });

    logger.info('lib/top-recipe-vote openVoteSession - session created', {
        sessionId: session.id,
        category,
        periodKey,
    });

    await sendNotification({
        type: NotificationType.NEW_VOTATION,
        userEmail: 'all',
        params: {
            category,
            periodKey,
        },
    });

    return session;
}

export async function castVote(
    userId: string,
    sessionId: string,
    recipeId: string
) {
    logger.info('lib/top-recipe-vote castVote - start', {
        userId,
        sessionId,
        recipeId,
    });

    const session = await prisma.recipeVoteSession.findUnique({
        where: { id: sessionId },
    });

    if (!session) {
        throw new Error('Vote session not found');
    }

    if (session.status !== 'voting') {
        throw new Error('Voting is closed for this session');
    }

    if (!session.candidates.includes(recipeId)) {
        throw new Error('Recipe is not a candidate in this session');
    }

    const vote = await prisma.recipeVote.upsert({
        where: {
            category_periodKey_userId: {
                category: session.category,
                periodKey: session.periodKey,
                userId,
            },
        },
        update: {
            recipeId,
            createdAt: new Date(),
        },
        create: {
            category: session.category,
            periodKey: session.periodKey,
            userId,
            recipeId,
        },
    });

    logger.info('lib/top-recipe-vote castVote - success', { voteId: vote.id });
    return vote;
}

export async function closeVoteSession(
    category: string,
    referenceDate: Date = new Date()
) {
    logger.info('lib/top-recipe-vote closeVoteSession - start', {
        category,
        referenceDate,
    });

    const targetDate = getTargetDate(category, referenceDate);
    const periodKey = getPeriodKey(category, targetDate);

    const session = await prisma.recipeVoteSession.findUnique({
        where: {
            category_periodKey: {
                category,
                periodKey,
            },
        },
    });

    if (!session) {
        logger.info(
            'lib/top-recipe-vote closeVoteSession - no session found to close',
            { category, periodKey }
        );
        return null;
    }

    if (session.status === 'closed') {
        logger.info(
            'lib/top-recipe-vote closeVoteSession - session already closed',
            { sessionId: session.id }
        );
        return session;
    }

    // Count votes for each candidate
    const voteCounts = await prisma.recipeVote.groupBy({
        by: ['recipeId'],
        where: {
            category,
            periodKey,
            recipeId: { in: session.candidates },
        },
        _count: {
            recipeId: true,
        },
    });

    // Fetch candidate recipes
    const recipes = await prisma.recipe.findMany({
        where: {
            id: { in: session.candidates },
        },
        include: {
            user: {
                select: {
                    name: true,
                },
            },
        },
    });

    // Create a map for quick vote count lookup
    const votesMap: Record<string, number> = {};
    for (const vc of voteCounts) {
        votesMap[vc.recipeId] = vc._count.recipeId;
    }

    // Sort recipes: votes descending, likes descending, id fallback
    const sortedRecipes = [...recipes].sort((a, b) => {
        const votesA = votesMap[a.id] || 0;
        const votesB = votesMap[b.id] || 0;

        if (votesB !== votesA) {
            return votesB - votesA;
        }
        return b.numLikes - a.numLikes;
    });

    const winner = sortedRecipes[0];
    if (!winner) {
        throw new Error('No candidates found to determine a winner');
    }

    // Update the session in DB
    const updatedSession = await prisma.recipeVoteSession.update({
        where: { id: session.id },
        data: {
            status: 'closed',
            winnerId: winner.id,
            closedAt: new Date(),
        },
    });

    logger.info('lib/top-recipe-vote closeVoteSession - winner determined', {
        sessionId: session.id,
        winnerId: winner.id,
        winnerUserId: winner.userId,
    });

    // Award badge via Badge Forge
    try {
        const badgeForgePayload = {
            category,
            user_id: winner.userId,
            recipe_id: winner.id,
        };

        const badgeForgeResponse = await fetch(
            `${process.env.BADGE_FORGE_URL}/award-top-recipe`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': process.env.BADGE_FORGE_API_KEY || '',
                },
                body: JSON.stringify(badgeForgePayload),
                cache: 'no-store',
            }
        );

        if (!badgeForgeResponse.ok) {
            const errorData = await badgeForgeResponse.json().catch(() => ({}));
            logger.error(
                'lib/top-recipe-vote closeVoteSession - badge forge error',
                {
                    status: badgeForgeResponse.status,
                    errorData,
                    winnerUserId: winner.userId,
                }
            );
        } else {
            logger.info(
                'lib/top-recipe-vote closeVoteSession - badge awarded successfully',
                {
                    winnerUserId: winner.userId,
                }
            );
        }
    } catch (error: any) {
        logger.error(
            'lib/top-recipe-vote closeVoteSession - error calling badge forge',
            {
                error: error.message,
                winnerUserId: winner.userId,
            }
        );
    }

    const winnerName = (winner as any).user?.name || 'Chef';
    await sendNotification({
        type: NotificationType.VOTATION_RESULT,
        userEmail: 'all',
        params: {
            category,
            periodKey,
            recipeId: winner.id,
            recipeTitle: winner.title,
            winnerName: winnerName,
        },
    });

    return updatedSession;
}

export async function getActiveSession(category: string) {
    logger.info('lib/top-recipe-vote getActiveSession - start', { category });

    const openSession = await prisma.recipeVoteSession.findFirst({
        where: {
            category,
            status: 'voting',
        },
        orderBy: {
            startedAt: 'desc',
        },
    });

    if (openSession) {
        return openSession;
    }

    const closedSession = await prisma.recipeVoteSession.findFirst({
        where: {
            category,
            status: 'closed',
        },
        orderBy: {
            closedAt: 'desc',
        },
    });

    return closedSession;
}

export async function getSessionDetails(session: any) {
    if (!session) return null;

    const candidates = await prisma.recipe.findMany({
        where: {
            id: { in: session.candidates },
        },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    });

    const voteCounts = await prisma.recipeVote.groupBy({
        by: ['recipeId'],
        where: {
            category: session.category,
            periodKey: session.periodKey,
            recipeId: { in: session.candidates },
        },
        _count: {
            recipeId: true,
        },
    });

    const votesMap: Record<string, number> = {};
    for (const vc of voteCounts) {
        votesMap[vc.recipeId] = vc._count.recipeId;
    }

    let winner = null;
    if (session.winnerId) {
        winner = await prisma.recipe.findUnique({
            where: { id: session.winnerId },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
        });
    }

    return {
        ...session,
        candidates: candidates.map((c) => ({
            ...c,
            voteCount: votesMap[c.id] || 0,
        })),
        winner,
    };
}
