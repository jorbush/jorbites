import { NextResponse } from 'next/server';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';

interface IParams {
    recipeId?: string;
}

export async function POST(request: Request, props: { params: Promise<IParams> }) {
    const params = await props.params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const { recipeId } = params;

    if (!recipeId || typeof recipeId !== 'string') {
        throw new Error('Invalid ID');
    }

    let favoriteIds = [...(currentUser.favoriteIds || [])];

    favoriteIds.push(recipeId);

    const user = await prisma.user.update({
        where: {
            id: currentUser.id,
        },
        data: {
            favoriteIds,
        },
    });

    return NextResponse.json(user);
}

export async function DELETE(request: Request, props: { params: Promise<IParams> }) {
    const params = await props.params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const { recipeId } = params;

    if (!recipeId || typeof recipeId !== 'string') {
        throw new Error('Invalid ID');
    }

    let favoriteIds = [...(currentUser.favoriteIds || [])];

    favoriteIds = favoriteIds.filter((id) => id !== recipeId);

    const user = await prisma.user.update({
        where: {
            id: currentUser.id,
        },
        data: {
            favoriteIds,
        },
    });

    return NextResponse.json(user);
}
