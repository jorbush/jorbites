import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import { redisCache } from '@/app/lib/redis';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendNotification from '@/app/actions/sendNotification';
import getRecipeById from '@/app/actions/getRecipeById';
import updateUserLevel from '@/app/actions/updateUserLevel';
import { deleteMultipleFromCloudinary } from '@/app/utils/cloudinary';
import { NotificationType } from '@/app/types/notification';
import {
    unauthorizedResponse,
    invalidInput,
    badRequest,
    forbiddenResponse,
    notFoundResponse,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { validateRecipeUpdateData } from '@/app/utils/recipeValidation';
import { SafeRecipe } from '@/app/types';

interface IParams {
    recipeId?: string;
}

export async function POST(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const [params, body, currentUser] = await Promise.all([
            props.params,
            request.json(),
            getCurrentUser(),
        ]);

        const { operation } = body;

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to interact with recipe'
            );
        }

        const { recipeId } = params;

        logger.info('POST /api/recipe/[recipeId] - start', {
            recipeId,
            operation,
            userId: currentUser.id,
        });

        if (!recipeId || typeof recipeId !== 'string') {
            return invalidInput(
                'Recipe ID is required and must be a valid string'
            );
        }

        if (
            !operation ||
            (operation !== 'increment' && operation !== 'decrement')
        ) {
            return badRequest(
                'Operation must be either "increment" or "decrement"'
            );
        }

        const currentRecipe = await prisma.recipe.findUnique({
            where: {
                id: recipeId,
            },
            include: {
                user: true,
            },
        });

        if (!currentRecipe) {
            return notFoundResponse('Recipe not found');
        }

        let numLikes = currentRecipe.numLikes;
        const favoriteIds = [...(currentUser.favoriteIds || [])];
        const alreadyFavorited = favoriteIds.includes(recipeId);

        if (operation === 'increment') {
            if (!alreadyFavorited) {
                // Add recipe to user's favoriteIds
                favoriteIds.push(recipeId);
                await prisma.user.update({
                    where: {
                        id: currentUser.id,
                    },
                    data: {
                        favoriteIds,
                    },
                });

                // Increment like count
                numLikes++;

                const [, recipe] = await Promise.all([
                    sendNotification({
                        type: NotificationType.NEW_LIKE,
                        userEmail: currentRecipe.user.email,
                        params: {
                            userName: currentUser.name,
                            recipeId: recipeId,
                        },
                    }),
                    prisma.recipe.update({
                        where: {
                            id: recipeId,
                        },
                        data: {
                            numLikes,
                        },
                    }),
                    updateUserLevel({
                        userId: currentRecipe.user.id,
                    }),
                ]);

                // Invalidate recipe cache so like count is fresh
                try {
                    await redisCache.del(`recipe:${recipeId}`);
                } catch (cacheError: any) {
                    logger.error(
                        'POST /api/recipe/[recipeId] - cache invalidation error',
                        { error: cacheError.message, recipeId }
                    );
                }

                logger.info(
                    'POST /api/recipe/[recipeId] - success (incremented)',
                    {
                        recipeId,
                        operation,
                        numLikes: recipe.numLikes,
                    }
                );
                return NextResponse.json(recipe);
            } else {
                logger.info(
                    'POST /api/recipe/[recipeId] - success (already favorited, no-op)',
                    {
                        recipeId,
                        operation,
                        numLikes: currentRecipe.numLikes,
                    }
                );
                return NextResponse.json(currentRecipe);
            }
        } else {
            // decrement
            if (alreadyFavorited) {
                // Remove recipe from user's favoriteIds
                const updatedFavoriteIds = favoriteIds.filter(
                    (id) => id !== recipeId
                );
                await prisma.user.update({
                    where: {
                        id: currentUser.id,
                    },
                    data: {
                        favoriteIds: updatedFavoriteIds,
                    },
                });

                // Decrement like count
                if (numLikes > 0) {
                    numLikes--;
                }

                const [recipe] = await Promise.all([
                    prisma.recipe.update({
                        where: {
                            id: recipeId,
                        },
                        data: {
                            numLikes: numLikes,
                        },
                    }),
                    updateUserLevel({
                        userId: currentRecipe.user.id,
                    }),
                ]);

                // Invalidate recipe cache so like count is fresh
                try {
                    await redisCache.del(`recipe:${recipeId}`);
                } catch (cacheError: any) {
                    logger.error(
                        'POST /api/recipe/[recipeId] - cache invalidation error',
                        { error: cacheError.message, recipeId }
                    );
                }

                logger.info(
                    'POST /api/recipe/[recipeId] - success (decremented)',
                    {
                        recipeId,
                        operation,
                        numLikes: recipe.numLikes,
                    }
                );
                return NextResponse.json(recipe);
            } else {
                logger.info(
                    'POST /api/recipe/[recipeId] - success (not favorited, no-op)',
                    {
                        recipeId,
                        operation,
                        numLikes: currentRecipe.numLikes,
                    }
                );
                return NextResponse.json(currentRecipe);
            }
        }
    } catch (error: any) {
        logger.error('POST /api/recipe/[recipeId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to update recipe likes');
    }
}

