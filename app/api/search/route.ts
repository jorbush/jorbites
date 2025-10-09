import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { unauthorized, internalServerError } from '@/app/utils/apiErrors';
import { logger, withAxiom } from '@/app/lib/axiom/server';

export const GET = withAxiom(async (request: Request) => {
    try {
        logger.info('GET /api/search - start');
        const url = new URL(request.url);
        const query = url.searchParams.get('q');
        const type = url.searchParams.get('type') || 'all';

        if (!query || query.length < 2) {
            return NextResponse.json({ users: [], recipes: [] });
        }

        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized('User authentication required to search');
        }

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
            user: {
                name: string | null;
                image: string | null;
            };
        };

        let users: SearchedUser[] = [];
        let recipes: SearchedRecipe[] = [];

        if (type === 'all' || type === 'users') {
            users = await prisma.user.findMany({
                where: {
                    name: {
                        contains: query,
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
            recipes = await prisma.recipe.findMany({
                where: {
                    title: {
                        contains: query,
                        mode: 'insensitive',
                    },
                },
                select: {
                    id: true,
                    title: true,
                    imageSrc: true,
                    userId: true,
                    user: {
                        select: {
                            name: true,
                            image: true,
                        },
                    },
                },
                take: 5,
            });
        }

        logger.info('GET /api/search - success', {
            query,
            type,
            userCount: users.length,
            recipeCount: recipes.length,
        });
        return NextResponse.json({
            users,
            recipes,
        });
    } catch (error: any) {
        logger.error('GET /api/search - error', { error: error.message });
        return internalServerError('Failed to perform search');
    }
});
