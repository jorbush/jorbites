import { NextResponse } from 'next/server';

import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendEmail from '@/app/actions/sendEmail';
import getRecipeById from '@/app/actions/getRecipeById';
import setLevelByUserId from '@/app/actions/setLevelByUserId';

interface IParams {
    recipeId?: string;
}

export async function POST(request: Request, { params }: { params: IParams }) {
    const body = await request.json();

    const { operation } = body;

    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const { recipeId } = params;

    if (!recipeId || typeof recipeId !== 'string') {
        throw new Error('Invalid ID');
    }

    const currentRecipe = await prisma.recipe.findUnique({
        where: {
            id: recipeId,
        },
        include: {
            user: true,
        },
    });

    let numLikes = currentRecipe?.numLikes;

    if (!numLikes && numLikes !== 0) {
        throw Error();
    }

    if (operation === 'increment') {
        numLikes++;
        if (currentRecipe?.user.emailNotifications) {
            await sendEmail(
                'You have received a new like from ' +
                    currentUser.name +
                    '.\nIn this recipe: https://jorbites.com/recipes/' +
                    recipeId,
                currentRecipe?.user.email
            );
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

    await setLevelByUserId({
        userId: currentRecipe?.user.id,
    });

    return NextResponse.json(recipe);
}

export async function DELETE(
    request: Request,
    { params }: { params: IParams }
) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const { recipeId } = params;

    if (!recipeId || typeof recipeId !== 'string') {
        throw new Error('Invalid ID');
    }

    const recipe = await getRecipeById({ recipeId });

    if (recipe?.userId !== currentUser.id) {
        return NextResponse.error();
    }

    const deletedRecipe = await prisma.recipe.delete({
        where: {
            id: recipeId,
        },
    });

    await setLevelByUserId({
        userId: recipe.userId,
    });

    return NextResponse.json(deletedRecipe);
}
