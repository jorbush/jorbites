import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeModalTopActions from '@/app/components/modals/recipe-steps/RecipeModalTopActions';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/components/utils/Tooltip', () => ({
    default: ({ children }: any) => <>{children}</>,
}));

describe('RecipeModalTopActions', () => {
    const mockOnCopyInviteLink = vi.fn();
    const mockOnSaveDraft = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders both buttons correctly', () => {
        render(
            <RecipeModalTopActions
                onCopyInviteLink={mockOnCopyInviteLink}
                onSaveDraft={mockOnSaveDraft}
            />
        );

        expect(screen.getByTestId('copy-co-cook-link-button')).toBeDefined();
        expect(screen.getByTestId('load-draft-button')).toBeDefined();
    });

    it('calls onCopyInviteLink when copy button is clicked', () => {
        render(
            <RecipeModalTopActions
                onCopyInviteLink={mockOnCopyInviteLink}
                onSaveDraft={mockOnSaveDraft}
            />
        );

        fireEvent.click(screen.getByTestId('copy-co-cook-link-button'));
        expect(mockOnCopyInviteLink).toHaveBeenCalledTimes(1);
    });

    it('calls onSaveDraft when save draft button is clicked', () => {
        render(
            <RecipeModalTopActions
                onCopyInviteLink={mockOnCopyInviteLink}
                onSaveDraft={mockOnSaveDraft}
            />
        );

        fireEvent.click(screen.getByTestId('load-draft-button'));
        expect(mockOnSaveDraft).toHaveBeenCalledTimes(1);
    });
});
