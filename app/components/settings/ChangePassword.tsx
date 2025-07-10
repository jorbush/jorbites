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
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaRegSave } from 'react-icons/fa';
import { FiEdit3, FiEye, FiEyeOff } from 'react-icons/fi';

interface ChangePasswordProps {
    currentUser?: SafeUser | null;
    savePassword: boolean;
    setSavePassword: Dispatch<SetStateAction<boolean>>;
    onSave: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({
    currentUser,
    savePassword,
    setSavePassword,
    onSave,
}) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { isValid },
        watch,
        reset,
    } = useForm<FieldValues>({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        mode: 'onChange',
    });

    const watchedFields = watch();
    const { currentPassword, newPassword, confirmPassword } = watchedFields;

    const updatePassword: SubmitHandler<FieldValues> = useCallback(
        (data) => {
            if (isLoading) return;

            setIsLoading(true);
            axios
                .patch(`/api/password/${currentUser?.id}`, {
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                })
                .then(() => {
                    toast.success(
                        t('password_updated') || 'Password updated successfully'
                    );
                    setIsEditing(false);
                    reset();
                })
                .catch((error) => {
                    const errorMessage =
                        error.response?.data?.error ||
                        t('something_went_wrong');
                    toast.error(errorMessage);
                })
                .finally(() => {
                    setIsLoading(false);
                    router.refresh();
                });
        },
        [currentUser?.id, router, t, isLoading, reset]
    );

    // Check if form is valid and has actual changes
    const canSave =
        isValid &&
        currentPassword &&
        newPassword &&
        confirmPassword &&
        newPassword !== currentPassword;

    const handleEditClick = () => {
        setIsEditing(true);
        reset();
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        reset();
    };

    useEffect(() => {
        if (savePassword && canSave) {
            handleSubmit(updatePassword)();
            setSavePassword(false);
            onSave();
        } else if (savePassword) {
            setSavePassword(false);
            onSave();
        }
    }, [
        savePassword,
        canSave,
        setSavePassword,
        onSave,
        handleSubmit,
        updatePassword,
    ]);

    return (
        <div
            className="flex flex-col gap-4"
            data-testid="change-password-selector"
        >
            <div className="flex items-center">
                <div className="flex-1">
                    <p className="text-left">
                        {t('change_password') || 'Change Password'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                        {t('password_requirements') ||
                            'Password must be at least 6 characters long'}
                    </p>
                </div>
                <div className="flex items-center">
                    {!isEditing ? (
                        <FiEdit3
                            data-testid="edit-password-icon"
                            className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                            onClick={handleEditClick}
                        />
                    ) : (
                        <button
                            onClick={handleCancelEdit}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                            disabled={isLoading}
                            data-testid="cancel-edit-button"
                        >
                            {t('cancel') || 'Cancel'}
                        </button>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="flex flex-col gap-3">
                    {/* Current Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                            {t('current_password') || 'Current Password'}
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                {...register('currentPassword', {
                                    required: true,
                                    minLength: 1,
                                })}
                                className="focus:ring-green-450 w-full rounded border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                                placeholder={
                                    t('enter_current_password') ||
                                    'Enter current password'
                                }
                                disabled={isLoading}
                                data-testid="current-password-input"
                            />
                            <button
                                type="button"
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                                onClick={() =>
                                    setShowCurrentPassword(!showCurrentPassword)
                                }
                                data-testid="toggle-current-password"
                            >
                                {showCurrentPassword ? (
                                    <FiEyeOff size={16} />
                                ) : (
                                    <FiEye size={16} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                            {t('new_password') || 'New Password'}
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                {...register('newPassword', {
                                    required: true,
                                    minLength: 6,
                                    validate: (value) =>
                                        value !== currentPassword ||
                                        t('new_password_must_be_different') ||
                                        'New password must be different from current password',
                                })}
                                className="focus:ring-green-450 w-full rounded border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                                placeholder={
                                    t('enter_new_password') ||
                                    'Enter new password'
                                }
                                disabled={isLoading}
                                data-testid="new-password-input"
                            />
                            <button
                                type="button"
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                                onClick={() =>
                                    setShowNewPassword(!showNewPassword)
                                }
                                data-testid="toggle-new-password"
                            >
                                {showNewPassword ? (
                                    <FiEyeOff size={16} />
                                ) : (
                                    <FiEye size={16} />
                                )}
                            </button>
                        </div>
                        {newPassword.length > 0 && newPassword.length < 6 && (
                            <p className="text-xs text-red-500">
                                {t('password_too_short') ||
                                    'Password must be at least 6 characters'}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                            {t('confirm_password') || 'Confirm Password'}
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('confirmPassword', {
                                    required: true,
                                    validate: (value) =>
                                        value === newPassword ||
                                        t('passwords_dont_match') ||
                                        'Passwords do not match',
                                })}
                                className="focus:ring-green-450 w-full rounded border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                                placeholder={
                                    t('confirm_new_password') ||
                                    'Confirm new password'
                                }
                                disabled={isLoading}
                                data-testid="confirm-password-input"
                            />
                            <button
                                type="button"
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                data-testid="toggle-confirm-password"
                            >
                                {showConfirmPassword ? (
                                    <FiEyeOff size={16} />
                                ) : (
                                    <FiEye size={16} />
                                )}
                            </button>
                        </div>
                        {confirmPassword.length > 0 &&
                            confirmPassword !== newPassword && (
                                <p className="text-xs text-red-500">
                                    {t('passwords_dont_match') ||
                                        'Passwords do not match'}
                                </p>
                            )}
                        {newPassword.length > 0 &&
                            newPassword === currentPassword && (
                                <p className="text-xs text-red-500">
                                    {t('new_password_must_be_different') ||
                                        'New password must be different from current password'}
                                </p>
                            )}
                    </div>

                    {/* Save Button */}
                    {canSave && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmit(updatePassword)}
                                disabled={isLoading}
                                className="bg-green-450 flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-80 disabled:opacity-50 dark:text-black dark:hover:opacity-100"
                                data-testid="save-password-button"
                            >
                                <FaRegSave className="h-4 w-4" />
                                {isLoading
                                    ? t('saving') || 'Saving...'
                                    : t('save_password') || 'Save Password'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChangePassword;
