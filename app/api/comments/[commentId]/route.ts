import { NextResponse } from 'next/server';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import getCommentById from '@/app/actions/getCommentById';

interface IParams {
    commentId?: string;
}

export async function DELETE(
    request: Request,
    { params }: { params: IParams }
) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

    const { commentId: commentId } = params;

    if (!commentId || typeof commentId !== 'string') {
        throw new Error('Invalid ID');
    }

    const comment = await getCommentById({ commentId });

    if (comment?.userId !== currentUser.id) {
        return NextResponse.error();
    }

    const user = await prisma.comment.delete({
        where: {
            id: commentId,
        },
    });

    return NextResponse.json(user);
}
