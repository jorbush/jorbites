'use client';

import React, { useReducer, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiClock,
    FiPlay,
    FiPause,
    FiRotateCcw,
    FiPlus,
    FiMinus,
    FiX,
    FiBell,
} from 'react-icons/fi';
import {
    StepTimerPreset,
    formatTimerDisplay,
} from '@/app/utils/stepGuideUtils';

interface StepSmartTimerProps {
    presets: StepTimerPreset[];
    onTimerComplete?: () => void;
}

interface TimerState {
    totalSeconds: number | null;
    remainingSeconds: number;
    isRunning: boolean;
    isFinished: boolean;
}

type TimerAction =
    | { type: 'START'; seconds: number }
    | { type: 'TICK' }
    | { type: 'TOGGLE_PAUSE' }
    | { type: 'ADJUST'; deltaSeconds: number }
    | { type: 'RESET' }
    | { type: 'DISMISS' };

const INITIAL_TIMER_STATE: TimerState = {
    totalSeconds: null,
    remainingSeconds: 0,
    isRunning: false,
    isFinished: false,
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
    switch (action.type) {
        case 'START':
            return {
                totalSeconds: action.seconds,
                remainingSeconds: action.seconds,
                isRunning: true,
                isFinished: false,
            };
        case 'TICK': {
            if (state.remainingSeconds <= 1) {
                return {
                    ...state,
                    remainingSeconds: 0,
                    isRunning: false,
                    isFinished: true,
                };
            }
            return {
                ...state,
                remainingSeconds: state.remainingSeconds - 1,
            };
        }
        case 'TOGGLE_PAUSE': {
            if (state.isFinished && state.totalSeconds) {
                return {
                    ...state,
                    remainingSeconds: state.totalSeconds,
                    isFinished: false,
                    isRunning: true,
                };
            }
            return {
                ...state,
                isRunning: !state.isRunning,
            };
        }
        case 'ADJUST': {
            const nextRemaining = Math.max(
                5,
                state.remainingSeconds + action.deltaSeconds
            );
            const nextTotal = state.totalSeconds
                ? Math.max(state.totalSeconds, nextRemaining)
                : nextRemaining;
            return {
                ...state,
                remainingSeconds: nextRemaining,
                totalSeconds: nextTotal,
                isFinished: false,
            };
        }
        case 'RESET':
            if (!state.totalSeconds) return state;
            return {
                ...state,
                remainingSeconds: state.totalSeconds,
                isRunning: false,
                isFinished: false,
            };
        case 'DISMISS':
            return INITIAL_TIMER_STATE;
        default:
            return state;
    }
}

const QUICK_CUSTOM_SECONDS = [
    { label: '+1m', seconds: 60 },
    { label: '+5m', seconds: 300 },
    { label: '+10m', seconds: 600 },
];

interface ActiveTimerCardProps {
    totalSeconds: number;
    remainingSeconds: number;
    isRunning: boolean;
    isFinished: boolean;
    onTogglePause: () => void;
    onAdjust: (delta: number) => void;
    onReset: () => void;
    onDismiss: () => void;
}

