import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Event, EventFrontmatter } from '@/app/utils/markdownUtils';

/**
 * Read a single markdown file and extract frontmatter and content
 */
export function readEventFile(filePath: string): {
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

/**
 * Get a specific event by slug and language
 */
export async function getEventBySlug(
    slug: string,
    language: string = 'en'
): Promise<Event | null> {
    const eventsDirectory = path.join(
        process.cwd(),
        'app/content/events',
        language
    );
    const filePath = path.join(eventsDirectory, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const { frontmatter, content } = readEventFile(filePath);

    return {
        slug,
        frontmatter,
        content,
        language,
    };
}

/**
 * Get all events for a specific language
 */
export async function getAllEvents(language: string = 'en'): Promise<Event[]> {
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
            const { frontmatter, content } = readEventFile(filePath);

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
