import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import {
    invalidInput,
    internalServerError,
    unauthorized,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { recipeBookRatelimit } from '@/app/lib/ratelimit';

interface IParams {
    userId?: string;
}

export async function GET(
    request: Request,
    props: { params: Promise<IParams> }
) {
    const params = await props.params;
    const { userId } = params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return unauthorized(
            'You must be logged in to view all the recipes of a user (yours)'
        );
    }

    if (!userId || typeof userId !== 'string') {
        return invalidInput(
            'User ID is required and must be a valid string'
        );
    }

    if (currentUser.id !== userId) {
        return unauthorized(
            'You can only view all the recipes of your own account'
        );
    }

    try {
        logger.info('GET /api/user/[userId]/recipes - start', {
            userId,
            currentUserId: currentUser?.id,
        });

        // Rate limiting to prevent abuse
        if (process.env.ENV === 'production') {
            const { success, reset } = await recipeBookRatelimit.limit(
                currentUser.id
            );
            if (!success) {
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                logger.warn(
                    'GET /api/user/[userId]/recipes - rate limit exceeded',
                    {
                        userId: currentUser.id,
                    }
                );
                return rateLimitExceeded(
                    `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                );
            }
        }

        const recipes = await prisma.recipe.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        const safeRecipes = recipes.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toISOString(),
        }));

        logger.info('GET /api/user/[userId]/recipes - success', {
            userId,
            count: safeRecipes.length,
        });

        return NextResponse.json(safeRecipes);
    } catch (error: any) {
        logger.error('GET /api/user/[userId]/recipes - error', {
            error: error.message,
            userId: (await props.params).userId,
        });
        return internalServerError('Failed to fetch recipes');
    }
}
