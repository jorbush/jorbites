import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendEmail from '@/app/actions/sendEmail';
import getRecipeById from '@/app/actions/getRecipeById';
import updateUserLevel from '@/app/actions/updateUserLevel';
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
} from '@/app/utils/constants';

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

        return NextResponse.json(recipe);
    } catch (error) {
        console.error('Error updating recipe likes:', error);
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
            category,
            method,
            ingredients,
            steps,
            minutes,
            imageSrc1,
            imageSrc2,
            imageSrc3,
            coCooksIds,
            linkedRecipeIds,
        } = body;

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

        const extraImages = [imageSrc1, imageSrc2, imageSrc3].filter(Boolean);

        const updatedRecipe = await prisma.recipe.update({
            where: {
                id: recipeId,
            },
            data: {
                title,
                description,
                imageSrc,
                category,
                method,
                ingredients,
                steps,
                minutes,
                extraImages,
                coCooksIds: coCooksIds || [],
                linkedRecipeIds: linkedRecipeIds || [],
            },
        });

        return NextResponse.json(updatedRecipe);
    } catch (error) {
        console.error('Error updating recipe:', error);
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

        const deletedRecipe = await prisma.recipe.delete({
            where: {
                id: recipeId,
            },
        });

        await updateUserLevel({
            userId: recipe.userId,
        });

        return NextResponse.json(deletedRecipe);
    } catch (error) {
        console.error('Error deleting recipe:', error);
        return internalServerError('Failed to delete recipe');
    }
}
