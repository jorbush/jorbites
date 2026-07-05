import prisma from '@/app/lib/prismadb';
import { SafeUser } from '@/app/types';

interface IParams {
    recipeId?: string;
}

export default async function getUsersWhoLikedRecipe(
    params: IParams
): Promise<SafeUser[]> {
    try {
        const { recipeId } = params;

        if (!recipeId) {
            return [];
        }

        const users = await prisma.user.findMany({
            where: {
                favoriteIds: {
                    has: recipeId,
                },
            },
            select: {
                id: true,
                name: true,
                image: true,
                level: true,
                verified: true,
                createdAt: true,
                updatedAt: true,
                badges: true,
            },
        });

        const safeUsers = users.map((user) => ({
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        }));

        return safeUsers;
    } catch (error: any) {
        console.error('Error in getUsersWhoLikedRecipe:', error);
        return [];
    }
}
