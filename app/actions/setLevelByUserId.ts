// Nivel = log(1 + (RecetasPublicadas ^ 1.5)) / log(LikesTotales + 1)

import prisma from "@/app/libs/prismadb";

interface IParams {
  userId?: string;
}

export default async function setLevelByUserId(params: IParams) {
  try {
    const { userId } = params;

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    //console.log(user?.name)

    if (!user) {
      throw new Error("El usuario no existe.");
    }

    const userRecipes = await prisma.listing.findMany({
      where: {
        userId: userId
      }
    });

    //console.log(userRecipes.length)

    const totalLikes = userRecipes.reduce((total, recipe) => total + (recipe.numLikes || 0), 0);

    //console.log(totalLikes)

    const newLevel = calculateLevel(userRecipes.length, totalLikes);

    //console.log(newLevel)

    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        level: newLevel
      }
    });

    return updatedUser;
  } catch (error: any) {
    throw new Error(error);
  }
}

function calculateLevel(numRecipes: number, numTotalLikes: number): number {
    const level = numRecipes + numTotalLikes
    
    return Math.floor(level);
}
  