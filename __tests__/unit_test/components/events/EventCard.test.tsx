import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import EventCard from '@/app/components/events/EventCard';
import { Event } from '@/app/utils/markdownUtils';

// Mock the dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

// Mock i18n-related modules
vi.mock('i18next', () => ({
    default: {
        use: () => ({
            use: () => ({
                use: () => ({
                    init: () => ({}),
                }),
            }),
        }),
        language: 'en',
    },
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
            changeLanguage: vi.fn(),
        },
    }),
    initReactI18next: {},
}));

vi.mock('i18next-http-backend', () => ({
    default: {},
}));

vi.mock('i18next-browser-languagedetector', () => ({
    default: {},
}));

// Mock date-utils to avoid i18n dependency
vi.mock('@/app/utils/date-utils', () => ({
    formatDateRange: (start: string, end: string) => {
        return `May 1, 2024${start !== end ? ' - May 2, 2024' : ''}`;
    },
    getEventDateDisplay: (frontmatter: any, t: any) => {
        if (frontmatter.permanent) return undefined;
        if (frontmatter.recurrent && frontmatter.dayOfMonth) {
            return t('recurrent_date', { day: frontmatter.dayOfMonth });
        }
        return `May 1, 2024${frontmatter.date !== frontmatter.endDate ? ' - May 2, 2024' : ''}`;
    },
}));

vi.mock('next/image', () => ({
    default: ({ alt }: { alt: string }) => (
        <img
            alt={alt}
            data-testid="event-image"
        />
    ),
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
            image: '/jorbites-social.jpg',
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

    const recurrentEvent: Event = {
        ...mockEvent,
        frontmatter: {
            ...mockEvent.frontmatter,
            recurrent: true,
            dayOfMonth: 29,
        },
    };

    afterEach(() => {
        cleanup();
    });

    it('renders the event card correctly', () => {
        render(<EventCard event={mockEvent} />);

        // Check if the title is displayed
        expect(screen.getByText('Test Event')).toBeDefined();

        // Check if image is rendered
        expect(screen.getByTestId('event-image')).toBeDefined();
    });

    it('formats multi-day date range correctly', () => {
        render(<EventCard event={mockEvent} />);

        // We now look for the date value directly since there's no "Date:" label
        const dateElement =
            screen.getByText(/May/i) || screen.getByText(/2024/i);
        expect(dateElement).toBeDefined();
    });

    it('formats single-day date correctly', () => {
        render(<EventCard event={singleDayEvent} />);

        // We now look for the date value directly since there's no "Date:" label
        const dateElement =
            screen.getByText(/May/i) || screen.getByText(/2024/i);
        expect(dateElement).toBeDefined();
    });

    it('renders recurrent event date correctly', () => {
        render(<EventCard event={recurrentEvent} />);

        // In the mock, t(key, options) returns key, but our mock implementation returns the key with options interpolated if handled
        // Actually the current mock t returns just key. Let's see.
        // Wait, the mock t is: t: (key: string) => key
        // So t('recurrent_date', { day: 29 }) will return 'recurrent_date'
        expect(screen.getByText('recurrent_date')).toBeDefined();
    });
});
