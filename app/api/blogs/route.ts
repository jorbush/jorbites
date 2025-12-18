import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedBlogs } from '@/app/utils/blog-utils';
import { internalServerError } from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get('lang') || 'en';
        let page = parseInt(searchParams.get('page') || '1');
        let pageSize = parseInt(searchParams.get('pageSize') || '10');
        const category =
            (searchParams.get('category') as 'general' | 'releases') ||
            'general';

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(pageSize) || pageSize < 1) pageSize = 10;

        logger.info('GET /api/blogs - start', {
            lang,
            page,
            pageSize,
            category,
        });
        const validLanguages = ['en', 'es', 'ca'];
        const language = validLanguages.includes(lang) ? lang : 'en';
        const result = await getPaginatedBlogs(
            language,
            page,
            pageSize,
            category
        );
        logger.info('GET /api/blogs - success', {
            language,
            category,
            total: result.total,
            page: result.currentPage,
        });
        return NextResponse.json(result);
    } catch (error: any) {
        logger.error('GET /api/blogs - error', { error: error.message });
        return internalServerError('Failed to fetch blogs');
    }
}
