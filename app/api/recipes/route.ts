import { NextResponse } from 'next/server';

import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendEmail from '@/app/actions/sendEmail';
import updateUserLevel from '@/app/actions/updateUserLevel';
import { JORBITES_URL } from '@/app/utils/constants';

export async function POST(request: Request) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
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
    } = body;

    Object.keys(body).forEach((value: any) => {
        if (!body[value]) {
            NextResponse.error();
        }
    });

    const recipeExist =
        (await prisma.recipe.findFirst({
            where: {
                imageSrc: imageSrc as string,
            },
        })) ?? null;

    if (recipeExist !== null) {
        return NextResponse.error();
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
        },
    });

    const users = await prisma.user.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });

    await Promise.all(
        users.map(async (user) => {
            if (user.emailNotifications) {
                await sendEmail(
                    `There's a new recipe available on Jorbites!\nCheck it out: ${JORBITES_URL}/recipes/` +
                        recipe.id,
                    user.email
                );
            }
        })
    );

    await updateUserLevel({
        userId: currentUser.id,
    });

    return NextResponse.json(recipe);
}
