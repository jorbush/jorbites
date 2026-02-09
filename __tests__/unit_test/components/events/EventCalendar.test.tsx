import { render, screen, fireEvent, cleanup } from '@testing-library/react';
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
    });

    afterEach(() => {
        cleanup();
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

    it('displays events on their respective dates', () => {
        render(
            <EventCalendar
                currentEvents={[mockEvents[0]]}
                upcomingEvents={[]}
            />
        );
        expect(screen.getByAltText('Test Event 1')).toBeDefined();
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

    it('navigates to next and previous months', () => {
        render(
            <EventCalendar
                currentEvents={[]}
                upcomingEvents={[]}
            />
        );
        const nextButtons = screen.getAllByLabelText('Next Month');
        const prevButtons = screen.getAllByLabelText('Previous Month');

        const now = new Date();
        const currentMonthName = `month_${format(now, 'MMM').toLowerCase()}`;

        fireEvent.click(nextButtons[0]);
        expect(screen.queryByText(currentMonthName)).toBeNull();

        fireEvent.click(prevButtons[0]);
        expect(
            screen.getByText(new RegExp(currentMonthName, 'i'))
        ).toBeDefined();
    });
});
