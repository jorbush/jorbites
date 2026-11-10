import React from 'react';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SearchResultItem from '@/app/components/inputs/SearchResultItem';

// Mock for Next.js images in CustomProxyImage
vi.mock('next/image', () => ({
    default: ({ alt, ...props }: any) => (
        <img
            alt={alt}
            {...props}
        />
    ),
}));

// Mock for Avatar
vi.mock('@/app/components/utils/Avatar', () => ({
    default: (props: any) => <div data-testid="avatar">{props.children}</div>,
}));

// Mock for VerificationBadge
vi.mock('@/app/components/VerificationBadge', () => ({
    default: () => <span data-testid="verification-badge" />,
}));

describe('<SearchResultItem />', () => {
    afterEach(() => {
        cleanup();
    });

    const mockUserResult = {
        id: 'user1',
        name: 'User 1',
        image: '/user1.jpg',
        level: 5,
        verified: true,
    };

    const mockRecipeResult = {
        id: 'recipe1',
        title: 'Recipe 1',
        imageSrc: '/recipe1.jpg',
        user: { name: 'Chef 1' },
    };

    const mockQuestResult = {
        id: 'quest1',
        title: 'Quest 1',
        description: 'Complete the quest challenge',
    };

    it('renders user result correctly', () => {
        render(
            <SearchResultItem
                result={mockUserResult}
                searchType="users"
                isDisabled={false}
                isSelected={false}
            />
        );

        expect(screen.getByText('User 1')).toBeDefined();
        expect(screen.getByTestId('avatar')).toBeDefined();
        expect(screen.getByTestId('verification-badge')).toBeDefined();
        expect(screen.getByText('Level 5')).toBeDefined();
    });

    it('renders recipe result with user name and fallback image', () => {
        const recipeWithoutImage = {
            id: 'recipe2',
            title: 'Recipe 2',
            user: { name: 'Chef 2' },
        };

        render(
            <SearchResultItem
                result={recipeWithoutImage}
                searchType="recipes"
                isDisabled={false}
                isSelected={false}
            />
        );

        expect(screen.getByText('Recipe 2')).toBeDefined();
        expect(screen.getByText('Chef 2')).toBeDefined();
    });

    it('renders quest result with title and description', () => {
        render(
            <SearchResultItem
                result={mockQuestResult}
                searchType="quests"
                isDisabled={false}
                isSelected={false}
            />
        );

        expect(screen.getByText('Quest 1')).toBeDefined();
        expect(screen.getByText('Complete the quest challenge')).toBeDefined();
    });

    it('triggers onSelectResult when clicked', () => {
        const mockSelect = vi.fn();
        render(
            <SearchResultItem
                result={mockUserResult}
                searchType="users"
                isDisabled={false}
                isSelected={false}
                onSelectResult={mockSelect}
            />
        );

        fireEvent.click(screen.getByRole('button'));
        expect(mockSelect).toHaveBeenCalledWith(mockUserResult);
    });

    it('disables the button when isDisabled is true', () => {
        const mockSelect = vi.fn();
        render(
            <SearchResultItem
                result={mockUserResult}
                searchType="users"
                isDisabled={true}
                isSelected={false}
                onSelectResult={mockSelect}
            />
        );

        const button = screen.getByRole('button');
        expect(button.hasAttribute('disabled')).toBe(true);
    });

    it('renders different styles when isSelected is true', () => {
        render(
            <SearchResultItem
                result={mockUserResult}
                searchType="users"
                isDisabled={false}
                isSelected={true}
                onSelectResult={vi.fn()}
            />
        );

        const button = screen.getByRole('button');
        expect(button.className).toContain('bg-neutral-100');
    });
});
