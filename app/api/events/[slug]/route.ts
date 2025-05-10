import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Event, EventFrontmatter } from '@/app/utils/markdownUtils';

// Define the function to read a specific event file
function readMarkdownFile(filePath: string): {
    frontmatter: EventFrontmatter;
    content: string;
} {
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            frontmatter: data as EventFrontmatter,
            content,
        };
    } catch (error) {
        console.error(`Error reading markdown file: ${filePath}`, error);
        return {
            frontmatter: {
                title: 'Error',
                description: 'Error loading event',
                date: new Date().toISOString(),
                endDate: new Date().toISOString(),
                location: '',
            },
            content: 'Error loading event content.',
        };
    }
}

// Get a specific event by slug and language
function getEventBySlug(slug: string, language: string = 'en'): Event | null {
    const eventsDirectory = path.join(
        process.cwd(),
        'app/content/events',
        language
    );
    const filePath = path.join(eventsDirectory, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const { frontmatter, content } = readMarkdownFile(filePath);

    return {
        slug,
        frontmatter,
        content,
        language,
    };
}

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
    const event = getEventBySlug(slug, language);

    if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
}
