import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorized,
    validationError,
    badRequest,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import {
    QUEST_DESCRIPTION_MAX_LENGTH,
    QUEST_TITLE_MAX_LENGTH,
} from '@/app/utils/constants';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('User authentication required to create quest');
        }

        const body = await request.json();

        logger.info('POST /api/quests - start', { userId: currentUser.id });
        const { title, description } = body;

        if (!title || !description) {
            return badRequest(
                'Missing required fields: title and description are required'
            );
        }

        if (title.length > QUEST_TITLE_MAX_LENGTH) {
            return validationError(
                `Title must be ${QUEST_TITLE_MAX_LENGTH} characters or less`
            );
        }

        if (description.length > QUEST_DESCRIPTION_MAX_LENGTH) {
            return validationError(
                `Description must be ${QUEST_DESCRIPTION_MAX_LENGTH} characters or less`
            );
        }

        const quest = await prisma.quest.create({
            data: {
                title,
                description,
                userId: currentUser.id,
                status: 'open',
            },
        });

        logger.info('POST /api/quests - success', {
            questId: quest.id,
            userId: currentUser.id,
        });
        return NextResponse.json(quest);
    } catch (error: any) {
        logger.error('POST /api/quests - error', { error: error.message });
        console.error(error);
        return internalServerError('Failed to create quest');
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const userId = searchParams.get('userId');
        const q = searchParams.get('q');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        let query: any = {};

        if (status && ['open', 'in_progress', 'completed'].includes(status)) {
            query.status = status;
        }

        if (userId) {
            query.userId = userId;
        }

        if (q) {
            query.AND = [
                ...(query.status ? [{ status: query.status }] : []),
                ...(query.userId ? [{ userId: query.userId }] : []),
                {
                    OR: [
                        {
                            title: {
                                contains: q,
                                mode: 'insensitive',
                            },
                        },
                        {
                            description: {
                                contains: q,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            ];
            delete query.status;
            delete query.userId;
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

        logger.info('GET /api/quests - success', { totalQuests, page, limit });
        return NextResponse.json({
            quests,
            totalQuests,
            totalPages: Math.ceil(totalQuests / limit),
            currentPage: page,
        });
    } catch (error: any) {
        logger.error('GET /api/quests - error', { error: error.message });
        console.error(error);
        return internalServerError('Failed to get quests');
    }
}
