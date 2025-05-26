import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendEmail from '@/app/actions/sendEmail';
import updateUserLevel from '@/app/actions/updateUserLevel';
import { EmailType } from '@/app/types/email';
import {
    RECIPE_TITLE_MAX_LENGTH,
    RECIPE_DESCRIPTION_MAX_LENGTH,
    RECIPE_INGREDIENT_MAX_LENGTH,
    RECIPE_STEP_MAX_LENGTH,
} from '@/app/utils/constants';

export async function POST(request: Request) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Validate field lengths
    if (title && title.length > RECIPE_TITLE_MAX_LENGTH) {
        return NextResponse.json(
            {
                error: `Title must be ${RECIPE_TITLE_MAX_LENGTH} characters or less`,
            },
            { status: 400 }
        );
    }

    if (description && description.length > RECIPE_DESCRIPTION_MAX_LENGTH) {
        return NextResponse.json(
            {
                error: `Description must be ${RECIPE_DESCRIPTION_MAX_LENGTH} characters or less`,
            },
            { status: 400 }
        );
    }

    // Validate ingredients and steps
    if (ingredients) {
        for (const ingredient of ingredients) {
            if (ingredient.length > RECIPE_INGREDIENT_MAX_LENGTH) {
                return NextResponse.json(
                    {
                        error: `Each ingredient must be ${RECIPE_INGREDIENT_MAX_LENGTH} characters or less`,
                    },
                    { status: 400 }
                );
            }
        }
    }

    if (steps) {
        for (const step of steps) {
            if (step.length > RECIPE_STEP_MAX_LENGTH) {
                return NextResponse.json(
                    {
                        error: `Each step must be ${RECIPE_STEP_MAX_LENGTH} characters or less`,
                    },
                    { status: 400 }
                );
            }
        }
    }

    const requiredFields = [
        'title',
        'description',
        'imageSrc',
        'category',
        'method',
        'ingredients',
        'steps',
        'minutes',
    ];

    for (const field of requiredFields) {
        if (!body[field]) {
            return NextResponse.json(
                { error: `Missing required field: ${field}` },
                { status: 400 }
            );
        }
    }

    const recipeExist =
        (await prisma.recipe.findFirst({
            where: {
                imageSrc: imageSrc as string,
            },
        })) ?? null;

    if (recipeExist !== null) {
        return NextResponse.json(
            { error: 'Recipe with this image already exists' },
            { status: 409 }
        );
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

    const recipe = await prisma.recipe.create({
        data: {
            title,
            description,
            imageSrc,
            category,
            method,
            ingredients,
            steps,
            minutes,
            numLikes: 0,
            extraImages,
            userId: currentUser.id,
            coCooksIds: limitedCoCooksIds,
            linkedRecipeIds: limitedLinkedRecipeIds,
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

    return NextResponse.json(recipe);
}
