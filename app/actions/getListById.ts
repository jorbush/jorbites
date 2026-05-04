import prisma from '@/app/lib/prismadb';
import getCurrentUser from './getCurrentUser';
import { SafeList, SafeRecipe, SafeUser } from '@/app/types';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    listId?: string;
}

export default async function getListById(
    params: IParams
): Promise<
    | { list: SafeList; recipes: (SafeRecipe & { user: SafeUser })[] }
    | { error: string }
    | null
> {
    try {
        const { listId } = params;
        const currentUser = await getCurrentUser();

        if (!listId) {
            return null;
        }

        const list = await prisma.list.findUnique({
            where: { id: listId },
            include: { user: true },
        });

        if (!list) {
            return null;
        }

        if (
            list.isPrivate &&
            (!currentUser || list.userId !== currentUser.id)
        ) {
            throw new Error('Unauthorized');
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
                user: true,
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
        if (error.message === 'Unauthorized') {
            return { error: 'Unauthorized' };
        }
        logger.error('getListById - error', {
            error: error.message,
            listId: params.listId,
        });
        return null;
    }
}
