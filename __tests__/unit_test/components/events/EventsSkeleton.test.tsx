import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import EventsSkeleton from '@/app/components/events/EventsSkeleton';
import { SafeWeeklyChallenge } from '@/app/types';

// Mock dependencies
vi.mock('@/app/components/utils/Container', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-container">{children}</div>
    ),
}));

describe('EventsSkeleton', () => {
    afterEach(() => {
        cleanup();
    });

    const mockWeeklyChallenge: SafeWeeklyChallenge = {
        id: 'challenge-id',
        type: 'recipe_creation',
        value: 'pasta',
        startDate: '2024-05-01T00:00:00.000Z',
        endDate: '2024-05-08T00:00:00.000Z',
        createdAt: '2024-05-01T00:00:00.000Z',
        updatedAt: '2024-05-01T00:00:00.000Z',
    };

    it('renders header, calendar and list skeletons without weekly challenge', () => {
        const { container } = render(<EventsSkeleton />);

        // Verify the mock container is rendered
        expect(screen.getByTestId('mock-container')).toBeDefined();

        // Verify no weekly challenge skeleton is rendered
        // The weekly challenge skeleton has a border-neutral-200 class and contains text or structure
        // Let's check for specific elements or classes using DOM querying
        const challengeSkeleton = container.querySelector('.border-yellow-500');
        expect(challengeSkeleton).toBeNull();

        // Verify calendar skeleton grid is rendered (should have 35 day cells plus 7 weekday headers = 42 cells)
        const calendarGrid = container.querySelector('.grid-cols-7');
        expect(calendarGrid).toBeDefined();

        const cells = calendarGrid?.children;
        expect(cells?.length).toBe(42); // 7 headers + 35 cells
    });

    it('renders weekly challenge skeleton when challenge is provided', () => {
        const { container } = render(
            <EventsSkeleton weeklyChallenge={mockWeeklyChallenge} />
        );

        // Verify that the WeeklyChallenge skeleton wrapper is rendered (p-6 border-neutral-200)
        const challengeSection = container.querySelector(
            '.border-neutral-200.p-6'
        );
        expect(challengeSection).not.toBeNull();
    });

    it('renders exactly 4 category skeletons with cards', () => {
        const { container } = render(<EventsSkeleton />);

        // Find scrollable lists wrappers (scrollable flex layouts)
        const scrollWrappers = container.querySelectorAll('.overflow-x-auto');
        expect(scrollWrappers.length).toBe(4);

        // Ensure each wrapper has 4 cards
        scrollWrappers.forEach((wrapper) => {
            const cards = wrapper.querySelectorAll('.border-neutral-200');
            // Since we mocked container, the only border-neutral-200 elements inside the wrapper should be the cards
            expect(cards.length).toBe(4);
        });
    });
});
