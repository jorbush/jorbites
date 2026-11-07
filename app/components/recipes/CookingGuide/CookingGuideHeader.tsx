'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiX,
    FiVolume2,
    FiVolumeX,
    FiMusic,
    FiList,
    FiPlay,
    FiClock,
    FiBell,
} from 'react-icons/fi';
import { MusicVibe } from '@/app/utils/cookingAudioEngine';
import { formatTimerDisplay } from '@/app/utils/stepGuideUtils';
import { CookingTimerController } from './useCookingTimer';

const VIBE_OPTIONS: {
    id: MusicVibe;
    labelKey: string;
    defaultLabel: string;
}[] = [
    {
        id: 'lofi',
        labelKey: 'guide_vibe_lofi',
        defaultLabel: 'Lo-Fi Kitchen',
    },
    {
        id: 'acoustic',
        labelKey: 'guide_vibe_acoustic',
        defaultLabel: 'Cozy Café',
    },
    { id: 'zen', labelKey: 'guide_vibe_zen', defaultLabel: 'Zen Chef' },
];

export interface CookingGuideHeaderProps {
    recipeTitle?: string;
    currentIndex: number;
    steps: string[];
    completedStepsCount: number;
    isCelebration: boolean;
    isMusicPlaying: boolean;
    musicVibe: MusicVibe;
    isSpeaking: boolean;
    ingredientsCount: number;
    timer?: CookingTimerController;
    isStepCompleted: (index: number) => boolean;
    onToggleMusic: () => void;
    onSelectVibe: (vibe: MusicVibe) => void;
    onReadAloud: () => void;
    onToggleIngredients: () => void;
    onGoToStep: (index: number) => void;
    onClose: () => void;
}

