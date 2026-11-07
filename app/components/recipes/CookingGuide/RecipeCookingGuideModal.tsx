'use client';

import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
    FiX,
    FiChevronLeft,
    FiChevronRight,
    FiCheck,
    FiVolume2,
    FiVolumeX,
    FiMusic,
    FiList,
    FiPlay,
} from 'react-icons/fi';
import useIsMounted from '@/app/hooks/useIsMounted';
import { formatText } from '@/app/utils/textFormatting';
import {
    detectStepAction,
    extractStepTimers,
} from '@/app/utils/stepGuideUtils';
import { CookingAudioEngine, MusicVibe } from '@/app/utils/cookingAudioEngine';
import CulinaryActionVisualizer from './CulinaryActionVisualizer';
import StepSmartTimer from './StepSmartTimer';
import CookingGuideCelebration from './CookingGuideCelebration';
import CookingGuideIngredientsDrawer from './CookingGuideIngredientsDrawer';

export interface RecipeCookingGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    steps: string[];
    ingredients?: string[];
    recipeId?: string;
    recipeTitle?: string;
    isStepCompleted: (index: number) => boolean;
    onToggleStep: (index: number) => void;
    completedStepsCount: number;
}

const EMPTY_INGREDIENTS: string[] = [];

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

export const RecipeCookingGuideModal: React.FC<
    RecipeCookingGuideModalProps
