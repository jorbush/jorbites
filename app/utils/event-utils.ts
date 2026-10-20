import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Event, EventFrontmatter } from '@/app/utils/markdownUtils';
import { ALLOWED_LANGUAGES } from '@/app/utils/constants';

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
 * Helper to resolve the events directory across different working directories
 */
export function getEventsDirectory(language: string = 'en'): string {
    const cwd = process.cwd();
    const candidate1 = path.join(cwd, 'app/content/events', language);
    if (fs.existsSync(candidate1)) {
        return candidate1;
    }
    const candidate2 = path.join(cwd, 'jorbites/app/content/events', language);
    if (fs.existsSync(candidate2)) {
        return candidate2;
    }
    return candidate1;
}

/**
 * Extract localized titles and descriptions for an event slug across all allowed languages
 */
export function getEventTranslations(slug: string): {
    titles: Record<string, string>;
    descriptions: Record<string, string>;
} {
    const titles: Record<string, string> = {};
    const descriptions: Record<string, string> = {};

    for (const lang of ALLOWED_LANGUAGES) {
        const eventsDirectory = getEventsDirectory(lang);
        const langFilePath = path.join(eventsDirectory, `${slug}.md`);
        if (fs.existsSync(langFilePath)) {
            const { frontmatter } = readEventFile(langFilePath);
            if (frontmatter.title && frontmatter.title !== 'Error') {
                titles[lang] = frontmatter.title;
            }
            if (
                frontmatter.description &&
                frontmatter.description !== 'Error loading event'
            ) {
                descriptions[lang] = frontmatter.description;
            }
        }
    }

    return { titles, descriptions };
}

/**
 * Get a specific event by slug and language
 */
export async function getEventBySlug(
    slug: string,
    language: string = 'en',
    includeTranslations: boolean = false
): Promise<Event | null> {
    const eventsDirectory = getEventsDirectory(language);
    const filePath = path.join(eventsDirectory, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const { frontmatter, content } = readEventFile(filePath);

    const event: Event = {
        slug,
        frontmatter,
        content,
        language,
    };

    if (includeTranslations) {
        const { titles, descriptions } = getEventTranslations(slug);
        event.titles = titles;
        event.descriptions = descriptions;
    }

    return event;
}

/**
 * Get all events for a specific language
 */
export async function getAllEvents(
    language: string = 'en',
    includeTranslations: boolean = false
): Promise<Event[]> {
    const eventsDirectory = getEventsDirectory(language);

    // Check if directory exists
    if (!fs.existsSync(eventsDirectory)) {
        return [];
    }

    try {
        const filenames = fs.readdirSync(eventsDirectory);
        const markdownFiles = filenames.filter((file) => file.endsWith('.md'));

        const events = markdownFiles.map((filename) => {
            const slug = filename.replace('.md', '');
            const filePath = path.join(eventsDirectory, filename);
            const { frontmatter, content } = readEventFile(filePath);

            const event: Event = {
                slug,
                frontmatter,
                content,
                language,
            };

            if (includeTranslations) {
                const { titles, descriptions } = getEventTranslations(slug);
                event.titles = titles;
                event.descriptions = descriptions;
            }

            return event;
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
