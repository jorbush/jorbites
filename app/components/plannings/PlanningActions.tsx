'use client';

import React from 'react';
import {
    FiShoppingCart,
    FiDownload,
    FiShare2,
    FiBookmark,
} from 'react-icons/fi';
import { AiOutlineEdit } from 'react-icons/ai';

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
    share,
    t,
}) => {
    const { isOwner, isPrivate, isSaved, isSaving } = statusFlags;
    return (
        <div className="flex shrink-0 flex-wrap items-center gap-2 pl-12 md:pl-0">
            <button
                type="button"
                onClick={onShoppingListOpen}
                className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white/60 p-2.5 text-sm font-semibold transition hover:bg-neutral-100 md:px-4 md:py-2.5 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-950"
                data-testid="shopping-list-button"
                title={t('shopping_list') as string}
            >
                <FiShoppingCart size={16} />
                <span className="hidden md:inline">{t('shopping_list')}</span>
            </button>

            <button
                type="button"
                onClick={onCalendarExportOpen}
                className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white/60 p-2.5 text-sm font-semibold transition hover:bg-neutral-100 md:px-4 md:py-2.5 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-950"
                data-testid="export-calendar-button"
                title={t('export_calendar') as string}
            >
                <FiDownload size={16} />
                <span className="hidden md:inline">{t('export_calendar')}</span>
            </button>

            {!isPrivate && (
                <button
                    type="button"
                    onClick={() => share({ title: editedName })}
                    className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white/60 p-2.5 text-sm font-semibold transition hover:bg-neutral-100 md:px-4 md:py-2.5 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-950"
                    data-testid="share-button"
                    title={t('share') as string}
                >
                    <FiShare2 size={16} />
                    <span className="hidden md:inline">{t('share')}</span>
                </button>
            )}

            {!isOwner && (
                <button
                    type="button"
                    onClick={handleSaveToggle}
                    disabled={isSaving}
                    className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white/60 p-2.5 text-sm font-semibold transition hover:bg-neutral-100 md:px-4 md:py-2.5 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-950"
                    data-testid="save-plan-button"
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
                    <span className="hidden md:inline">
                        {t(isSaved ? 'unsave_plan_action' : 'save_plan_action')}
                    </span>
                </button>
            )}

            {isOwner && (
                <button
                    type="button"
                    onClick={onPlanningModalOpen}
                    className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl bg-neutral-900 p-2.5 text-sm font-semibold text-white transition hover:opacity-90 md:px-4 md:py-2.5 dark:bg-white dark:text-neutral-900"
                    data-testid="edit-plan-button"
                    title={t('edit_plan') as string}
                >
                    <AiOutlineEdit size={16} />
                    <span className="hidden md:inline">{t('edit_plan')}</span>
                </button>
            )}
        </div>
    );
};
