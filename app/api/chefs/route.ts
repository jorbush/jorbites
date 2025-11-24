import { NextResponse } from 'next/server';
import getChefs from '@/app/actions/getChefs';
import { logger } from '@/app/lib/axiom/server';
import { internalServerError } from '@/app/utils/apiErrors';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || undefined;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const orderBy = searchParams.get('orderBy') || undefined;

        const response = await getChefs({
            search,
            page,
            limit,
            orderBy: orderBy as any,
        });

        if (response.error) {
            logger.error('GET /api/chefs - error', {
                error: response.error.message,
            });
            return internalServerError(response.error.message);
        }

        logger.info('GET /api/chefs - success', {
            count: response.data?.chefs.length,
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        logger.error('GET /api/chefs - error', { error: error.message });
        return internalServerError('Failed to fetch chefs');
    }
}
