import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendEmail from '@/app/actions/sendEmail';
import getRecipeById from '@/app/actions/getRecipeById';
import updateUserLevel from '@/app/actions/updateUserLevel';
import { deleteMultipleFromCloudinary } from '@/app/utils/cloudinary';
import { EmailType } from '@/app/types/email';
import {
    unauthorized,
    invalidInput,
    badRequest,
    forbidden,
    notFound,
    internalServerError,
    validationError,
} from '@/app/utils/apiErrors';
import {
    RECIPE_TITLE_MAX_LENGTH,
    RECIPE_DESCRIPTION_MAX_LENGTH,
    RECIPE_INGREDIENT_MAX_LENGTH,
    RECIPE_STEP_MAX_LENGTH,
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
    RECIPE_MAX_CATEGORIES,
} from '@/app/utils/constants';
import { logger } from '@/app/lib/axiom/server';
import { YOUTUBE_URL_REGEX } from '@/app/utils/validation';

interface IParams {
    recipeId?: string;
}

export async function POST(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const body = await request.json();

        const { operation } = body;

        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
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
            return notFound('Recipe not found');
        }

        let numLikes = currentRecipe.numLikes;

        if (operation === 'increment') {
            numLikes++;
            if (currentRecipe.user.emailNotifications) {
                await sendEmail({
                    type: EmailType.NEW_LIKE,
                    userEmail: currentRecipe.user.email,
                    params: {
                        userName: currentUser.name,
                        recipeId: recipeId,
                    },
                });
            }
        } else {
            if (numLikes > 0) {
                numLikes--;
            }
        }

        const recipe = await prisma.recipe.update({
            where: {
                id: recipeId,
            },
            data: {
                numLikes: numLikes,
            },
        });

        await updateUserLevel({
            userId: currentRecipe.user.id,
        });

        logger.info('POST /api/recipe/[recipeId] - success', {
            recipeId,
            operation,
            numLikes: recipe.numLikes,
        });
        return NextResponse.json(recipe);
    } catch (error: any) {
        logger.error('POST /api/recipe/[recipeId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to update recipe likes');
    }
}

export async function PATCH(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('User authentication required to edit recipe');
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
            return notFound('Recipe not found');
        }

        if (recipe.userId !== currentUser.id) {
            return forbidden('You can only edit your own recipes');
        }

        const body = await request.json();
        const {
            title,
            description,
            imageSrc,
            category, // Legacy field for backward compatibility
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
        } = body;

        // Handle both legacy 'category' and new 'categories' field
        let finalCategories: string[] | undefined = undefined;
        if (Array.isArray(categories)) {
            finalCategories = categories;
        } else if (typeof category === 'string' && category.trim() !== '') {
            // Migrate legacy single category to array
            finalCategories = [category];
        } else if (categories === undefined && category === undefined) {
            // If neither is provided, keep existing categories
            finalCategories = undefined;
        }

        // Validate categories if provided
        if (finalCategories !== undefined) {
            if (finalCategories.length === 0) {
                return badRequest('At least one category is required');
            }

            if (finalCategories.length > RECIPE_MAX_CATEGORIES) {
                return validationError(
                    `Recipe cannot have more than ${RECIPE_MAX_CATEGORIES} categories`
                );
            }

            // Check for award-winning category
            const existingCategories = Array.isArray(recipe.categories)
                ? recipe.categories
                : recipe.category
                  ? [recipe.category]
                  : [];
            const hasAwardWinning = existingCategories.some(
                (cat) => cat.toLowerCase() === 'award-winning'
            );

            if (
                finalCategories.some(
                    (cat) => cat.toLowerCase() === 'award-winning'
                ) &&
                !hasAwardWinning
            ) {
                return forbidden(
                    'The Award-winning category cannot be set via API'
                );
            }
        }

        if (!title || !description) {
            return badRequest(
                'Missing required fields: title and description are required'
            );
        }

        if (title && title.length > RECIPE_TITLE_MAX_LENGTH) {
            return validationError(
                `Title must be ${RECIPE_TITLE_MAX_LENGTH} characters or less`
            );
        }

        if (description && description.length > RECIPE_DESCRIPTION_MAX_LENGTH) {
            return validationError(
                `Description must be ${RECIPE_DESCRIPTION_MAX_LENGTH} characters or less`
            );
        }

        if (ingredients && ingredients.length > RECIPE_MAX_INGREDIENTS) {
            return validationError(
                `Recipe cannot have more than ${RECIPE_MAX_INGREDIENTS} ingredients`
            );
        }

        if (steps && steps.length > RECIPE_MAX_STEPS) {
            return validationError(
                `Recipe cannot have more than ${RECIPE_MAX_STEPS} steps`
            );
        }

        if (ingredients) {
            for (const ingredient of ingredients) {
                if (ingredient.length > RECIPE_INGREDIENT_MAX_LENGTH) {
                    return validationError(
                        `Each ingredient must be ${RECIPE_INGREDIENT_MAX_LENGTH} characters or less`
                    );
                }
            }
        }

        if (steps) {
            for (const step of steps) {
                if (step.length > RECIPE_STEP_MAX_LENGTH) {
                    return validationError(
                        `Each step must be ${RECIPE_STEP_MAX_LENGTH} characters or less`
                    );
                }
            }
        }

        if (youtubeUrl && youtubeUrl.trim() !== '') {
            if (!YOUTUBE_URL_REGEX.test(youtubeUrl.trim())) {
                return validationError('Invalid YouTube URL format');
            }
        }

        // Handle questId - ensure empty strings become null
        let finalQuestId: string | null = null;
        if (questId !== undefined) {
            finalQuestId = questId && questId.trim() !== '' ? questId : null;
        } else if (recipe.questId) {
            finalQuestId = recipe.questId;
        }

        const extraImages = [imageSrc1, imageSrc2, imageSrc3].filter(Boolean);

        const imagesToDelete: string[] = [];
        if (recipe.imageSrc && recipe.imageSrc !== imageSrc) {
            imagesToDelete.push(recipe.imageSrc);
        }
        const oldExtraImages = recipe.extraImages || [];
        const newExtraImages = extraImages;
        for (const oldImage of oldExtraImages) {
            if (!newExtraImages.includes(oldImage)) {
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
                console.error(
                    'Error deleting old images from Cloudinary:',
                    error
                );
            }
        }

        const updateData: any = {
            title,
            description,
            imageSrc,
            method,
            ingredients,
            steps,
            minutes,
            extraImages,
            coCooksIds: coCooksIds || [],
            linkedRecipeIds: linkedRecipeIds || [],
            youtubeUrl: youtubeUrl?.trim() || null,
            questId: finalQuestId,
        };

        // Only update categories if provided
        if (finalCategories !== undefined) {
            updateData.categories = finalCategories;
        }

        const updatedRecipe = await prisma.recipe.update({
            where: {
                id: recipeId,
            },
            data: updateData,
        });

        logger.info('PATCH /api/recipe/[recipeId] - success', { recipeId });
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
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
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
            return notFound('Recipe not found');
        }

        if (recipe.userId !== currentUser.id) {
            return forbidden('You can only delete your own recipes');
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

        const deletedRecipe = await prisma.recipe.delete({
            where: {
                id: recipeId,
            },
        });

        await updateUserLevel({
            userId: recipe.userId,
        });

        logger.info('DELETE /api/recipe/[recipeId] - success', {
            recipeId,
        });
        return NextResponse.json(deletedRecipe);
    } catch (error: any) {
        logger.error('DELETE /api/recipe/[recipeId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to delete recipe');
    }
}
