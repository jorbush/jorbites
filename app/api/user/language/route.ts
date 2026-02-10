import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { unauthorized, internalServerError } from '@/app/utils/apiErrors';

export async function PATCH(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized();
        }

        const body = await request.json();
        const { language } = body;

        const updatedUser = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                language,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        logger.error('PATCH /api/user/language - error', {
            error: error.message,
        });
        return internalServerError();
    }
}
