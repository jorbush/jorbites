'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft, FiShare2 } from 'react-icons/fi';
import { GiPadlock, GiPadlockOpen } from 'react-icons/gi';
import { AiOutlineDelete } from 'react-icons/ai';
import { SafeList } from '@/app/types';
import useShare from '@/app/hooks/useShare';

interface ListBackButtonProps {
    backLabel: string;
}

const ListBackButton: React.FC<ListBackButtonProps> = ({ backLabel }) => {
    const router = useRouter();

    const handleBack = useCallback(
        (e: React.MouseEvent) => {
            if (
                router?.back &&
                typeof window !== 'undefined' &&
                window.history.length > 1
            ) {
                e.preventDefault();
                router.back();
            }
        },
        [router]
    );

    return (
        <Link
            href="/lists"
            onClick={handleBack}
            className="group inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            data-cy="back-button"
        >
            <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 group-hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:border-neutral-600">
                <FiChevronLeft size={18} />
            </div>
            <span>{backLabel}</span>
        </Link>
    );
};

interface ListActionControlsProps {
    list: SafeList;
    shareTitle: string;
    isOwner: boolean;
    isLoading: boolean;
    onTogglePrivacy: () => void;
    onOpenDeleteModal: () => void;
}

const ListActionControls: React.FC<ListActionControlsProps> = ({
    list,
    shareTitle,
    isOwner,
    isLoading,
    onTogglePrivacy,
    onOpenDeleteModal,
}) => {
    const { t } = useTranslation();
    const { share } = useShare();

    if (list.isPrivate && !isOwner) {
        return null;
    }

    const privacyTitle = String(
        (list.isPrivate ? t('private') : t('public')) || ''
    );
    const shareLabel = String(t('share') || 'Share');
    const deleteListLabel = String(t('delete_list') || 'Delete list');

    return (
        <div className="flex flex-wrap items-center gap-2">
            {!list.isPrivate && (
                <button
                    type="button"
                    onClick={() => share({ title: shareTitle })}
                    className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                    aria-label={shareLabel}
                    title={shareLabel}
                    data-cy="share-list-button"
                >
                    <FiShare2 size={16} />
                </button>
            )}

            {isOwner && (
                <>
                    <button
                        type="button"
                        onClick={onTogglePrivacy}
                        disabled={isLoading}
                        data-cy="toggle-list-privacy"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                        title={privacyTitle}
                    >
                        {list.isPrivate ? (
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
                    {!list.isDefault && (
                        <button
                            type="button"
                            onClick={onOpenDeleteModal}
                            disabled={isLoading}
                            data-cy="delete-list-button"
                            className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-red-200/80 bg-red-50 text-red-600 shadow-2xs transition-colors duration-200 hover:border-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:border-red-800"
                            title={deleteListLabel}
                        >
                            <AiOutlineDelete size={16} />
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export interface ListTopBarProps {
    list: SafeList;
    shareTitle: string;
    isOwner: boolean;
    isLoading: boolean;
    onTogglePrivacy: () => void;
    onOpenDeleteModal: () => void;
}

const ListTopBar: React.FC<ListTopBarProps> = ({
    list,
    shareTitle,
    isOwner,
    isLoading,
    onTogglePrivacy,
    onOpenDeleteModal,
}) => {
    const { t } = useTranslation();
    const backLabel = String(t('back') || 'Back');

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <ListBackButton backLabel={backLabel} />
            <ListActionControls
                list={list}
                shareTitle={shareTitle}
                isOwner={isOwner}
                isLoading={isLoading}
                onTogglePrivacy={onTogglePrivacy}
                onOpenDeleteModal={onOpenDeleteModal}
            />
        </div>
    );
};

export default ListTopBar;
