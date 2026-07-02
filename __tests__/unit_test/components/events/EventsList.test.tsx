import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import EventsList from '@/app/components/events/EventsList';
import { Event } from '@/app/utils/markdownUtils';

// Mock dependencies
vi.mock('@/app/components/events/EventCard', () => ({
    default: ({ event, priority }: { event: Event; priority?: boolean }) => (
        <div
            data-testid="event-card"
            data-priority={priority ? 'true' : 'false'}
        >
            {event.frontmatter.title}
        </div>
    ),
}));

vi.mock('@/app/components/utils/HorizontalScrollSection', () => ({
    default: ({
        title,
        emptyMessage,
        hasItems,
        children,
    }: {
        title: string;
        emptyMessage: string;
        hasItems: boolean;
        children: React.ReactNode;
    }) => (
        <div data-testid="horizontal-scroll-section">
            <h2>{title}</h2>
            {!hasItems ? <p>{emptyMessage}</p> : <div>{children}</div>}
        </div>
    ),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('EventsList', () => {
    // Sample events data for testing
    const mockEvents: Event[] = [
        {
            slug: 'event-1',
            frontmatter: {
                title: 'Event 1',
                description: 'Description 1',
                date: '2024-05-01',
                endDate: '2024-05-02',
                location: 'Location 1',
            },
            content: 'Content 1',
            language: 'en',
        },
        {
            slug: 'event-2',
            frontmatter: {
                title: 'Event 2',
                description: 'Description 2',
                date: '2024-06-01',
                endDate: '2024-06-02',
                location: 'Location 2',
            },
            content: 'Content 2',
            language: 'en',
        },
    ];

    afterEach(() => {
        cleanup();
    });

    it('renders the title correctly', () => {
        render(
            <EventsList
                events={mockEvents}
                title="Test Title"
            />
        );

        expect(screen.getByText('Test Title')).toBeDefined();
    });

    it('renders event cards for each event', () => {
        render(
            <EventsList
                events={mockEvents}
                title="Test Title"
            />
        );

        const eventCards = screen.getAllByTestId('event-card');
        expect(eventCards.length).toBe(2);

        expect(screen.getByText('Event 1')).toBeDefined();
        expect(screen.getByText('Event 2')).toBeDefined();
    });

    it('shows empty message when no events are provided', () => {
        const emptyMessage = 'No events available';
        render(
            <EventsList
                events={[]}
                title="Test Title"
                emptyMessage={emptyMessage}
            />
        );

        expect(screen.getByText(emptyMessage)).toBeDefined();
        expect(screen.queryByTestId('event-card')).toBeNull();
    });

    it('uses default empty message when not provided', () => {
        render(
            <EventsList
                events={[]}
                title="Test Title"
            />
        );

        expect(screen.getByText('No events found')).toBeDefined();
    });

    it('passes priority=true to first two event cards and false to the rest when priority=true', () => {
        const threeEvents: Event[] = [
            ...mockEvents,
            {
                slug: 'event-3',
                frontmatter: {
                    title: 'Event 3',
                    description: 'Description 3',
                    date: '2024-07-01',
                    endDate: '2024-07-02',
                    location: 'Location 3',
                },
                content: 'Content 3',
                language: 'en',
            },
        ];

        render(
            <EventsList
                events={threeEvents}
                title="Test Title"
                priority={true}
            />
        );

        const eventCards = screen.getAllByTestId('event-card');
        expect(eventCards.length).toBe(3);

        expect(eventCards[0].getAttribute('data-priority')).toBe('true');
        expect(eventCards[1].getAttribute('data-priority')).toBe('true');
        expect(eventCards[2].getAttribute('data-priority')).toBe('false');
    });

    it('passes priority=false to all event cards when priority=false', () => {
        render(
            <EventsList
                events={mockEvents}
                title="Test Title"
                priority={false}
            />
        );

        const eventCards = screen.getAllByTestId('event-card');
        expect(eventCards[0].getAttribute('data-priority')).toBe('false');
        expect(eventCards[1].getAttribute('data-priority')).toBe('false');
    });
});
