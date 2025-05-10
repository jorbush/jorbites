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
                image: '/jorbites-social.jpg',
            },
            content: 'Error loading event content.',
        };
    }
}

// Get all events from markdown files for a specific language
function getEvents(language: string = 'en'): Event[] {
    const eventsDirectory = path.join(
        process.cwd(),
        'app/content/events',
        language
    );

    // Check if directory exists
    if (!fs.existsSync(eventsDirectory)) {
        return [];
    }

    try {
        const filenames = fs.readdirSync(eventsDirectory);
        const markdownFiles = filenames.filter((file) => file.endsWith('.md'));

        const events = markdownFiles.map((filename) => {
            const filePath = path.join(eventsDirectory, filename);
            const { frontmatter, content } = readMarkdownFile(filePath);

            return {
                slug: filename.replace('.md', ''),
                frontmatter,
                content,
                language,
            };
        });

        return events;
    } catch (error) {
        console.error(
            `Error reading events directory: ${eventsDirectory}`,
            error
        );
        return [];
    }
}

export async function GET(request: NextRequest) {
    // Get the language from query parameter, default to 'en'
    const searchParams = request.nextUrl.searchParams;
    const lang = searchParams.get('lang') || 'en';

    // Validate language
    const validLanguages = ['en', 'es', 'ca'];
    const language = validLanguages.includes(lang) ? lang : 'en';

    // Get events for the requested language
    const events = getEvents(language);

    return NextResponse.json(events);
}
