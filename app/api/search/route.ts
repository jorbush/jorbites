import { NextResponse, after } from 'next/server';
import { emitServerAnalyticsEvent } from '@/app/lib/analytics/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorizedResponse,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { authenticatedRatelimit } from '@/app/lib/ratelimit';
import {
    buildRecipeWhereClause,
    getPrismaOrderByClause,
    ORDER_BY_OPTIONS,
    OrderByType,
    parseListParam,
} from '@/app/utils/filter';

const hasNumericParam = (value?: string): boolean =>
    Boolean(value && /^\d+$/.test(value.trim()));

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const query = url.searchParams.get('q') || '';
        const trimmedQuery = query.trim();
        const type = url.searchParams.get('type') || 'all';
        const difficulty = url.searchParams.get('difficulty') || undefined;
        const dietaryTags = url.searchParams.get('dietaryTags') || undefined;
        const excludeAllergens =
            url.searchParams.get('excludeAllergens') || undefined;
        const maxCalories = url.searchParams.get('maxCalories') || undefined;
        const minProtein = url.searchParams.get('minProtein') || undefined;
        const maxCarbohydrates =
            url.searchParams.get('maxCarbohydrates') || undefined;
        const maxFat = url.searchParams.get('maxFat') || undefined;
        const rawOrderBy = url.searchParams.get('orderBy') || undefined;
        const validatedOrderBy =
            rawOrderBy &&
            (ORDER_BY_OPTIONS as readonly string[]).includes(rawOrderBy)
                ? (rawOrderBy as OrderByType)
                : undefined;

        const hasValidQuery = trimmedQuery.length >= 2;
        const hasRecipeFilters = Boolean(
            difficulty?.trim() ||
            parseListParam(dietaryTags).length > 0 ||
            parseListParam(excludeAllergens).length > 0 ||
            hasNumericParam(maxCalories) ||
            hasNumericParam(minProtein) ||
            hasNumericParam(maxCarbohydrates) ||
            hasNumericParam(maxFat)
        );

        if (!hasValidQuery && !(type === 'recipes' && hasRecipeFilters)) {
            return NextResponse.json({ users: [], recipes: [] });
        }

        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to search'
            );
        }

        if (process.env.ENV === 'production') {
            const { success, reset } = await authenticatedRatelimit.limit(
                currentUser.id
            );
            if (!success) {
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                logger.warn('GET /api/search - rate limit exceeded', {
                    userId: currentUser.id,
                });
                return rateLimitExceeded(
                    `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
                    retryAfterSeconds
                );
            }
        }

        logger.info('GET /api/search - start', {
            query: trimmedQuery,
            type,
            hasRecipeFilters,
            userId: currentUser.id,
        });

        type SearchedUser = {
            id: string;
            name: string | null;
            image: string | null;
            verified: boolean;
            level: number;
        };

        type SearchedRecipe = {
            id: string;
            title: string;
            imageSrc: string | null;
            userId: string;
            calories?: number | null;
            protein?: number | null;
            carbohydrates?: number | null;
            fat?: number | null;
            fiber?: number | null;
            difficulty?: string | null;
            dietaryTags?: string[];
            allergens?: string[];
            categories?: string[];
            ingredients?: string[];
            user: {
                name: string | null;
                image: string | null;
            };
        };

        let users: SearchedUser[] = [];
        let recipes: SearchedRecipe[] = [];

        if ((type === 'all' || type === 'users') && hasValidQuery) {
            users = await prisma.user.findMany({
                where: {
                    name: {
                        contains: trimmedQuery,
                        mode: 'insensitive',
                    },
                    NOT: {
                        id: currentUser.id, // Exclude current user from results
                    },
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    verified: true,
                    level: true,
                },
                take: 5,
            });
        }

        if (type === 'all' || type === 'recipes') {
            const recipeWhere = buildRecipeWhereClause({
                search: hasValidQuery ? trimmedQuery : undefined,
                difficulty,
                dietaryTags,
                excludeAllergens,
                maxCalories,
                minProtein,
                maxCarbohydrates,
                maxFat,
                orderBy: validatedOrderBy,
            });

            const recipeOrderBy = validatedOrderBy
                ? getPrismaOrderByClause(validatedOrderBy)
                : hasRecipeFilters
                  ? { createdAt: 'desc' as const }
                  : undefined;

            recipes = await prisma.recipe.findMany({
                where: recipeWhere,
                select: {
                    id: true,
                    title: true,
                    imageSrc: true,
                    userId: true,
                    calories: true,
                    protein: true,
                    carbohydrates: true,
                    fat: true,
                    fiber: true,
                    difficulty: true,
                    dietaryTags: true,
                    allergens: true,
                    categories: true,
                    ingredients: true,
                    user: {
                        select: {
                            name: true,
                            image: true,
                        },
                    },
                },
                ...(recipeOrderBy ? { orderBy: recipeOrderBy } : {}),
                take: hasRecipeFilters ? 12 : 5,
            });
        }

        logger.info('GET /api/search - success', {
            query: trimmedQuery,
            type,
            userCount: users.length,
            recipeCount: recipes.length,
        });
        after(async () => {
            await emitServerAnalyticsEvent({
                category: 'discovery',
                name: 'search_executed',
                path: '/search',
                locale: currentUser.language || undefined,
                props: {
                    mode: type,
                    zero_results: users.length === 0 && recipes.length === 0,
                },
            });
        });

        return NextResponse.json({
            users,
            recipes,
        });
    } catch (error: any) {
        logger.error('GET /api/search - error', { error: error.message });
        return internalServerError('Failed to perform search');
    }
}