> = ({
    isOpen,
    onClose,
    steps,
    ingredients = EMPTY_INGREDIENTS,
    recipeId,
    recipeTitle,
    isStepCompleted,
    onToggleStep,
    completedStepsCount,
}) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();
    const audioEngineRef = useRef<CookingAudioEngine | null>(null);

    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isCelebration, setIsCelebration] = useState<boolean>(false);
    const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(true);
    const [musicVibe, setMusicVibe] = useState<MusicVibe>('lofi');
    const [isIngredientsOpen, setIsIngredientsOpen] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

    // Jump to first incomplete step when opening the guide
    const prevIsOpenRef = useRef<boolean>(false);
    useEffect(() => {
        if (isOpen && !prevIsOpenRef.current) {
            const firstIncomplete = steps.findIndex(
                (_, idx) => !isStepCompleted(idx)
            );
            setCurrentIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
            setIsCelebration(false);
            setIsIngredientsOpen(false);
        }
        prevIsOpenRef.current = isOpen;
    }, [isOpen, steps, isStepCompleted]);

    // Manage Audio Engine lifecycle
    useEffect(() => {
        if (!isOpen) {
            audioEngineRef.current?.stopMusic();
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            return;
        }

        if (!audioEngineRef.current) {
            audioEngineRef.current = new CookingAudioEngine();
        }

        if (isMusicPlaying) {
            audioEngineRef.current.startMusic(musicVibe);
        } else {
            audioEngineRef.current.stopMusic();
        }

        return () => {
            audioEngineRef.current?.stopMusic();
        };
    }, [isOpen, isMusicPlaying, musicVibe]);

    useEffect(() => {
        return () => {
            audioEngineRef.current?.dispose();
            audioEngineRef.current = null;
        };
    }, []);

    // Lock body scroll & request screen wake lock while open
    useEffect(() => {
        if (!isOpen || typeof document === 'undefined') return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        let wakeLockSentinel: { release: () => Promise<void> } | null = null;
        const nav = navigator as Navigator & {
            wakeLock?: {
                request: (
                    type: 'screen'
                ) => Promise<{ release: () => Promise<void> }>;
            };
        };
        if (nav.wakeLock?.request) {
            nav.wakeLock
                .request('screen')
                .then((sentinel) => {
                    wakeLockSentinel = sentinel;
                })
                .catch(() => {});
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            wakeLockSentinel?.release().catch(() => {});
        };
    }, [isOpen]);

    const currentStepText = steps[currentIndex] || '';
    const currentStepDone = isStepCompleted(currentIndex);

    const detectedAction = useMemo(
        () => detectStepAction(currentStepText),
        [currentStepText]
    );

    const timerPresets = useMemo(
        () => extractStepTimers(currentStepText),
        [currentStepText]
    );

    const stopSpeech = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    }, []);

    const handleReadAloud = useCallback(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            return;
        }
        if (isSpeaking) {
            stopSpeech();
            return;
        }
        try {
            window.speechSynthesis.cancel();
            const cleanText = currentStepText.replace(/[*_]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        } catch {
            setIsSpeaking(false);
        }
    }, [currentStepText, isSpeaking, stopSpeech]);

    const handleGoToStep = useCallback(
        (index: number) => {
            if (index < 0 || index >= steps.length) return;
            stopSpeech();
            setIsCelebration(false);
            setCurrentIndex(index);
            audioEngineRef.current?.playStepAdvance();
        },
        [steps.length, stopSpeech]
    );

    const handlePrevious = useCallback(() => {
        if (isCelebration) {
            setIsCelebration(false);
            return;
        }
        if (currentIndex > 0) {
            handleGoToStep(currentIndex - 1);
        }
    }, [currentIndex, handleGoToStep, isCelebration]);

    const handleNext = useCallback(() => {
        stopSpeech();
        if (currentIndex < steps.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            audioEngineRef.current?.playStepAdvance();
        } else {
            setIsCelebration(true);
            audioEngineRef.current?.playCelebrationFanfare();
        }
    }, [currentIndex, steps.length, stopSpeech]);

    const handleCompleteAndNext = useCallback(() => {
        stopSpeech();
        if (!currentStepDone) {
            onToggleStep(currentIndex);
            audioEngineRef.current?.playStepComplete();
        } else {
            audioEngineRef.current?.playStepAdvance();
        }

        if (currentIndex < steps.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setIsCelebration(true);
            audioEngineRef.current?.playCelebrationFanfare();
        }
    }, [currentIndex, currentStepDone, onToggleStep, steps.length, stopSpeech]);

    const handleToggleCurrentStep = useCallback(() => {
        onToggleStep(currentIndex);
        audioEngineRef.current?.playStepComplete();
    }, [currentIndex, onToggleStep]);

    const handleTimerComplete = useCallback(() => {
        audioEngineRef.current?.playTimerAlarm();
    }, []);

    const handleToggleMusic = useCallback(() => {
        setIsMusicPlaying((prev) => !prev);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isIngredientsOpen) {
                    setIsIngredientsOpen(false);
                } else {
                    onClose();
                }
            } else if (e.key === 'ArrowRight' && !isCelebration) {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrevious();
            } else if (
                (e.key === 'm' || e.key === 'M') &&
                !e.metaKey &&
                !e.ctrlKey
            ) {
                handleToggleMusic();
            } else if (
                (e.key === 'i' || e.key === 'I') &&
                !e.metaKey &&
                !e.ctrlKey &&
                ingredients.length > 0
            ) {
                setIsIngredientsOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [
        isOpen,
        isIngredientsOpen,
        isCelebration,
        onClose,
        handleNext,
        handlePrevious,
        handleToggleMusic,
        ingredients.length,
    ]);

    if (!mounted || !isOpen || steps.length === 0) return null;

    const progressPercent = Math.round(
        ((isCelebration ? steps.length : currentIndex + 1) / steps.length) * 100
    );

    const modalContent = (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={String(
                t('guide_modal_label', {
                    defaultValue: 'Interactive Cooking Guide',
                })
            )}
            className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-neutral-50/95 text-neutral-900 backdrop-blur-xl select-none dark:bg-neutral-950/95 dark:text-white"
            data-testid="recipe-cooking-guide-modal"
            data-cy="recipe-cooking-guide-modal"
        >
            {/* Ambient Animated Background Orbs */}
            <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                aria-hidden="true"
            >
                <div
                    className={`bg-green-450/20 dark:bg-green-450/15 absolute -top-24 -left-24 size-96 rounded-full blur-3xl transition-transform duration-1000 ${
                        isMusicPlaying
                            ? 'scale-105 animate-pulse'
                            : 'opacity-50'
                    }`}
                />
                <div
                    className={`bg-green-450/15 dark:bg-green-450/10 absolute -right-24 -bottom-24 size-96 rounded-full blur-3xl transition-transform duration-1000 ${
                        isMusicPlaying ? 'animate-smooth-float' : 'opacity-40'
                    }`}
                />
            </div>

            {/* TOP HEADER & PROGRESS TIMELINE */}
            <header className="relative z-10 border-b border-neutral-200/80 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4 dark:border-neutral-800/80 dark:bg-neutral-900/70">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
                    {/* Left: Title & Step Counter */}
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="border-green-450/50 bg-green-450 flex size-9 shrink-0 items-center justify-center rounded-xl border text-neutral-950 shadow-2xs">
                            <FiPlay
                                size={16}
                                className="ml-0.5 fill-current"
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-neutral-900 sm:text-base dark:text-white">
                                {recipeTitle ||
                                    String(
                                        t('guide_title_fallback', {
                                            defaultValue: 'Cooking Mode',
                                        })
                                    )}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
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

                    {/* Right: Music Controls, Vibe Pill, Read Aloud, Ingredients Drawer, Close */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Music Play/Mute + Vibe Switcher */}
                        <div className="flex items-center gap-1 rounded-full border border-neutral-200/80 bg-neutral-50/90 p-1 dark:border-neutral-700/70 dark:bg-neutral-800/80">
                            <button
                                type="button"
                                onClick={handleToggleMusic}
                                className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
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
                                {/* Animated Equalizer Bars */}
                                {isMusicPlaying && (
                                    <span
                                        className="flex items-end gap-0.5"
                                        aria-hidden="true"
                                    >
                                        <span className="h-2.5 w-0.5 animate-bounce rounded-full bg-neutral-950" />
                                        <span
                                            className="h-3.5 w-0.5 animate-bounce rounded-full bg-neutral-950"
                                            style={{ animationDelay: '150ms' }}
                                        />
                                        <span
                                            className="h-2 w-0.5 animate-bounce rounded-full bg-neutral-950"
                                            style={{ animationDelay: '300ms' }}
                                        />
                                    </span>
                                )}
                            </button>

                            {/* Vibe Selector Pills */}
                            <div className="hidden items-center gap-0.5 sm:flex">
                                {VIBE_OPTIONS.map((vibe) => (
                                    <button
                                        key={vibe.id}
                                        type="button"
                                        onClick={() => {
                                            setMusicVibe(vibe.id);
                                            if (!isMusicPlaying) {
                                                setIsMusicPlaying(true);
                                            }
                                        }}
                                        className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
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

                        {/* Read Step Aloud Button */}
                        <button
                            type="button"
                            onClick={handleReadAloud}
                            className={`flex size-9 cursor-pointer items-center justify-center rounded-full border transition-colors ${
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
                                <FiVolumeX size={16} />
                            ) : (
                                <FiVolume2 size={16} />
                            )}
                        </button>

                        {/* Quick-Peek Ingredients Drawer Toggle */}
                        {ingredients.length > 0 && (
                            <button
                                type="button"
                                onClick={() =>
                                    setIsIngredientsOpen((prev) => !prev)
                                }
                                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-700"
                                data-testid="guide-ingredients-toggle-btn"
                            >
                                <FiList size={14} />
                                <span className="hidden sm:inline">
                                    {String(
                                        t('ingredients', {
                                            defaultValue: 'Ingredients',
                                        })
                                    )}
                                </span>
                                <span className="border-green-450/40 bg-green-450/20 dark:text-green-450 py-0.2 rounded-full border px-1.5 text-[10px] font-bold text-neutral-900">
                                    {ingredients.length}
                                </span>
                            </button>
                        )}

                        {/* Close Full-Screen Guide */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-neutral-200/80 bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                            aria-label={String(
                                t('close', { defaultValue: 'Close' })
                            )}
                            data-testid="guide-close-btn"
                            data-cy="guide-close-btn"
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                </div>

                {/* Segmented Interactive Step Timeline */}
                <div
                    className="mx-auto mt-3 flex max-w-5xl items-center gap-1.5"
                    role="tablist"
                    aria-label={String(t('steps', { defaultValue: 'Steps' }))}
                >
                    {steps.map((_, idx) => {
                        const isDone = isStepCompleted(idx);
                        const isCurrent =
                            !isCelebration && idx === currentIndex;
                        return (
                            <button
                                key={idx}
                                type="button"
                                role="tab"
                                aria-selected={isCurrent}
                                aria-label={`${String(
                                    t('step', { defaultValue: 'Step' })
                                )} ${idx + 1}`}
                                onClick={() => handleGoToStep(idx)}
                                className={`h-2 flex-1 cursor-pointer rounded-full transition-all duration-300 ${
                                    isCurrent
                                        ? 'bg-green-450 ring-green-450/40 h-2.5 ring-2'
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

            {/* CENTER STAGE: ACTIVE STEP OR CELEBRATION */}
            <main className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6 sm:px-8">
                {isCelebration ? (
                    <CookingGuideCelebration
                        recipeId={recipeId}
                        recipeTitle={recipeTitle}
                        totalSteps={steps.length}
                        completedCount={completedStepsCount}
                        onRestart={() => {
                            setIsCelebration(false);
                            setCurrentIndex(0);
                        }}
                        onClose={onClose}
                    />
                ) : (
                    <div
                        key={currentIndex}
                        className="animate-search-fade-in mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl border border-neutral-200/80 bg-white/90 p-6 text-center shadow-lg backdrop-blur-md sm:p-10 dark:border-neutral-800/80 dark:bg-neutral-900/85"
                        data-testid="guide-active-step-card"
                    >
                        {/* Animated Culinary Action Centerpiece */}
                        <CulinaryActionVisualizer
                            action={detectedAction}
                            isCompleted={currentStepDone}
                            stepIndex={currentIndex}
                        />

                        {/* Step Text */}
                        <div
                            className="mt-6 max-h-[38vh] overflow-y-auto px-2 text-lg leading-relaxed font-medium text-neutral-800 sm:text-2xl sm:leading-relaxed dark:text-neutral-100"
                            data-testid="guide-step-text"
                            data-cy="guide-step-text"
                        >
                            {formatText(currentStepText)}
                        </div>

                        {/* Smart Step Timers */}
                        <StepSmartTimer
                            presets={timerPresets}
                            stepIndex={currentIndex}
                            onTimerComplete={handleTimerComplete}
                        />

                        {/* Individual Step Completion Checkbox Pill */}
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={handleToggleCurrentStep}
                                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                                    currentStepDone
                                        ? 'border-green-450/50 bg-green-450 text-neutral-950 shadow-2xs'
                                        : 'border-neutral-200/80 bg-neutral-50/80 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-800'
                                }`}
                                data-testid="guide-toggle-step-done-btn"
                            >
                                <FiCheck
                                    size={14}
                                    className={
                                        currentStepDone ? 'stroke-[3]' : ''
                                    }
                                />
                                <span>
                                    {currentStepDone
                                        ? String(
                                              t('guide_marked_completed', {
                                                  defaultValue:
                                                      'Completed (click to undo)',
                                              })
                                          )
                                        : String(
                                              t('guide_mark_as_completed', {
                                                  defaultValue:
                                                      'Mark step as completed',
                                              })
                                          )}
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* BOTTOM NAVIGATION CONTROLS */}
            {!isCelebration && (
                <footer className="relative z-10 border-t border-neutral-200/80 bg-white/80 px-4 py-3.5 backdrop-blur-md sm:px-6 sm:py-4 dark:border-neutral-800/80 dark:bg-neutral-900/70">
                    <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
                        {/* Previous Button */}
                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-200 dark:hover:bg-neutral-800"
                            data-testid="guide-prev-btn"
                        >
                            <FiChevronLeft size={18} />
                            <span className="hidden sm:inline">
                                {String(
                                    t('previous', { defaultValue: 'Previous' })
                                )}
                            </span>
                        </button>

                        {/* Center Progress Percentage */}
                        <div className="hidden flex-col items-center text-xs text-neutral-500 md:flex dark:text-neutral-400">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                {progressPercent}%{' '}
                                {String(
                                    t('guide_progress', {
                                        defaultValue: 'through recipe',
                                    })
                                )}
                            </span>
                            <span className="text-[11px]">
                                {String(
                                    t('guide_keyboard_hint', {
                                        defaultValue:
                                            'Use ← → arrows to navigate · M for music',
                                    })
                                )}
                            </span>
                        </div>

                        {/* Right: Complete & Next / Skip */}
                        <div className="flex items-center gap-2">
                            {currentIndex < steps.length - 1 && (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="cursor-pointer rounded-full border border-neutral-200/80 bg-neutral-50/80 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                    data-testid="guide-skip-next-btn"
                                >
                                    {String(
                                        t('next', { defaultValue: 'Next' })
                                    )}
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleCompleteAndNext}
                                className="border-green-450/50 bg-green-450 flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-sm transition-transform duration-200 hover:scale-102 sm:px-6"
                                data-testid="guide-complete-next-btn"
                                data-cy="guide-complete-next-btn"
                            >
                                <FiCheck
                                    size={16}
                                    className="stroke-[2.5]"
                                />
                                <span>
                                    {currentIndex === steps.length - 1
                                        ? String(
                                              t('guide_finish_cooking', {
                                                  defaultValue:
                                                      'Finish Cooking',
                                              })
                                          )
                                        : String(
                                              t('guide_complete_and_next', {
                                                  defaultValue:
                                                      'Complete & Next',
                                              })
                                          )}
                                </span>
                                <FiChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </footer>
            )}

            {/* Quick-Peek Ingredients Drawer */}
            <CookingGuideIngredientsDrawer
                isOpen={isIngredientsOpen}
                onClose={() => setIsIngredientsOpen(false)}
                ingredients={ingredients}
                recipeId={recipeId}
            />
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }

    return modalContent;
};

export default RecipeCookingGuideModal;
