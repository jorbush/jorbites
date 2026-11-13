export interface EventFrontmatter {
    title: string;
    description: string;
    date: string;
    endDate: string;
    image: string; // Mandatory image URL for the event
    badge?: string; // Optional badge image URL
    permanent?: boolean; // Flag for permanent events
    recurrent?: boolean; // Flag for recurrent events (e.g., 29 of gnocchis)
    dayOfMonth?: number; // Day of month for recurrent events (1-31)
}

export interface Event {
    slug: string;
    frontmatter: EventFrontmatter;
    content: string;
    language: string;
    titles?: Record<string, string>;
    descriptions?: Record<string, string>;
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
    category?: 'general' | 'releases';
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
 * Get the effective date for an event.
 * For recurrent events, returns the next occurrence date (today if it matches dayOfMonth,
 * this month if dayOfMonth is still ahead, or next month if dayOfMonth has passed).
 */
export function getEffectiveEventDate(
    event: Event,
    now: Date = new Date()
): Date {
    if (
        event.frontmatter.recurrent === true &&
        typeof event.frontmatter.dayOfMonth === 'number' &&
        event.frontmatter.dayOfMonth >= 1 &&
        event.frontmatter.dayOfMonth <= 31
    ) {
        const year = now.getFullYear();
        const month = now.getMonth();
        const currentDay = now.getDate();
        const targetDay = event.frontmatter.dayOfMonth;

        if (currentDay <= targetDay) {
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            return new Date(year, month, Math.min(targetDay, daysInMonth));
        }

        const daysInNextMonth = new Date(year, month + 2, 0).getDate();
        return new Date(year, month + 1, Math.min(targetDay, daysInNextMonth));
    }

    return new Date(event.frontmatter.date);
}

/**
 * Sort events by date (newest first by default, or earliest first when ascending=true)
 */
export function sortEventsByDate(
    events: Event[],
    ascending: boolean = false
): Event[] {
    const now = new Date();
    return events.toSorted((a, b) => {
        const dateA = getEffectiveEventDate(a, now).getTime();
        const dateB = getEffectiveEventDate(b, now).getTime();

        return ascending ? dateA - dateB : dateB - dateA;
    });
}
