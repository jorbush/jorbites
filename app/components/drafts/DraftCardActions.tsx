'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiTrash2, FiCopy, FiUsers } from 'react-icons/fi';

export interface DraftCardActionsProps {
    onManageCoCooks?: (e: React.MouseEvent) => void;
    onDuplicate: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}

const DraftCardActions: React.FC<DraftCardActionsProps> = ({
    onManageCoCooks,
    onDuplicate,
    onDelete,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-1">
            {onManageCoCooks && (
                <button
                    type="button"
                    data-testid="draft-card-manage-collabs"
                    onClick={onManageCoCooks}
                    className="flex size-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-blue-50 hover:text-blue-700 dark:text-neutral-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                    title={
                        (t('manage_co_cooks_invite', {
                            defaultValue: 'Manage Co-Cooks & Invites',
                        }) ?? 'Manage Co-Cooks & Invites') as string
                    }
                    aria-label={
                        (t('manage_co_cooks_invite', {
                            defaultValue: 'Manage Co-Cooks & Invites',
                        }) ?? 'Manage Co-Cooks & Invites') as string
                    }
                >
                    <FiUsers size={16} />
                </button>
            )}
            <button
                type="button"
                data-testid="draft-card-duplicate"
                onClick={onDuplicate}
                className="flex size-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                title={(t('duplicate_draft') ?? 'Duplicate') as string}
                aria-label={(t('duplicate_draft') ?? 'Duplicate') as string}
            >
                <FiCopy size={16} />
            </button>
            <button
                type="button"
                data-testid="draft-card-delete"
                onClick={onDelete}
                className="flex size-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-red-50 hover:text-red-700 dark:text-neutral-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                title={(t('delete_draft') ?? 'Delete') as string}
                aria-label={(t('delete_draft') ?? 'Delete') as string}
            >
                <FiTrash2 size={16} />
            </button>
        </div>
    );
};

export default DraftCardActions;
