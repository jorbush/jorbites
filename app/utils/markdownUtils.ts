import matter from 'gray-matter';

export interface EventFrontmatter {
    title: string;
    description: string;
    date: string;
    endDate: string;
    image: string; // Mandatory image URL for the event
}

export interface Event {
    slug: string;
    frontmatter: EventFrontmatter;
    content: string;
    language: string;
}

/**
 * Parse markdown content with frontmatter
 */
export function parseMarkdown(markdown: string): {
    frontmatter: EventFrontmatter;
    content: string;
} {
    try {
        const { data, content } = matter(markdown);

        return {
            frontmatter: data as EventFrontmatter,
            content,
        };
    } catch (error) {
        console.error(`Error parsing markdown content:`, error);
        return {
            frontmatter: {
                title: 'Error',
                description: 'Error loading event',
                date: new Date().toISOString(),
                endDate: new Date().toISOString(),
                image: '/images/events/default.jpg',
            },
            content: 'Error loading event content.',
        };
    }
}

/**
 * Categorize events by date: current, upcoming, and past
 */
export function categorizeEvents(events: Event[]): {
    current: Event[];
    upcoming: Event[];
    past: Event[];
} {
    const now = new Date();

    return events.reduce(
        (acc, event) => {
            const startDate = new Date(event.frontmatter.date);
            const endDate = new Date(event.frontmatter.endDate);

            // Current events: ongoing right now
            if (startDate <= now && endDate >= now) {
                acc.current.push(event);
            }
            // Upcoming events: starting in the future
            else if (startDate > now) {
                acc.upcoming.push(event);
            }
            // Past events: already ended
            else if (endDate < now) {
                acc.past.push(event);
            }

            return acc;
        },
        { current: [] as Event[], upcoming: [] as Event[], past: [] as Event[] }
    );
}

/**
 * Sort events by date (newest first)
 */
export function sortEventsByDate(
    events: Event[],
    ascending: boolean = false
): Event[] {
    return [...events].sort((a, b) => {
        const dateA = new Date(a.frontmatter.date).getTime();
        const dateB = new Date(b.frontmatter.date).getTime();

        return ascending ? dateA - dateB : dateB - dateA;
    });
}
