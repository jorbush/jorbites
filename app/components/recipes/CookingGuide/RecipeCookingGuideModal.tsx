'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';
import useIsMounted from '@/app/hooks/useIsMounted';
import { formatText } from '@/app/utils/textFormatting';
import {
    detectStepAction,
    extractStepTimers,
} from '@/app/utils/stepGuideUtils';
import CulinaryActionVisualizer from './CulinaryActionVisualizer';
import StepSmartTimer from './StepSmartTimer';
import CookingGuideCelebration from './CookingGuideCelebration';
import CookingGuideIngredientsDrawer from './CookingGuideIngredientsDrawer';
import CookingGuideHeader from './CookingGuideHeader';
import CookingGuideFooter from './CookingGuideFooter';
import { useCookingGuideController } from './useCookingGuideController';

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

type ActiveCookingGuideDialogProps = Omit<
    RecipeCookingGuideModalProps,
    'isOpen'
>;

const ActiveCookingGuideDialog: React.FC<ActiveCookingGuideDialogProps> = ({
    onClose,
    steps,
    ingredients = EMPTY_INGREDIENTS,
    recipeId,
    recipeTitle,
    isStepCompleted,
    onToggleStep,
    completedStepsCount,
}) => {
    const { t, i18n } = useTranslation();
    const dialogRef = useRef<HTMLDialogElement>(null);

    const {
        currentIndex,
        currentStepText,
        currentStepDone,
        isCelebration,
        isMusicPlaying,
        musicVibe,
        isIngredientsOpen,
        isSpeaking,
        timer,
        setIsIngredientsOpen,
        handleReadAloud,
        handleGoToStep,
        handlePrevious,
        handleNext,
        handleCompleteAndNext,
        handleToggleCurrentStep,
        handleToggleMusic,
        handleSelectVibe,
        handleRestart,
    } = useCookingGuideController({
        steps,
        ingredientsCount: ingredients.length,
        language: i18n?.language,
        isStepCompleted,
        onToggleStep,
        onClose,
    });

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (typeof dialog.showModal === 'function') {
            try {
                if (dialog.open) {
                    dialog.close();
                }
                dialog.showModal();
            } catch {
                dialog.setAttribute('open', '');
            }
        }
    }, []);

    const detectedAction = useMemo(
        () => detectStepAction(currentStepText),
        [currentStepText]
    );

    const timerPresets = useMemo(
        () => extractStepTimers(currentStepText),
        [currentStepText]
    );

    const progressPercent = Math.round(
        ((isCelebration ? steps.length : currentIndex + 1) / steps.length) * 100
    );

    const dialogContent = (
        <dialog
            ref={dialogRef}
            open
            onCancel={(e) => {
                e.preventDefault();
                if (isIngredientsOpen) {
                    setIsIngredientsOpen(false);
                } else {
                    onClose();
                }
            }}
            aria-label={String(
                t('guide_modal_label', {
                    defaultValue: 'Interactive Cooking Guide',
                })
            )}
            className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none flex-col justify-between overflow-hidden border-none bg-neutral-50/95 p-0 text-neutral-900 backdrop-blur-xl select-none dark:bg-neutral-950/95 dark:text-white"
            data-testid="recipe-cooking-guide-modal"
            data-cy="recipe-cooking-guide-modal"
        >
            <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                aria-hidden="true"
            >
                <div
                    className={`bg-green-450/20 dark:bg-green-450/15 absolute -top-24 -left-24 size-96 rounded-full blur-3xl transition-transform duration-1000 ${
                        isMusicPlaying
                            ? 'scale-105 motion-safe:animate-pulse'
                            : 'opacity-50'
                    }`}
                />
                <div
                    className={`bg-green-450/15 dark:bg-green-450/10 absolute -right-24 -bottom-24 size-96 rounded-full blur-3xl transition-transform duration-1000 ${
                        isMusicPlaying
                            ? 'motion-safe:animate-smooth-float'
                            : 'opacity-40'
                    }`}
                />
            </div>

            <CookingGuideHeader
                recipeTitle={recipeTitle}
                currentIndex={currentIndex}
                steps={steps}
                completedStepsCount={completedStepsCount}
                isCelebration={isCelebration}
                isMusicPlaying={isMusicPlaying}
                musicVibe={musicVibe}
                isSpeaking={isSpeaking}
                ingredientsCount={ingredients.length}
                timer={timer}
                isStepCompleted={isStepCompleted}
                onToggleMusic={handleToggleMusic}
                onSelectVibe={handleSelectVibe}
                onReadAloud={handleReadAloud}
                onToggleIngredients={() =>
                    setIsIngredientsOpen((prev) => !prev)
                }
                onGoToStep={handleGoToStep}
                onClose={onClose}
            />

            <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-3 py-4 md:px-8 md:py-6">
                {isCelebration ? (
                    <div className="my-auto w-full">
                        <CookingGuideCelebration
                            recipeId={recipeId}
                            recipeTitle={recipeTitle}
                            totalSteps={steps.length}
                            completedCount={completedStepsCount}
                            onRestart={handleRestart}
                            onClose={onClose}
                        />
                    </div>
                ) : (
                    <div
                        key={currentIndex}
                        className="animate-search-fade-in mx-auto my-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-neutral-200/80 bg-white/90 p-5 text-center shadow-lg backdrop-blur-md md:rounded-3xl md:p-10 dark:border-neutral-800/80 dark:bg-neutral-900/85"
                        data-testid="guide-active-step-card"
                    >
                        <CulinaryActionVisualizer
                            action={detectedAction}
                            isCompleted={currentStepDone}
                            stepIndex={currentIndex}
                        />

                        <div
                            className="mt-4 max-h-[34vh] overflow-y-auto px-1 text-base leading-relaxed font-medium text-neutral-800 md:mt-6 md:max-h-[38vh] md:px-2 md:text-2xl md:leading-relaxed dark:text-neutral-100"
                            data-testid="guide-step-text"
                            data-cy="guide-step-text"
                        >
                            {formatText(currentStepText)}
                        </div>

                        <StepSmartTimer
                            presets={timerPresets}
                            timer={timer}
                        />

                        <div className="mt-4 md:mt-6">
                            <button
                                type="button"
                                onClick={handleToggleCurrentStep}
                                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 md:px-4 md:py-2 ${
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

            {!isCelebration && (
                <CookingGuideFooter
                    currentIndex={currentIndex}
                    totalSteps={steps.length}
                    progressPercent={progressPercent}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onCompleteAndNext={handleCompleteAndNext}
                />
            )}

            <CookingGuideIngredientsDrawer
                isOpen={isIngredientsOpen}
                onClose={() => setIsIngredientsOpen(false)}
                ingredients={ingredients}
                recipeId={recipeId}
            />
        </dialog>
    );

    if (typeof document !== 'undefined') {
        return createPortal(dialogContent, document.body);
    }

    return dialogContent;
};

export const RecipeCookingGuideModal: React.FC<
    RecipeCookingGuideModalProps
> = ({ isOpen, ...rest }) => {
    const mounted = useIsMounted();
    if (!mounted || !isOpen || rest.steps.length === 0) return null;
    return <ActiveCookingGuideDialog {...rest} />;
};

export default RecipeCookingGuideModal;
