import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PinButton from '@/app/components/buttons/PinButton';
import { SafeUser } from '@/app/types';

let mockIsPinned = false;
let mockIsLoading = false;
const mockTogglePin = vi.fn();

vi.mock('@/app/hooks/usePin', () => ({
    default: () => ({
        isPinned: mockIsPinned,
        togglePin: mockTogglePin,
        isLoading: mockIsLoading,
    }),
}));

vi.mock('react-icons/bs', () => ({
    BsPinAngle: () => <div data-testid="pin-outline" />,
    BsPinAngleFill: () => <div data-testid="pin-filled" />,
}));

describe('<PinButton />', () => {
    const mockRecipeId = '123';
    const mockCurrentUser: SafeUser = {
        id: '456',
        name: 'Test User',
        email: null,
        emailVerified: null,
        image: null,
        hashedPassword: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favoriteIds: [],
        pinnedRecipeIds: [],
        emailNotifications: false,
        level: 0,
        verified: false,
    };

    beforeEach(() => {
        mockIsPinned = false;
        mockIsLoading = false;
        mockTogglePin.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders outline pin when not pinned', () => {
        mockIsPinned = false;
        render(
            <PinButton
                recipeId={mockRecipeId}
                currentUser={mockCurrentUser}
            />
        );
        expect(screen.getByTestId('pin-outline')).toBeDefined();
        expect(screen.queryByTestId('pin-filled')).toBeNull();
    });

    it('renders filled pin when pinned', () => {
        mockIsPinned = true;
        render(
            <PinButton
                recipeId={mockRecipeId}
                currentUser={mockCurrentUser}
            />
        );
        expect(screen.getByTestId('pin-filled')).toBeDefined();
        expect(screen.queryByTestId('pin-outline')).toBeNull();
    });

    it('calls togglePin when clicked', () => {
        mockIsPinned = false;
        render(
            <PinButton
                recipeId={mockRecipeId}
                currentUser={mockCurrentUser}
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockTogglePin).toHaveBeenCalled();
    });
});
