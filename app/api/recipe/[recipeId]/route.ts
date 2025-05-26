import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendEmail from '@/app/actions/sendEmail';
import getRecipeById from '@/app/actions/getRecipeById';
import updateUserLevel from '@/app/actions/updateUserLevel';
import { EmailType } from '@/app/types/email';

interface IParams {
    recipeId?: string;
}

export async function POST(
    request: Request,
    props: { params: Promise<IParams> }
) {
    const params = await props.params;
    const body = await request.json();

    const { operation } = body;

    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipeId } = params;

    if (!recipeId || typeof recipeId !== 'string') {
        return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
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
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    let numLikes = currentRecipe.numLikes;

    if (operation === 'increment') {
        numLikes++;
        if (currentRecipe?.user.emailNotifications) {
            await sendEmail({
                type: EmailType.NEW_LIKE,
                userEmail: currentRecipe?.user.email,
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
        userId: currentRecipe?.user.id,
    });

    return NextResponse.json(recipe);
}

export async function DELETE(
    request: Request,
    props: { params: Promise<IParams> }
) {
    const params = await props.params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipeId } = params;

    if (!recipeId || typeof recipeId !== 'string') {
        return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
    }

    const recipe = await getRecipeById({ recipeId });

    if (!recipe) {
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (recipe.userId !== currentUser.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
}
