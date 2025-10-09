import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import { internalServerError } from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const idsParam = url.searchParams.get('ids');

        logger.info('GET /api/users/multiple - start', {
            idsCount: idsParam?.split(',').length || 0,
        });

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

        logger.info('GET /api/users/multiple - success', {
            count: users.length,
        });
        return NextResponse.json(users);
    } catch (error: any) {
        logger.error('GET /api/users/multiple - error', {
            error: error.message,
        });
        return internalServerError('Failed to fetch users');
    }
}
