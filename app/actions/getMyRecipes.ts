import prisma from "@/app/libs/prismadb";

import getCurrentUser from "./getCurrentUser";

export default async function getMyRecipes() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const myRecipes = await prisma.listing.findMany({
      where: {
        userId: currentUser.id
      }
    });

    const safeMyRecipes = myRecipes.map((recipe) => ({
      ...recipe,
      createdAt: recipe.createdAt.toString(),
    }));

    return safeMyRecipes;
  } catch (error: any) {
    throw new Error(error);
  }
}