import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CookingGuideHeader from '@/app/components/recipes/CookingGuide/CookingGuideHeader';
import CookingGuideFooter from '@/app/components/recipes/CookingGuide/CookingGuideFooter';
import { CookingTimerController } from '@/app/components/recipes/CookingGuide/useCookingTimer';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { defaultValue?: string }) =>
            options?.defaultValue || key,
    }),
}));

describe('CookingGuideHeader & CookingGuideFooter', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders header timer badge when timer is active and handles progress segment clicks', () => {
        const onGoToStep = vi.fn();
        const togglePause = vi.fn();
        const mockTimer: CookingTimerController = {
            state: {
                totalSeconds: 300,
                remainingSeconds: 185,
                endAt: Date.now() + 185000,
                isRunning: true,
                isFinished: false,
            },
            start: vi.fn(),
            togglePause,
            adjust: vi.fn(),
            reset: vi.fn(),
            dismiss: vi.fn(),
        };

        render(
            <CookingGuideHeader
                recipeTitle="Paella Valenciana"
                currentIndex={0}
                steps={['Step A', 'Step B']}
                completedStepsCount={1}
                isCelebration={false}
                isMusicPlaying={true}
                musicVibe="lofi"
                isSpeaking={false}
                ingredientsCount={4}
                timer={mockTimer}
                isStepCompleted={(idx) => idx === 0}
                onToggleMusic={vi.fn()}
                onSelectVibe={vi.fn()}
                onReadAloud={vi.fn()}
                onToggleIngredients={vi.fn()}
                onGoToStep={onGoToStep}
                onClose={vi.fn()}
            />
        );

        const headerBadge = screen.getByTestId('header-active-timer-badge');
        expect(headerBadge.textContent).toContain('03:05');

        fireEvent.click(headerBadge);
        expect(togglePause).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId('guide-progress-segment-1'));
        expect(onGoToStep).toHaveBeenCalledWith(1);
    });

    it('disables Previous button on first step and hides Next skip button on last step in CookingGuideFooter', () => {
        const onPrevious = vi.fn();
        const onNext = vi.fn();
        const onCompleteAndNext = vi.fn();

        const { rerender } = render(
            <CookingGuideFooter
                currentIndex={0}
                totalSteps={2}
                progressPercent={50}
                onPrevious={onPrevious}
                onNext={onNext}
                onCompleteAndNext={onCompleteAndNext}
            />
        );

        expect(
            (screen.getByTestId('guide-prev-btn') as HTMLButtonElement).disabled
        ).toBe(true);
        expect(screen.getByTestId('guide-skip-next-btn')).toBeDefined();

        rerender(
            <CookingGuideFooter
                currentIndex={1}
                totalSteps={2}
                progressPercent={100}
                onPrevious={onPrevious}
                onNext={onNext}
                onCompleteAndNext={onCompleteAndNext}
            />
        );

        expect(
            (screen.getByTestId('guide-prev-btn') as HTMLButtonElement).disabled
        ).toBe(false);
        expect(screen.queryByTestId('guide-skip-next-btn')).toBeNull();
        expect(screen.getByText('Finish Cooking')).toBeDefined();
    });
});
