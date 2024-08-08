import prisma from '@/app/libs/prismadb';
import { calculateLevel } from '@/app/utils/calculateLevel';

interface IParams {
    userId?: string;
}

export default async function updateUserLevel(params: IParams) {
    try {
        const { userId } = params;

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            throw new Error('El usuario no existe.');
        }

        const userRecipes = await prisma.recipe.findMany({
            where: {
                userId: userId,
            },
        });

        const totalLikes = userRecipes.reduce(
            (total, recipe) => total + (recipe.numLikes || 0),
            0
        );

        const newLevel = calculateLevel(userRecipes.length, totalLikes);

        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                level: newLevel,
            },
        });

        return updatedUser;
    } catch (error: any) {
        throw new Error(error);
    }
}
