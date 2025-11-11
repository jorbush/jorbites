import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';

export interface IQuestsParams {
    status?: string;
    userId?: string;
    page?: number;
    limit?: number;
}

export interface ServerResponse<T> {
    data: T | null;
    error: {
        code: string;
        message: string;
    } | null;
}

export interface QuestsResponse {
    quests: any[];
    totalQuests: number;
    totalPages: number;
    currentPage: number;
}

export default async function getQuests(
    params: IQuestsParams
): Promise<ServerResponse<QuestsResponse>> {
    try {
        logger.info('getQuests - start', { params });
        const { status, userId, page = 1, limit = 10 } = params;

        let query: any = {};

        if (status && ['open', 'in_progress', 'completed'].includes(status)) {
            query.status = status;
        }

        if (userId) {
            query.userId = userId;
        }

        const quests = await prisma.quest.findMany({
            where: query,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        verified: true,
                    },
                },
                recipes: {
                    select: {
                        id: true,
                        title: true,
                        imageSrc: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalQuests = await prisma.quest.count({
            where: query,
        });

        const safeQuests = quests.map((quest) => ({
            ...quest,
            createdAt: quest.createdAt.toISOString(),
            updatedAt: quest.updatedAt.toISOString(),
        }));

        logger.info('getQuests - success', { totalQuests, page, limit });
        return {
            data: {
                quests: safeQuests,
                totalQuests,
                totalPages: Math.ceil(totalQuests / limit),
                currentPage: page,
            },
            error: null,
        };
    } catch (error: any) {
        logger.error('getQuests - error', { error: error.message, params });
        return {
            data: null,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to get quests',
            },
        };
    }
}
