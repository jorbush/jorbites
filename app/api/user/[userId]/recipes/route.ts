import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import {
    invalidInput,
    internalServerError,
    unauthorized,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import getCurrentUser from '@/app/actions/getCurrentUser';

interface IParams {
    userId?: string;
}

export async function GET(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const { userId } = params;
        const currentUser = await getCurrentUser();

        logger.info('GET /api/user/[userId]/recipes - start', {
            userId,
            currentUser: currentUser,
        });

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

        const recipes = await prisma.recipe.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: 'desc',
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
