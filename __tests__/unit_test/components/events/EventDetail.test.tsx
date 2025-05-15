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
}));

vi.mock('react-markdown', () => ({
    default: ({ children }: { children: string }) => (
        <div data-testid="markdown-content">{children}</div>
    ),
}));

vi.mock('next/image', () => ({
    default: ({ alt }: { alt: string }) => (
        <img
            alt={alt}
            data-testid="event-detail-image"
        />
    ),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
    },
}));

// Mock Heading component
vi.mock('@/app/components/navigation/Heading', () => ({
    default: ({ title }: { title: string }) => (
        <h1 data-testid="heading">{title}</h1>
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
            image: '/jorbites-social.jpg',
        },
        content: 'Event content with markdown',
        language: 'en',
    };

    afterEach(() => {
        cleanup();
    });

    it('renders the event details correctly', () => {
        render(<EventDetail event={mockEvent} />);

        // Check if the title is displayed via Heading component
        expect(screen.getByTestId('heading')).toBeDefined();
        expect(screen.getByTestId('heading').textContent).toBe('Test Event');

        // Check if image is rendered
        expect(screen.getByTestId('event-detail-image')).toBeDefined();

        // Check if the markdown content is passed to ReactMarkdown
        const markdownContent = screen.getByTestId('markdown-content');
        expect(markdownContent.textContent).toBe('Event content with markdown');
    });

    it('displays date correctly', () => {
        render(<EventDetail event={mockEvent} />);

        // We now look for the date value directly since there's no "Date:" label
        const dateElement =
            screen.getByText(/May/i) || screen.getByText(/2024/i);
        expect(dateElement).toBeDefined();
    });

    it('has share button', () => {
        render(<EventDetail event={mockEvent} />);

        // Check for share button by its aria-label
        const shareButton = screen.getByLabelText('Share');
        expect(shareButton).toBeDefined();
    });
});
