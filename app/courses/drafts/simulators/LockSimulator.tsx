'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiLock, FiUnlock, FiUser, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface LockSimulatorProps {
    onInteracted?: () => void;
}

export const LockSimulator: React.FC<LockSimulatorProps> = ({
    onInteracted,
}) => {
    const { t } = useTranslation();
    const [isLocked, setIsLocked] = useState(true);
    const [countdown, setCountdown] = useState(30);
    const [ingredientsText, setIngredientsText] = useState(
        '2 cups Italian Arborio rice, 1 liter Warm vegetable broth, 1 cup Dry white wine'
    );

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLocked) {
            interval = setInterval(() => {
                setCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isLocked]);

    const handleToggleLock = () => {
        if (isLocked) {
            setIsLocked(false);
            toast.success(
                t('drafts_course_details.toast_lock_released') ||
                    'Step lock released! The step is now editable.'
            );
        } else {
            setIsLocked(true);
            setCountdown(30);
            toast(
                t('drafts_course_details.toast_lock_acquired', {
                    name: 'Chef Alex',
                }) || 'Chef Alex acquired the step lock.',
                { icon: '🔒' }
            );
        }
        onInteracted?.();
    };

    return (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h4 className="text-base font-semibold text-neutral-900 dark:text-white">
                        {t('drafts_course_details.lock_simulator_title') ||
                            'Step-Lock Simulator'}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {t('drafts_course_details.lock_simulator_desc') ||
                            'Simulate what happens when a friend is working on Step 4 (Ingredients):'}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleToggleLock}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition ${
                        isLocked
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {isLocked ? (
                        <FiUnlock className="size-3.5" />
                    ) : (
                        <FiLock className="size-3.5" />
                    )}
                    <span>
                        {isLocked
                            ? t('drafts_course_details.release_lock_btn') ||
                              'Release Step Lock'
                            : t('drafts_course_details.simulate_lock_btn') ||
                              'Simulate Friend Editing Step 4'}
                    </span>
                </button>
            </div>

            {/* Simulated Wizard Step 4 */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500 uppercase">
                        {t('drafts_course_details.step_ingredients_header') ||
                            'Step 4 of 7: Ingredients'}
                    </span>
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isLocked
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
                        }`}
                    >
                        {isLocked ? (
                            <>
                                <FiLock className="size-3" />{' '}
                                {t('drafts_course_details.locked_by_chef', {
                                    name: 'Chef Alex',
                                    seconds: countdown,
                                }) || `Locked by Chef Alex (${countdown}s)`}
                            </>
                        ) : (
                            <>
                                <FiUnlock className="size-3" />{' '}
                                {t('drafts_course_details.unlocked_badge') ||
                                    'Unlocked & Editable'}
                            </>
                        )}
                    </span>
                </div>

                {/* Orange Step-Lock Banner */}
                {isLocked ? (
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-7 items-center justify-center rounded-full bg-amber-200 font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                <FiUser className="size-3.5" />
                            </div>
                            <div>
                                <span className="font-semibold">
                                    {t(
                                        'drafts_course_details.locked_banner_demo'
                                    ) ||
                                        'Chef Alex is currently editing this step.'}
                                </span>
                                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                                    {t(
                                        'drafts_course_details.input_protected_notice'
                                    ) ||
                                        'Input protected: Waiting for Chef Alex to finish.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-700 dark:text-amber-300">
                            <span className="inline-block size-2 animate-pulse rounded-full bg-amber-500" />
                            <span>{countdown}s</span>
                        </div>
                    </div>
                ) : (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50/90 p-3.5 text-xs text-green-800 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-300">
                        <FiCheckCircle className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                        <span>
                            {t('drafts_course_details.unlocked_message') ||
                                'Step is unlocked! You can now write ingredients without collision.'}
                        </span>
                    </div>
                )}

                {/* Ingredients Textarea */}
                <div>
                    <label
                        htmlFor="lock-ingredients-list-input"
                        className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                        {t('drafts_course_details.ingredients_list_label') ||
                            'Ingredients List'}
                    </label>
                    <textarea
                        id="lock-ingredients-list-input"
                        rows={3}
                        value={ingredientsText}
                        onChange={(e) => setIngredientsText(e.target.value)}
                        disabled={isLocked}
                        aria-label={
                            t('drafts_course_details.ingredients_list_label') ||
                            'Ingredients List'
                        }
                        className={`w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs transition focus:outline-hidden dark:border-neutral-800 dark:text-white ${
                            isLocked
                                ? 'cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
                                : 'bg-white dark:bg-neutral-900'
                        }`}
                    />
                </div>
            </div>
        </div>
    );
};

export default LockSimulator;