const ActiveTimerCard: React.FC<ActiveTimerCardProps> = ({
    totalSeconds,
    remainingSeconds,
    isRunning,
    isFinished,
    onTogglePause,
    onAdjust,
    onReset,
    onDismiss,
}) => {
    const { t } = useTranslation();
    const progress =
        totalSeconds > 0
            ? Math.min(1, Math.max(0, remainingSeconds / totalSeconds))
            : 0;
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div
            className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-4 py-3 shadow-xs transition-colors duration-300 sm:px-5 ${
                isFinished
                    ? 'border-green-450 bg-green-450/20 animate-pulse text-neutral-900 dark:text-white'
                    : 'border-neutral-200/80 bg-neutral-50/90 text-neutral-900 dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:text-white'
            }`}
            data-testid="active-step-timer"
        >
            <div className="flex items-center gap-3">
                <div className="relative flex size-14 shrink-0 items-center justify-center">
                    <svg
                        className="-rotate-90 transform"
                        width="54"
                        height="54"
                        viewBox="0 0 54 54"
                    >
                        <circle
                            cx="27"
                            cy="27"
                            r={radius}
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-neutral-200 dark:text-neutral-700"
                        />
                        <circle
                            cx="27"
                            cy="27"
                            r={radius}
                            fill="transparent"
                            stroke="#C5F0A4"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </svg>
                    <button
                        type="button"
                        onClick={onTogglePause}
                        className="bg-green-450 absolute flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-950 shadow-2xs transition-transform hover:scale-102"
                        aria-label={String(
                            isRunning
                                ? t('guide_timer_pause', {
                                      defaultValue: 'Pause timer',
                                  })
                                : t('guide_timer_resume', {
                                      defaultValue: 'Start timer',
                                  })
                        )}
                        data-testid="timer-play-pause-btn"
                    >
                        {isRunning ? (
                            <FiPause size={15} />
                        ) : (
                            <FiPlay
                                size={15}
                                className="ml-0.5"
                            />
                        )}
                    </button>
                </div>

                <div>
                    <div
                        className="font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl"
                        data-testid="timer-countdown-display"
                    >
                        {formatTimerDisplay(remainingSeconds)}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {isFinished ? (
                            <span className="dark:text-green-450 flex items-center gap-1 font-semibold text-neutral-900">
                                <FiBell size={12} />
                                {String(
                                    t('guide_timer_finished', {
                                        defaultValue: 'Timer complete!',
                                    })
                                )}
                            </span>
                        ) : (
                            <span>
                                {isRunning
                                    ? String(
                                          t('guide_timer_running', {
                                              defaultValue: 'Timer running',
                                          })
                                      )
                                    : String(
                                          t('guide_timer_paused', {
                                              defaultValue: 'Timer paused',
                                          })
                                      )}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onAdjust(-60)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200/80 bg-white text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    title="-1 min"
                    aria-label="-1 min"
                    data-testid="timer-minus-btn"
                >
                    <FiMinus size={13} />
                </button>
                <button
                    type="button"
                    onClick={() => onAdjust(60)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200/80 bg-white text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    title="+1 min"
                    aria-label="+1 min"
                    data-testid="timer-plus-btn"
                >
                    <FiPlus size={13} />
                </button>
                <button
                    type="button"
                    onClick={onReset}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200/80 bg-white text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    title={String(
                        t('reset_checklist', { defaultValue: 'Reset' })
                    )}
                    aria-label={String(
                        t('reset_checklist', { defaultValue: 'Reset' })
                    )}
                    data-testid="timer-reset-btn"
                >
                    <FiRotateCcw size={13} />
                </button>
                <button
                    type="button"
                    onClick={onDismiss}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-200/60 hover:text-neutral-700 dark:hover:bg-neutral-700/60 dark:hover:text-neutral-200"
                    title={String(t('close', { defaultValue: 'Close' }))}
                    aria-label={String(t('close', { defaultValue: 'Close' }))}
                    data-testid="timer-dismiss-btn"
                >
                    <FiX size={15} />
                </button>
            </div>
        </div>
    );
};

export const StepSmartTimer: React.FC<StepSmartTimerProps> = ({
    presets,
    onTimerComplete,
}) => {
    const { t } = useTranslation();
    const [state, dispatch] = useReducer(timerReducer, INITIAL_TIMER_STATE);

    useEffect(() => {
        if (!state.isRunning) return;
        const interval = setInterval(() => {
            dispatch({ type: 'TICK' });
        }, 1000);
        return () => clearInterval(interval);
    }, [state.isRunning]);

    useEffect(() => {
        if (state.isFinished) {
            onTimerComplete?.();
        }
    }, [state.isFinished, onTimerComplete]);

    const startPreset = useCallback((seconds: number) => {
        dispatch({ type: 'START', seconds });
    }, []);

    return (
        <div
            className="mt-3 flex flex-col items-center gap-2.5 md:mt-5 md:gap-3"
            data-testid="step-smart-timer"
        >
            {state.totalSeconds !== null ? (
                <ActiveTimerCard
                    totalSeconds={state.totalSeconds}
                    remainingSeconds={state.remainingSeconds}
                    isRunning={state.isRunning}
                    isFinished={state.isFinished}
                    onTogglePause={() => dispatch({ type: 'TOGGLE_PAUSE' })}
                    onAdjust={(deltaSeconds) =>
                        dispatch({ type: 'ADJUST', deltaSeconds })
                    }
                    onReset={() => dispatch({ type: 'RESET' })}
                    onDismiss={() => dispatch({ type: 'DISMISS' })}
                />
            ) : (
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {presets.map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => startPreset(preset.seconds)}
                            className="border-green-450/50 bg-green-450 hover:bg-green-450/90 flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-neutral-900 shadow-xs transition-transform duration-200 hover:scale-102 md:px-4 md:py-2"
                            data-testid={`smart-timer-preset-${preset.seconds}`}
                        >
                            <FiClock size={14} />
                            <span>
                                {String(
                                    t('guide_start_timer_for', {
                                        time: preset.label,
                                        defaultValue: `Start ${preset.label} timer`,
                                    })
                                )}
                            </span>
                        </button>
                    ))}

                    <div className="flex items-center gap-1 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-2.5 py-1 whitespace-nowrap md:gap-1.5 dark:border-neutral-800 dark:bg-neutral-800/60">
                        <FiClock
                            size={12}
                            className="shrink-0 text-neutral-400 dark:text-neutral-500"
                        />
                        <span className="hidden text-[11px] font-medium text-neutral-500 md:inline dark:text-neutral-400">
                            {String(
                                t('guide_quick_timer', {
                                    defaultValue: 'Quick timer:',
                                })
                            )}
                        </span>
                        {QUICK_CUSTOM_SECONDS.map((item) => (
                            <button
                                key={item.seconds}
                                type="button"
                                onClick={() => startPreset(item.seconds)}
                                className="cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-200/70 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                data-testid={`quick-timer-${item.seconds}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StepSmartTimer;
