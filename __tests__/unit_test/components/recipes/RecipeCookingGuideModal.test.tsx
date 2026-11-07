import React from 'react';
import {
    render,
    screen,
    fireEvent,
    cleanup,
    act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeCookingGuideModal from '@/app/components/recipes/CookingGuide/RecipeCookingGuideModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { defaultValue?: string }) =>
            options?.defaultValue || key,
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
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

describe('RecipeCookingGuideModal', () => {
    const mockSteps = [
        'Preheat oven to 180°C for 10 minutes',
        'Whisk eggs and sugar together',
        'Garnish and serve warm',
    ];
    const mockIngredients = ['200g Flour', '3 Eggs'];

    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('returns null when isOpen is false', () => {
        render(
            <RecipeCookingGuideModal
                isOpen={false}
                onClose={vi.fn()}
                steps={mockSteps}
                isStepCompleted={() => false}
                onToggleStep={vi.fn()}
                completedStepsCount={0}
            />
        );
        expect(screen.queryByTestId('recipe-cooking-guide-modal')).toBeNull();
    });

    it('renders active step, smart timer preset, and navigates steps', () => {
        const onClose = vi.fn();
        const onToggleStep = vi.fn();

        render(
            <RecipeCookingGuideModal
                isOpen={true}
                onClose={onClose}
                steps={mockSteps}
                ingredients={mockIngredients}
                recipeId="rec-123"
                recipeTitle="Classic Sponge Cake"
                isStepCompleted={() => false}
                onToggleStep={onToggleStep}
                completedStepsCount={0}
            />
        );

        expect(screen.getByTestId('recipe-cooking-guide-modal')).toBeDefined();
        expect(screen.getByText('Classic Sponge Cake')).toBeDefined();
        expect(
            screen.getByText('Preheat oven to 180°C for 10 minutes')
        ).toBeDefined();

        // Smart timer preset detected for 10 minutes (600s)
        const timerPresetBtn = screen.getByTestId('smart-timer-preset-600');
        expect(timerPresetBtn).toBeDefined();

        // Start timer and advance 2 seconds
        fireEvent.click(timerPresetBtn);
        expect(screen.getByTestId('timer-countdown-display').textContent).toBe(
            '10:00'
        );
        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(screen.getByTestId('timer-countdown-display').textContent).toBe(
            '09:58'
        );

        // Navigate to Step 2 via Complete & Next
        const completeNextBtn = screen.getByTestId('guide-complete-next-btn');
        fireEvent.click(completeNextBtn);
        expect(onToggleStep).toHaveBeenCalledWith(0);
        expect(screen.getByText('Whisk eggs and sugar together')).toBeDefined();

        // Navigate to Step 3 via Next button
        const skipNextBtn = screen.getByTestId('guide-skip-next-btn');
        fireEvent.click(skipNextBtn);
        expect(screen.getByText('Garnish and serve warm')).toBeDefined();

        // Finish cooking on last step shows Celebration Finale
        fireEvent.click(screen.getByTestId('guide-complete-next-btn'));
        expect(screen.getByTestId('cooking-guide-celebration')).toBeDefined();

        // Clicking "I Made This!" opens Cooksnap modal and closes guide
        fireEvent.click(screen.getByTestId('guide-share-cooksnap-btn'));
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(mockCooksnapOpen).toHaveBeenCalledWith(
            'rec-123',
            'Classic Sponge Cake'
        );
    });

    it('opens and closes the quick-peek ingredients drawer and toggles music vibes', () => {
        const onClose = vi.fn();

        render(
            <RecipeCookingGuideModal
                isOpen={true}
                onClose={onClose}
                steps={mockSteps}
                ingredients={mockIngredients}
                recipeId="rec-123"
                isStepCompleted={() => false}
                onToggleStep={vi.fn()}
                completedStepsCount={0}
            />
        );

        // Toggle ingredients drawer
        fireEvent.click(screen.getByTestId('guide-ingredients-toggle-btn'));
        expect(
            screen.getByTestId('cooking-guide-ingredients-drawer')
        ).toBeDefined();
        expect(screen.getByText('200g Flour')).toBeDefined();

        // Close drawer via Escape key first before closing modal
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(
            screen.queryByTestId('cooking-guide-ingredients-drawer')
        ).toBeNull();
        expect(onClose).not.toHaveBeenCalled();

        // Switch music vibe and toggle music
        fireEvent.click(screen.getByTestId('guide-vibe-acoustic'));
        fireEvent.click(screen.getByTestId('guide-music-toggle-btn'));

        // Pressing Escape again closes the modal
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
