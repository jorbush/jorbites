import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import {
    unauthorized,
    invalidInput,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
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
            return unauthorized('User authentication required to add favorite');
        }

        const { recipeId } = params;

        logger.info('POST /api/favorites/[recipeId] - start', {
            recipeId,
            userId: currentUser.id,
        });

        if (!recipeId || typeof recipeId !== 'string') {
            return invalidInput(
                'Recipe ID is required and must be a valid string'
            );
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

        logger.info('POST /api/favorites/[recipeId] - success', {
            recipeId,
            userId: user.id,
        });
        return NextResponse.json(user);
    } catch (error: any) {
        logger.error('POST /api/favorites/[recipeId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to add recipe to favorites');
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
            return unauthorized(
                'User authentication required to remove favorite'
            );
        }

        const { recipeId } = params;

        logger.info('DELETE /api/favorites/[recipeId] - start', {
            recipeId,
            userId: currentUser.id,
        });

        if (!recipeId || typeof recipeId !== 'string') {
            return invalidInput(
                'Recipe ID is required and must be a valid string'
            );
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

        logger.info('DELETE /api/favorites/[recipeId] - success', {
            recipeId,
            userId: user.id,
        });
        return NextResponse.json(user);
    } catch (error: any) {
        logger.error('DELETE /api/favorites/[recipeId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to remove recipe from favorites');
    }
}
