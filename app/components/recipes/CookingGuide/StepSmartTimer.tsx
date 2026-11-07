'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    stepIndex: number;
    onTimerComplete?: () => void;
}

const QUICK_CUSTOM_SECONDS = [
    { label: '+1m', seconds: 60 },
    { label: '+5m', seconds: 300 },
    { label: '+10m', seconds: 600 },
];

export const StepSmartTimer: React.FC<StepSmartTimerProps> = ({
    presets,
    stepIndex,
    onTimerComplete,
}) => {
    const { t } = useTranslation();
    const [totalSeconds, setTotalSeconds] = useState<number | null>(null);
    const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isFinished, setIsFinished] = useState<boolean>(false);

    // Reset timer view when user changes step unless a timer is actively running
    useEffect(() => {
        if (!isRunning) {
            setTotalSeconds(null);
            setRemainingSeconds(0);
            setIsFinished(false);
        }
    }, [stepIndex, isRunning]);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    setIsRunning(false);
                    setIsFinished(true);
                    onTimerComplete?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, onTimerComplete]);

    const startPreset = useCallback((seconds: number) => {
        setTotalSeconds(seconds);
        setRemainingSeconds(seconds);
        setIsFinished(false);
        setIsRunning(true);
    }, []);

    const togglePause = useCallback(() => {
        if (isFinished && totalSeconds) {
            setRemainingSeconds(totalSeconds);
            setIsFinished(false);
            setIsRunning(true);
            return;
        }
        setIsRunning((prev) => !prev);
    }, [isFinished, totalSeconds]);

    const adjustTime = useCallback((deltaSeconds: number) => {
        setRemainingSeconds((prev) => {
            const next = Math.max(5, prev + deltaSeconds);
            setTotalSeconds((currTotal) =>
                currTotal ? Math.max(currTotal, next) : next
            );
            setIsFinished(false);
            return next;
        });
    }, []);

    const resetTimer = useCallback(() => {
        if (totalSeconds) {
            setRemainingSeconds(totalSeconds);
            setIsRunning(false);
            setIsFinished(false);
        }
    }, [totalSeconds]);

    const dismissTimer = useCallback(() => {
        setIsRunning(false);
        setIsFinished(false);
        setTotalSeconds(null);
        setRemainingSeconds(0);
    }, []);

    const progress =
        totalSeconds && totalSeconds > 0
            ? Math.min(1, Math.max(0, remainingSeconds / totalSeconds))
            : 0;
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div
            className="mt-5 flex flex-col items-center gap-3"
            data-testid="step-smart-timer"
        >
            {/* Active Timer Display */}
            {totalSeconds !== null ? (
                <div
                    className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-4 py-3 shadow-xs transition-all duration-300 sm:px-5 ${
                        isFinished
                            ? 'border-green-450 bg-green-450/20 animate-pulse text-neutral-900 dark:text-white'
                            : 'border-neutral-200/80 bg-neutral-50/90 text-neutral-900 dark:border-neutral-700/80 dark:bg-neutral-800/80 dark:text-white'
                    }`}
                    data-testid="active-step-timer"
                >
                    <div className="flex items-center gap-3">
                        {/* Circular SVG Progress Ring */}
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
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <button
                                type="button"
                                onClick={togglePause}
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
                                                      defaultValue:
                                                          'Timer running',
                                                  })
                                              )
                                            : String(
                                                  t('guide_timer_paused', {
                                                      defaultValue:
                                                          'Timer paused',
                                                  })
                                              )}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timer Controls (-1m, +1m, Reset, Close) */}
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => adjustTime(-60)}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200/80 bg-white text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            title="-1 min"
                            aria-label="-1 min"
                            data-testid="timer-minus-btn"
                        >
                            <FiMinus size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={() => adjustTime(60)}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200/80 bg-white text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            title="+1 min"
                            aria-label="+1 min"
                            data-testid="timer-plus-btn"
                        >
                            <FiPlus size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={resetTimer}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200/80 bg-white text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
                            onClick={dismissTimer}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-200/60 hover:text-neutral-700 dark:hover:bg-neutral-700/60 dark:hover:text-neutral-200"
                            title={String(
                                t('close', { defaultValue: 'Close' })
                            )}
                            aria-label={String(
                                t('close', { defaultValue: 'Close' })
                            )}
                            data-testid="timer-dismiss-btn"
                        >
                            <FiX size={15} />
                        </button>
                    </div>
                </div>
            ) : (
                /* Preset & Quick Timer Triggers */
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {presets.map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => startPreset(preset.seconds)}
                            className="border-green-450/50 bg-green-450 hover:bg-green-450/90 flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold text-neutral-900 shadow-xs transition-transform duration-200 hover:scale-102"
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

                    {/* Quick custom timer pills */}
                    <div className="flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-2.5 py-1 dark:border-neutral-800 dark:bg-neutral-800/60">
                        <FiClock
                            size={12}
                            className="text-neutral-400 dark:text-neutral-500"
                        />
                        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
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
                                className="cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-semibold text-neutral-700 transition hover:bg-neutral-200/70 dark:text-neutral-300 dark:hover:bg-neutral-700"
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