const HeaderTimerBadge: React.FC<{ timer: CookingTimerController }> = ({
    timer,
}) => {
    const { t } = useTranslation();
    const { state } = timer;
    if (state.totalSeconds === null) return null;

    return (
        <button
            type="button"
            onClick={timer.togglePause}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono text-xs font-bold tabular-nums transition-colors ${
                state.isFinished
                    ? 'border-green-450 bg-green-450 text-neutral-950 motion-safe:animate-pulse'
                    : state.isRunning
                      ? 'border-green-450/50 bg-green-450/20 dark:text-green-450 text-neutral-900'
                      : 'border-neutral-200/80 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
            aria-label={String(
                state.isRunning
                    ? t('guide_timer_pause', { defaultValue: 'Pause timer' })
                    : t('guide_timer_resume', { defaultValue: 'Start timer' })
            )}
            data-testid="header-active-timer-badge"
        >
            {state.isFinished ? <FiBell size={13} /> : <FiClock size={13} />}
            <span>{formatTimerDisplay(state.remainingSeconds)}</span>
        </button>
    );
};

export const CookingGuideHeader: React.FC<CookingGuideHeaderProps> = ({
    recipeTitle,
    currentIndex,
    steps,
    completedStepsCount,
    isCelebration,
    isMusicPlaying,
    musicVibe,
    isSpeaking,
    ingredientsCount,
    timer,
    isStepCompleted,
    onToggleMusic,
    onSelectVibe,
    onReadAloud,
    onToggleIngredients,
    onGoToStep,
    onClose,
}) => {
    const { t } = useTranslation();
    const seenSteps = new Map<string, number>();

    return (
        <header className="pwa-header-surface relative z-10 border-b border-neutral-200/80 bg-white/90 px-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-2.5 backdrop-blur-sm md:px-6 md:pt-[calc(1rem+env(safe-area-inset-top,0px))] md:pb-4 dark:border-neutral-800/80 dark:bg-neutral-900/85">
            <div
                aria-hidden="true"
                data-testid="guide-pwa-status-bar-shield"
                className="pwa-status-bar-shield"
            />
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 md:gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 md:gap-3">
                    <div className="border-green-450/50 bg-green-450 flex size-8 shrink-0 items-center justify-center rounded-xl border text-neutral-950 shadow-2xs md:size-9">
                        <FiPlay
                            size={15}
                            className="ml-0.5 fill-current"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-neutral-900 md:text-base dark:text-white">
                            {recipeTitle ||
                                String(
                                    t('guide_title_fallback', {
                                        defaultValue: 'Cooking Mode',
                                    })
                                )}
                        </p>
                        <p className="truncate text-[11px] text-neutral-500 md:text-xs dark:text-neutral-400">
                            {String(
                                t('guide_step_x_of_y', {
                                    current: currentIndex + 1,
                                    total: steps.length,
                                    defaultValue: `Step ${currentIndex + 1} of ${steps.length}`,
                                })
                            )}{' '}
                            · {completedStepsCount}/{steps.length}{' '}
                            {String(
                                t('guide_completed_short', {
                                    defaultValue: 'done',
                                })
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
                    {timer && <HeaderTimerBadge timer={timer} />}

                    <div className="flex items-center gap-1 rounded-full border border-neutral-200/80 bg-neutral-50/90 p-0.5 md:p-1 dark:border-neutral-700/70 dark:bg-neutral-800/80">
                        <button
                            type="button"
                            onClick={onToggleMusic}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors md:px-3 ${
                                isMusicPlaying
                                    ? 'border-green-450/50 bg-green-450 text-neutral-950 shadow-2xs'
                                    : 'text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-700'
                            }`}
                            aria-label={String(
                                isMusicPlaying
                                    ? t('guide_mute_music', {
                                          defaultValue: 'Pause music',
                                      })
                                    : t('guide_play_music', {
                                          defaultValue: 'Play music',
                                      })
                            )}
                            data-testid="guide-music-toggle-btn"
                        >
                            <FiMusic size={13} />
                            {isMusicPlaying && (
                                <span
                                    className="flex items-end gap-0.5"
                                    aria-hidden="true"
                                >
                                    <span className="h-2.5 w-0.5 rounded-full bg-neutral-950 motion-safe:animate-bounce" />
                                    <span
                                        className="h-3.5 w-0.5 rounded-full bg-neutral-950 motion-safe:animate-bounce"
                                        style={{ animationDelay: '150ms' }}
                                    />
                                    <span
                                        className="h-2 w-0.5 rounded-full bg-neutral-950 motion-safe:animate-bounce"
                                        style={{ animationDelay: '300ms' }}
                                    />
                                </span>
                            )}
                        </button>

                        <div className="hidden items-center gap-0.5 md:flex">
                            {VIBE_OPTIONS.map((vibe) => (
                                <button
                                    key={vibe.id}
                                    type="button"
                                    onClick={() => onSelectVibe(vibe.id)}
                                    className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors ${
                                        musicVibe === vibe.id
                                            ? 'bg-neutral-900 font-semibold text-white dark:bg-white dark:text-neutral-900'
                                            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                                    }`}
                                    data-testid={`guide-vibe-${vibe.id}`}
                                >
                                    {String(
                                        t(vibe.labelKey, {
                                            defaultValue: vibe.defaultLabel,
                                        })
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onReadAloud}
                        className={`flex size-8 cursor-pointer items-center justify-center rounded-full border transition-colors md:size-9 ${
                            isSpeaking
                                ? 'border-green-450 bg-green-450 text-neutral-950'
                                : 'border-neutral-200/80 bg-neutral-50/80 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-700'
                        }`}
                        title={String(
                            t('guide_read_aloud', {
                                defaultValue: 'Read step aloud',
                            })
                        )}
                        aria-label={String(
                            t('guide_read_aloud', {
                                defaultValue: 'Read step aloud',
                            })
                        )}
                        data-testid="guide-read-aloud-btn"
                    >
                        {isSpeaking ? (
                            <FiVolumeX size={15} />
                        ) : (
                            <FiVolume2 size={15} />
                        )}
                    </button>

                    {ingredientsCount > 0 && (
                        <button
                            type="button"
                            onClick={onToggleIngredients}
                            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 md:px-3.5 md:py-2 dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-700"
                            data-testid="guide-ingredients-toggle-btn"
                        >
                            <FiList size={14} />
                            <span className="hidden md:inline">
                                {String(
                                    t('ingredients', {
                                        defaultValue: 'Ingredients',
                                    })
                                )}
                            </span>
                            <span className="border-green-450/40 bg-green-450/20 dark:text-green-450 rounded-full border px-1.5 py-0.5 text-[10px] font-bold text-neutral-900">
                                {ingredientsCount}
                            </span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 bg-neutral-100 text-neutral-700 transition-colors hover:bg-neutral-200 md:size-9 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                        aria-label={String(
                            t('close', { defaultValue: 'Close' })
                        )}
                        data-testid="guide-close-btn"
                        data-cy="guide-close-btn"
                    >
                        <FiX size={17} />
                    </button>
                </div>
            </div>

            <div
                className="mx-auto mt-2.5 flex max-w-5xl items-center gap-1 md:mt-3 md:gap-1.5"
                role="tablist"
                aria-label={String(t('steps', { defaultValue: 'Steps' }))}
            >
                {steps.map((stepItem, idx) => {
                    const count = (seenSteps.get(stepItem) ?? 0) + 1;
                    seenSteps.set(stepItem, count);
                    const stepKey =
                        count === 1 ? stepItem : `${stepItem}-${count}`;
                    const isDone = isStepCompleted(idx);
                    const isCurrent = !isCelebration && idx === currentIndex;

                    return (
                        <button
                            key={stepKey}
                            type="button"
                            role="tab"
                            aria-selected={isCurrent}
                            aria-label={`${String(
                                t('step', { defaultValue: 'Step' })
                            )} ${idx + 1}`}
                            onClick={() => onGoToStep(idx)}
                            className={`h-1.5 flex-1 cursor-pointer rounded-full transition-colors duration-300 md:h-2 ${
                                isCurrent
                                    ? 'bg-green-450 ring-green-450/40 h-2 ring-2 md:h-2.5'
                                    : isDone
                                      ? 'bg-green-450/70 hover:bg-green-450'
                                      : 'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700'
                            }`}
                            data-testid={`guide-progress-segment-${idx}`}
                        />
                    );
                })}
            </div>
        </header>
    );
};

export default CookingGuideHeader;
