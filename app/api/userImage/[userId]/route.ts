import { NextResponse } from 'next/server';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';

export async function PUT(request: Request) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const body = await request.json();
    const { userImage } = body;

    if (!userImage || typeof userImage !== 'string') {
        throw new Error('Invalid ID');
    }

    const user = await prisma.user.update({
        where: {
            id: currentUser.id,
        },
        data: {
            image: userImage,
        },
    });

    return NextResponse.json(user);
}
