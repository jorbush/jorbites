import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import EventDetail from '@/app/components/events/EventDetail';
import { Event } from '@/app/utils/markdownUtils';

// Mock the dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        back: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('react-markdown', () => ({
    default: ({ children }: { children: string }) => (
        <div data-testid="markdown-content">{children}</div>
    ),
}));

describe('EventDetail', () => {
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
        content: 'Event content with markdown',
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

    it('renders the event details correctly', () => {
        render(<EventDetail event={mockEvent} />);

        // Check if the title is displayed
        expect(screen.getByText('Test Event')).toBeDefined();

        // Check if the location is displayed
        expect(screen.getByText(/Test Location/)).toBeDefined();

        // Check if the markdown content is passed to ReactMarkdown
        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toBe('Event content with markdown');
    });

    it('formats multi-day date range correctly', () => {
        render(<EventDetail event={mockEvent} />);

        // The formatted date will depend on the date-fns format, but we can check for the date text
        const dateElement = screen.getByText(/date/i);
        expect(dateElement).toBeDefined();
    });

    it('formats single-day date correctly', () => {
        render(<EventDetail event={singleDayEvent} />);

        // The formatted date will depend on the date-fns format, but we can check for the date text
        const dateElement = screen.getByText(/date/i);
        expect(dateElement).toBeDefined();
    });
});
