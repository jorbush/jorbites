import prisma from '@/app/lib/prismadb';
import getCurrentUser from './getCurrentUser';
import { SafeList, SafeRecipe, SafeUser } from '@/app/types';
import { logger } from '@/app/lib/axiom/server';
import { USER_SELECT_FIELDS } from '../utils/constants';
import { NextResponse } from 'next/server';
import {
    badRequest,
    internalServerError,
    notFoundResponse,
    unauthorizedResponse,
} from '@/app/utils/apiErrors';

interface IParams {
    listId?: string;
}

export default async function getListById(
    params: IParams
): Promise<
    | { list: SafeList; recipes: (SafeRecipe & { user: SafeUser })[] }
    | NextResponse
> {
    try {
        const { listId } = params;

        if (!listId) {
            return badRequest('List ID is required');
        }

        const list = await prisma.list.findUnique({
            where: { id: listId },
            include: {
                user: {
                    select: USER_SELECT_FIELDS,
                },
            },
        });

        if (!list) {
            return notFoundResponse('List not found');
        }

        if (list.isPrivate) {
            const currentUser = await getCurrentUser();

            if (!currentUser || list.userId !== currentUser.id) {
                return unauthorizedResponse('Unauthorized');
            }
        }

        const safeList = {
            ...list,
            createdAt: list.createdAt.toISOString(),
            updatedAt: list.updatedAt.toISOString(),
            user: {
                ...list.user,
                createdAt: list.user.createdAt.toISOString(),
                updatedAt: list.user.updatedAt.toISOString(),
                emailVerified: list.user.emailVerified?.toISOString() || null,
            },
        };

        const recipes = await prisma.recipe.findMany({
            where: {
                id: {
                    in: list.recipeIds,
                },
            },
            include: {
                user: {
                    select: USER_SELECT_FIELDS,
                },
            },
        });

        const safeRecipes = recipes.map((recipe) => ({
            ...recipe,
            createdAt: recipe.createdAt.toISOString(),
            user: {
                ...recipe.user,
                createdAt: recipe.user.createdAt.toISOString(),
                updatedAt: recipe.user.updatedAt.toISOString(),
                emailVerified: recipe.user.emailVerified?.toISOString() || null,
            },
        }));

        return { list: safeList, recipes: safeRecipes };
    } catch (error: any) {
        logger.error('getListById - error', {
            error: error.message,
            listId: params.listId,
        });
        return internalServerError('Failed to fetch list');
    }
}
