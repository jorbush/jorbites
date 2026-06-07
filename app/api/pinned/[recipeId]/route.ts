import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import {
    unauthorized,
    invalidInput,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { redisCache } from '@/app/lib/redis';

interface IParams {
    recipeId?: string;
}

export async function POST(
    request: Request,
    props: { params: Promise<IParams> }
) {
    const params = await props.params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return unauthorized('User authentication required to pin recipe');
    }

    try {

        const { recipeId } = params;

        logger.info('POST /api/pinned/[recipeId] - start', {
            recipeId,
            userId: currentUser.id,
        });

        if (!recipeId || typeof recipeId !== 'string') {
            return invalidInput(
                'Recipe ID is required and must be a valid string'
            );
        }

        const recipe = await prisma.recipe.findUnique({
            where: {
                id: recipeId,
            },
            select: {
                userId: true,
            },
        });

        if (!recipe) {
            return invalidInput('Recipe not found');
        }

        if (recipe.userId !== currentUser.id) {
            return invalidInput('You can only pin recipes that you created');
        }

        let pinnedRecipeIds = [...(currentUser.pinnedRecipeIds || [])];

        if (pinnedRecipeIds.includes(recipeId)) {
            return invalidInput('Recipe is already pinned');
        }

        if (pinnedRecipeIds.length >= 4) {
            return invalidInput('You can only pin up to 4 recipes');
        }

        pinnedRecipeIds.push(recipeId);

        const user = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                pinnedRecipeIds,
            },
            select: {
                id: true,
                pinnedRecipeIds: true,
            },
        });

        try {
            await redisCache.del(`pinned_recipes:${currentUser.id}`);
        } catch (cacheError: any) {
            logger.error('Failed to invalidate pinned recipes cache', {
                error: cacheError.message,
                userId: currentUser.id,
            });
        }

        logger.info('POST /api/pinned/[recipeId] - success', {
            recipeId,
            userId: user.id,
        });
        return NextResponse.json(user);
    } catch (error: any) {
        logger.error('POST /api/pinned/[recipeId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to pin recipe');
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<IParams> }
) {
    const params = await props.params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return unauthorized('User authentication required to unpin recipe');
    }

    try {

        const { recipeId } = params;

        logger.info('DELETE /api/pinned/[recipeId] - start', {
            recipeId,
            userId: currentUser.id,
        });

        if (!recipeId || typeof recipeId !== 'string') {
            return invalidInput(
                'Recipe ID is required and must be a valid string'
            );
        }

        let pinnedRecipeIds = [...(currentUser.pinnedRecipeIds || [])];

        pinnedRecipeIds = pinnedRecipeIds.filter((id) => id !== recipeId);

        const user = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                pinnedRecipeIds,
            },
            select: {
                id: true,
                pinnedRecipeIds: true,
            },
        });

        try {
            await redisCache.del(`pinned_recipes:${currentUser.id}`);
        } catch (cacheError: any) {
            logger.error('Failed to invalidate pinned recipes cache', {
                error: cacheError.message,
                userId: currentUser.id,
            });
        }

        logger.info('DELETE /api/pinned/[recipeId] - success', {
            recipeId,
            userId: user.id,
        });
        return NextResponse.json(user);
    } catch (error: any) {
        logger.error('DELETE /api/pinned/[recipeId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to unpin recipe');
    }
}
