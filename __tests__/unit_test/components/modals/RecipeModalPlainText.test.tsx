import {
    render,
    screen,
    fireEvent,
    act,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeModal from '@/app/components/modals/RecipeModal';
import React from 'react';
import axios from 'axios';
import '@testing-library/jest-dom/vitest';

// Mock the custom hooks
vi.mock('@/app/hooks/useRecipeModal', () => ({
    default: vi.fn(() => ({
        isOpen: true,
        onClose: vi.fn(),
        isEditMode: false,
    })),
}));

vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key,
    })),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

vi.mock('axios');

describe('RecipeModal Plain Text Bugfix', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.mocked(axios.get).mockResolvedValue({ data: null });
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    const advanceStep = async () => {
        const nextButton = screen.getByTestId('modal-action-button');
        await act(async () => {
            fireEvent.click(nextButton);
        });
        await act(async () => {
            vi.advanceTimersByTime(2100);
        });
    };

    it('should NOT allow clicking Next when in plain text mode in Ingredients step', async () => {
        const { container } = render(<RecipeModal />);

        await act(async () => {
            await Promise.resolve();
        });

        // CATEGORY -> DESCRIPTION
        fireEvent.click(screen.getByText('fruits'));
        await advanceStep();

        // DESCRIPTION step
        const titleInput = container.querySelector('[data-cy="recipe-title"]');
        const descInput = container.querySelector('[data-cy="recipe-description"]');
        if (!titleInput || !descInput) throw new Error('Inputs not found');
        await act(async () => {
            fireEvent.change(titleInput, { target: { value: 'Test' } });
            fireEvent.change(descInput, { target: { value: 'Test' } });
        });

        // To INGREDIENTS
        await advanceStep();
        expect(screen.getByText('title_ingredients')).toBeDefined();

        // Toggle to plain text mode
        fireEvent.click(screen.getByRole('switch'));

        // VERIFY: Disabled
        const nextButton = screen.getByTestId('modal-action-button');
        expect(nextButton).toBeDisabled();

        // Click Apply
        const textarea = container.querySelector('[data-cy="ingredients-textarea"]');
        if (!textarea) throw new Error('Textarea not found');
        fireEvent.change(textarea, { target: { value: 'Ing 1' } });
        await act(async () => {
            fireEvent.click(screen.getByTestId('apply-ingredients-button'));
        });

        // VERIFY: Enabled
        expect(nextButton).not.toBeDisabled();
    });
});
