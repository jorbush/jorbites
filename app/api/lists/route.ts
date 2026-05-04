import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import {
    unauthorized,
    internalServerError,
    badRequest,
} from '@/app/utils/apiErrors';

export async function GET() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('Unauthorized');
        }

        logger.info('GET /api/lists - start', { userId: currentUser.id });

        let lists = await prisma.list.findMany({
            where: {
                userId: currentUser.id,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Lazy create default list if the user has no lists
        // Note: Restored per user request to ensure the AddToListModal always has the default list ready
        if (lists.length === 0) {
            try {
                const defaultList = await prisma.list.create({
                    data: {
                        name: 'to cook later',
                        isDefault: true,
                        isPrivate: true,
                        userId: currentUser.id,
                    },
                });
                lists = [defaultList];
            } catch (error) {
                // If a parallel request already created it, re-fetch
                lists = await prisma.list.findMany({
                    where: { userId: currentUser.id },
                    orderBy: { createdAt: 'asc' },
                });
            }
        }

        logger.info('GET /api/lists - success', {
            userId: currentUser.id,
            listCount: lists.length,
        });
        return NextResponse.json(lists);
    } catch (error: any) {
        logger.error('GET /api/lists - error', { error: error.message });
        return internalServerError('Internal Error');
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('Unauthorized');
        }

        logger.info('POST /api/lists - start', { userId: currentUser.id });

        const body = await request.json();
        const { name, isPrivate, recipeId } = body;

        if (typeof name !== 'string' || name.trim().length === 0) {
            return badRequest('Missing or invalid name');
        }

        const list = await prisma.list.create({
            data: {
                name: name.trim(),
                isPrivate: isPrivate !== undefined ? isPrivate : true,
                isDefault: false,
                userId: currentUser.id,
                ...(recipeId && { recipeIds: [recipeId] }),
            },
        });

        logger.info('POST /api/lists - success', { listId: list.id });
        return NextResponse.json(list);
    } catch (error: any) {
        logger.error('POST /api/lists - error', { error: error.message });
        return internalServerError('Internal Error');
    }
}
