import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendEmail from '@/app/actions/sendEmail';
import updateUserLevel from '@/app/actions/updateUserLevel';
import { EmailType } from '@/app/types/email';
import {
    RECIPE_TITLE_MAX_LENGTH,
    RECIPE_DESCRIPTION_MAX_LENGTH,
    RECIPE_INGREDIENT_MAX_LENGTH,
    RECIPE_STEP_MAX_LENGTH,
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
    RECIPE_MAX_CATEGORIES,
} from '@/app/utils/constants';
import {
    unauthorized,
    validationError,
    badRequest,
    forbidden,
    conflict,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { YOUTUBE_URL_REGEX } from '@/app/utils/validation';
import { contentCreationRatelimit } from '@/app/lib/ratelimit';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
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
        } = body;

        if (!Array.isArray(categories)) {
            return badRequest('Categories must be an array');
        }

        if (categories.length > RECIPE_MAX_CATEGORIES) {
            return validationError(
                `Recipe cannot have more than ${RECIPE_MAX_CATEGORIES} categories`
            );
        }

        // Validate each category is a non-empty string
        if (categories.some((cat) => typeof cat !== 'string' || !cat.trim())) {
            return badRequest('All categories must be non-empty strings');
        }

        // Check for award-winning category
        if (categories.some((cat) => cat.toLowerCase() === 'award-winning')) {
            return forbidden(
                'The Award-winning category cannot be set via API'
            );
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

        // Check for recipe with same image
        const recipeExist = await prisma.recipe.findFirst({
            where: {
                imageSrc: imageSrc as string,
            },
        });

        if (recipeExist !== null) {
            return conflict('A recipe with this image already exists');
        }

        // Validate YouTube URL if provided
        if (youtubeUrl && youtubeUrl.trim() !== '') {
            if (!YOUTUBE_URL_REGEX.test(youtubeUrl.trim())) {
                return validationError('Invalid YouTube URL format');
            }
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

        // Handle questId - ensure empty strings become null
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
            },
        });

        await sendEmail({
            type: EmailType.NEW_RECIPE,
            userEmail: currentUser.email,
            params: {
                recipeId: recipe.id,
            },
        });

        await updateUserLevel({
            userId: currentUser.id,
        });

        logger.info('POST /api/recipes - success', {
            recipeId: recipe.id,
            userId: currentUser.id,
        });
        return NextResponse.json(recipe);
    } catch (error: any) {
        logger.error('POST /api/recipes - error', { error: error.message });
        console.error(error);
        return internalServerError('Failed to create recipe');
    }
}
