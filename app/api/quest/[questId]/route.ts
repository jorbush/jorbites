import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorized,
    validationError,
    badRequest,
    notFound,
    forbidden,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import {
    QUEST_TITLE_MAX_LENGTH,
    QUEST_DESCRIPTION_MAX_LENGTH,
} from '@/app/utils/constants';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ questId: string }> }
) {
    try {
        const { questId } = await params;

        if (!questId || typeof questId !== 'string') {
            return badRequest('Invalid quest ID');
        }

        const quest = await prisma.quest.findUnique({
            where: {
                id: questId,
            },
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
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                verified: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!quest) {
            return notFound('Quest not found');
        }

        logger.info('GET /api/quest/[questId] - success', { questId });
        return NextResponse.json(quest);
    } catch (error: any) {
        logger.error('GET /api/quest/[questId] - error', {
            error: error.message,
        });
        console.error(error);
        return internalServerError('Failed to get quest');
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ questId: string }> }
) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('User authentication required to update quest');
        }

        const { questId } = await params;

        if (!questId || typeof questId !== 'string') {
            return badRequest('Invalid quest ID');
        }

        const body = await request.json();
        const { title, description, status } = body;

        logger.info('PATCH /api/quest/[questId] - start', {
            questId,
            userId: currentUser.id,
        });

        const existingQuest = await prisma.quest.findUnique({
            where: { id: questId },
        });

        if (!existingQuest) {
            return notFound('Quest not found');
        }

        if (existingQuest.userId !== currentUser.id) {
            return forbidden('You can only update your own quests');
        }

        if (title && title.length > QUEST_TITLE_MAX_LENGTH) {
            return validationError(
                `Title must be ${QUEST_TITLE_MAX_LENGTH} characters or less`
            );
        }

        if (description && description.length > QUEST_DESCRIPTION_MAX_LENGTH) {
            return validationError(
                `Description must be ${QUEST_DESCRIPTION_MAX_LENGTH} characters or less`
            );
        }

        if (status && !['open', 'in_progress', 'completed'].includes(status)) {
            return validationError(
                'Status must be one of: open, in_progress, completed'
            );
        }

        const quest = await prisma.quest.update({
            where: { id: questId },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(status && { status }),
            },
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
                    include: {
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
        });

        logger.info('PATCH /api/quest/[questId] - success', {
            questId,
            userId: currentUser.id,
        });
        return NextResponse.json(quest);
    } catch (error: any) {
        logger.error('PATCH /api/quest/[questId] - error', {
            error: error.message,
        });
        console.error(error);
        return internalServerError('Failed to update quest');
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ questId: string }> }
) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('User authentication required to delete quest');
        }

        const { questId } = await params;

        if (!questId || typeof questId !== 'string') {
            return badRequest('Invalid quest ID');
        }

        logger.info('DELETE /api/quest/[questId] - start', {
            questId,
            userId: currentUser.id,
        });

        const existingQuest = await prisma.quest.findUnique({
            where: { id: questId },
        });

        if (!existingQuest) {
            return notFound('Quest not found');
        }

        if (existingQuest.userId !== currentUser.id) {
            return forbidden('You can only delete your own quests');
        }

        const quest = await prisma.quest.delete({
            where: { id: questId },
        });

        logger.info('DELETE /api/quest/[questId] - success', {
            questId,
            userId: currentUser.id,
        });
        return NextResponse.json(quest);
    } catch (error: any) {
        logger.error('DELETE /api/quest/[questId] - error', {
            error: error.message,
        });
        console.error(error);
        return internalServerError('Failed to delete quest');
    }
}
