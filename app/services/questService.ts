import prisma from '@/app/lib/prismadb';
import { triggerBadgeForgeEvaluation } from '@/app/lib/badgeForge';
import {
    badRequest,
    notFoundResponse,
    forbiddenResponse,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

export interface CompleteQuestOptions {
    questId: string;
    currentUserId: string;
    recipeId?: string;
    solverId?: string;
}

export async function completeQuest(options: CompleteQuestOptions) {
    const {
        questId,
        currentUserId,
        recipeId,
        solverId: inputSolverId,
    } = options;

    const existingQuest = await prisma.quest.findUnique({
        where: { id: questId },
        include: {
            recipes: true,
        },
    });

    if (!existingQuest) {
        return { errorResponse: notFoundResponse('Quest not found') };
    }

    if (existingQuest.userId !== currentUserId) {
        return {
            errorResponse: forbiddenResponse(
                'You can only complete your own quests'
            ),
        };
    }

    // Handle retry path if quest is already completed
    if (existingQuest.status === 'completed') {
        if (!existingQuest.badgeEvaluated && existingQuest.acceptedSolverId) {
            logger.info('Retrying Badge Forge evaluation for completed quest', {
                questId,
                solverId: existingQuest.acceptedSolverId,
            });
            const evaluated = await triggerBadgeForgeEvaluation(
                existingQuest.acceptedSolverId
            );
            if (evaluated) {
                const updated = await prisma.quest.update({
                    where: { id: questId },
                    data: { badgeEvaluated: true },
                    include: {
                        user: { select: { id: true, name: true, image: true } },
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
                return { quest: updated };
            }
        }
        return { errorResponse: badRequest('Quest is already completed') };
    }

    // Filter recipes submitted by users other than quest owner
    const candidateRecipes = existingQuest.recipes.filter(
        (r) => r.userId !== currentUserId
    );

    let selectedRecipeId: string | null = null;
    let selectedSolverId: string | null = null;

    // 1. If explicit recipeId passed
    if (recipeId) {
        const matchedRecipe = candidateRecipes.find((r) => r.id === recipeId);
        if (!matchedRecipe) {
            return {
                errorResponse: badRequest(
                    'Selected recipe is not linked to this quest'
                ),
            };
        }
        selectedRecipeId = matchedRecipe.id;
        selectedSolverId = matchedRecipe.userId;
    }
    // 2. If explicit solverId passed
    else if (inputSolverId) {
        const matchedRecipes = candidateRecipes.filter(
            (r) => r.userId === inputSolverId
        );
        if (matchedRecipes.length === 0) {
            return {
                errorResponse: badRequest(
                    'Solver must have a submitted recipe for this quest'
                ),
            };
        }
        selectedRecipeId = matchedRecipes[0].id;
        selectedSolverId = inputSolverId;
    }
    // 3. Infer solver if there is exactly 1 candidate recipe
    else if (candidateRecipes.length === 1) {
        selectedRecipeId = candidateRecipes[0].id;
        selectedSolverId = candidateRecipes[0].userId;
    } else if (candidateRecipes.length > 1) {
        return {
            errorResponse: badRequest(
                'Multiple recipe submissions exist. Please specify which recipe is accepted.'
            ),
        };
    }

    // Atomic Compare-And-Set (CAS) update: only succeeds if quest status is NOT completed
    const casResult = await prisma.quest.updateMany({
        where: {
            id: questId,
            userId: currentUserId,
            status: { not: 'completed' },
        },
        data: {
            status: 'completed',
            acceptedRecipeId: selectedRecipeId,
            acceptedSolverId: selectedSolverId,
            badgeEvaluated: false,
        },
    });

    if (casResult.count === 0) {
        // Quest was updated/completed concurrently by another request
        const recheck = await prisma.quest.findUnique({
            where: { id: questId },
        });
        if (recheck && recheck.status === 'completed') {
            return { errorResponse: badRequest('Quest is already completed') };
        }
        return { errorResponse: badRequest('Failed to update quest status') };
    }

    // Fetch the updated quest document after successful CAS update
    const updatedQuest = await prisma.quest.findUnique({
        where: { id: questId },
        include: {
            user: { select: { id: true, name: true, image: true } },
            recipes: {
                include: {
                    user: { select: { id: true, name: true, image: true } },
                },
            },
        },
    });

    if (selectedSolverId) {
        const evaluated = await triggerBadgeForgeEvaluation(selectedSolverId);
        if (evaluated) {
            await prisma.quest.update({
                where: { id: questId },
                data: { badgeEvaluated: true },
            });
            if (updatedQuest) {
                updatedQuest.badgeEvaluated = true;
            }
        }
    }

    return { quest: updatedQuest! };
}
