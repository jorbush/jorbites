import matter from 'gray-matter';

export interface EventFrontmatter {
    title: string;
    description: string;
    date: string;
    endDate: string;
    image: string; // Mandatory image URL for the event
    permanent?: boolean; // Flag for permanent events
    recurrent?: boolean; // Flag for recurrent events (e.g., 29 of gnocchis)
    dayOfMonth?: number; // Day of month for recurrent events (1-31)
}

export interface Event {
    slug: string;
    frontmatter: EventFrontmatter;
    content: string;
    language: string;
}

export interface BlogFrontmatter {
    title: string;
    user_id: string;
    date: string;
    description: string;
}

export interface Blog {
    id: string; // slug without extension
    slug: string;
    frontmatter: BlogFrontmatter;
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
 * Categorize events by date: current, upcoming, past, and permanent
 */
export function categorizeEvents(events: Event[]): {
    current: Event[];
    upcoming: Event[];
    past: Event[];
    permanent: Event[];
} {
    const now = new Date();
    const currentDayOfMonth = now.getDate();

    return events.reduce(
        (acc, event) => {
            // Handle permanent events separately
            if (event.frontmatter.permanent === true) {
                acc.permanent.push(event);
                return acc;
            }

            // Handle recurrent events (e.g., 29 of gnocchis)
            if (
                event.frontmatter.recurrent === true &&
                typeof event.frontmatter.dayOfMonth === 'number' &&
                event.frontmatter.dayOfMonth >= 1 &&
                event.frontmatter.dayOfMonth <= 31
            ) {
                const eventDayOfMonth = event.frontmatter.dayOfMonth;
                if (currentDayOfMonth === eventDayOfMonth) {
                    // Recurrent event is current today
                    acc.current.push(event);
                } else {
                    // Recurrent event is upcoming (either this month or next)
                    acc.upcoming.push(event);
                }
                return acc;
            }

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
        {
            current: [] as Event[],
            upcoming: [] as Event[],
            past: [] as Event[],
            permanent: [] as Event[],
        }
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
