'use client';

import { useRouter } from 'next/navigation';
import React, {
    useCallback,
    useState,
    useTransition,
    useImperativeHandle,
    useId,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaRegSave } from 'react-icons/fa';
import { ChangePasswordHeader } from './ChangePasswordHeader';
import { PasswordFieldInput } from './PasswordFieldInput';

interface ChangePasswordProps {
    currentUser?: SafeUser | null;
    ref?: React.Ref<ChangePasswordRef>;
}

export interface ChangePasswordRef {
    save: () => void;
}

const ChangePassword = ({ currentUser, ref }: ChangePasswordProps) => {
    const { refresh } = useRouter() || {};
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const currentPasswordId = useId();
    const newPasswordId = useId();
    const confirmPasswordId = useId();

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

    const currentPassword = watch('currentPassword') || '';
    const newPassword = watch('newPassword') || '';
    const confirmPassword = watch('confirmPassword') || '';

    const updatePassword: SubmitHandler<FieldValues> = useCallback(
        (data) => {
            if (isPending) return;

            startTransition(async () => {
                try {
                    await axios.patch(`/api/password/${currentUser?.id}`, {
                        currentPassword: data.currentPassword,
                        newPassword: data.newPassword,
                    });
                    toast.success(
                        t('password_updated') || 'Password updated successfully'
                    );
                    setIsEditing(false);
                    reset();
                } catch (error: any) {
                    const errorMessage =
                        error.response?.data?.error ||
                        t('something_went_wrong');
                    toast.error(errorMessage);
                } finally {
                    refresh();
                }
            });
        },
        [currentUser?.id, refresh, t, isPending, reset]
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

    useImperativeHandle(
        ref,
        () => ({
            save: () => {
                if (isEditing) {
                    handleSubmit(updatePassword)();
                }
            },
        }),
        [isEditing, handleSubmit, updatePassword]
    );

    const hidePasswordText = t('hide_password') || 'Hide password';
    const showPasswordText = t('show_password') || 'Show password';

    return (
        <div
            className="flex flex-col gap-4"
            data-testid="change-password-selector"
        >
            <ChangePasswordHeader
                title={t('change_password') || 'Change Password'}
                requirementsText={
                    t('password_requirements') ||
                    'Password must be at least 8 characters long'
                }
                isEditing={isEditing}
                isPending={isPending}
                onEditClick={handleEditClick}
                onCancelEdit={handleCancelEdit}
                changePasswordLabel={t('change_password') || 'Change Password'}
                cancelLabel={t('cancel') || 'Cancel'}
            />

            {isEditing && (
                <form
                    onSubmit={handleSubmit(updatePassword)}
                    className="flex flex-col gap-3"
                >
                    {/* Current Password */}
                    <PasswordFieldInput
                        id={currentPasswordId}
                        label={t('current_password') || 'Current Password'}
                        placeholder={
                            t('enter_current_password') ||
                            'Enter current password'
                        }
                        registerProps={register('currentPassword', {
                            required: true,
                            minLength: 1,
                        })}
                        showPassword={showCurrentPassword}
                        onToggleShowPassword={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                        }
                        disabled={isPending}
                        testId="current-password-input"
                        toggleTestId="toggle-current-password"
                        hidePasswordLabel={hidePasswordText}
                        showPasswordLabel={showPasswordText}
                    />

                    {/* New Password */}
                    <PasswordFieldInput
                        id={newPasswordId}
                        label={t('new_password') || 'New Password'}
                        placeholder={
                            t('enter_new_password') || 'Enter new password'
                        }
                        registerProps={register('newPassword', {
                            required: true,
                            minLength: 8,
                            validate: (value) =>
                                value !== currentPassword ||
                                t('new_password_must_be_different') ||
                                'New password must be different from current password',
                        })}
                        showPassword={showNewPassword}
                        onToggleShowPassword={() =>
                            setShowNewPassword(!showNewPassword)
                        }
                        disabled={isPending}
                        errorText={
                            newPassword.length > 0 &&
                            newPassword.length < 8 &&
                            (t('password_too_short') ||
                                'Password must be at least 8 characters')
                        }
                        secondaryErrorText={
                            newPassword.length > 0 &&
                            newPassword === currentPassword &&
                            (t('new_password_must_be_different') ||
                                'New password must be different from current password')
                        }
                        testId="new-password-input"
                        toggleTestId="toggle-new-password"
                        hidePasswordLabel={hidePasswordText}
                        showPasswordLabel={showPasswordText}
                    />

                    {/* Confirm Password */}
                    <PasswordFieldInput
                        id={confirmPasswordId}
                        label={t('confirm_password') || 'Confirm Password'}
                        placeholder={
                            t('confirm_new_password') || 'Confirm new password'
                        }
                        registerProps={register('confirmPassword', {
                            required: true,
                            validate: (value) =>
                                value === newPassword ||
                                t('passwords_dont_match') ||
                                'Passwords do not match',
                        })}
                        showPassword={showConfirmPassword}
                        onToggleShowPassword={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isPending}
                        errorText={
                            confirmPassword.length > 0 &&
                            confirmPassword !== newPassword &&
                            (t('passwords_dont_match') ||
                                'Passwords do not match')
                        }
                        testId="confirm-password-input"
                        toggleTestId="toggle-confirm-password"
                        hidePasswordLabel={hidePasswordText}
                        showPasswordLabel={showPasswordText}
                    />

                    {/* Save Button */}
                    {canSave && (
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="bg-green-450 flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-80 disabled:opacity-50 dark:text-black dark:hover:opacity-100"
                                data-testid="save-password-button"
                            >
                                <FaRegSave className="size-4" />
                                {isPending
                                    ? t('saving') || 'Saving...'
                                    : t('save_password') || 'Save Password'}
                            </button>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
};

export default ChangePassword;
