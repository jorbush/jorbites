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
} from '@/app/utils/apiErrors';

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
