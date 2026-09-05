'use client';

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { FiTrash2, FiCopy } from 'react-icons/fi';
import { FaUserPlus } from 'react-icons/fa';
import { DraftSummary } from '@/app/types/draft';
import {
    generateDraftTitle,
    getDraftTTLInfo,
    getDraftProgress,
} from '@/app/lib/draftMetadata';
import DraftProgressBar from './DraftProgressBar';
import DraftTTLBadge from './DraftTTLBadge';

interface DraftCardProps {
    draft: DraftSummary;
    onOpen: (draftId: string) => void;
    onDelete: (draftId: string) => void;
    onDuplicate: (draftId: string) => void;
    onShare?: (draftId: string) => void;
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
    onShare,
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

    const handleShare = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onShare?.(draft.draftId);
        },
        [draft.draftId, onShare]
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

            {draft.type === 'shared' &&
                draft.coCooksIds &&
                draft.coCooksIds.length > 0 && (
                    <div className="flex">
                        {draft.coCooksIds.slice(0, 3).map((id) => (
                            <div
                                key={id}
                                className="-ml-2 flex size-6 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-[10px] font-bold text-white first:ml-0 dark:border-neutral-900"
                            >
                                {id.substring(0, 1).toUpperCase()}
                            </div>
                        ))}
                        {draft.coCooksIds.length > 3 && (
                            <div className="-ml-2 flex size-6 items-center justify-center rounded-full border-2 border-white bg-neutral-200 text-[10px] font-medium text-neutral-600 first:ml-0 dark:border-neutral-900 dark:bg-neutral-700 dark:text-neutral-300">
                                +{draft.coCooksIds.length - 3}
                            </div>
                        )}
                    </div>
                )}

            <div className="relative z-10 mt-2 flex items-center justify-between">
                <div data-testid="draft-card-ttl">
                    <DraftTTLBadge ttlInfo={ttlInfo} />
                </div>

                <div className="flex items-center gap-1">
                    {onShare && (
                        <button
                            type="button"
                            data-testid="draft-card-share"
                            onClick={handleShare}
                            className="flex size-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-green-50 hover:text-green-600 dark:text-neutral-400 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                            title={
                                (t('copy_co_cook_link') ??
                                    'Copy invite link') as string
                            }
                            aria-label={
                                (t('copy_co_cook_link') ??
                                    'Copy invite link') as string
                            }
                        >
                            <FaUserPlus size={16} />
                        </button>
                    )}
                    <button
                        type="button"
                        data-testid="draft-card-duplicate"
                        onClick={handleDuplicate}
                        className="flex size-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                        title={(t('duplicate_draft') ?? 'Duplicate') as string}
                        aria-label={
                            (t('duplicate_draft') ?? 'Duplicate') as string
                        }
                    >
                        <FiCopy size={16} />
                    </button>
                    <button
                        type="button"
                        data-testid="draft-card-delete"
                        onClick={handleDelete}
                        className="flex size-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title={(t('delete_draft') ?? 'Delete') as string}
                        aria-label={(t('delete_draft') ?? 'Delete') as string}
                    >
                        <FiTrash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DraftCard;
