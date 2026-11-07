'use client';

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiAward, FiRotateCcw, FiCheck } from 'react-icons/fi';
import { TbPhotoPlus } from 'react-icons/tb';
import confetti from 'canvas-confetti';
import useCooksnapModal from '@/app/hooks/useCooksnapModal';

interface CookingGuideCelebrationProps {
    recipeId?: string;
    recipeTitle?: string;
    totalSteps: number;
    completedCount: number;
    onRestart: () => void;
    onClose: () => void;
}

export const CookingGuideCelebration: React.FC<
    CookingGuideCelebrationProps
> = ({
    recipeId,
    recipeTitle,
    totalSteps,
    completedCount,
    onRestart,
    onClose,
}) => {
    const { t } = useTranslation();
    const cooksnapModal = useCooksnapModal();
    const allCompleted = totalSteps > 0 && completedCount >= totalSteps;

    useEffect(() => {
        try {
            confetti({
                particleCount: 90,
                spread: 75,
                origin: { y: 0.6 },
            });
        } catch {
            // Ignore in test environments where canvas is not available
        }
    }, []);

    const handleShareCooksnap = () => {
        onClose();
        if (recipeId) {
            cooksnapModal.onOpen(recipeId, recipeTitle);
        }
    };

    return (
        <div
            className="mx-auto flex w-full max-w-xl flex-col items-center rounded-2xl border border-neutral-200/80 bg-white/95 p-5 text-center shadow-xl backdrop-blur-md md:rounded-3xl md:p-10 dark:border-neutral-800/80 dark:bg-neutral-900/95"
            data-testid="cooking-guide-celebration"
        >
            <div className="relative mb-5 flex items-center justify-center md:mb-6">
                <div className="border-green-450/40 bg-green-450/20 absolute -inset-4 rounded-full border opacity-60 motion-safe:animate-ping" />
                <div className="border-green-450 bg-green-450 relative z-10 flex size-16 items-center justify-center rounded-2xl border text-neutral-950 shadow-lg md:size-20">
                    <FiAward className="size-8 md:size-10" />
                </div>
            </div>

            <span className="border-green-450/40 bg-green-450/15 dark:text-green-450 mb-2 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold text-neutral-900">
                {completedCount}/{totalSteps}{' '}
                {String(t('steps', { defaultValue: 'steps' }))}
            </span>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-white">
                {allCompleted
                    ? String(
                          t('guide_celebration_title', {
                              defaultValue: 'Bon Appétit! Recipe Complete!',
                          })
                      )
                    : String(
                          t('guide_celebration_review_title', {
                              defaultValue: 'Bon Appétit! Guide Finished!',
                          })
                      )}
            </h2>

            {recipeTitle && (
                <p className="mt-1 text-sm font-semibold text-neutral-700 md:text-base dark:text-neutral-300">
                    {recipeTitle}
                </p>
            )}

            <p className="mt-2 max-w-md text-xs leading-relaxed text-neutral-500 md:text-sm dark:text-neutral-400">
                {allCompleted
                    ? String(
                          t('guide_celebration_subtitle', {
                              defaultValue:
                                  'You followed every step like a true chef. Enjoy your delicious creation or share a photo with the community!',
                          })
                      )
                    : String(
                          t('guide_celebration_review_subtitle', {
                              defaultValue:
                                  'You reached the end of the guide. You can review any remaining steps or share a photo of your creation!',
                          })
                      )}
            </p>

            <div className="mt-6 flex w-full flex-col items-center justify-center gap-2.5 md:mt-8 md:flex-row md:gap-3">
                {recipeId && (
                    <button
                        type="button"
                        onClick={handleShareCooksnap}
                        className="border-green-450/50 bg-green-450 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold text-neutral-950 shadow-sm transition-transform duration-200 hover:scale-102 md:w-auto md:py-3"
                        data-testid="guide-share-cooksnap-btn"
                    >
                        <TbPhotoPlus size={18} />
                        <span>
                            {String(
                                t('i_made_this', {
                                    defaultValue: 'I Made This!',
                                })
                            )}
                        </span>
                    </button>
                )}

                <button
                    type="button"
                    onClick={onRestart}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 md:w-auto md:py-3 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    data-testid="guide-restart-btn"
                >
                    <FiRotateCcw size={16} />
                    <span>
                        {String(
                            t('guide_restart', {
                                defaultValue: 'Review Steps',
                            })
                        )}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 md:w-auto md:py-3 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                    data-testid="guide-done-btn"
                >
                    <FiCheck size={16} />
                    <span>
                        {String(t('guide_done', { defaultValue: 'Done' }))}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default CookingGuideCelebration;
