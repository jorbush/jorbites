'use client';

import React from 'react';
import {
    FiShoppingCart,
    FiDownload,
    FiShare2,
    FiBookmark,
} from 'react-icons/fi';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { GiPadlock, GiPadlockOpen } from 'react-icons/gi';

interface PlanningStatusFlags {
    isOwner: boolean;
    isPrivate: boolean;
    isSaved: boolean;
    isSaving: boolean;
}

interface PlanningActionsProps {
    statusFlags: PlanningStatusFlags;
    editedName: string;
    onShoppingListOpen: () => void;
    onCalendarExportOpen: () => void;
    onPlanningModalOpen: () => void;
    handleSaveToggle: () => void;
    togglePrivacy?: () => void;
    onDelete?: () => void;
    share: (data: { title: string }) => void;
    t: any;
}

export const PlanningActions: React.FC<PlanningActionsProps> = ({
    statusFlags,
    editedName,
    onShoppingListOpen,
    onCalendarExportOpen,
    onPlanningModalOpen,
    handleSaveToggle,
    togglePrivacy,
    onDelete,
    share,
    t,
}) => {
    const { isOwner, isPrivate, isSaved, isSaving } = statusFlags;
    return (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
                type="button"
                onClick={onShoppingListOpen}
                className="flex size-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 md:h-9 md:w-auto md:px-3 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                data-testid="shopping-list-button"
                data-cy="shopping-list-button"
                title={t('shopping_list') as string}
            >
                <FiShoppingCart size={16} />
                <span className="hidden text-xs font-semibold md:inline">
                    {t('shopping_list')}
                </span>
            </button>

            <button
                type="button"
                onClick={onCalendarExportOpen}
                className="flex size-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 md:h-9 md:w-auto md:px-3 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                data-testid="export-calendar-button"
                data-cy="export-calendar-button"
                title={t('export_calendar') as string}
            >
                <FiDownload size={16} />
                <span className="hidden text-xs font-semibold md:inline">
                    {t('export_calendar')}
                </span>
            </button>

            {!isPrivate && (
                <button
                    type="button"
                    onClick={() => share({ title: editedName })}
                    className="flex size-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 md:h-9 md:w-auto md:px-3 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                    data-testid="share-button"
                    data-cy="share-button"
                    title={t('share') as string}
                >
                    <FiShare2 size={16} />
                    <span className="hidden text-xs font-semibold md:inline">
                        {t('share')}
                    </span>
                </button>
            )}

            {!isOwner && (
                <button
                    type="button"
                    onClick={handleSaveToggle}
                    disabled={isSaving}
                    className="flex size-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 md:h-9 md:w-auto md:px-3 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                    data-testid="save-plan-button"
                    data-cy="save-plan-button"
                    title={
                        t(
                            isSaved ? 'unsave_plan_action' : 'save_plan_action'
                        ) as string
                    }
                >
                    <FiBookmark
                        size={16}
                        className={
                            isSaved
                                ? 'fill-current text-neutral-900 dark:text-white'
                                : ''
                        }
                    />
                    <span className="hidden text-xs font-semibold md:inline">
                        {t(isSaved ? 'unsave_plan_action' : 'save_plan_action')}
                    </span>
                </button>
            )}

            {isOwner && togglePrivacy && (
                <button
                    type="button"
                    onClick={togglePrivacy}
                    disabled={isSaving}
                    data-cy="toggle-plan-privacy"
                    aria-label={(isPrivate ? t('private') : t('public')) || ''}
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
            )}

            {isOwner && (
                <button
                    type="button"
                    onClick={onPlanningModalOpen}
                    className="flex size-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-neutral-900 text-white shadow-2xs transition-colors duration-200 hover:bg-neutral-800 md:h-9 md:w-auto md:px-3.5 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                    data-testid="edit-plan-button"
                    data-cy="edit-plan-button"
                    title={t('edit_plan') as string}
                >
                    <AiOutlineEdit size={16} />
                    <span className="hidden text-xs font-semibold md:inline">
                        {t('edit_plan')}
                    </span>
                </button>
            )}

            {isOwner && onDelete && (
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={isSaving}
                    data-testid="delete-plan-button"
                    data-cy="delete-plan-button"
                    className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-red-200/80 bg-red-50 text-red-600 shadow-2xs transition-colors duration-200 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:border-red-800"
                    title={t('delete') || 'Delete'}
                    aria-label={t('delete') || 'Delete'}
                >
                    <AiOutlineDelete size={16} />
                </button>
            )}
        </div>
    );
};
