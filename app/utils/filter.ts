import type { Prisma } from '@prisma/client';
import {
    DIETARY_TAGS,
    RECIPE_ALLERGENS,
    RECIPE_CUISINES,
    RECIPE_DIFFICULTIES,
} from '@/app/utils/constants';

export enum OrderByType {
    NEWEST = 'newest',
    OLDEST = 'oldest',
    TITLE_ASC = 'title_asc',
    TITLE_DESC = 'title_desc',
    MOST_LIKED = 'most_liked',
    BEST_RATED = 'best_rated',
    HIGHEST_PROTEIN = 'highest_protein',
    LOWEST_CALORIES = 'lowest_calories',
}

export const ORDER_BY_OPTIONS = [
    OrderByType.NEWEST,
    OrderByType.OLDEST,
    OrderByType.TITLE_ASC,
    OrderByType.TITLE_DESC,
    OrderByType.MOST_LIKED,
    OrderByType.BEST_RATED,
    OrderByType.HIGHEST_PROTEIN,
    OrderByType.LOWEST_CALORIES,
] as const;

export const ORDER_BY_LABELS = {
    [OrderByType.NEWEST]: 'newest_first',
    [OrderByType.OLDEST]: 'oldest_first',
    [OrderByType.TITLE_ASC]: 'title_a_z',
    [OrderByType.TITLE_DESC]: 'title_z_a',
    [OrderByType.MOST_LIKED]: 'most_liked',
    [OrderByType.BEST_RATED]: 'best_rated',
    [OrderByType.HIGHEST_PROTEIN]: 'highest_protein',
    [OrderByType.LOWEST_CALORIES]: 'lowest_calories',
} as const;

export const ORDER_BY_FALLBACK_LABELS = {
    [OrderByType.NEWEST]: 'Newest first',
    [OrderByType.OLDEST]: 'Oldest first',
    [OrderByType.TITLE_ASC]: 'Title A-Z',
    [OrderByType.TITLE_DESC]: 'Title Z-A',
    [OrderByType.MOST_LIKED]: 'Most liked',
    [OrderByType.BEST_RATED]: 'Best rated',
    [OrderByType.HIGHEST_PROTEIN]: 'Highest protein',
    [OrderByType.LOWEST_CALORIES]: 'Lowest calories',
} as const;

export const ADVANCED_FILTER_QUERY_PARAMS = [
    'startDate',
    'endDate',
    'minCalories',
    'maxCalories',
    'minYield',
    'maxYield',
    'recipeCuisine',
    'difficulty',
    'dietaryTags',
    'excludeAllergens',
    'minProtein',
    'maxCarbohydrates',
    'maxFat',
] as const;

export interface IRecipeFilterParams {
    category?: string;
    search?: string;
    orderBy?: OrderByType;
    startDate?: string;
    endDate?: string;
    minCalories?: number | string;
    maxCalories?: number | string;
    minYield?: number | string;
    maxYield?: number | string;
    recipeCuisine?: string;
    difficulty?: string;
    dietaryTags?: string | string[];
    excludeAllergens?: string | string[];
    minProtein?: number | string;
    maxProtein?: number | string;
    minCarbohydrates?: number | string;
    maxCarbohydrates?: number | string;
    minFat?: number | string;
    maxFat?: number | string;
}

export const getPrismaOrderByClause = (
    orderBy: OrderByType
): Prisma.RecipeOrderByWithRelationInput[] => {
    switch (orderBy) {
        case OrderByType.OLDEST:
            return [{ createdAt: 'asc' }, { id: 'asc' }];
        case OrderByType.TITLE_ASC:
            return [{ title: 'asc' }, { id: 'asc' }];
        case OrderByType.TITLE_DESC:
            return [{ title: 'desc' }, { id: 'asc' }];
        case OrderByType.MOST_LIKED:
            return [{ numLikes: 'desc' }, { id: 'asc' }];
        case OrderByType.BEST_RATED:
            return [
                { averageRating: 'desc' },
                { ratingCount: 'desc' },
                { id: 'asc' },
            ];
        case OrderByType.HIGHEST_PROTEIN:
            return [{ protein: 'desc' }, { id: 'asc' }];
        case OrderByType.LOWEST_CALORIES:
            return [{ calories: 'asc' }, { id: 'asc' }];
        case OrderByType.NEWEST:
        default:
            return [{ createdAt: 'desc' }, { id: 'asc' }];
    }
};

