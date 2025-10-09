import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import { internalServerError } from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const idsParam = url.searchParams.get('ids');

        logger.info('GET /api/recipes/multiple - start', {
            idsCount: idsParam?.split(',').length || 0,
        });

        if (!idsParam) {
            return NextResponse.json([]);
        }

        const ids = idsParam.split(',');

        if (ids.length === 0) {
            return NextResponse.json([]);
        }

        const recipes = await prisma.recipe.findMany({
            where: {
                id: {
                    in: ids,
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
        });

        logger.info('GET /api/recipes/multiple - success', {
            count: recipes.length,
        });
        return NextResponse.json(recipes);
    } catch (error: any) {
        logger.error('GET /api/recipes/multiple - error', {
            error: error.message,
        });
        return internalServerError('Failed to fetch recipes');
    }
}
