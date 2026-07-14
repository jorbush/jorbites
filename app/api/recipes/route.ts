import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendNotification from '@/app/actions/sendNotification';
import updateUserLevel from '@/app/actions/updateUserLevel';
import { NotificationType } from '@/app/types/notification';
import {
    unauthorizedResponse,
    conflict,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { validateRecipeData } from '@/app/utils/recipeValidation';
import { contentCreationRatelimit } from '@/app/lib/ratelimit';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to create recipe'
            );
        }

        // Rate limiting for recipe creation - prevent spam
        if (process.env.ENV === 'production') {
            const { success, reset } = await contentCreationRatelimit.limit(
                currentUser.id
            );
            if (!success) {
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                logger.warn('POST /api/recipes - rate limit exceeded', {
                    userId: currentUser.id,
                });
                return rateLimitExceeded(
                    `Too many recipe submissions. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                );
            }
        }

        const body = await request.json();

        logger.info('POST /api/recipes - start', { userId: currentUser.id });

        const validationErrorResponse = validateRecipeData(body);
        if (validationErrorResponse) {
            return validationErrorResponse;
        }

        const {
            title,
            description,
            imageSrc,
            categories,
            method,
            ingredients,
            steps,
            minutes,
            imageSrc1,
            imageSrc2,
            imageSrc3,
            coCooksIds,
            linkedRecipeIds,
            youtubeUrl,
            questId,
            recipeCuisine,
            calories,
            recipeYield,
        } = body;

        const recipeExist = await prisma.recipe.findFirst({
            where: {
                imageSrc: imageSrc as string,
            },
        });

        if (recipeExist !== null) {
            return conflict('A recipe with this image already exists');
        }

        const extraImages: string[] = [];

        if (imageSrc1 !== '' && imageSrc1 !== undefined) {
            extraImages.push(imageSrc1);
        }

        if (imageSrc2 !== '' && imageSrc2 !== undefined) {
            extraImages.push(imageSrc2);
        }

        if (imageSrc3 !== '' && imageSrc3 !== undefined) {
            extraImages.push(imageSrc3);
        }

        const finalCoCooksIds = Array.isArray(coCooksIds) ? coCooksIds : [];
        const finalLinkedRecipeIds = Array.isArray(linkedRecipeIds)
            ? linkedRecipeIds
            : [];

        const limitedCoCooksIds = finalCoCooksIds.slice(0, 4); // Max 4 co-cooks
        const limitedLinkedRecipeIds = finalLinkedRecipeIds.slice(0, 2); // Max 2 linked recipes

        const finalQuestId = questId && questId.trim() !== '' ? questId : null;

        const recipe = await prisma.recipe.create({
            data: {
                title,
                description,
                imageSrc,
                categories,
                method,
                ingredients,
                steps,
                minutes,
                numLikes: 0,
                extraImages,
                userId: currentUser.id,
                coCooksIds: limitedCoCooksIds,
                linkedRecipeIds: limitedLinkedRecipeIds,
                youtubeUrl: youtubeUrl?.trim() || null,
                questId: finalQuestId,
                recipeCuisine: recipeCuisine || null,
                calories:
                    calories !== undefined &&
                    calories !== null &&
                    calories !== ''
                        ? parseInt(calories.toString(), 10)
                        : null,
                recipeYield:
                    recipeYield !== undefined &&
                    recipeYield !== null &&
                    recipeYield !== ''
                        ? parseInt(recipeYield.toString(), 10)
                        : null,
            },
        });

        await sendNotification({
            type: NotificationType.NEW_RECIPE,
            userEmail: currentUser.email,
            params: {
                recipeId: recipe.id,
                recipeName: title,
            },
        });

        if (finalQuestId) {
            const quest = await prisma.quest.findUnique({
                where: { id: finalQuestId },
                include: { user: true },
            });

            if (quest?.user?.email) {
                await sendNotification({
                    type: NotificationType.QUEST_FULFILLED,
                    userEmail: quest.user.email,
                    params: {
                        questId: finalQuestId,
                        submissionId: recipe.id,
                        fulfilledByName: currentUser.name || 'Un usuario',
                    },
                });
            }
        }

        await updateUserLevel({
            userId: currentUser.id,
        });

        logger.info('POST /api/recipes - success', {
            recipeId: recipe.id,
            userId: currentUser.id,
        });

        try {
            await redisCache.del(`recipes:graph:${currentUser.id}`);
            await redisCache.incr('recipes:global:version');
        } catch (error: any) {
            logger.error('POST /api/recipes - cache invalidation error', {
                error: error.message,
                userId: currentUser.id,
            });
        }

        return NextResponse.json(recipe);
    } catch (error: any) {
        logger.error('POST /api/recipes - error', { error: error.message });
        console.error(error);
        return internalServerError('Failed to create recipe');
    }
}
