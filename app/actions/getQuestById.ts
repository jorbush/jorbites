import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    questId?: string;
}

export default async function getQuestById(params: IParams) {
    try {
        const { questId } = params;

        if (!questId) {
            logger.warn('getQuestById - no questId provided');
            return null;
        }

        logger.info('getQuestById - start', { questId });

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
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        imageSrc: true,
                        category: true,
                        method: true,
                        minutes: true,
                        numLikes: true,
                        ingredients: true,
                        steps: true,
                        extraImages: true,
                        userId: true,
                        coCooksIds: true,
                        linkedRecipeIds: true,
                        youtubeUrl: true,
                        questId: true,
                        createdAt: true,
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
            logger.warn('getQuestById - quest not found', { questId });
            return null;
        }

        logger.info('getQuestById - success', { questId });

        return {
            ...quest,
            createdAt: quest.createdAt.toISOString(),
            updatedAt: quest.updatedAt.toISOString(),
            recipes: quest.recipes.map((recipe) => ({
                ...recipe,
                createdAt: recipe.createdAt.toISOString(),
            })),
        };
    } catch (error: any) {
        logger.error('getQuestById - error', {
            error: error.message,
            questId: params.questId,
        });
        return null;
    }
}
