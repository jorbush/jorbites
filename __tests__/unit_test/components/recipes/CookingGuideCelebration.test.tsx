import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CookingGuideCelebration from '@/app/components/recipes/CookingGuide/CookingGuideCelebration';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { defaultValue?: string }) =>
            options?.defaultValue || key,
    }),
}));

const mockCooksnapOpen = vi.fn();
vi.mock('@/app/hooks/useCooksnapModal', () => ({
    default: () => ({
        onOpen: mockCooksnapOpen,
    }),
}));

vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

describe('CookingGuideCelebration', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('shows full completion message when all steps are completed', () => {
        const onRestart = vi.fn();
        const onClose = vi.fn();

        render(
            <CookingGuideCelebration
                recipeId="rec-10"
                recipeTitle="Tiramisu"
                totalSteps={4}
                completedCount={4}
                onRestart={onRestart}
                onClose={onClose}
            />
        );

        expect(screen.getByText('Bon Appétit! Recipe Complete!')).toBeDefined();
        expect(screen.getByText('4/4 steps')).toBeDefined();

        fireEvent.click(screen.getByTestId('guide-restart-btn'));
        expect(onRestart).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId('guide-done-btn'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('shows partial completion message when some steps were skipped', () => {
        render(
            <CookingGuideCelebration
                recipeId="rec-10"
                recipeTitle="Tiramisu"
                totalSteps={5}
                completedCount={2}
                onRestart={vi.fn()}
                onClose={vi.fn()}
            />
        );

        expect(screen.getByText('Bon Appétit! Guide Finished!')).toBeDefined();
        expect(screen.getByText('2/5 steps')).toBeDefined();
    });
});
