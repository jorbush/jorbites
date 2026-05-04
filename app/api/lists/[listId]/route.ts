import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { logger } from '@/app/lib/axiom/server';
import {
    unauthorized,
    internalServerError,
    badRequest,
    notFound,
} from '@/app/utils/apiErrors';

interface IParams {
    listId?: string;
}

export async function PATCH(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('Unauthorized');
        }

        const { listId } = params;
        logger.info('PATCH /api/lists/[listId] - start', {
            listId,
            userId: currentUser.id,
        });

        if (!listId || typeof listId !== 'string') {
            return badRequest('Invalid ID');
        }

        const body = await request.json();
        const { name, isPrivate } = body;

        if (
            name !== undefined &&
            (typeof name !== 'string' || name.trim().length === 0)
        ) {
            return badRequest('Invalid name');
        }

        if (isPrivate !== undefined && typeof isPrivate !== 'boolean') {
            return badRequest('Invalid isPrivate flag');
        }

        const existingList = await prisma.list.findUnique({
            where: { id: listId },
        });

        if (!existingList || existingList.userId !== currentUser.id) {
            return notFound('Not found or unauthorized');
        }

        const updatedList = await prisma.list.update({
            where: { id: listId },
            data: {
                name: name !== undefined ? name.trim() : existingList.name,
                isPrivate:
                    isPrivate !== undefined
                        ? isPrivate
                        : existingList.isPrivate,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        verified: true,
                        level: true,
                        badges: true,
                        createdAt: true,
                        updatedAt: true,
                        emailVerified: true,
                    },
                },
            },
        });

        logger.info('PATCH /api/lists/[listId] - success', {
            listId: updatedList.id,
        });

        const safeList = {
            ...updatedList,
            createdAt: updatedList.createdAt.toISOString(),
            updatedAt: updatedList.updatedAt.toISOString(),
            user: {
                ...updatedList.user,
                createdAt: updatedList.user.createdAt.toISOString(),
                updatedAt: updatedList.user.updatedAt.toISOString(),
                emailVerified: updatedList.user.emailVerified?.toISOString() || null,
            },
        };

        return NextResponse.json(safeList);
    } catch (error: any) {
        logger.error('PATCH /api/lists/[listId] - error', {
            error: error.message,
        });
        return internalServerError('Internal Error');
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('Unauthorized');
        }

        const { listId } = params;
        logger.info('DELETE /api/lists/[listId] - start', {
            listId,
            userId: currentUser.id,
        });

        if (!listId || typeof listId !== 'string') {
            return badRequest('Invalid ID');
        }

        const existingList = await prisma.list.findUnique({
            where: { id: listId },
        });

        if (!existingList || existingList.userId !== currentUser.id) {
            return notFound('Not found or unauthorized');
        }

        if (existingList.isDefault) {
            return badRequest('Cannot delete default list');
        }

        await prisma.list.delete({
            where: { id: listId },
        });

        logger.info('DELETE /api/lists/[listId] - success', { listId });
        return NextResponse.json({ message: 'List deleted' });
    } catch (error: any) {
        logger.error('DELETE /api/lists/[listId] - error', {
            error: error.message,
        });
        return internalServerError('Internal Error');
    }
}
