import React from 'react';
import {
    render,
    screen,
    fireEvent,
    cleanup,
    act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StepSmartTimer from '@/app/components/recipes/CookingGuide/StepSmartTimer';
import {
    timerReducer,
    INITIAL_TIMER_STATE,
} from '@/app/components/recipes/CookingGuide/useCookingTimer';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { defaultValue?: string }) =>
            options?.defaultValue || key,
    }),
}));

describe('StepSmartTimer & timerReducer', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('calculates remaining seconds from endAt timestamp without drift when backgrounded', () => {
        const started = timerReducer(INITIAL_TIMER_STATE, {
            type: 'START',
            seconds: 120,
            now: 1000,
        });
        expect(started.endAt).toBe(121000);
        expect(started.remainingSeconds).toBe(120);

        // Simulate 45 seconds passing in background before next tick
        const afterBackgroundJump = timerReducer(started, {
            type: 'TICK',
            now: 46000,
        });
        expect(afterBackgroundJump.remainingSeconds).toBe(75);
        expect(afterBackgroundJump.isRunning).toBe(true);

        // Simulate reaching endAt
        const finished = timerReducer(afterBackgroundJump, {
            type: 'TICK',
            now: 121000,
        });
        expect(finished.remainingSeconds).toBe(0);
        expect(finished.isRunning).toBe(false);
        expect(finished.isFinished).toBe(true);
    });

    it('starts preset timer, pauses/resumes, adjusts +/-1m, resets, dismissal, and fires onTimerComplete', () => {
        const onTimerComplete = vi.fn();
        render(
            <StepSmartTimer
                presets={[{ id: 'p-10', label: '10 s', seconds: 10 }]}
                onTimerComplete={onTimerComplete}
            />
        );

        const presetBtn = screen.getByTestId('smart-timer-preset-10');
        fireEvent.click(presetBtn);

        expect(screen.getByTestId('timer-countdown-display').textContent).toBe(
            '00:10'
        );

        // Pause and resume
        const playPauseBtn = screen.getByTestId('timer-play-pause-btn');
        fireEvent.click(playPauseBtn);
        expect(screen.getByText('Timer paused')).toBeDefined();
        fireEvent.click(playPauseBtn);
        expect(screen.getByText('Timer running')).toBeDefined();

        // Adjust +1m (60s) -> 01:10, then -1m -> 00:10
        fireEvent.click(screen.getByTestId('timer-plus-btn'));
        expect(screen.getByTestId('timer-countdown-display').textContent).toBe(
            '01:10'
        );
        fireEvent.click(screen.getByTestId('timer-minus-btn'));
        expect(screen.getByTestId('timer-countdown-display').textContent).toBe(
            '00:10'
        );

        // Advance 10 seconds to finish
        act(() => {
            vi.advanceTimersByTime(10000);
        });
        expect(screen.getByTestId('timer-countdown-display').textContent).toBe(
            '00:00'
        );
        expect(screen.getByText('Timer complete!')).toBeDefined();
        expect(onTimerComplete).toHaveBeenCalledTimes(1);

        // Reset restores initial preset duration
        fireEvent.click(screen.getByTestId('timer-reset-btn'));
        expect(screen.getByTestId('timer-countdown-display').textContent).toBe(
            '00:10'
        );

        // Dismiss returns to preset buttons
        fireEvent.click(screen.getByTestId('timer-dismiss-btn'));
        expect(screen.queryByTestId('active-step-timer')).toBeNull();
        expect(screen.getByTestId('quick-timer-60')).toBeDefined();
    });
});
