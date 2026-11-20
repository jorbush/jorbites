import { NextResponse } from 'next/server';
import getChefs, { ChefOrderByType } from '@/app/actions/getChefs';
import { logger } from '@/app/lib/axiom/server';
import { internalServerError } from '@/app/utils/apiErrors';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || undefined;
        const rawPage = parseInt(searchParams.get('page') || '1', 10);
        const rawLimit = parseInt(searchParams.get('limit') || '12', 10);
        const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
        const limit =
            Number.isFinite(rawLimit) && rawLimit >= 1
                ? Math.min(rawLimit, 50)
                : 12;
        const orderByParam = searchParams.get('orderBy');

        const validOrderByValues = Object.values(ChefOrderByType);
        const orderBy: ChefOrderByType | undefined =
            orderByParam &&
            validOrderByValues.includes(orderByParam as ChefOrderByType)
                ? (orderByParam as ChefOrderByType)
                : undefined;

        const response = await getChefs({
            search,
            page,
            limit,
            orderBy,
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
