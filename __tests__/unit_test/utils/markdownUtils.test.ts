import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
    categorizeEvents,
    getEffectiveEventDate,
    sortEventsByDate,
    Event,
} from '@/app/utils/markdownUtils';

describe('categorizeEvents', () => {
    // Helper function to create mock events
    const createEvent = (
        slug: string,
        options: {
            date?: string;
            endDate?: string;
            permanent?: boolean;
            recurrent?: boolean;
            dayOfMonth?: number;
        } = {}
    ): Event => ({
        slug,
        frontmatter: {
            title: `Event ${slug}`,
            description: 'Test description',
            date: options.date || '2025-01-01',
            endDate: options.endDate || '2025-01-31',
            image: '/test.jpg',
            permanent: options.permanent,
            recurrent: options.recurrent,
            dayOfMonth: options.dayOfMonth,
        },
        content: 'Test content',
        language: 'en',
    });

    describe('permanent events', () => {
        it('should categorize permanent events separately', () => {
            const events = [
                createEvent('permanent-event', { permanent: true }),
                createEvent('regular-event', {
                    date: '2099-01-01',
                    endDate: '2099-12-31',
                }),
            ];

            const result = categorizeEvents(events);

            expect(result.permanent).toHaveLength(1);
            expect(result.permanent[0].slug).toBe('permanent-event');
            expect(result.upcoming).toHaveLength(1);
            expect(result.upcoming[0].slug).toBe('regular-event');
        });
    });

    describe('recurrent events', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should categorize recurrent event as current when today is the dayOfMonth', () => {
            // Set the date to the 29th
            vi.setSystemTime(new Date('2025-01-29T12:00:00'));

            const events = [
                createEvent('gnocchi-day', {
                    recurrent: true,
                    dayOfMonth: 29,
                }),
            ];

            const result = categorizeEvents(events);

            expect(result.current).toHaveLength(1);
            expect(result.current[0].slug).toBe('gnocchi-day');
            expect(result.upcoming).toHaveLength(0);
        });

        it('should categorize recurrent event as upcoming when today is before the dayOfMonth', () => {
            // Set the date to the 15th
            vi.setSystemTime(new Date('2025-01-15T12:00:00'));

            const events = [
                createEvent('gnocchi-day', {
                    recurrent: true,
                    dayOfMonth: 29,
                }),
            ];

            const result = categorizeEvents(events);

            expect(result.upcoming).toHaveLength(1);
            expect(result.upcoming[0].slug).toBe('gnocchi-day');
            expect(result.current).toHaveLength(0);
        });

        it('should categorize recurrent event as upcoming when today is after the dayOfMonth', () => {
            // Set the date to the 30th
            vi.setSystemTime(new Date('2025-01-30T12:00:00'));

            const events = [
                createEvent('gnocchi-day', {
                    recurrent: true,
                    dayOfMonth: 29,
                }),
            ];

            const result = categorizeEvents(events);

            // After the day has passed, it should still be upcoming (for next month)
            expect(result.upcoming).toHaveLength(1);
            expect(result.upcoming[0].slug).toBe('gnocchi-day');
            expect(result.current).toHaveLength(0);
        });

        it('should not treat event as recurrent if recurrent is false', () => {
            vi.setSystemTime(new Date('2025-01-29T12:00:00'));

            const events = [
                createEvent('regular-event', {
                    recurrent: false,
                    dayOfMonth: 29,
                    date: '2099-01-01',
                    endDate: '2099-12-31',
                }),
            ];

            const result = categorizeEvents(events);

            // Should be treated as a regular upcoming event based on date
            expect(result.upcoming).toHaveLength(1);
            expect(result.current).toHaveLength(0);
        });

        it('should not treat event as recurrent if dayOfMonth is missing', () => {
            vi.setSystemTime(new Date('2025-01-29T12:00:00'));

            const events = [
                createEvent('incomplete-recurrent', {
                    recurrent: true,
                    // dayOfMonth is missing
                    date: '2099-01-01',
                    endDate: '2099-12-31',
                }),
            ];

            const result = categorizeEvents(events);

            // Should be treated as a regular upcoming event based on date
            expect(result.upcoming).toHaveLength(1);
            expect(result.current).toHaveLength(0);
        });

        it('should not treat event as recurrent if dayOfMonth is 0 (invalid)', () => {
            vi.setSystemTime(new Date('2025-01-29T12:00:00'));

            const events = [
                createEvent('invalid-day', {
                    recurrent: true,
                    dayOfMonth: 0, // Invalid - should be 1-31
                    date: '2099-01-01',
                    endDate: '2099-12-31',
                }),
            ];

            const result = categorizeEvents(events);

            // Should be treated as a regular upcoming event based on date
            expect(result.upcoming).toHaveLength(1);
            expect(result.current).toHaveLength(0);
        });

        it('should not treat event as recurrent if dayOfMonth is greater than 31 (invalid)', () => {
            vi.setSystemTime(new Date('2025-01-29T12:00:00'));

            const events = [
                createEvent('invalid-day-high', {
                    recurrent: true,
                    dayOfMonth: 32, // Invalid - should be 1-31
                    date: '2099-01-01',
                    endDate: '2099-12-31',
                }),
            ];

            const result = categorizeEvents(events);

            // Should be treated as a regular upcoming event based on date
            expect(result.upcoming).toHaveLength(1);
            expect(result.current).toHaveLength(0);
        });
    });

    describe('regular events', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should categorize current events correctly', () => {
            vi.setSystemTime(new Date('2025-06-15T12:00:00'));

            const events = [
                createEvent('current-event', {
                    date: '2025-06-01',
                    endDate: '2025-06-30',
                }),
            ];

            const result = categorizeEvents(events);

            expect(result.current).toHaveLength(1);
            expect(result.current[0].slug).toBe('current-event');
        });

        it('should categorize upcoming events correctly', () => {
            vi.setSystemTime(new Date('2025-06-15T12:00:00'));

            const events = [
                createEvent('upcoming-event', {
                    date: '2025-07-01',
                    endDate: '2025-07-31',
                }),
            ];

            const result = categorizeEvents(events);

            expect(result.upcoming).toHaveLength(1);
            expect(result.upcoming[0].slug).toBe('upcoming-event');
        });

        it('should categorize past events correctly', () => {
            vi.setSystemTime(new Date('2025-06-15T12:00:00'));

            const events = [
                createEvent('past-event', {
                    date: '2025-01-01',
                    endDate: '2025-01-31',
                }),
            ];

            const result = categorizeEvents(events);

            expect(result.past).toHaveLength(1);
            expect(result.past[0].slug).toBe('past-event');
        });
    });
});

