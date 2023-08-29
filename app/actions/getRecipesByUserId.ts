import prisma from "@/app/libs/prismadb";

import getCurrentUser from "./getCurrentUser";

interface IParams {
  userId?: string;
}

export default async function getRecipesByUserId(
  params: IParams
) {
  try {
    const { userId } = params;

    const recipes = await prisma.listing.findMany({
      where: {
        userId: userId
      },
      include: {
        user: true
      }
    });

    const safeRecipes = recipes.map((recipe) => ({
      ...recipe,
      createdAt: recipe.createdAt.toString(),
    }));

    return safeRecipes;
  } catch (error: any) {
    throw new Error(error);
  }
}