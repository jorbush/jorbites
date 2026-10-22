'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaRegSave } from 'react-icons/fa';
import { FiEdit3 } from 'react-icons/fi';

interface ChangeProfileDetailsHeaderProps {
    isEditing: boolean;
    isDirty: boolean;
    isPending: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
}

const ChangeProfileDetailsHeader: React.FC<ChangeProfileDetailsHeaderProps> = ({
    isEditing,
    isDirty,
    isPending,
    onEdit,
    onSave,
    onCancel,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    {t('profile_details') || 'Creator Profile'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t('profile_details_description') ||
                        'Customize your bio, website, and social links.'}
                </p>
            </div>
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <>
                        {isDirty && (
                            <button
                                type="button"
                                onClick={onSave}
                                disabled={isPending}
                                className="text-green-450 dark:text-green-450 cursor-pointer transition hover:opacity-70"
                                title={t('save') || 'Save'}
                                data-testid="save-profile-details"
                            >
                                <FaRegSave className="size-4" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isPending}
                            className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                            data-testid="cancel-profile-details"
                        >
                            {t('cancel') || 'Cancel'}
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="flex cursor-pointer items-center gap-1 text-xs text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                        data-testid="edit-profile-details"
                    >
                        <FiEdit3 className="size-3.5" />
                        <span>{t('edit') || 'Edit'}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChangeProfileDetailsHeader;
