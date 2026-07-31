import React from 'react';
import { FiEdit3 } from 'react-icons/fi';

interface ChangePasswordHeaderProps {
    title: string;
    requirementsText: string;
    isEditing: boolean;
    isPending: boolean;
    onEditClick: () => void;
    onCancelEdit: () => void;
    changePasswordLabel: string;
    cancelLabel: string;
}

export const ChangePasswordHeader: React.FC<ChangePasswordHeaderProps> = ({
    title,
    requirementsText,
    isEditing,
    isPending,
    onEditClick,
    onCancelEdit,
    changePasswordLabel,
    cancelLabel,
}) => {
    return (
        <div className="flex items-center">
            <div className="flex-1">
                <p className="text-left">{title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {requirementsText}
                </p>
            </div>
            <div className="flex items-center">
                {!isEditing ? (
                    <button
                        type="button"
                        onClick={onEditClick}
                        className="p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                        aria-label={changePasswordLabel}
                        data-testid="edit-password-button"
                    >
                        <FiEdit3
                            data-testid="edit-password-icon"
                            className="size-4"
                        />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                        disabled={isPending}
                        data-testid="cancel-edit-button"
                    >
                        {cancelLabel}
                    </button>
                )}
            </div>
        </div>
    );
};
