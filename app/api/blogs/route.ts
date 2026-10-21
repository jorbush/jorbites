import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedBlogs, getBlogsByAuthor } from '@/app/utils/blog-utils';
import { internalServerError } from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { ALLOWED_LANGUAGES } from '@/app/utils/constants';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get('lang') || 'en';
        let page = parseInt(searchParams.get('page') || '1');
        let pageSize = parseInt(searchParams.get('pageSize') || '10');
        const category =
            (searchParams.get('category') as 'general' | 'releases') ||
            'general';
        const authorId =
            searchParams.get('authorId') ||
            searchParams.get('userId') ||
            undefined;
        const authorName =
            searchParams.get('authorName') ||
            searchParams.get('author') ||
            undefined;

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(pageSize) || pageSize < 1) pageSize = 10;

        logger.info('GET /api/blogs - start', {
            lang,
            page,
            pageSize,
            category,
            authorId,
            authorName,
        });
        const language = (ALLOWED_LANGUAGES as readonly string[]).includes(lang)
            ? lang
            : 'en';

        if (authorId || authorName) {
            const authorBlogs = await getBlogsByAuthor(
                authorId || '',
                authorName || null,
                language
            );
            const total = authorBlogs.length;
            const totalPages = Math.ceil(total / pageSize) || 1;
            const startIndex = (page - 1) * pageSize;
            const paginatedAuthorBlogs = authorBlogs.slice(
                startIndex,
                startIndex + pageSize
            );

            logger.info('GET /api/blogs - author blogs success', {
                language,
                authorId,
                authorName,
                total,
                page,
            });

            return NextResponse.json({
                blogs: paginatedAuthorBlogs,
                total,
                totalPages,
                currentPage: page,
            });
        }

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
