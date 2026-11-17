import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ProfilePlanningsContent from '@/app/components/profile/ProfilePlanningsContent';
import { SafePlanning } from '@/app/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' },
    }),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    useSearchParams: () => ({
        get: vi.fn(() => null),
    }),
    usePathname: () => '/profile/user1',
}));

const createMockPlanning = (
    id: string,
    name: string,
    isPrivate = false
): SafePlanning => ({
    id,
    name,
    description: `Description for ${name}`,
    isPrivate,
    userId: 'user1',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    meals: [],
});

describe('ProfilePlanningsContent Component', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders empty state when no plannings are provided', () => {
        render(
            <ProfilePlanningsContent
                plannings={[]}
                isOwnProfile={false}
                searchParams={{}}
            />
        );

        expect(screen.getByTestId('profile-plannings-empty')).toBeDefined();
        expect(screen.getByText('no_meal_plans')).toBeDefined();
    });

    it('renders plannings grid with single column below md and filters by searchQuery', () => {
        const plannings = [
            createMockPlanning('p1', 'Weekly Vegan Menu', false),
            createMockPlanning('p2', 'High Protein Plan', true),
        ];

        render(
            <ProfilePlanningsContent
                plannings={plannings}
                isOwnProfile={true}
                searchParams={{}}
                searchQuery="vegan"
            />
        );

        const content = screen.getByTestId('profile-plannings-content');
        const grid = content.querySelector('.grid');
        expect(grid?.className).toContain('grid-cols-1');
        expect(grid?.className).toContain('md:grid-cols-2');
        expect(grid?.className).not.toContain('sm:grid-cols-2');

        expect(screen.getByText('Weekly Vegan Menu')).toBeDefined();
        expect(screen.queryByText('High Protein Plan')).toBeNull();
    });

    it('renders EmptySearchResults and triggers onClearSearch when no plannings match', () => {
        const onClearSearch = vi.fn();
        render(
            <ProfilePlanningsContent
                plannings={[createMockPlanning('p1', 'Weekly Vegan Menu')]}
                isOwnProfile={false}
                searchParams={{}}
                searchQuery="keto"
                onClearSearch={onClearSearch}
            />
        );

        expect(
            screen.getByTestId('profile-plannings-search-empty')
        ).toBeDefined();
        fireEvent.click(screen.getByTestId('profile-plannings-search-clear'));
        expect(onClearSearch).toHaveBeenCalledTimes(1);
    });
});