describe('sortEventsByDate with recurrent events', () => {
    const createEvent = (
        slug: string,
        options: {
            date?: string;
            endDate?: string;
            recurrent?: boolean;
            dayOfMonth?: number;
        } = {}
    ): Event => ({
        slug,
        frontmatter: {
            title: `Event ${slug}`,
            description: 'Test description',
            date: options.date || '2024-01-01',
            endDate: options.endDate || '2024-01-31',
            image: '/test.jpg',
            recurrent: options.recurrent,
            dayOfMonth: options.dayOfMonth,
        },
        content: 'Test content',
        language: 'en',
    });

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('sorts upcoming events chronologically so recurrent event does not always appear first', () => {
        vi.setSystemTime(new Date('2026-11-12T12:00:00'));

        const gnocchiEvent = createEvent('gnocchi-day', {
            date: '2024-11-29',
            endDate: '2024-11-29',
            recurrent: true,
            dayOfMonth: 29,
        });
        const soonerEvent = createEvent('thanksgiving-bake', {
            date: '2026-11-20',
            endDate: '2026-11-22',
        });

        const sorted = sortEventsByDate([gnocchiEvent, soonerEvent], true);

        expect(sorted.map((e) => e.slug)).toEqual([
            'thanksgiving-bake',
            'gnocchi-day',
        ]);
    });

    it('places recurrent event in next month when dayOfMonth has already passed', () => {
        vi.setSystemTime(new Date('2026-11-30T12:00:00'));

        const gnocchiEvent = createEvent('gnocchi-day', {
            date: '2024-11-29',
            endDate: '2024-11-29',
            recurrent: true,
            dayOfMonth: 29,
        });
        const decEvent = createEvent('winter-special', {
            date: '2026-12-15',
            endDate: '2026-12-20',
        });

        const sorted = sortEventsByDate([gnocchiEvent, decEvent], true);

        expect(sorted.map((e) => e.slug)).toEqual([
            'winter-special',
            'gnocchi-day',
        ]);
        expect(getEffectiveEventDate(gnocchiEvent).getMonth()).toBe(11); // December (0-indexed)
        expect(getEffectiveEventDate(gnocchiEvent).getDate()).toBe(29);
    });

    it('places recurrent event first when its next occurrence is genuinely sooner', () => {
        vi.setSystemTime(new Date('2026-11-25T12:00:00'));

        const gnocchiEvent = createEvent('gnocchi-day', {
            date: '2024-11-29',
            endDate: '2024-11-29',
            recurrent: true,
            dayOfMonth: 29,
        });
        const decEvent = createEvent('winter-special', {
            date: '2026-12-05',
            endDate: '2026-12-10',
        });

        const sorted = sortEventsByDate([decEvent, gnocchiEvent], true);

        expect(sorted.map((e) => e.slug)).toEqual([
            'gnocchi-day',
            'winter-special',
        ]);
    });
});
