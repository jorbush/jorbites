import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
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
        return internalServerError('Failed to fetch users');
    }
}
