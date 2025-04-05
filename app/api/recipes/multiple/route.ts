import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function GET(request: Request) {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return NextResponse.error();
    }

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
        return NextResponse.error();
    }
}
