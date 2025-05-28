import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug } from '@/app/utils/event-utils';
import { notFound, internalServerError } from '@/app/utils/apiErrors';

interface IParams {
    slug: string;
}

export async function GET(
    request: NextRequest,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const { slug } = params;
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get('lang') || 'en';
        const validLanguages = ['en', 'es', 'ca'];
        const language = validLanguages.includes(lang) ? lang : 'en';
        const event = await getEventBySlug(slug, language);
        if (!event) {
            return notFound('Event not found');
        }
        return NextResponse.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        return internalServerError('Failed to fetch event');
    }
}
