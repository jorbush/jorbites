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
        i18n: { language: 'es' },
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

    it('persists active timer across step changes and shows header mini-timer badge', () => {
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

        // Start 10 minute timer (600s) and advance 2 seconds
        fireEvent.click(screen.getByTestId('smart-timer-preset-600'));
        expect(screen.getByTestId('timer-countdown-display').textContent).toBe(
            '10:00'
        );
        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(screen.getByTestId('timer-countdown-display').textContent).toBe(
            '09:58'
        );
        expect(
            screen.getByTestId('header-active-timer-badge').textContent
        ).toContain('09:58');

        // Navigate to Step 2 via Complete & Next — timer must survive step transition!
        fireEvent.click(screen.getByTestId('guide-complete-next-btn'));
        expect(onToggleStep).toHaveBeenCalledWith(0);
        expect(screen.getByText('Whisk eggs and sugar together')).toBeDefined();
        expect(screen.getByTestId('timer-countdown-display').textContent).toBe(
            '09:58'
        );
        expect(
            screen.getByTestId('header-active-timer-badge').textContent
        ).toContain('09:58');

        // Advance another 3 seconds while on Step 2
        act(() => {
            vi.advanceTimersByTime(3000);
        });
        expect(screen.getByTestId('timer-countdown-display').textContent).toBe(
            '09:55'
        );

        // Navigate to Step 3 via Next button
        fireEvent.click(screen.getByTestId('guide-skip-next-btn'));
        expect(screen.getByText('Garnish and serve warm')).toBeDefined();

        // Finish cooking on last step shows Celebration Finale
        fireEvent.click(screen.getByTestId('guide-complete-next-btn'));
        expect(screen.getByTestId('cooking-guide-celebration')).toBeDefined();

        // Clicking "Review Steps" restarts at Step 1
        fireEvent.click(screen.getByTestId('guide-restart-btn'));
        expect(
            screen.getByText('Preheat oven to 180°C for 10 minutes')
        ).toBeDefined();

        // Jump to celebration again and share Cooksnap
        fireEvent.click(screen.getByTestId('guide-progress-segment-2'));
        fireEvent.click(screen.getByTestId('guide-complete-next-btn'));
        fireEvent.click(screen.getByTestId('guide-share-cooksnap-btn'));
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(mockCooksnapOpen).toHaveBeenCalledWith(
            'rec-123',
            'Classic Sponge Cake'
        );
    });

    it('supports keyboard shortcuts (ArrowRight, ArrowLeft, i, m, Escape) and speech language', () => {
        const onClose = vi.fn();
        const mockSpeak = vi.fn();
        const mockCancel = vi.fn();

        Object.defineProperty(window, 'speechSynthesis', {
            writable: true,
            configurable: true,
            value: {
                speak: mockSpeak,
                cancel: mockCancel,
            },
        });

        class MockUtterance {
            text: string;
            lang = '';
            onend: (() => void) | null = null;
            onerror: (() => void) | null = null;
            constructor(text: string) {
                this.text = text;
            }
        }
        Object.defineProperty(window, 'SpeechSynthesisUtterance', {
            writable: true,
            configurable: true,
            value: MockUtterance,
        });

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

        // ArrowRight advances to Step 2, ArrowLeft returns to Step 1
        fireEvent.keyDown(window, { key: 'ArrowRight' });
        expect(screen.getByText('Whisk eggs and sugar together')).toBeDefined();
        fireEvent.keyDown(window, { key: 'ArrowLeft' });
        expect(
            screen.getByText('Preheat oven to 180°C for 10 minutes')
        ).toBeDefined();

        // Read aloud uses Spanish locale from i18n
        fireEvent.click(screen.getByTestId('guide-read-aloud-btn'));
        expect(mockSpeak).toHaveBeenCalledTimes(1);
        expect(mockSpeak.mock.calls[0][0].lang).toBe('es-ES');

        // 'i' opens ingredients drawer, Escape closes drawer first
        fireEvent.keyDown(window, { key: 'i' });
        expect(
            screen.getByTestId('cooking-guide-ingredients-drawer')
        ).toBeDefined();
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(
            screen.queryByTestId('cooking-guide-ingredients-drawer')
        ).toBeNull();
        expect(onClose).not.toHaveBeenCalled();

        // 'm' toggles music preference and saves to localStorage
        fireEvent.keyDown(window, { key: 'm' });
        expect(localStorage.getItem('jorbites_cooking_guide_music')).toContain(
            '"isPlaying":false'
        );

        // Escape closes modal
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
