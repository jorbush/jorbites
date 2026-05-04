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

        const existingList = await prisma.list.findUnique({
            where: { id: listId },
        });

        if (!existingList || existingList.userId !== currentUser.id) {
            return notFound('Not found or unauthorized');
        }

        const updatedList = await prisma.list.update({
            where: { id: listId },
            data: {
                name: name !== undefined ? name : existingList.name,
                isPrivate:
                    isPrivate !== undefined
                        ? isPrivate
                        : existingList.isPrivate,
            },
        });

        logger.info('PATCH /api/lists/[listId] - success', {
            listId: updatedList.id,
        });
        return NextResponse.json(updatedList);
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
