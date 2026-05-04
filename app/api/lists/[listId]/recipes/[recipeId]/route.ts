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
    recipeId?: string;
}

export async function POST(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('Unauthorized');
        }

        const { listId, recipeId } = params;
        logger.info('POST /api/lists/[listId]/recipes/[recipeId] - start', {
            listId,
            recipeId,
            userId: currentUser.id,
        });

        if (
            !listId ||
            typeof listId !== 'string' ||
            !recipeId ||
            typeof recipeId !== 'string'
        ) {
            return badRequest('Invalid IDs');
        }

        const list = await prisma.list.findUnique({
            where: { id: listId },
        });

        if (!list || list.userId !== currentUser.id) {
            return notFound('Not found or unauthorized');
        }

        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
        });

        if (!recipe) {
            return notFound('Recipe not found');
        }

        const updatedList = await prisma.list.update({
            where: { id: listId },
            data: {
                recipes: {
                    connect: { id: recipeId },
                },
            },
        });

        logger.info('POST /api/lists/[listId]/recipes/[recipeId] - success', {
            listId,
            recipeId,
        });
        return NextResponse.json(updatedList);
    } catch (error: any) {
        logger.error('POST /api/lists/[listId]/recipes/[recipeId] - error', {
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

        const { listId, recipeId } = params;
        logger.info('DELETE /api/lists/[listId]/recipes/[recipeId] - start', {
            listId,
            recipeId,
            userId: currentUser.id,
        });

        if (
            !listId ||
            typeof listId !== 'string' ||
            !recipeId ||
            typeof recipeId !== 'string'
        ) {
            return badRequest('Invalid IDs');
        }

        const list = await prisma.list.findUnique({
            where: { id: listId },
        });

        if (!list || list.userId !== currentUser.id) {
            return notFound('Not found or unauthorized');
        }

        const updatedList = await prisma.list.update({
            where: { id: listId },
            data: {
                recipes: {
                    disconnect: { id: recipeId },
                },
            },
        });

        logger.info('DELETE /api/lists/[listId]/recipes/[recipeId] - success', {
            listId,
            recipeId,
        });
        return NextResponse.json(updatedList);
    } catch (error: any) {
        logger.error('DELETE /api/lists/[listId]/recipes/[recipeId] - error', {
            error: error.message,
        });
        return internalServerError('Internal Error');
    }
}
