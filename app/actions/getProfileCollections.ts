import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import { USER_SELECT_FIELDS } from '@/app/utils/constants';
import { toSafeRecipe } from '@/app/utils/toSafeRecipe';
import { SafeList, SafePlanning, SafeQuest, SafeUser } from '@/app/types';

export interface GetProfileCollectionsParams {
    userId: string;
    includePrivate?: boolean;
    includeLists?: boolean;
    includeQuests?: boolean;
    includePlannings?: boolean;
}

export interface ProfileCollectionsResult {
    lists: SafeList[];
    quests: SafeQuest[];
    plannings: SafePlanning[];
}

const toIsoString = (value: unknown): string => {
    if (value && typeof (value as Date).toISOString === 'function') {
        return (value as Date).toISOString();
    }
    return String(value ?? '');
};

const mapToSafeUser = (user: any): SafeUser | undefined => {
    if (!user) return undefined;
    return {
        ...user,
        createdAt: toIsoString(user.createdAt),
        updatedAt: toIsoString(user.updatedAt),
        emailVerified: user.emailVerified
            ? toIsoString(user.emailVerified)
            : null,
    };
};

const mapToSafeList = (list: any): SafeList => ({
    ...list,
    createdAt: toIsoString(list.createdAt),
    updatedAt: toIsoString(list.updatedAt),
    user: mapToSafeUser(list.user),
    recipes: Array.isArray(list.recipes)
        ? list.recipes.map((recipe: any) => ({
              id: recipe.id,
              title: recipe.title,
              imageSrc: recipe.imageSrc,
          }))
        : [],
});

const mapToSafeQuest = (quest: any): SafeQuest => ({
    ...quest,
    createdAt: toIsoString(quest.createdAt),
    updatedAt: toIsoString(quest.updatedAt),
    user: mapToSafeUser(quest.user),
    recipes: Array.isArray(quest.recipes)
        ? quest.recipes.map((recipe: any) => ({
              ...toSafeRecipe(recipe),
              user: mapToSafeUser(recipe.user),
          }))
        : [],
});

const mapToSafePlanning = (plan: any): SafePlanning => ({
    ...plan,
    createdAt: toIsoString(plan.createdAt),
    updatedAt: toIsoString(plan.updatedAt),
    user: mapToSafeUser(plan.user),
    meals: Array.isArray(plan.meals)
        ? plan.meals.map((meal: any) => ({
              ...meal,
              recipe: meal.recipe
                  ? {
                        ...toSafeRecipe(meal.recipe),
                        user: mapToSafeUser(meal.recipe.user),
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
                      include: {
                          user: {
                              select: USER_SELECT_FIELDS,
                          },
                          recipes: {
                              select: {
                                  id: true,
                                  title: true,
                                  imageSrc: true,
                              },
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
                      include: {
                          user: {
                              select: USER_SELECT_FIELDS,
                          },
                          recipes: {
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
                      include: {
                          user: {
                              select: USER_SELECT_FIELDS,
                          },
                          meals: {
                              include: {
                                  recipe: {
                                      include: {
                                          user: {
                                              select: USER_SELECT_FIELDS,
                                          },
                                      },
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
