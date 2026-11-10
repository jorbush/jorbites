import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import ListHeaderCard from '@/app/components/lists/ListHeaderCard';
import { SafeList, SafeUser } from '@/app/types';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('@/app/components/utils/Avatar', () => ({
    default: () => <div data-testid="avatar" />,
}));

vi.mock('@/app/utils/date-utils', () => ({
    formatDate: () => '2026-11-10',
}));

describe('ListHeaderCard', () => {
    const mockUser: SafeUser = {
        id: 'user-id-1',
        name: 'Chef Mario',
        image: '/mario.jpg',
        level: 5,
        verified: true,
        badges: [],
    };

    const mockList: SafeList = {
        id: 'list-1',
        name: 'Pasta Party',
        userId: 'user-id-1',
        recipeIds: ['recipe-1', 'recipe-2'],
        isDefault: false,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: mockUser,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders list title and user details', () => {
        render(
            <ListHeaderCard
                list={mockList}
                recipesCount={2}
            />
        );

        expect(screen.getByText('Pasta Party')).toBeDefined();
        expect(screen.getByText('Chef Mario')).toBeDefined();
        expect(screen.getByText('level 5')).toBeDefined();
        expect(screen.getByText('2 recipes')).toBeDefined();
    });

    it('renders default title when isDefault is true', () => {
        render(
            <ListHeaderCard
                list={{ ...mockList, isDefault: true }}
                recipesCount={1}
            />
        );

        expect(screen.getByText('to_cook_later')).toBeDefined();
        expect(screen.getByText('1 recipe')).toBeDefined();
    });

    it('navigates to user profile on author click', () => {
        render(
            <ListHeaderCard
                list={mockList}
                recipesCount={2}
            />
        );

        const userLink = screen.getByText('Chef Mario');
        fireEvent.click(userLink);

        expect(mockPush).toHaveBeenCalledWith('/profile/user-id-1');
    });

    it('renders correctly when list has no user', () => {
        render(
            <ListHeaderCard
                list={{ ...mockList, user: undefined }}
                recipesCount={0}
            />
        );

        expect(screen.getByText('Pasta Party')).toBeDefined();
        expect(screen.getByText('0 recipes')).toBeDefined();
        expect(screen.queryByText('Chef Mario')).toBeNull();
    });
});
