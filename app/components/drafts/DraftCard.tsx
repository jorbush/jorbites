'use client';

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { DraftSummary } from '@/app/types/draft';
import {
    generateDraftTitle,
    getDraftTTLInfo,
    getDraftProgress,
} from '@/app/lib/draftMetadata';
import DraftProgressBar from './DraftProgressBar';
import DraftTTLBadge from './DraftTTLBadge';
import DraftCardAvatars from './DraftCardAvatars';
import DraftCardActions from './DraftCardActions';

interface DraftCardProps {
    draft: DraftSummary;
    onOpen: (draftId: string) => void;
    onDelete: (draftId: string) => void;
    onDuplicate: (draftId: string) => void;
    onManageCoCooks?: (draftId: string) => void;
}

function getRelativeTime(dateStr?: string | null, t?: TFunction): string {
    if (!dateStr) {
        return t
            ? t('draft_just_now', { defaultValue: 'Just now' })
            : 'Just now';
    }
    const timestamp = new Date(dateStr).getTime();
    if (isNaN(timestamp)) {
        return t
            ? t('draft_just_now', { defaultValue: 'Just now' })
            : 'Just now';
    }
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60 || isNaN(seconds)) {
        return t
            ? t('draft_just_now', { defaultValue: 'Just now' })
            : 'Just now';
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return t
            ? t('draft_minutes_ago', {
                  count: minutes,
                  defaultValue: `${minutes}m ago`,
              })
            : `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return t
            ? t('draft_hours_ago', {
                  count: hours,
                  defaultValue: `${hours}h ago`,
              })
            : `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
        return t
            ? t('draft_days_ago', {
                  count: days,
                  defaultValue: `${days}d ago`,
              })
            : `${days}d ago`;
    }
    const weeks = Math.floor(days / 7);
    return t
        ? t('draft_weeks_ago', {
              count: weeks,
              defaultValue: `${weeks}w ago`,
          })
        : `${weeks}w ago`;
}

const DraftCard: React.FC<DraftCardProps> = ({
    draft,
    onOpen,
    onDelete,
    onDuplicate,
    onManageCoCooks,
}) => {
    const { t } = useTranslation();

    const handleOpen = useCallback(() => {
        onOpen(draft.draftId);
    }, [draft.draftId, onOpen]);

    const handleDelete = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onDelete(draft.draftId);
        },
        [draft.draftId, onDelete]
    );

    const handleDuplicate = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onDuplicate(draft.draftId);
        },
        [draft.draftId, onDuplicate]
    );

    const handleManageCoCooks = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onManageCoCooks?.(draft.draftId);
        },
        [draft.draftId, onManageCoCooks]
    );

    const title = generateDraftTitle(draft);
    const ttlInfo = getDraftTTLInfo(draft.updatedAt, draft.type);
    const progress = getDraftProgress(draft);
    const relativeTime = getRelativeTime(draft.updatedAt, t);

    return (
        <div
            data-testid="draft-card"
            className="group relative flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
            <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    <button
                        type="button"
                        data-testid="draft-card-title"
                        onClick={handleOpen}
                        className="cursor-pointer text-left font-semibold after:absolute after:inset-0 after:rounded-xl after:content-[''] hover:underline focus:outline-hidden"
                        title={title}
                    >
                        {title}
                    </button>
                </h3>
                <div className="relative z-10 shrink-0">
                    <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            draft.type === 'shared'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                    >
                        {draft.type === 'shared'
                            ? t('shared_draft', { defaultValue: 'Shared' })
                            : t('solo_draft', { defaultValue: 'Solo' })}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span>{relativeTime}</span>
            </div>

            <div
                data-testid="draft-card-progress"
                className="relative z-10 mt-1"
            >
                <DraftProgressBar progress={progress} />
            </div>

            {draft.type === 'shared' && (
                <div className="relative z-10">
                    <DraftCardAvatars
                        coCooksIds={draft.coCooksIds}
                        onManageCoCooks={
                            onManageCoCooks ? handleManageCoCooks : undefined
                        }
                    />
                </div>
            )}

            <div className="relative z-10 mt-2 flex items-center justify-between">
                <div data-testid="draft-card-ttl">
                    <DraftTTLBadge ttlInfo={ttlInfo} />
                </div>

                <DraftCardActions
                    onManageCoCooks={
                        onManageCoCooks ? handleManageCoCooks : undefined
                    }
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default DraftCard;
