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
    badRequest,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { validateRecipeCreateData } from '@/app/utils/recipeValidation';
import { validateRemixContent } from '@/app/utils/recipeRemixValidation';
import { contentCreationRatelimit } from '@/app/lib/ratelimit';
import { MAX_CO_COOKS, MAX_LINKED_RECIPES } from '@/app/utils/constants';
import { DraftService } from '@/app/services/draftService';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

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

        const validationErrorResponse = validateRecipeCreateData(body);
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
            prepTime,
            cookTime,
            forkedFromRecipeId,
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

        const limitedCoCooksIds = finalCoCooksIds.slice(0, MAX_CO_COOKS);
        const limitedLinkedRecipeIds = finalLinkedRecipeIds.slice(
            0,
            MAX_LINKED_RECIPES
        );

        const finalQuestId = questId && questId.trim() !== '' ? questId : null;

        const rawForkedFromRecipeId =
            forkedFromRecipeId && typeof forkedFromRecipeId === 'string'
                ? forkedFromRecipeId.trim()
                : null;

        let validForkedFromRecipe: {
            id: string;
            ingredients: string[];
            steps: string[];
        } | null = null;

        if (
            rawForkedFromRecipeId &&
            OBJECT_ID_REGEX.test(rawForkedFromRecipeId)
        ) {
            validForkedFromRecipe = await prisma.recipe.findUnique({
                where: { id: rawForkedFromRecipeId },
                select: {
                    id: true,
                    ingredients: true,
                    steps: true,
                },
            });
        }

        if (validForkedFromRecipe) {
            const { hasModifiedIngredients, hasModifiedSteps, isValidRemix } =
                validateRemixContent(
                    ingredients,
                    steps,
                    validForkedFromRecipe.ingredients,
                    validForkedFromRecipe.steps
                );

            if (!isValidRemix) {
                if (!hasModifiedIngredients && !hasModifiedSteps) {
                    return badRequest(
                        'A recipe remix must include changes to both the ingredients and preparation steps of the original recipe'
                    );
                }
                if (!hasModifiedIngredients) {
                    return badRequest(
                        'A recipe remix must include changes to the ingredients of the original recipe'
                    );
                }
                return badRequest(
                    'A recipe remix must include changes to the preparation steps of the original recipe'
                );
            }
        }

        const finalForkedFromRecipeId = validForkedFromRecipe
            ? validForkedFromRecipe.id
            : null;

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
                prepTime:
                    prepTime !== undefined &&
                    prepTime !== null &&
                    prepTime !== ''
                        ? parseInt(prepTime.toString(), 10)
                        : null,
                cookTime:
                    cookTime !== undefined &&
                    cookTime !== null &&
                    cookTime !== ''
                        ? parseInt(cookTime.toString(), 10)
                        : null,
                forkedFromRecipeId: finalForkedFromRecipeId,
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
            await Promise.all([
                redisCache.del(`recipes:graph:${currentUser.id}`),
                redisCache.del(`user:activity:graph:${currentUser.id}`),
                redisCache.incr('recipes:global:version'),
            ]);
            if (finalForkedFromRecipeId) {
                await Promise.all([
                    redisCache.del(`recipe:${finalForkedFromRecipeId}`),
                    redisCache.del(`recipe:remixes:${finalForkedFromRecipeId}`),
                ]);
            }
            if (body.draftId) {
                await DraftService.cleanUpDraftOnPublish(
                    body.draftId,
                    currentUser.id
                );
            }
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
