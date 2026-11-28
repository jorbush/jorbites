import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import {
    SafeListPreview,
    SafePlanningPreview,
    SafeQuestPreview,
    SafeUserPreview,
} from '@/app/types';

export interface GetProfileCollectionsParams {
    userId: string;
    includePrivate?: boolean;
    includeLists?: boolean;
    includeQuests?: boolean;
    includePlannings?: boolean;
}

export interface ProfileCollectionsResult {
    lists: SafeListPreview[];
    quests: SafeQuestPreview[];
    plannings: SafePlanningPreview[];
}

const USER_PREVIEW_SELECT = {
    id: true,
    name: true,
    image: true,
} as const;

const RECIPE_PREVIEW_SELECT = {
    id: true,
    title: true,
    imageSrc: true,
} as const;

const toIsoString = (value: unknown): string => {
    if (value && typeof (value as Date).toISOString === 'function') {
        return (value as Date).toISOString();
    }
    return String(value ?? '');
};

const mapToUserPreview = (user: any): SafeUserPreview | undefined => {
    if (!user) return undefined;
    return {
        id: user.id,
        name: user.name ?? null,
        image: user.image ?? null,
    };
};

const mapToSafeList = (list: any): SafeListPreview => ({
    id: list.id,
    name: list.name,
    isPrivate: list.isPrivate,
    isDefault: list.isDefault,
    userId: list.userId,
    recipeIds: Array.isArray(list.recipeIds) ? list.recipeIds : [],
    createdAt: toIsoString(list.createdAt),
    updatedAt: toIsoString(list.updatedAt),
    user: mapToUserPreview(list.user),
    recipes: Array.isArray(list.recipes)
        ? list.recipes.map((recipe: any) => ({
              id: recipe.id,
              title: recipe.title,
              imageSrc: recipe.imageSrc,
          }))
        : [],
});

const mapToSafeQuest = (quest: any): SafeQuestPreview => ({
    id: quest.id,
    title: quest.title,
    description: quest.description,
    status: quest.status,
    userId: quest.userId,
    acceptedRecipeId: quest.acceptedRecipeId ?? null,
    acceptedSolverId: quest.acceptedSolverId ?? null,
    badgeEvaluated: Boolean(quest.badgeEvaluated),
    createdAt: toIsoString(quest.createdAt),
    updatedAt: toIsoString(quest.updatedAt),
    user: mapToUserPreview(quest.user),
    recipes: Array.isArray(quest.recipes)
        ? quest.recipes.map((recipe: any) => ({
              id: recipe.id,
              title: recipe.title,
              imageSrc: recipe.imageSrc,
          }))
        : [],
});

const mapToSafePlanning = (plan: any): SafePlanningPreview => ({
    id: plan.id,
    name: plan.name,
    description: plan.description ?? null,
    isPrivate: plan.isPrivate,
    targetCalories: plan.targetCalories ?? null,
    targetProtein: plan.targetProtein ?? null,
    targetCarbohydrates: plan.targetCarbohydrates ?? null,
    targetFat: plan.targetFat ?? null,
    userId: plan.userId,
    createdAt: toIsoString(plan.createdAt),
    updatedAt: toIsoString(plan.updatedAt),
    user: mapToUserPreview(plan.user),
    meals: Array.isArray(plan.meals)
        ? plan.meals.map((meal: any) => ({
              id: meal.id,
              planningId: meal.planningId,
              day: meal.day,
              mealType: meal.mealType,
              recipeId: meal.recipeId,
              recipe: meal.recipe
                  ? {
                        id: meal.recipe.id,
                        title: meal.recipe.title,
                        imageSrc: meal.recipe.imageSrc,
                    }
                  : undefined,
          }))
        : [],
});

export default async function getProfileCollections({
    userId,
    includePrivate = false,
    includeLists = true,
    includeQuests = true,
    includePlannings = true,
}: GetProfileCollectionsParams): Promise<ProfileCollectionsResult> {
    if (!userId) {
        return { lists: [], quests: [], plannings: [] };
    }

    try {
        const privacyFilter = includePrivate ? {} : { isPrivate: false };

        const [lists, quests, plannings] = await Promise.all([
            includeLists
                ? prisma.list.findMany({
                      where: {
                          userId,
                          ...privacyFilter,
                      },
                      select: {
                          id: true,
                          name: true,
                          isPrivate: true,
                          isDefault: true,
                          userId: true,
                          recipeIds: true,
                          createdAt: true,
                          updatedAt: true,
                          user: {
                              select: USER_PREVIEW_SELECT,
                          },
                          recipes: {
                              select: RECIPE_PREVIEW_SELECT,
                              take: 4,
                          },
                      },
                      orderBy: {
                          createdAt: 'desc',
                      },
                  })
                : Promise.resolve([]),
            includeQuests
                ? prisma.quest.findMany({
                      where: {
                          userId,
                      },
                      select: {
                          id: true,
                          title: true,
                          description: true,
                          status: true,
                          userId: true,
                          acceptedRecipeId: true,
                          acceptedSolverId: true,
                          badgeEvaluated: true,
                          createdAt: true,
                          updatedAt: true,
                          user: {
                              select: USER_PREVIEW_SELECT,
                          },
                          recipes: {
                              select: RECIPE_PREVIEW_SELECT,
                              orderBy: {
                                  createdAt: 'desc',
                              },
                          },
                      },
                      orderBy: {
                          createdAt: 'desc',
                      },
                  })
                : Promise.resolve([]),
            includePlannings
                ? prisma.planning.findMany({
                      where: {
                          userId,
                          ...privacyFilter,
                      },
                      select: {
                          id: true,
                          name: true,
                          description: true,
                          isPrivate: true,
                          userId: true,
                          createdAt: true,
                          updatedAt: true,
                          user: {
                              select: USER_PREVIEW_SELECT,
                          },
                          meals: {
                              select: {
                                  id: true,
                                  planningId: true,
                                  day: true,
                                  mealType: true,
                                  recipeId: true,
                                  recipe: {
                                      select: RECIPE_PREVIEW_SELECT,
                                  },
                              },
                          },
                      },
                      orderBy: {
                          createdAt: 'desc',
                      },
                  })
                : Promise.resolve([]),
        ]);

        return {
            lists: lists.map(mapToSafeList),
            quests: quests.map(mapToSafeQuest),
            plannings: plannings.map(mapToSafePlanning),
        };
    } catch (error: any) {
        logger.error('getProfileCollections - error', {
            error: error.message,
            userId,
        });
        return { lists: [], quests: [], plannings: [] };
    }
}
