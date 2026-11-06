'use client';

import React from 'react';
import { SafePlanning } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import { formatDate } from '@/app/utils/date-utils';
import { GiPadlock, GiPadlockOpen } from 'react-icons/gi';
import VerificationBadge from '@/app/components/VerificationBadge';

export interface PlanningHeaderProps {
    editedName: string;
    editedDesc: string;
    planning: SafePlanning;
    language: string;
    isOwner: boolean;
    isPrivate: boolean;
    isSaving: boolean;
    togglePrivacy: () => void;
    push: (url: string) => void;
    t: any;
    mealsCount?: number;
    showLock?: boolean;
}

export const PlanningHeader: React.FC<PlanningHeaderProps> = ({
    editedName,
    editedDesc,
    planning,
    language,
    isOwner,
    isPrivate,
    isSaving,
    togglePrivacy,
    push,
    t,
    mealsCount,
    showLock = true,
}) => {
    return (
        <div className="flex w-full flex-col">
            {/* Fallback lock for standalone tests */}
            {showLock && isOwner && togglePrivacy && (
                <div className="mb-4 flex justify-end">
                    <button
                        type="button"
                        onClick={togglePrivacy}
                        disabled={isSaving}
                        data-cy="toggle-plan-privacy"
                        aria-label={
                            (isPrivate ? t('private') : t('public')) || ''
                        }
                        title={(isPrivate ? t('private') : t('public')) || ''}
                        className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                    >
                        {isPrivate ? (
                            <GiPadlock
                                size={16}
                                className="text-neutral-700 dark:text-neutral-300"
                                data-testid="lock-icon"
                            />
                        ) : (
                            <GiPadlockOpen
                                size={16}
                                className="text-neutral-700 dark:text-neutral-300"
                                data-testid="lock-open-icon"
                            />
                        )}
                    </button>
                </div>
            )}

            {/* Plan Title & Date */}
            <div className="mb-5">
                <h1
                    className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
                    data-cy="plan-title"
                >
                    {editedName}
                </h1>
                <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDate(planning.createdAt, language)}
                </p>
                {editedDesc && (
                    <p
                        className="mt-3 text-sm text-neutral-600 dark:text-neutral-400"
                        data-cy="plan-description"
                    >
                        {editedDesc}
                    </p>
                )}
            </div>

            {/* Bottom shelf: Chef User & Meals Count */}
            <div className="flex flex-col justify-between gap-4 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center dark:border-neutral-800">
                {planning.user ? (
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={planning.user.image}
                            size={42}
                            onClick={() =>
                                push(`/profile/${planning.user!.id}`)
                            }
                            quality="auto:eco"
                        />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    className="hover:text-green-450 dark:hover:text-green-450 cursor-pointer text-left text-base font-semibold text-neutral-900 transition-colors duration-200 focus:outline-hidden sm:text-lg dark:text-white"
                                    onClick={() =>
                                        push(`/profile/${planning.user!.id}`)
                                    }
                                >
                                    {planning.user.name}
                                </button>
                                {planning.user.verified && (
                                    <VerificationBadge size={18} />
                                )}
                            </div>
                            {typeof planning.user.level === 'number' && (
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {`${t('level')} ${planning.user.level}`}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div />
                )}

                <div className="self-end text-xs font-medium text-neutral-500 sm:self-auto dark:text-neutral-400">
                    {`${mealsCount ?? planning.meals?.length ?? 0} ${t('meals')}`}
                </div>
            </div>
        </div>
    );
};
