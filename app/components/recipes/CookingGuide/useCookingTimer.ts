'use client';

import { useReducer, useEffect, useCallback } from 'react';

export interface TimerState {
    totalSeconds: number | null;
    remainingSeconds: number;
    endAt: number | null;
    isRunning: boolean;
    isFinished: boolean;
}

export type TimerAction =
    | { type: 'START'; seconds: number; now: number }
    | { type: 'TICK'; now: number }
    | { type: 'TOGGLE_PAUSE'; now: number }
    | { type: 'ADJUST'; deltaSeconds: number; now: number }
    | { type: 'RESET' }
    | { type: 'DISMISS' };

export const INITIAL_TIMER_STATE: TimerState = {
    totalSeconds: null,
    remainingSeconds: 0,
    endAt: null,
    isRunning: false,
    isFinished: false,
};

export function timerReducer(
    state: TimerState,
    action: TimerAction
): TimerState {
    switch (action.type) {
        case 'START':
            return {
                totalSeconds: action.seconds,
                remainingSeconds: action.seconds,
                endAt: action.now + action.seconds * 1000,
                isRunning: true,
                isFinished: false,
            };
        case 'TICK': {
            if (!state.isRunning || state.endAt === null) {
                return state;
            }
            const nextRemaining = Math.max(
                0,
                Math.round((state.endAt - action.now) / 1000)
            );
            if (nextRemaining <= 0) {
                return {
                    ...state,
                    remainingSeconds: 0,
                    endAt: null,
                    isRunning: false,
                    isFinished: true,
                };
            }
            return {
                ...state,
                remainingSeconds: nextRemaining,
            };
        }
        case 'TOGGLE_PAUSE': {
            if (state.isFinished && state.totalSeconds) {
                return {
                    ...state,
                    remainingSeconds: state.totalSeconds,
                    endAt: action.now + state.totalSeconds * 1000,
                    isFinished: false,
                    isRunning: true,
                };
            }
            if (state.isRunning) {
                const remaining =
                    state.endAt !== null
                        ? Math.max(
                              1,
                              Math.round((state.endAt - action.now) / 1000)
                          )
                        : state.remainingSeconds;
                return {
                    ...state,
                    remainingSeconds: remaining,
                    endAt: null,
                    isRunning: false,
                };
            }
            return {
                ...state,
                endAt: action.now + state.remainingSeconds * 1000,
                isRunning: true,
            };
        }
        case 'ADJUST': {
            const baseRemaining =
                state.isRunning && state.endAt !== null
                    ? Math.max(0, Math.round((state.endAt - action.now) / 1000))
                    : state.remainingSeconds;
            const nextRemaining = Math.max(
                5,
                baseRemaining + action.deltaSeconds
            );
            return {
                ...state,
                remainingSeconds: nextRemaining,
                totalSeconds: state.totalSeconds ?? nextRemaining,
                endAt: state.isRunning
                    ? action.now + nextRemaining * 1000
                    : null,
                isFinished: false,
            };
        }
        case 'RESET':
            if (!state.totalSeconds) return state;
            return {
                ...state,
                remainingSeconds: state.totalSeconds,
                endAt: null,
                isRunning: false,
                isFinished: false,
            };
        case 'DISMISS':
            return INITIAL_TIMER_STATE;
        default:
            return state;
    }
}

export interface CookingTimerController {
    state: TimerState;
    start: (seconds: number) => void;
    togglePause: () => void;
    adjust: (deltaSeconds: number) => void;
    reset: () => void;
    dismiss: () => void;
}

export function useCookingTimer(
    onTimerComplete?: () => void
): CookingTimerController {
    const [state, dispatch] = useReducer(timerReducer, INITIAL_TIMER_STATE);

    useEffect(() => {
        if (!state.isRunning) return;

        const tick = () => {
            dispatch({ type: 'TICK', now: Date.now() });
        };

        const interval = setInterval(tick, 1000);

        const handleVisibilityChange = () => {
            if (
                typeof document !== 'undefined' &&
                document.visibilityState === 'visible'
            ) {
                tick();
            }
        };

        if (typeof document !== 'undefined') {
            document.addEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        }

        return () => {
            clearInterval(interval);
            if (typeof document !== 'undefined') {
                document.removeEventListener(
                    'visibilitychange',
                    handleVisibilityChange
                );
            }
        };
    }, [state.isRunning]);

    useEffect(() => {
        if (state.isFinished) {
            onTimerComplete?.();
        }
    }, [state.isFinished, onTimerComplete]);

    const start = useCallback((seconds: number) => {
        dispatch({ type: 'START', seconds, now: Date.now() });
    }, []);

    const togglePause = useCallback(() => {
        dispatch({ type: 'TOGGLE_PAUSE', now: Date.now() });
    }, []);

    const adjust = useCallback((deltaSeconds: number) => {
        dispatch({ type: 'ADJUST', deltaSeconds, now: Date.now() });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    const dismiss = useCallback(() => {
        dispatch({ type: 'DISMISS' });
    }, []);

    return {
        state,
        start,
        togglePause,
        adjust,
        reset,
        dismiss,
    };
}
