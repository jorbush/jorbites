import { NextResponse } from 'next/server';
import getBiteCards from '@/app/actions/getBiteCards';
import { internalServerError } from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const limitParam = url.searchParams.get('limit');
        const excludeParam = url.searchParams.get('excludeIds');
        const limit = limitParam
            ? Math.min(Math.max(parseInt(limitParam, 10) || 20, 1), 50)
            : 20;

        const excludeIds = excludeParam
            ? excludeParam
                  .split(',')
                  .map((id) => id.trim())
                  .filter(Boolean)
            : [];

        const recipes = await getBiteCards({ limit, excludeIds });
        return NextResponse.json(recipes);
    } catch (error: any) {
        logger.error('GET /api/recipes/bite-cards - error', {
            error: error?.message || error,
        });
        return internalServerError('Failed to fetch bite cards');
    }
}
