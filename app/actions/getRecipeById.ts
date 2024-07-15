import prisma from "@/app/libs/prismadb";

interface IParams {
  recipeId?: string;
}

export default async function getRecipeById(
  params: IParams
) {
  try {
    const { recipeId } = params;

    const recipe = await prisma.listing.findUnique({
      where: {
        id: recipeId,
      },
      include: {
        user: true
      }
    });

    if (!recipe) {
      return null;
    }

    return {
      ...recipe,
      createdAt: recipe.createdAt.toISOString(),
      user: {
        ...recipe.user,
        createdAt: recipe.user.createdAt.toISOString(),
        updatedAt: recipe.user.updatedAt.toISOString(),
        emailVerified:
          recipe.user.emailVerified?.toString() || null,
      }
    };
  } catch (error: any) {
    throw new Error(error);
  }
}
