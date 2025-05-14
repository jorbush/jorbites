import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug } from '@/app/utils/event-utils';

interface IParams {
    slug: string;
}

export async function GET(
    request: NextRequest,
    props: { params: Promise<IParams> }
) {
    // Properly destructure from context to ensure params are awaited
    const params = await props.params;
    const { slug } = params;

    // Get the language from query parameter, default to 'en'
    const searchParams = request.nextUrl.searchParams;
    const lang = searchParams.get('lang') || 'en';

    // Validate language
    const validLanguages = ['en', 'es', 'ca'];
    const language = validLanguages.includes(lang) ? lang : 'en';

    // Get the event
    const event = await getEventBySlug(slug, language);

    if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
}
