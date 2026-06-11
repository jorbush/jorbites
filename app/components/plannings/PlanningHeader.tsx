'use client';

import React from 'react';
import { SafePlanning } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import { formatDate } from '@/app/utils/date-utils';
import { FiChevronLeft } from 'react-icons/fi';
import { GiPadlock, GiPadlockOpen } from 'react-icons/gi';

interface PlanningHeaderProps {
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
}) => {
    return (
        <div className="flex w-full flex-1 flex-col gap-3">
            {/* Title & Back Button Row */}
            <div className="flex w-full flex-row items-center gap-2.5">
                <button
                    type="button"
                    onClick={() => push('/plannings')}
                    className="flex shrink-0 cursor-pointer items-center justify-center rounded-full p-2 text-neutral-600 transition hover:bg-neutral-100 focus:outline-hidden dark:text-neutral-400 dark:hover:bg-neutral-800"
                    aria-label="Back"
                >
                    <FiChevronLeft className="text-2xl" />
                </button>
                <h1 className="truncate text-3xl font-semibold tracking-tight">
                    {editedName}
                </h1>
            </div>

            {/* Description & Metadata */}
            <div className="flex flex-col gap-2 pl-12 md:pl-0">
                {editedDesc && (
                    <p className="text-sm font-light text-neutral-500 dark:text-neutral-400">
                        {editedDesc}
                    </p>
                )}

                <div className="mt-1 flex flex-wrap items-center gap-3">
                    {planning.user && (
                        <div className="flex flex-row items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-950">
                            <Avatar
                                src={planning.user.image}
                                size={20}
                            />
                            <span className="font-medium text-neutral-600 dark:text-neutral-400">
                                {planning.user.name}
                            </span>
                        </div>
                    )}
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatDate(planning.createdAt, language)}
                    </div>

                    {isOwner && (
                        <button
                            type="button"
                            onClick={togglePrivacy}
                            disabled={isSaving}
                            className="flex cursor-pointer flex-row items-center gap-2 rounded-lg px-3 py-1.5 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800"
                            title={
                                (isPrivate ? t('private') : t('public')) || ''
                            }
                        >
                            {isPrivate ? (
                                <GiPadlock
                                    size={20}
                                    className="text-neutral-700 dark:text-neutral-300"
                                    data-testid="lock-icon"
                                />
                            ) : (
                                <GiPadlockOpen
                                    size={20}
                                    className="text-neutral-700 dark:text-neutral-300"
                                    data-testid="lock-open-icon"
                                />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
