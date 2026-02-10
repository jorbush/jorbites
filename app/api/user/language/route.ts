import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import {
    unauthorized,
    internalServerError,
    badRequest,
} from '@/app/utils/apiErrors';

export async function PATCH(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized();
        }

        const body = await request.json();
        const { language } = body;

        const ALLOWED_LANGUAGES = ['es', 'en', 'ca'];
        if (!language || !ALLOWED_LANGUAGES.includes(language)) {
            return badRequest('Invalid language');
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                language,
            },
            select: {
                language: true,
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
