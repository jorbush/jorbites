import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import { internalServerError } from '@/app/utils/apiErrors';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const idsParam = url.searchParams.get('ids');

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

        return NextResponse.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return internalServerError('Failed to fetch recipes');
    }
}
