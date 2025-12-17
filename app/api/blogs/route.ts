import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedBlogs } from '@/app/utils/blog-utils';
import { internalServerError } from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get('lang') || 'en';
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');

        logger.info('GET /api/blogs - start', { lang, page, pageSize });
        const validLanguages = ['en', 'es', 'ca'];
        const language = validLanguages.includes(lang) ? lang : 'en';
        const result = await getPaginatedBlogs(language, page, pageSize);
        logger.info('GET /api/blogs - success', {
            language,
            total: result.total,
            page: result.currentPage,
        });
        return NextResponse.json(result);
    } catch (error: any) {
        logger.error('GET /api/blogs - error', { error: error.message });
        return internalServerError('Failed to fetch blogs');
    }
}
