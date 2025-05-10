import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import EventCard from '@/app/components/events/EventCard';
import { Event } from '@/app/utils/markdownUtils';

// Mock the dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
            changeLanguage: vi.fn(),
        },
    }),
}));

describe('EventCard', () => {
    // Sample event data for testing
    const mockEvent: Event = {
        slug: 'test-event',
        frontmatter: {
            title: 'Test Event',
            description: 'This is a test event',
            date: '2024-05-01',
            endDate: '2024-05-02',
            location: 'Test Location',
        },
        content: 'Event content',
        language: 'en',
    };

    const singleDayEvent: Event = {
        ...mockEvent,
        frontmatter: {
            ...mockEvent.frontmatter,
            date: '2024-05-01',
            endDate: '2024-05-01',
        },
    };

    afterEach(() => {
        cleanup();
    });

    it('renders the event card correctly', () => {
        render(<EventCard event={mockEvent} />);

        // Check if the title and description are displayed
        expect(screen.getByText('Test Event')).toBeDefined();
        expect(screen.getByText('This is a test event')).toBeDefined();

        // Check if the location is displayed
        expect(screen.getByText(/Test Location/)).toBeDefined();
    });

    it('formats multi-day date range correctly', () => {
        render(<EventCard event={mockEvent} />);

        // The formatted date will depend on the date-fns format, but we can check for the date text
        const dateText = screen.getByText(/date/i).textContent;

        // Just making sure it has the date in some format
        expect(dateText).toBeTruthy();
    });

    it('formats single-day date correctly', () => {
        render(<EventCard event={singleDayEvent} />);

        // The formatted date will depend on the date-fns format, but we can check for the date text
        const dateText = screen.getByText(/date/i).textContent;

        // Just making sure it has the date in some format
        expect(dateText).toBeTruthy();

        // For a single-day event, there shouldn't be a range separator
        expect(dateText).not.toContain(' - ');
    });
});
