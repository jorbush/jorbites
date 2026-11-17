import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ProfileQuestsContent from '@/app/components/profile/ProfileQuestsContent';
import { SafeQuest } from '@/app/types';

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

const createMockQuest = (id: string, title: string): SafeQuest => ({
    id,
    title,
    description: `Looking for ${title}`,
    status: 'open',
    userId: 'user1',
    acceptedRecipeId: null,
    acceptedSolverId: null,
    badgeEvaluated: false,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    recipes: [],
});

describe('ProfileQuestsContent Component', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders empty state when no quests are provided', () => {
        render(
            <ProfileQuestsContent
                quests={[]}
                searchParams={{}}
            />
        );

        expect(screen.getByTestId('profile-quests-empty')).toBeDefined();
        expect(screen.getByText('no_quests')).toBeDefined();
    });

    it('renders quests grid with single column below md and filters by searchQuery', () => {
        const quests = [
            createMockQuest('q1', 'Homemade Ramen'),
            createMockQuest('q2', 'Tiramisu'),
        ];

        render(
            <ProfileQuestsContent
                quests={quests}
                searchParams={{}}
                searchQuery="ramen"
            />
        );

        const content = screen.getByTestId('profile-quests-content');
        const grid = content.querySelector('.grid');
        expect(grid?.className).toContain('grid-cols-1');
        expect(grid?.className).toContain('md:grid-cols-2');
        expect(grid?.className).not.toContain('sm:grid-cols-2');

        expect(screen.getByText('Homemade Ramen')).toBeDefined();
        expect(screen.queryByText('Tiramisu')).toBeNull();
    });

    it('renders EmptySearchResults and triggers onClearSearch when no quests match', () => {
        const onClearSearch = vi.fn();
        render(
            <ProfileQuestsContent
                quests={[createMockQuest('q1', 'Homemade Ramen')]}
                searchParams={{}}
                searchQuery="paella"
                onClearSearch={onClearSearch}
            />
        );

        expect(screen.getByTestId('profile-quests-search-empty')).toBeDefined();
        fireEvent.click(screen.getByTestId('profile-quests-search-clear'));
        expect(onClearSearch).toHaveBeenCalledTimes(1);
    });
});