export const applyOrderByWhereFilters = (
    where: Prisma.RecipeWhereInput,
    orderBy?: OrderByType
): Prisma.RecipeWhereInput => {
    if (orderBy === OrderByType.LOWEST_CALORIES && !where.calories) {
        return {
            ...where,
            calories: {
                not: null,
                isSet: true,
            },
        };
    }

    return where;
};

export interface DateRangeFilter {
    startDate?: string;
    endDate?: string;
}

export interface PrismaDateFilter {
    createdAt?: {
        gte?: Date;
        lte?: Date;
    };
}

export const getDateRangeFilter = (
    startDate?: string,
    endDate?: string
): PrismaDateFilter => {
    const filter: PrismaDateFilter = {};

    if (startDate || endDate) {
        filter.createdAt = {};

        if (startDate) {
            filter.createdAt.gte = new Date(startDate);
        }

        if (endDate) {
            // Set end date to end of day
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            filter.createdAt.lte = endDateTime;
        }
    }

    return filter;
};

export const parseListParam = (value?: string | string[]): string[] => {
    if (!value) {
        return [];
    }

    const rawItems = Array.isArray(value) ? value : [value];
    const seen = new Set<string>();
    const result: string[] = [];

    for (const item of rawItems) {
        if (typeof item !== 'string') continue;
        for (const part of item.split(',')) {
            const normalized = part.trim().toLowerCase();
            if (normalized && !seen.has(normalized)) {
                seen.add(normalized);
                result.push(normalized);
            }
        }
    }

    return result;
};

const parseNonNegativeInt = (value?: number | string): number | undefined => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    const parsed = parseInt(value.toString(), 10);
    if (Number.isNaN(parsed) || parsed < 0) {
        return undefined;
    }

    return parsed;
};

type NumericRecipeField =
    | 'calories'
    | 'recipeYield'
    | 'protein'
    | 'carbohydrates'
    | 'fat';

const applyIntRangeFilter = (
    where: Prisma.RecipeWhereInput,
    field: NumericRecipeField,
    minVal?: number | string,
    maxVal?: number | string
): void => {
    const min = parseNonNegativeInt(minVal);
    const max = parseNonNegativeInt(maxVal);

    if (min === undefined && max === undefined) {
        return;
    }

    const currentFilter = (
        where[field] && typeof where[field] === 'object' ? where[field] : {}
    ) as Prisma.IntNullableFilter;

    where[field] = {
        ...currentFilter,
        ...(min !== undefined ? { gte: min } : {}),
        ...(max !== undefined ? { lte: max } : {}),
    };
};

const ALLOWED_DIETARY_TAGS = new Set<string>(DIETARY_TAGS);
const ALLOWED_ALLERGENS = new Set<string>(RECIPE_ALLERGENS);

