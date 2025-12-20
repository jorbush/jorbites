import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { SafeRecipe, SafeUser } from '@/app/types';

interface IParams {
    recipeId?: string;
    includeRelatedData?: boolean;
}

type RecipeData = SafeRecipe & {
    user: SafeUser;
};

type RecipeDataWithRelated = RecipeData & {
    coCooks: Array<{
        id: string;
        name: string | null;
        image: string | null;
        level: number;
        verified: boolean;
    }>;
    linkedRecipes: Array<SafeRecipe & { user: SafeUser }>;
};

// Function overloads
async function getRecipeById(
    params: IParams & { includeRelatedData: true }
): Promise<RecipeDataWithRelated | null>;
async function getRecipeById(
    params: IParams & { includeRelatedData?: false }
): Promise<RecipeData | null>;
async function getRecipeById(
    params: IParams
): Promise<RecipeData | RecipeDataWithRelated | null>;

async function getRecipeById(
    params: IParams
): Promise<RecipeData | RecipeDataWithRelated | null> {
    try {
        logger.info('getRecipeById - start', {
            recipeId: params.recipeId,
            includeRelatedData: params.includeRelatedData,
        });
        const { recipeId, includeRelatedData = false } = params;

        const recipe = await prisma.recipe.findUnique({
            where: {
                id: recipeId,
            },
            include: {
                user: true,
            },
        });

        if (!recipe) {
            logger.info('getRecipeById - recipe not found', { recipeId });
            return null;
        }

        const baseRecipe: RecipeData = {
            ...recipe,
            createdAt: recipe.createdAt.toISOString(),
            user: {
                ...recipe.user,
                createdAt: recipe.user.createdAt.toISOString(),
                updatedAt: recipe.user.updatedAt.toISOString(),
                emailVerified: recipe.user.emailVerified?.toString() || null,
            } as SafeUser,
        };

        // If includeRelatedData is false, return just the recipe
        if (!includeRelatedData) {
            logger.info('getRecipeById - success', { recipeId });
            return baseRecipe;
        }

        // Fetch related data in parallel
        const coCooksIds = recipe.coCooksIds || [];
        const linkedRecipeIds = recipe.linkedRecipeIds || [];

        const [coCooks, linkedRecipes] = await Promise.all([
            coCooksIds.length > 0
                ? prisma.user.findMany({
                      where: {
                          id: {
                              in: coCooksIds,
                          },
                      },
                      select: {
                          id: true,
                          name: true,
                          image: true,
                          level: true,
                          verified: true,
                      },
                  })
                : Promise.resolve([]),
            linkedRecipeIds.length > 0
                ? prisma.recipe
                      .findMany({
                          where: {
                              id: {
                                  in: linkedRecipeIds,
                              },
                          },
                          include: {
                              user: true,
                          },
                      })
                      .then((recipes) =>
                          recipes.map((r) => ({
                              ...r,
                              createdAt: r.createdAt.toISOString(),
                              user: {
                                  ...r.user,
                                  createdAt: r.user.createdAt.toISOString(),
                                  updatedAt: r.user.updatedAt.toISOString(),
                                  emailVerified:
                                      r.user.emailVerified?.toISOString() ||
                                      null,
                              } as SafeUser,
                          }))
                      )
                : Promise.resolve([]),
        ]);

        logger.info('getRecipeById - success with related data', {
            recipeId,
            coCooksCount: coCooks.length,
            linkedRecipesCount: linkedRecipes.length,
        });

        return {
            ...baseRecipe,
            coCooks,
            linkedRecipes,
        };
    } catch (error: any) {
        logger.error('getRecipeById - error', {
            error: error.message,
            recipeId: params.recipeId,
        });
        throw new Error(error);
    }
}

export default getRecipeById;
