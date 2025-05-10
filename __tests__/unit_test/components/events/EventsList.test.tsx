import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import EventsList from '@/app/components/events/EventsList';
import { Event } from '@/app/utils/markdownUtils';

// Mock dependencies
vi.mock('@/app/components/events/EventCard', () => ({
    default: ({ event }: { event: Event }) => (
        <div data-testid="event-card">{event.frontmatter.title}</div>
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
});
