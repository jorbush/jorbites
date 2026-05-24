import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeBookButton from '@/app/components/profile/RecipeBookButton';
import useRecipeBookModal from '@/app/hooks/useRecipeBookModal';

// Mock useRecipeBookModal
vi.mock('@/app/hooks/useRecipeBookModal');

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('RecipeBookButton', () => {
    const defaultProps = {
        userId: 'user-123',
        userName: 'John Doe',
        userImage: 'https://example.com/avatar.png',
    };

    const mockOnOpen = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useRecipeBookModal).mockReturnValue({
            isOpen: false,
            userId: '',
            userName: '',
            userImage: null,
            onOpen: mockOnOpen,
            onClose: vi.fn(),
        } as any);
    });

    afterEach(() => {
        cleanup();
    });

    it('renders with book icon initially', () => {
        render(<RecipeBookButton {...defaultProps} />);

        expect(screen.getByTestId('book-icon')).toBeDefined();
    });

    it('opens the recipe book modal when clicked', () => {
        render(<RecipeBookButton {...defaultProps} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockOnOpen).toHaveBeenCalledWith(
            'user-123',
            'John Doe',
            'https://example.com/avatar.png'
        );
    });
});
