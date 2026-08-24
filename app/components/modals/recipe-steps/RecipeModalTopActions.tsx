'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiUploadCloud } from 'react-icons/fi';
import { FaUserPlus } from 'react-icons/fa';
import Tooltip from '@/app/components/utils/Tooltip';

export interface RecipeModalTopActionsProps {
    onCopyInviteLink: () => void;
    onSaveDraft: () => void;
}

const RecipeModalTopActions: React.FC<RecipeModalTopActionsProps> = ({
    onCopyInviteLink,
    onSaveDraft,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-3">
            <Tooltip
                text={
                    t('copy_co_cook_link_tooltip') || 'Copy co-cook invite link'
                }
            >
                <button
                    type="button"
                    onClick={onCopyInviteLink}
                    aria-label={t('copy_co_cook_link') || 'Copy invite link'}
                    data-testid="copy-co-cook-link-button"
                    className="hover:text-green-450 dark:hover:text-green-450 flex cursor-pointer items-center justify-center text-2xl text-black transition dark:text-neutral-100"
                >
                    <FaUserPlus />
                </button>
            </Tooltip>
            <Tooltip text={t('save_draft_tooltip') || 'Save draft'}>
                <button
                    type="button"
                    onClick={onSaveDraft}
                    aria-label={t('save_draft') || 'Save draft'}
                    data-testid="load-draft-button"
                    className="hover:text-green-450 dark:hover:text-green-450 flex cursor-pointer items-center justify-center text-2xl text-black transition dark:text-neutral-100"
                >
                    <FiUploadCloud />
                </button>
            </Tooltip>
        </div>
    );
};

export default RecipeModalTopActions;
