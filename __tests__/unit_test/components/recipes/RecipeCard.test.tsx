import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import { SafeRecipe, SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

// Mock the HeartButton component
vi.mock('@/app/components/HeartButton', () => ({
    default: () => <button data-testid="heart-button">Heart</button>,
}));

// Mock the PinButton component
vi.mock('@/app/components/buttons/PinButton', () => ({
    default: () => <button data-testid="pin-button">Pin</button>,
}));

vi.mock('react-icons/bs', () => ({
    BsPinAngleFill: () => <div data-testid="static-pin" />,
}));

// Mock the Avatar component
vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ src, size }: { src: string | null; size: number }) => (
        <div
            data-testid="avatar"
            data-src={src}
            data-size={size}
        >
            Avatar
        </div>
    ),
}));

describe('<RecipeCard />', () => {
    const mockRecipe: SafeRecipe = {
        id: '1',
        title: 'Test Recipe',
        imageSrc: '/test-image.jpg',
        minutes: 30,
        description: 'Test Description',
        category: 'Test Category',
        method: 'Test Method',
        numLikes: 0,
        ingredients: [],
        steps: [],
        extraImages: [],
        userId: '1',
        createdAt: '2022-01-01',
        coCooksIds: [],
        linkedRecipeIds: [],
    };

    const mockUser: SafeUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: null,
        image: null,
        hashedPassword: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favoriteIds: [],
        emailNotifications: false,
        level: 0,
        verified: false,
        badges: [],
        resetToken: null,
        resetTokenExpiry: null,
    };

    const mockRouter = {
        back: vi.fn(),
        push: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        render(
            <RecipeCard
                data={mockRecipe}
                currentUser={mockUser}
            />
        );
        (useRouter as any).mockReturnValue(mockRouter);
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the recipe title', () => {
        expect(screen.getByText('Test Recipe')).toBeDefined();
    });

    it('renders the recipe cooking time', () => {
        expect(screen.getByText('30 min')).toBeDefined();
    });

    it('renders the recipe image', () => {
        const image = screen.getByAltText('recipe') as HTMLImageElement;
        expect(image).toBeDefined();
        expect(image.src).toContain('test-image.jpg');
    });

    it('renders the HeartButton component', () => {
        expect(screen.getByTestId('heart-button')).toBeDefined();
    });

    it('navigates to the recipe page when clicked', () => {
        fireEvent.click(screen.getByText('Test Recipe'));
        expect(mockRouter.push).toHaveBeenCalledWith('/recipes/1');
    });

    it('renders and calls onAction when action button is clicked', () => {
        const onAction = vi.fn();
        const ActionIcon = () => <div data-testid="action-icon" />;

        cleanup();
        render(
            <RecipeCard
                data={mockRecipe}
                onAction={onAction}
                actionIcon={ActionIcon}
                actionLabel="Delete Action"
            />
        );

        const actionButton = screen.getByTitle('Delete Action');
        expect(actionButton).toBeDefined();
        expect(screen.getByTestId('action-icon')).toBeDefined();

        fireEvent.click(actionButton);

        expect(onAction).toHaveBeenCalledWith(mockRecipe.id);
        expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('does not call onAction when disabled', () => {
        const onAction = vi.fn();
        const ActionIcon = () => <div data-testid="action-icon" />;

        cleanup();
        render(
            <RecipeCard
                data={mockRecipe}
                onAction={onAction}
                actionIcon={ActionIcon}
                actionLabel="Delete Action"
                disabled
            />
        );

        const actionButton = screen.getByTitle('Delete Action');
        fireEvent.click(actionButton);

        expect(onAction).not.toHaveBeenCalled();
    });

    describe('user parameter logic', () => {
        const mockRecipeUser: SafeUser = {
            id: '2',
            name: 'Recipe Author',
            email: 'author@example.com',
            emailVerified: null,
            image: '/author-image.jpg',
            hashedPassword: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            favoriteIds: [],
            emailNotifications: false,
            level: 5,
            verified: true,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
        };

        beforeEach(() => {
            cleanup();
        });

        it('shows user avatar and name when user prop is provided', () => {
            render(
                <RecipeCard
                    data={mockRecipe}
                    currentUser={mockUser}
                    user={mockRecipeUser}
                />
            );

            // Should show avatar and user name
            expect(screen.getByTestId('avatar')).toBeDefined();
            expect(screen.getByText('Recipe Author')).toBeDefined();

            // Should NOT show cooking time
            expect(screen.queryByText('30 min')).toBeNull();
        });

        it('shows cooking time when user prop is not provided', () => {
            render(
                <RecipeCard
                    data={mockRecipe}
                    currentUser={mockUser}
                />
            );

            // Should show cooking time
            expect(screen.getByText('30 min')).toBeDefined();

            // Should NOT show avatar or user name
            expect(screen.queryByTestId('avatar')).toBeNull();
            expect(screen.queryByText('Recipe Author')).toBeNull();
        });

        it('shows cooking time when user prop is null', () => {
            render(
                <RecipeCard
                    data={mockRecipe}
                    currentUser={mockUser}
                    user={null}
                />
            );

            // Should show cooking time
            expect(screen.getByText('30 min')).toBeDefined();

            // Should NOT show avatar
            expect(screen.queryByTestId('avatar')).toBeNull();
        });
    });

    describe('pinning logic', () => {
        it('renders PinButton when canPin is true', () => {
            cleanup();
            render(
                <RecipeCard
                    data={mockRecipe}
                    currentUser={mockUser}
                    canPin={true}
                />
            );
            expect(screen.getByTestId('pin-button')).toBeDefined();
        });

        it('does not render PinButton when canPin is false', () => {
            cleanup();
            render(
                <RecipeCard
                    data={mockRecipe}
                    currentUser={mockUser}
                    canPin={false}
                />
            );
            expect(screen.queryByTestId('pin-button')).toBeNull();
        });
    });
});
