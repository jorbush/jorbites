import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RecipeInfo from '@/app/components/recipes/RecipeInfo';
import { SafeUser } from '@/app/types';
import * as nextNavigation from 'next/navigation';

vi.mock('@/app/hooks/useMediaQuery', () => ({
    default: () => false,
}));

// Mock the dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: vi.fn(),
            language: 'en',
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: vi.fn(),
    },
}));

vi.mock('../Avatar', () => ({
    default: ({ src, size, onClick }: any) => (
        <img
            src={src}
            width={size}
            height={size}
            onClick={onClick}
            alt="Avatar"
        />
    ),
}));

vi.mock('../HeartButton', () => ({
    default: () => <button data-testid="heart-button">Heart</button>,
}));

vi.mock('@/app/components/recipes/RecipeCategoryAndMethod', () => ({
    default: ({ category, method }: any) => (
        <div data-testid="recipe-category-and-method">
            Category: {category?.label}, Method: {method?.label}
        </div>
    ),
}));

describe('RecipeInfo', () => {
    const mockUser: SafeUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: new Date().toISOString(),
        image: 'https://example.com/avatar.jpg',
        verified: true,
        level: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hashedPassword: null,
        favoriteIds: [],
        emailNotifications: false,
    };

    const mockProps = {
        user: mockUser,
        description: 'A delicious recipe',
        descriptionText: 'A delicious recipe',
        steps: ['Step 1', 'Step 2'],
        stepsText: ['Step 1', 'Step 2'],
        ingredients: ['Ingredient 1', 'Ingredient 2'],
        ingredientsText: ['Ingredient 1', 'Ingredient 2'],
        category: {
            icon: vi.fn(),
            label: 'Dinner',
            description: 'Evening meal',
        },
        method: { icon: vi.fn(), label: 'Baking' },
        currentUser: null,
        id: '123',
        likes: 10,
    };

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders user information correctly', () => {
        render(<RecipeInfo {...mockProps} />);
        expect(screen.queryByText(mockUser.name!)).toBeDefined();
        expect(screen.getByText('level 5')).toBeDefined();
        expect(screen.getByTestId('heart-button')).toBeDefined();
        expect(screen.getByText('10')).toBeDefined();
    });

    it('displays recipe details correctly', () => {
        render(<RecipeInfo {...mockProps} />);
        expect(screen.getByText('2 steps')).toBeDefined();
        expect(screen.getByText('2 ingredients')).toBeDefined();
        expect(screen.getByText('A delicious recipe')).toBeDefined();
    });

    it('renders ingredients and steps', () => {
        render(<RecipeInfo {...mockProps} />);
        // The component uses mounted state, so we need to check for either the key or the translated value
        // Since the mock returns the key, both should be 'ingredients' and 'steps'
        expect(screen.getByText('ingredients')).toBeDefined();
        expect(screen.getByText('Ingredient 1')).toBeDefined();
        expect(screen.getByText('Ingredient 2')).toBeDefined();
        expect(screen.getByText('steps')).toBeDefined();
        expect(screen.getByText('Step 1')).toBeDefined();
        expect(screen.getByText('Step 2')).toBeDefined();
    });

    it('navigates to user profile when avatar is clicked', () => {
        const pushMock = vi.fn();
        vi.spyOn(nextNavigation, 'useRouter').mockReturnValue({
            push: pushMock,
        } as any);

        render(<RecipeInfo {...mockProps} />);
        fireEvent.click(screen.getByAltText('Avatar'));
        expect(pushMock).toHaveBeenCalledWith('/profile/1');
    });

    it('displays verified icon for verified users', () => {
        render(<RecipeInfo {...mockProps} />);
        expect(screen.getByTestId('verified-icon')).toBeDefined();
    });

    it('does not display verified icon for unverified users', () => {
        const unverifiedProps = {
            ...mockProps,
            user: { ...mockUser, verified: false },
        };
        render(<RecipeInfo {...unverifiedProps} />);
        expect(screen.queryByTestId('verified-icon')).toBeNull();
    });

    it('renders RecipeCategoryAndMethod component', () => {
        render(<RecipeInfo {...mockProps} />);
        expect(screen.getByTestId('recipe-category-and-method')).toBeDefined();
    });

    it('has correct id attributes for hash navigation', () => {
        const { container } = render(<RecipeInfo {...mockProps} />);
        expect(container.querySelector('#description')).not.toBeNull();
        expect(container.querySelector('#ingredients')).not.toBeNull();
        expect(container.querySelector('#steps')).not.toBeNull();
    });
});
