import { NextRequest, NextResponse } from 'next/server';
import { getBlogById } from '@/app/utils/blog-utils';
import { notFound, internalServerError } from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    id: string;
}

export async function GET(
    request: NextRequest,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const { id } = params;
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get('lang') || 'en';

        logger.info('GET /api/blogs/[id] - start', { id, lang });
        const validLanguages = ['en', 'es', 'ca'];
        const language = validLanguages.includes(lang) ? lang : 'en';
        const blog = await getBlogById(id, language);
        if (!blog) {
            logger.info('GET /api/blogs/[id] - blog not found', {
                id,
            });
            return notFound('Blog not found');
        }
        logger.info('GET /api/blogs/[id] - success', { id, language });
        return NextResponse.json(blog);
    } catch (error: any) {
        logger.error('GET /api/blogs/[id] - error', {
            error: error.message,
        });
        return internalServerError('Failed to fetch blog');
    }
}
