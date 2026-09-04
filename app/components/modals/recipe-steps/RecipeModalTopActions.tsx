import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiUploadCloud, FiFolder } from 'react-icons/fi';
import Tooltip from '@/app/components/utils/Tooltip';

export interface RecipeModalTopActionsProps {
    onSaveDraft: () => void;
    onOpenDrafts: () => void;
    hasDrafts?: boolean;
    isSaving?: boolean;
    isLocked?: boolean;
}

const RecipeModalTopActions: React.FC<RecipeModalTopActionsProps> = ({
    onSaveDraft,
    onOpenDrafts,
    hasDrafts,
    isSaving = false,
    isLocked = false,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-2.5 sm:gap-3">
            <Tooltip text={t('my_drafts') || 'My Drafts'}>
                <button
                    type="button"
                    onClick={onOpenDrafts}
                    disabled={isSaving}
                    aria-label={t('my_drafts') || 'My Drafts'}
                    data-testid="open-drafts-modal-button"
                    className="hover:text-green-450 dark:hover:text-green-450 relative flex cursor-pointer items-center justify-center text-xl text-black transition disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-100"
                >
                    <FiFolder />
                    {hasDrafts && (
                        <span
                            data-testid="drafts-indicator-dot"
                            className="bg-green-450 absolute -top-1 -right-1 size-2 rounded-full border border-white dark:border-neutral-900"
                        />
                    )}
                </button>
            </Tooltip>
            <Tooltip text={t('save_draft_tooltip') || 'Save draft'}>
                {/* load-draft-button retained for backward compatibility with existing tests; data-cy is preferred */}
                <button
                    type="button"
                    onClick={onSaveDraft}
                    disabled={isSaving || isLocked}
                    aria-label={t('save_draft') || 'Save draft'}
                    data-testid="load-draft-button"
                    data-cy="save-draft-button"
                    className="hover:text-green-450 dark:hover:text-green-450 flex cursor-pointer items-center justify-center text-xl text-black transition disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-100"
                >
                    <FiUploadCloud />
                </button>
            </Tooltip>
        </div>
    );
};

export default RecipeModalTopActions;
