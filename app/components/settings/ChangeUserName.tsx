'use client';

import { useRouter } from 'next/navigation';
import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import { USERNAME_MAX_LENGTH } from '@/app/utils/constants';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaRegSave } from 'react-icons/fa';
import { FiEdit3 } from 'react-icons/fi';

interface ChangeUserNameProps {
    currentUser?: SafeUser | null;
    saveUserName: boolean;
    setSaveUserName: Dispatch<SetStateAction<boolean>>;
    onSave: () => void;
}

const ChangeUserNameSelector: React.FC<ChangeUserNameProps> = ({
    currentUser,
    saveUserName,
    setSaveUserName,
    onSave,
}) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [newUserName, setNewUserName] = useState(currentUser?.name || '');
    const [canSave, setCanSave] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const updateUserName = useCallback(() => {
        if (isLoading) return;

        setIsLoading(true);
        axios
            .patch(`/api/userName/${currentUser?.id}`, {
                userName: newUserName,
            })
            .then(() => {
                toast.success(
                    t('username_updated') || 'Username updated successfully'
                );
                setIsEditing(false);
            })
            .catch((error) => {
                const errorMessage =
                    error.response?.data?.error || t('something_went_wrong');
                toast.error(errorMessage);
                // Reset to original name on error
                setNewUserName(currentUser?.name || '');
            })
            .finally(() => {
                setCanSave(false);
                setIsLoading(false);
                router.refresh();
            });
    }, [currentUser?.id, currentUser?.name, newUserName, router, t, isLoading]);

    const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Only allow alphanumeric characters (letters and numbers)
        const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '');

        // Limit to max length
        const limitedValue = cleanValue.slice(0, USERNAME_MAX_LENGTH);

        setNewUserName(limitedValue);
        setCanSave(
            limitedValue !== currentUser?.name && limitedValue.length > 0
        );
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setNewUserName(currentUser?.name || '');
        setCanSave(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setNewUserName(currentUser?.name || '');
        setCanSave(false);
    };

    useEffect(() => {
        if (saveUserName && canSave) {
            updateUserName();
            setSaveUserName(false);
            onSave();
        } else if (saveUserName) {
            setSaveUserName(false);
            onSave();
        }
    }, [saveUserName, canSave, setSaveUserName, onSave, updateUserName]);

    return (
        <div className="flex items-center">
            <div className="flex-1">
                <p className="text-left">
                    {t('update_username') || 'Update Username'}
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {t('username_requirements') ||
                        `Max ${USERNAME_MAX_LENGTH} characters, no spaces`}
                </p>
            </div>
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <>
                        <input
                            type="text"
                            value={newUserName}
                            onChange={handleUserNameChange}
                            className="focus:ring-green-450 w-24 rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                            placeholder={t('username') || 'Username'}
                            disabled={isLoading}
                            maxLength={USERNAME_MAX_LENGTH}
                            data-testid="username-input"
                        />
                        <div className="text-xs text-gray-400">
                            {newUserName.length}/{USERNAME_MAX_LENGTH}
                        </div>
                        {canSave && (
                            <FaRegSave
                                data-testid="save-username-icon"
                                className="text-green-450 h-4 w-4 cursor-pointer hover:opacity-70"
                                onClick={updateUserName}
                            />
                        )}
                        <button
                            onClick={handleCancelEdit}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                            disabled={isLoading}
                            data-testid="cancel-edit-button"
                        >
                            {t('cancel') || 'Cancel'}
                        </button>
                    </>
                ) : (
                    <>
                        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                            {currentUser?.name ||
                                t('no_username') ||
                                'No username'}
                        </span>
                        <FiEdit3
                            data-testid="edit-username-icon"
                            className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                            onClick={handleEditClick}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ChangeUserNameSelector;