export const buildRecipeWhereClause = (
    params: IRecipeFilterParams,
    baseWhere: Prisma.RecipeWhereInput = {}
): Prisma.RecipeWhereInput => {
    const {
        category,
        search,
        orderBy,
        startDate,
        endDate,
        minCalories,
        maxCalories,
        minYield,
        maxYield,
        recipeCuisine,
        difficulty,
        dietaryTags,
        excludeAllergens,
        minProtein,
        maxProtein,
        minCarbohydrates,
        maxCarbohydrates,
        minFat,
        maxFat,
    } = params;

    let query: Prisma.RecipeWhereInput = { ...baseWhere };

    if (typeof category === 'string' && category.length > 0) {
        query.categories = {
            has: category,
        };
    }

    if (typeof search === 'string' && search.trim()) {
        query.title = {
            contains: search.trim(),
            mode: 'insensitive',
        };
    }

    const dateRangeFilter = getDateRangeFilter(startDate, endDate);
    if (Object.keys(dateRangeFilter).length > 0) {
        query = { ...query, ...dateRangeFilter };
    }

    applyIntRangeFilter(query, 'calories', minCalories, maxCalories);
    applyIntRangeFilter(query, 'recipeYield', minYield, maxYield);
    applyIntRangeFilter(query, 'protein', minProtein, maxProtein);
    applyIntRangeFilter(
        query,
        'carbohydrates',
        minCarbohydrates,
        maxCarbohydrates
    );
    applyIntRangeFilter(query, 'fat', minFat, maxFat);

    if (typeof recipeCuisine === 'string' && recipeCuisine.trim()) {
        const normalizedCuisine = recipeCuisine.trim();
        const matchedCuisine = RECIPE_CUISINES.find(
            (c) => c.toLowerCase() === normalizedCuisine.toLowerCase()
        );
        if (matchedCuisine) {
            query.recipeCuisine = {
                equals: matchedCuisine,
                mode: 'insensitive',
            };
        } else {
            query.recipeCuisine = {
                equals: 'NON_EXISTENT_CUISINE_VAL',
            };
        }
    }

    if (typeof difficulty === 'string' && difficulty.trim()) {
        const normalizedDifficulty = difficulty.trim();
        const matchedDifficulty = RECIPE_DIFFICULTIES.find(
            (d) => d.toLowerCase() === normalizedDifficulty.toLowerCase()
        );
        if (matchedDifficulty) {
            query.difficulty = {
                equals: matchedDifficulty,
                mode: 'insensitive',
            };
        } else {
            query.difficulty = {
                equals: 'NON_EXISTENT_DIFFICULTY_VAL',
            };
        }
    }

    const parsedTags = parseListParam(dietaryTags);
    if (parsedTags.length > 0) {
        const allValid = parsedTags.every((tag) =>
            ALLOWED_DIETARY_TAGS.has(tag)
        );
        query.dietaryTags = {
            hasEvery: allValid ? parsedTags : ['NON_EXISTENT_DIETARY_TAG'],
        };
    }

    const parsedAllergens = parseListParam(excludeAllergens);
    if (parsedAllergens.length > 0) {
        const validAllergens = parsedAllergens.filter((allergen) =>
            ALLOWED_ALLERGENS.has(allergen)
        );
        if (validAllergens.length > 0) {
            query.NOT = {
                allergens: {
                    hasSome: validAllergens,
                },
            };
        }
    }

    return applyOrderByWhereFilters(query, orderBy);
};

export const hasActiveRecipeFilterParams = (
    params: IRecipeFilterParams
): boolean => {
    return Boolean(
        params.category ||
        params.search ||
        params.startDate ||
        params.endDate ||
        params.minCalories ||
        params.maxCalories ||
        params.minYield ||
        params.maxYield ||
        params.recipeCuisine ||
        params.difficulty ||
        parseListParam(params.dietaryTags).length > 0 ||
        parseListParam(params.excludeAllergens).length > 0 ||
        params.minProtein ||
        params.maxProtein ||
        params.minCarbohydrates ||
        params.maxCarbohydrates ||
        params.minFat ||
        params.maxFat
    );
};

export enum ChefOrderByType {
    TRENDING = 'trending',
    NEWEST = 'newest',
    OLDEST = 'oldest',
    NAME_ASC = 'name_asc',
    NAME_DESC = 'name_desc',
    MOST_RECIPES = 'most_recipes',
    MOST_LIKED = 'most_liked',
    HIGHEST_LEVEL = 'highest_level',
}