async function cleanupOldImages(
    recipe: SafeRecipe,
    newImageSrc: string,
    newExtraImages: string[],
    recipeId: string
) {
    const imagesToDelete: string[] = [];
    if (recipe.imageSrc && recipe.imageSrc !== newImageSrc) {
        imagesToDelete.push(recipe.imageSrc);
    }
    const oldExtraImages = recipe.extraImages || [];
    const newExtraImagesSet = new Set(newExtraImages);
    for (const oldImage of oldExtraImages) {
        if (!newExtraImagesSet.has(oldImage)) {
            imagesToDelete.push(oldImage);
        }
    }
    if (imagesToDelete.length > 0) {
        try {
            const { successful, failed } =
                await deleteMultipleFromCloudinary(imagesToDelete);
            if (successful.length > 0) {
                console.log(
                    `Successfully deleted ${successful.length} old images from Cloudinary for recipe ${recipeId}`
                );
            }
            if (failed.length > 0) {
                console.warn(
                    `Failed to delete ${failed.length} old images from Cloudinary for recipe ${recipeId}:`,
                    failed
                );
            }
        } catch (error) {
            console.error('Error deleting old images from Cloudinary:', error);
        }
    }
}

async function invalidateRecipeCache(recipeId: string) {
    try {
        await redisCache.del(`recipe:${recipeId}`);
        await redisCache.incr('recipes:global:version');
    } catch (error: any) {
        logger.error(
            'PATCH /api/recipe/[recipeId] - cache invalidation error',
            {
                error: error.message,
                recipeId,
            }
        );
    }
}

