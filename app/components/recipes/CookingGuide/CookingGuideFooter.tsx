'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';

export interface CookingGuideFooterProps {
    currentIndex: number;
    totalSteps: number;
    progressPercent: number;
    onPrevious: () => void;
    onNext: () => void;
    onCompleteAndNext: () => void;
}

export const CookingGuideFooter: React.FC<CookingGuideFooterProps> = ({
    currentIndex,
    totalSteps,
    progressPercent,
    onPrevious,
    onNext,
    onCompleteAndNext,
}) => {
    const { t } = useTranslation();
    const isLastStep = currentIndex === totalSteps - 1;

    return (
        <footer className="relative z-10 border-t border-neutral-200/80 bg-white/80 px-4 py-3.5 backdrop-blur-md sm:px-6 sm:py-4 dark:border-neutral-800/80 dark:bg-neutral-900/70">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    data-testid="guide-prev-btn"
                >
                    <FiChevronLeft size={18} />
                    <span className="hidden sm:inline">
                        {String(t('previous', { defaultValue: 'Previous' }))}
                    </span>
                </button>

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

                <div className="flex items-center gap-2">
                    {!isLastStep && (
                        <button
                            type="button"
                            onClick={onNext}
                            className="cursor-pointer rounded-full border border-neutral-200/80 bg-neutral-50/80 px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            data-testid="guide-skip-next-btn"
                        >
                            {String(t('next', { defaultValue: 'Next' }))}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onCompleteAndNext}
                        className="border-green-450/50 bg-green-450 flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-sm transition-transform duration-200 hover:scale-102 sm:px-6"
                        data-testid="guide-complete-next-btn"
                        data-cy="guide-complete-next-btn"
                    >
                        <FiCheck
                            size={16}
                            className="stroke-[2.5]"
                        />
                        <span>
                            {isLastStep
                                ? String(
                                      t('guide_finish_cooking', {
                                          defaultValue: 'Finish Cooking',
                                      })
                                  )
                                : String(
                                      t('guide_complete_and_next', {
                                          defaultValue: 'Complete & Next',
                                      })
                                  )}
                        </span>
                        <FiChevronRight size={16} />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default CookingGuideFooter;
