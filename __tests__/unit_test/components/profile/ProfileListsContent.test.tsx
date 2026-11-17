import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ProfileListsContent from '@/app/components/profile/ProfileListsContent';
import { SafeList } from '@/app/types';

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

const createMockList = (
    id: string,
    name: string,
    isPrivate = false
): SafeList => ({
    id,
    name,
    isPrivate,
    isDefault: false,
    userId: 'user1',
    recipeIds: ['r1'],
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    recipes: [],
});

describe('ProfileListsContent Component', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders empty state when no lists are provided', () => {
        render(
            <ProfileListsContent
                lists={[]}
                isOwnProfile={false}
                searchParams={{}}
            />
        );

        expect(screen.getByTestId('profile-lists-empty')).toBeDefined();
        expect(screen.getByText('no_lists')).toBeDefined();
    });

    it('renders lists grid with single column below md and filters by searchQuery', () => {
        const lists = [
            createMockList('l1', 'Summer Salads', false),
            createMockList('l2', 'Winter Soups', true),
        ];

        render(
            <ProfileListsContent
                lists={lists}
                isOwnProfile={true}
                searchParams={{}}
                searchQuery="summer"
            />
        );

        const content = screen.getByTestId('profile-lists-content');
        const grid = content.querySelector('.grid');
        expect(grid?.className).toContain('grid-cols-1');
        expect(grid?.className).toContain('md:grid-cols-2');
        expect(grid?.className).not.toContain('sm:grid-cols-2');

        expect(screen.getByText('Summer Salads')).toBeDefined();
        expect(screen.queryByText('Winter Soups')).toBeNull();
    });

    it('shows public and private badges on own profile and hides public badge for visitors', () => {
        const lists = [
            createMockList('l1', 'Public List', false),
            createMockList('l2', 'Private List', true),
        ];

        const { unmount } = render(
            <ProfileListsContent
                lists={lists}
                isOwnProfile={true}
                searchParams={{}}
            />
        );

        expect(screen.getByText('public')).toBeDefined();
        expect(screen.getByText('private')).toBeDefined();

        unmount();

        render(
            <ProfileListsContent
                lists={[createMockList('l1', 'Public List', false)]}
                isOwnProfile={false}
                searchParams={{}}
            />
        );

        expect(screen.queryByText('public')).toBeNull();
    });

    it('renders EmptySearchResults and triggers onClearSearch when no lists match', () => {
        const onClearSearch = vi.fn();
        render(
            <ProfileListsContent
                lists={[createMockList('l1', 'Summer Salads', false)]}
                isOwnProfile={false}
                searchParams={{}}
                searchQuery="ramen"
                onClearSearch={onClearSearch}
            />
        );

        expect(screen.getByTestId('profile-lists-search-empty')).toBeDefined();
        fireEvent.click(screen.getByTestId('profile-lists-search-clear'));
        expect(onClearSearch).toHaveBeenCalledTimes(1);
    });
});