export async function PATCH(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const [params, currentUser] = await Promise.all([
            props.params,
            getCurrentUser(),
        ]);

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to edit recipe'
            );
        }

        const { recipeId } = params;

        logger.info('PATCH /api/recipe/[recipeId] - start', {
            recipeId,
            userId: currentUser.id,
        });

        if (!recipeId || typeof recipeId !== 'string') {
            return invalidInput(
                'Recipe ID is required and must be a valid string'
            );
        }

        const recipe = await getRecipeById({ recipeId });

        if (!recipe) {
            return notFoundResponse('Recipe not found');
        }

        if (recipe.userId !== currentUser.id) {
            return forbiddenResponse('You can only edit your own recipes');
        }

        const body = await request.json();
        const validationErrorResponse = validateRecipeUpdateData(body, recipe);
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

        // Handle questId - ensure empty strings become null
        let finalQuestId: string | null = null;
        if (questId !== undefined) {
            finalQuestId = questId && questId.trim() !== '' ? questId : null;
        } else if (recipe.questId) {
            finalQuestId = recipe.questId;
        }

        const finalImageSrc =
            imageSrc !== undefined ? imageSrc : recipe.imageSrc;
        const hasExtraImageUpdates =
            imageSrc1 !== undefined ||
            imageSrc2 !== undefined ||
            imageSrc3 !== undefined;
        const finalExtraImages = hasExtraImageUpdates
            ? [imageSrc1, imageSrc2, imageSrc3].filter(Boolean)
            : recipe.extraImages || [];

        await cleanupOldImages(
            recipe,
            finalImageSrc,
            finalExtraImages,
            recipeId
        );

        const updateData: Partial<SafeRecipe> & {
            extraImages?: string[];
        } = {
            title,
            description,
            imageSrc: imageSrc !== undefined ? imageSrc : undefined,
            method,
            ingredients,
            steps,
            minutes,
            coCooksIds: coCooksIds || [],
            linkedRecipeIds: linkedRecipeIds || [],
            youtubeUrl: youtubeUrl?.trim() || null,
            questId: finalQuestId,
            ...(categories !== undefined && { categories }),
            ...(hasExtraImageUpdates && { extraImages: finalExtraImages }),
        };

        if (recipeCuisine !== undefined) {
            updateData.recipeCuisine = recipeCuisine || null;
        }
        if (calories !== undefined) {
            updateData.calories =
                calories !== null && calories !== ''
                    ? parseInt(calories.toString(), 10)
                    : null;
        }
        if (recipeYield !== undefined) {
            updateData.recipeYield =
                recipeYield !== null && recipeYield !== ''
                    ? parseInt(recipeYield.toString(), 10)
                    : null;
        }

        const updatedRecipe = await prisma.recipe.update({
            where: {
                id: recipeId,
            },
            data: updateData,
        });

        logger.info('PATCH /api/recipe/[recipeId] - success', { recipeId });

        await invalidateRecipeCache(recipeId);

        return NextResponse.json(updatedRecipe);
    } catch (error: any) {
        logger.error('PATCH /api/recipe/[recipeId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to update recipe');
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const [params, currentUser] = await Promise.all([
            props.params,
            getCurrentUser(),
        ]);

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to delete recipe'
            );
        }

        const { recipeId } = params;

        logger.info('DELETE /api/recipe/[recipeId] - start', {
            recipeId,
            userId: currentUser.id,
        });

        if (!recipeId || typeof recipeId !== 'string') {
            return invalidInput(
                'Recipe ID is required and must be a valid string'
            );
        }

        const recipe = await getRecipeById({ recipeId });

        if (!recipe) {
            return notFoundResponse('Recipe not found');
        }

        if (recipe.userId !== currentUser.id) {
            return forbiddenResponse('You can only delete your own recipes');
        }

        const imageUrls: string[] = [];
        if (recipe.imageSrc) {
            imageUrls.push(recipe.imageSrc);
        }
        if (recipe.extraImages && recipe.extraImages.length > 0) {
            imageUrls.push(...recipe.extraImages);
        }
        if (imageUrls.length > 0) {
            try {
                const { successful, failed } =
                    await deleteMultipleFromCloudinary(imageUrls);
                if (successful.length > 0) {
                    console.log(
                        `Successfully deleted ${successful.length} images from Cloudinary for recipe ${recipeId}`
                    );
                }
                if (failed.length > 0) {
                    console.warn(
                        `Failed to delete ${failed.length} images from Cloudinary for recipe ${recipeId}:`,
                        failed
                    );
                }
            } catch (error) {
                console.error('Error deleting images from Cloudinary:', error);
            }
        }

        const [deletedRecipe] = await Promise.all([
            prisma.recipe.delete({
                where: {
                    id: recipeId,
                },
            }),
            updateUserLevel({
                userId: recipe.userId,
            }),
        ]);

        logger.info('DELETE /api/recipe/[recipeId] - success', {
            recipeId,
        });

        // Invalidate cache
        try {
            await Promise.all([
                redisCache.del(`recipe:${recipeId}`),
                redisCache.del(`recipes:graph:${currentUser.id}`),
                redisCache.incr('recipes:global:version'),
            ]);
        } catch (error: any) {
            logger.error(
                'DELETE /api/recipe/[recipeId] - cache invalidation error',
                {
                    error: error.message,
                    recipeId,
                }
            );
        }

        return NextResponse.json(deletedRecipe);
    } catch (error: any) {
        logger.error('DELETE /api/recipe/[recipeId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to delete recipe');
    }
}
