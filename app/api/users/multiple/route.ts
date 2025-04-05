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

        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
            select: {
                id: true,
                name: true,
                image: true,
                level: true,
                verified: true,
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.error();
    }
}
