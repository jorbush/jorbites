import { NextResponse } from 'next/server';

import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendEmail from '@/app/actions/sendEmail';
import { EmailType } from '@/app/types/email';

export async function POST(request: Request) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const body = await request.json();
    const { recipeId, comment } = body;

    if (!recipeId || !comment) {
        return NextResponse.error();
    }

    const currentRecipe = await prisma.recipe.findUnique({
        where: {
            id: recipeId,
        },
        include: {
            user: true,
        },
    });

    if (currentRecipe?.user.emailNotifications) {
        await sendEmail({
            type: EmailType.NEW_COMMENT,
            userEmail: currentRecipe?.user.email,
            params: {
                userName: currentUser.name,
                recipeId: recipeId,
            },
        });
    }

    const recipeAndComment = await prisma.recipe.update({
        where: {
            id: recipeId,
        },
        data: {
            comments: {
                create: {
                    userId: currentUser.id,
                    comment: comment,
                },
            },
        },
        include: {
            comments: true,
        },
    });

    return NextResponse.json(recipeAndComment);
}
