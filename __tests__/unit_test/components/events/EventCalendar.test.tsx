import {
    render,
    screen,
    fireEvent,
    cleanup,
    act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EventCalendar from '@/app/components/events/EventCalendar';
import { Event } from '@/app/utils/markdownUtils';
import { format } from 'date-fns';

// Mock next/image
vi.mock('next/image', () => ({
    default: ({ src, alt, fill }: any) => (
        <img
            src={src}
            alt={alt}
            style={fill ? { width: '100%', height: '100%' } : {}}
        />
    ),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' },
    }),
}));

const mockEvents: Event[] = [
    {
        slug: 'test-event-1',
        frontmatter: {
            title: 'Test Event 1',
            date: new Date().toISOString(),
            endDate: new Date().toISOString(),
            image: '/test-image-1.webp',
            description: 'Test Description 1',
        },
        content: '',
        language: 'en',
    },
    {
        slug: 'test-event-2',
        frontmatter: {
            title: 'Test Event 2',
            date: new Date().toISOString(),
            endDate: new Date().toISOString(),
            image: '/test-image-2.webp',
            badge: '/test-badge-2.webp',
            description: 'Test Description 2',
        },
        content: '',
        language: 'en',
    },
];

describe('EventCalendar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('renders the current month and year', () => {
        render(
            <EventCalendar
                currentEvents={[]}
                upcomingEvents={[]}
            />
        );
        const now = new Date();
        const monthName = `month_${format(now, 'MMM').toLowerCase()}`;
        const year = format(now, 'yyyy');

        expect(screen.getByText(new RegExp(monthName, 'i'))).toBeDefined();
        expect(screen.getByText(new RegExp(year, 'i'))).toBeDefined();
    });

    it('displays events on their respective dates with links', () => {
        render(
            <EventCalendar
                currentEvents={[mockEvents[0]]}
                upcomingEvents={[]}
            />
        );

        // Check for the image with alt text
        expect(screen.getByAltText('Test Event 1')).toBeDefined();

        // Check if it is wrapped in a link
        const links = screen.getAllByRole('link');
        const eventLink = links.find(
            (link) =>
                link.getAttribute('href') === `/events/${mockEvents[0].slug}`
        );

        expect(eventLink).toBeDefined();
        expect(eventLink?.className).toContain('cursor-pointer');
    });

    it('shows tooltip on hover', async () => {
        render(
            <EventCalendar
                currentEvents={[mockEvents[0]]}
                upcomingEvents={[]}
            />
        );

        const link = screen
            .getAllByRole('link')
            .find(
                (l) =>
                    l.getAttribute('href') === `/events/${mockEvents[0].slug}`
            );
        const tooltipWrapper = link?.parentElement;

        if (tooltipWrapper) {
            fireEvent.mouseEnter(tooltipWrapper);

            act(() => {
                vi.advanceTimersByTime(500);
            });

            const tooltip = screen.getByTestId('tooltip');
            expect(tooltip).toBeDefined();
            expect(tooltip.textContent).toBe('Test Event 1');
        } else {
            throw new Error('Tooltip wrapper not found');
        }
    });

    it('prioritizes badge image over event image', () => {
        render(
            <EventCalendar
                currentEvents={[mockEvents[1]]}
                upcomingEvents={[]}
            />
        );
        const img = screen.getByAltText('Test Event 2') as HTMLImageElement;
        expect(img.src).toContain('/test-badge-2.webp');
    });

    it('navigates to next and previous months with cursor pointers', () => {
        render(
            <EventCalendar
                currentEvents={[]}
                upcomingEvents={[]}
            />
        );
        const nextButton = screen.getByLabelText('Next Month');
        const prevButton = screen.getByLabelText('Previous Month');

        expect(nextButton.className).toContain('cursor-pointer');
        expect(prevButton.className).toContain('cursor-pointer');

        const now = new Date();
        const currentMonthName = `month_${format(now, 'MMM').toLowerCase()}`;

        fireEvent.click(nextButton);
        expect(screen.queryByText(currentMonthName)).toBeNull();

        fireEvent.click(prevButton);
        expect(
            screen.getByText(new RegExp(currentMonthName, 'i'))
        ).toBeDefined();
    });

    it('applies correct dark mode classes to day numbers', () => {
        render(
            <EventCalendar
                currentEvents={[]}
                upcomingEvents={[]}
            />
        );

        // Find all day display elements (spans with numbers)
        // We can't rely on getting all text nodes as numbers easily without context,
        // but we know the structure: span with class "text-xs font-medium..."

        // Let's just grab the container and query spans
        const container = screen
            .getByText(new RegExp(format(new Date(), 'yyyy'), 'i'))
            .closest('.mb-10'); // Main container
        // Not reliable to rely on class names that might change, but for unit test checking 'these changes' specifically:

        // We check for elements containing 'dark:text-neutral-300'
        // These should be days that are NOT today.

        // Since the calendar renders many days, at least one should be "not today".
        // (Unless the month has 1 day and it is today, which is impossible)

        const days = container?.querySelectorAll('span.text-xs');
        let foundNonToday = false;

        days?.forEach((day) => {
            if (day.className.includes('dark:text-neutral-300')) {
                foundNonToday = true;
            }
        });

        expect(foundNonToday).toBe(true);
    });

    it('displays the days of the week starting from Monday', () => {
        render(
            <EventCalendar
                currentEvents={[]}
                upcomingEvents={[]}
            />
        );

        const expectedDays = [
            'day_mon',
            'day_tue',
            'day_wed',
            'day_thu',
            'day_fri',
            'day_sat',
            'day_sun',
        ];

        // The days of the week are rendered as uppercase in the component,
        // but the mock translation returns the key as is.
        const dayHeaders = screen.getAllByText(/day_/);
        expect(dayHeaders.length).toBe(7);

        expectedDays.forEach((day, index) => {
            expect(dayHeaders[index].textContent?.toLowerCase()).toBe(
                day.toLowerCase()
            );
        });
    });
});
